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

Storybook Quest sessions (the default starter theme) use the same reward
structure:

- 5 correct: page-turn reward moment
- 7 correct: chapter checkpoint and story trunk crate
- 8 correct: dragon tale reward moment
- 10 correct: final chapter victory

The story trunk awards one local Storybook Quest collectible card the child has
not already collected.

BlockWorks sessions add rank, reward moments, and collectibles:

- 5 correct: selfie reward moment
- 7 correct: checkpoint reward and mystery crate
- 8 correct: curated 99 Nights campfire reward moment
- 10 correct: server victory reward

The mystery crate awards one local BlockWorks collectible card the child has not
already collected.

Mario Course sessions use the same reward structure:

- 5 correct: jump-shot reward moment
- 7 correct: star power checkpoint and ? block crate
- 8 correct: wonder hills reward moment
- 10 correct: course clear victory

The ? block crate awards one local Mario Course collectible card the child has
not already collected.

Space Cadets sessions (Helldivers-themed) use the same reward structure:

- 5 correct: extraction-ready reward moment
- 7 correct: orbital strike checkpoint and stratagem crate
- 8 correct: Terminid front reward moment
- 10 correct: mission accomplished victory

The stratagem crate awards one local Space Cadets collectible card the child has
not already collected.

Luigi's Mansion sessions use the same reward structure:

- 5 correct: ghost snap reward moment
- 7 correct: flashlight checkpoint and portrait crate
- 8 correct: King Boo tower reward moment
- 10 correct: mansion cleared victory

The portrait crate awards one local Luigi's Mansion collectible card the child
has not already collected.

Wizard School sessions (Harry Potter / Hogwarts-themed) use the same reward
structure:

- 5 correct: spell snap reward moment
- 7 correct: charm checkpoint and magical trunk crate
- 8 correct: Bertie Bott's Every Flavour Beans reward moment
- 10 correct: house victory

The magical trunk awards one local Wizard School collectible card the child has
not already collected.

Toybox Rescue sessions (Toy Story-themed) use the same reward structure:

- 5 correct: shelf snap reward moment
- 7 correct: launch checkpoint and prize box crate
- 8 correct: Pizza Planet claw-machine reward moment
- 10 correct: toybox victory

The prize box awards one local Toybox Rescue collectible card the child has not
already collected.

Demigod Camp sessions (Percy Jackson / Camp Half-Blood-themed) use the same
reward structure:

- 5 correct: camp snap reward moment
- 7 correct: oracle checkpoint and quest cache crate
- 8 correct: labyrinth bonus reward moment
- 10 correct: Olympus victory

The quest cache awards one local Demigod Camp collectible card the child has not
already collected.

Goat Yard sessions (Goat Simulator 3-themed) use the same reward structure:

- 5 correct: stunt snap reward moment
- 7 correct: ramp checkpoint and chaos crate
- 8 correct: headbutt bonus reward moment
- 10 correct: trophy yard victory

The chaos crate awards one local Goat Yard collectible card the child has not
already collected.

Garden Goose sessions (Untitled Goose Game-themed) use the same reward structure:

- 5 correct: mischief snap reward moment
- 7 correct: bell checkpoint and honk crate
- 8 correct: picnic bonus reward moment
- 10 correct: garden job done victory

The honk crate awards one local Garden Goose collectible card the child has not
already collected.

Curated internet media lives under `static/assets/storybook/curated/`,
`static/assets/blockworks/curated/`,
`static/assets/mario-course/curated/`, `static/assets/space-cadets/curated/`,
`static/assets/luigi-mansion/curated/`, `static/assets/wizard-school/curated/`,
`static/assets/toybox/curated/`, `static/assets/demigod-camp/curated/`,
and `static/assets/goat-yard/curated/`, and `static/assets/garden-goose/curated/` and is served locally. Source URLs and
runtime-use notes are listed in each theme's `SOURCE.md` so you can review or
remove files before the kids use the app.

## Tests

```bash
python3 -m unittest discover -s tests
```
