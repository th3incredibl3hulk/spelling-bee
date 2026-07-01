# Spelling Practice

Private local-network spelling practice app for the three child profiles in
`PROJECT_MANIFEST.md`.

## Run

```bash
python3 server.py --host 127.0.0.1 --port 8787
```

Open `http://127.0.0.1:8787`.

For tablets or other devices on the home network, run:

```bash
python3 server.py --host 0.0.0.0 --port 8787
```

The app creates `data/spelling_bee.sqlite` on startup and seeds children,
themes, and word pools.

## Audio

Generate static WAV prompts into `static/audio`:

```bash
python3 scripts/generate_audio.py
```

By default, existing audio files are skipped. After adding a word in the app, this
generates only missing audio:

```bash
python3 scripts/generate_audio.py --engine kokoro --voice af_heart
```

List words that do not have audio yet:

```bash
python3 scripts/generate_audio.py --list-missing
```

Generate or regenerate a specific word:

```bash
python3 scripts/generate_audio.py --engine kokoro --voice af_heart --word-id g2-example
python3 scripts/generate_audio.py --engine kokoro --voice af_heart --word "example" --grade-level 2 --overwrite
```

This uses `espeak-ng` or `espeak` when available, then falls back to macOS
`say`. If Kokoro is installed locally, use:

```bash
python3 scripts/generate_audio.py --engine kokoro --voice af_heart --overwrite
```

Each clip says the word, an example sentence when available, then the word again.

## BlockWorks Game Layer

Correct answers earn XP when a session completes. Abandoned sessions still lose
their progress.

- Grade 2 correct: 10 XP
- Grade 5 correct: 15 XP
- Grade 7 correct: 20 XP
- Bonus/theme words: +5 XP

BlockWorks sessions add rank, reward moments, and collectibles:

- 5 correct: selfie reward moment
- 7 correct: checkpoint reward and mystery crate
- 8 correct: curated 99 Nights campfire reward moment
- 10 correct: server victory reward

The mystery crate awards one local BlockWorks collectible card the child has not
already collected.

Curated internet media lives under `static/assets/blockworks/curated/` and is
served locally. Source URLs and runtime-use notes are listed in
`static/assets/blockworks/SOURCE.md` so you can review or remove files before
the kids use the app.

## Tests

```bash
python3 -m unittest discover -s tests
```
