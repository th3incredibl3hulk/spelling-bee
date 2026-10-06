#!/usr/bin/env python3
"""Generate local audio prompts for spelling words.

The app serves static audio files from static/audio. This script can use Kokoro
when requested, and otherwise uses locally available command-line speech tools.
It verifies that generated WAV files contain audio frames before accepting them.
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
import wave
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

import server  # noqa: E402


PAUSE_SECONDS = 0.2
KOKORO_SAMPLE_RATE = 24000


def prompt_parts(word: str, sentence: str) -> tuple[str, str]:
    """Return (intro, outro) spoken segments with a pause between them."""
    intro = f"Your word is: {word}."
    sentence = sentence.strip()
    if sentence:
        outro = f"{sentence} {word}."
    else:
        outro = f"{word}."
    return intro, outro


def prompt_text(word: str, sentence: str, *, pause_seconds: float = PAUSE_SECONDS) -> str:
    """Single-string prompt for engines that support embedded silence markers."""
    intro, outro = prompt_parts(word, sentence)
    # macOS `say` understands [[slnc N]] as N milliseconds of silence.
    silence_ms = max(0, int(pause_seconds * 1000))
    return f"{intro} [[slnc {silence_ms}]] {outro}"


def output_path(audio_word_path: str) -> Path:
    if not audio_word_path.startswith("/audio/"):
        raise ValueError(f"Unsupported audio path: {audio_word_path}")
    name = audio_word_path.removeprefix("/audio/")
    target = (server.STATIC_DIR / "audio" / name).resolve()
    target.relative_to((server.STATIC_DIR / "audio").resolve())
    target.parent.mkdir(parents=True, exist_ok=True)
    return target


def validate_wav(target: Path) -> None:
    with wave.open(str(target), "rb") as handle:
        frames = handle.getnframes()
        rate = handle.getframerate()
    if frames <= 0 or rate <= 0:
        raise RuntimeError(f"Generated audio is empty: {target}")


def generate_with_say(word: str, sentence: str, target: Path, say_voice: str = "") -> None:
    text = prompt_text(word, sentence, pause_seconds=PAUSE_SECONDS)
    temp_aiff = target.with_suffix(".tmp.aiff")
    say_cmd = ["say"]
    if say_voice:
        say_cmd.extend(["-v", say_voice])
    say_cmd.extend(["-o", str(temp_aiff), text])
    subprocess.run(say_cmd, check=True)
    try:
        subprocess.run(
            ["afconvert", "-f", "WAVE", "-d", "LEI16@22050", str(temp_aiff), str(target)],
            check=True,
        )
    finally:
        temp_aiff.unlink(missing_ok=True)
    validate_wav(target)


def generate_with_espeak(word: str, sentence: str, target: Path, command: str, voice: str) -> None:
    intro, outro = prompt_parts(word, sentence)
    # espeak has no reliable long silence marker; speak intro/outro with a gap via sox if present,
    # otherwise insert a spoken ellipsis pause as a weaker fallback.
    text = f"{intro} ... ... {outro}"
    cmd = [command]
    if voice:
        cmd.extend(["-v", voice])
    cmd.extend(["-g", "20", "-w", str(target), text])
    subprocess.run(cmd, check=True)
    validate_wav(target)


def _to_numpy_audio(audio):
    import numpy as np

    if hasattr(audio, "detach"):
        audio = audio.detach().cpu().numpy()
    return np.asarray(audio, dtype=np.float32).reshape(-1)


def _kokoro_speak(pipeline, text: str, voice: str):
    import numpy as np

    chunks = []
    for _, _, audio in pipeline(text, voice=voice, speed=1):
        chunks.append(_to_numpy_audio(audio))
    if not chunks:
        raise RuntimeError("Kokoro did not return audio.")
    return chunks[0] if len(chunks) == 1 else np.concatenate(chunks)


def generate_with_kokoro(word: str, sentence: str, target: Path, voice: str) -> None:
    try:
        import numpy as np
        import soundfile as sf
        from kokoro import KPipeline
    except ImportError as exc:
        raise RuntimeError(
            "Kokoro generation requires local packages: kokoro, soundfile, and numpy."
        ) from exc

    intro, outro = prompt_parts(word, sentence)
    # Suppress the model-default repo warning; behavior is unchanged.
    try:
        pipeline = KPipeline(lang_code="a", repo_id="hexgrad/Kokoro-82M")
    except TypeError:
        pipeline = KPipeline(lang_code="a")
    intro_audio = _kokoro_speak(pipeline, intro, voice)
    outro_audio = _kokoro_speak(pipeline, outro, voice)
    silence = np.zeros(int(KOKORO_SAMPLE_RATE * PAUSE_SECONDS), dtype=np.float32)
    audio = np.concatenate([intro_audio, silence, outro_audio])
    sf.write(target, audio, KOKORO_SAMPLE_RATE)
    validate_wav(target)


def pick_auto_engine() -> tuple[str, str]:
    espeak_ng = shutil.which("espeak-ng")
    if espeak_ng:
        return "espeak", espeak_ng
    espeak = shutil.which("espeak")
    if espeak:
        return "espeak", espeak
    if shutil.which("say") and shutil.which("afconvert"):
        return "say", "say"
    raise RuntimeError("No local speech generator found. Install Kokoro or espeak-ng.")


def word_rows() -> list[dict]:
    server.init_db()
    with server.connect() as conn:
        return [
            dict(row)
            for row in conn.execute(
                """
                SELECT id, word, grade_level, example_sentence, audio_word_path
                FROM words
                WHERE active = 1
                ORDER BY grade_level, word COLLATE NOCASE
                """
            )
        ]


def filter_rows(rows: list[dict], args: argparse.Namespace) -> list[dict]:
    selected = rows
    if args.word_id:
        wanted = {word_id.strip() for word_id in args.word_id if word_id.strip()}
        selected = [row for row in selected if row["id"] in wanted]
    if args.word:
        wanted_words = {word.casefold().strip() for word in args.word if word.strip()}
        selected = [row for row in selected if row["word"].casefold() in wanted_words]
    if args.grade_level is not None:
        selected = [row for row in selected if int(row["grade_level"]) == args.grade_level]
    return selected


def missing_rows(rows: list[dict]) -> list[dict]:
    return [row for row in rows if not output_path(row["audio_word_path"]).exists()]


def print_rows(rows: list[dict], label: str) -> None:
    print(f"{label}: {len(rows)}")
    for row in rows:
        target = output_path(row["audio_word_path"])
        status = "missing" if not target.exists() else "exists"
        print(f"{row['id']}\tgrade={row['grade_level']}\t{status}\t{target.relative_to(ROOT)}\t{row['word']}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate spelling word audio clips.")
    parser.add_argument("--engine", choices=("auto", "espeak", "say", "kokoro"), default="auto")
    parser.add_argument("--voice", default="af_heart", help="Kokoro voice name.")
    parser.add_argument("--espeak-voice", default="en-us", help="espeak/espeak-ng voice name.")
    parser.add_argument("--say-voice", default="", help="Optional macOS say voice.")
    parser.add_argument("--word-id", action="append", help="Generate only this word id. Can be repeated.")
    parser.add_argument("--word", action="append", help="Generate only this word text. Can be repeated.")
    parser.add_argument("--grade-level", type=int, choices=(0, 1, 2, 4, 5, 6, 7), help="Restrict by grade level.")
    parser.add_argument("--list-missing", action="store_true", help="List words with missing audio and exit.")
    parser.add_argument("--dry-run", action="store_true", help="Show selected words without generating audio.")
    parser.add_argument("--overwrite", action="store_true")
    parser.add_argument("--limit", type=int, default=0)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    rows = filter_rows(word_rows(), args)
    if args.limit:
        rows = rows[: args.limit]
    if args.list_missing:
        print_rows(missing_rows(rows), "missing")
        return
    if args.dry_run:
        print_rows(rows, "selected")
        return
    generated = 0
    skipped = 0
    auto_engine = pick_auto_engine() if args.engine == "auto" else None
    for row in rows:
        target = output_path(row["audio_word_path"])
        if target.exists() and not args.overwrite:
            skipped += 1
            continue
        word = row["word"]
        sentence = row["example_sentence"] or ""
        engine = auto_engine[0] if auto_engine else args.engine
        if engine == "kokoro":
            generate_with_kokoro(word, sentence, target, args.voice)
        elif engine == "espeak":
            command = auto_engine[1] if auto_engine else shutil.which("espeak-ng") or shutil.which("espeak")
            if not command:
                raise RuntimeError("espeak or espeak-ng was not found.")
            generate_with_espeak(word, sentence, target, command, args.espeak_voice)
        else:
            generate_with_say(word, sentence, target, args.say_voice)
        generated += 1
        print(f"generated {target.relative_to(ROOT)}")
    print(f"done: {generated} generated, {skipped} skipped")


if __name__ == "__main__":
    main()
