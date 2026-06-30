# Spelling Practice App Project Manifest

## Project Overview

This project is a private, local-network spelling practice web app for a family with
three sons, ages 7, 10, and 12. The goal is to make spelling practice short,
engaging, and repeatable by combining grade-appropriate word practice with
game-like feedback, themes, icons, pictures, and sound effects.

The app is intended for household use only. It is not intended for public release,
distribution, or use outside the local network. Security is a low concern, but the
implementation should still avoid careless data loss and unnecessary exposure of
write endpoints.

The core learning experience should be simple: a child selects their profile,
chooses a challenge level and possibly a theme, hears a word, types the spelling,
receives feedback, and builds mastery over time.

## Confirmed Product Decisions

- App form: local-network web app.
- Audience: three children, ages 7, 10, and 12.
- Primary learning loop: listen to a spoken word, type the spelling, receive
feedback.
- Session length: moderately short sessions of roughly 10-12 words.
- Word pools: bundled grade-level pools with many more words than a single
session; each session samples from the larger pool.
- Initial challenge levels: Grade 2, Grade 5, and Grade 7.
- Profiles: each child should have separate progress tracking.
- Storage: server-side SQLite so progress is shared across devices on the home
network.
- Progress emphasis: mastery focused rather than only score focused.
- Progress data should include accuracy, attempts, streaks, mastered words, and
words needing review.
- Audio direction: pre-generated text-to-speech audio is preferred.
- Candidate TTS system: Kokoro.
- Kokoro voice reference:
[https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md#american-english](https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md#american-english)
- Kokoro implementation note: very short isolated utterances can be less reliable,
so generated clips should likely use a phrase plus repetition, such as
"Your word is: adventure. Adventure." instead of only "adventure."
- Media/theme references requested by the user: Helldivers, Roblox, Harry Potter,
Toy Story, Percy Jackson, Dr Seuss, Goat Simulator, and Untitled Goose Game.
- The user is comfortable using direct references to copyrighted media because
this is private household software running only on a local network.



## V1 Product Scope

V1 should aim for a complete, usable spelling practice loop rather than a large
collection of mini-games.

Required V1 capabilities:

- Child profile selection from a simple home screen.
- Challenge level selection for Grade 2, Grade 5, and Grade 7.
- Short spelling sessions using 10-12 words.
- Audio playback for each word.
- Text input for spelling answers.
- Immediate answer feedback.
- End-of-session summary.
- Per-child progress persistence in SQLite.
- Bundled word pools by grade level.
- Static audio assets served by the app.
- Basic gamification such as points, streaks, badges, ranks, or theme rewards.

V1 should not start by building:

- A public authentication system.
- Account creation.
- Cloud sync.
- Public deployment.
- A large parent-management console unless later confirmed as required for V1.
- Multiple complex mini-games before the core listen-and-type loop works.



## Themes and Media Interests

The user wants the experience to feel connected to the children's interests:

- Helldivers
- Roblox
- Harry Potter
- Toy Story
- Percy Jackson
- Dr Seuss
- Goat Simulator
- Untitled Goose Game

The user has explicitly said direct references are acceptable because the app is
private and local-only. A future implementer may therefore use names, themed
labels, recognizable concepts, images, icons, or sound effects if they are locally
available and practical.

Implementation guidance:

- Prefer locally bundled assets so the app works reliably on the home network.
- Keep theme support data-driven where practical, for example theme name, color
palette, icon set, background image, feedback sounds, and reward labels.
- Avoid making theme support block the core spelling loop.
- Start with a small number of complete themes rather than many incomplete ones.
- If copyrighted source assets are used, keep them out of any public package,
release, demo, or shared repository unless the user later changes the policy.

Open theme questions:

- Should themes be available from the start or unlocked through progress?
- Should each child have separate unlocked themes?
- Which themes should ship first?
- Should themes affect only visuals/audio, or should they also change reward names
and session framing?
- Should any theme include proper nouns as spelling words, or should proper nouns
stay separate from grade-level spelling practice?



## Learning and Game Mechanics

Intended V1 loop:

1. Child opens the app on the local network.
2. Child selects their profile.
3. Child selects a grade-level challenge.
4. Child optionally selects a theme.
5. App starts a 10-12 word session.
6. For each word, the app plays the pre-generated audio prompt.
7. Child types the spelling.
8. App checks the answer.
9. App gives immediate feedback.
10. App records the attempt and updates mastery data.
11. App presents a short end-of-session summary.

Likely answer-checking behavior:

- Trim leading and trailing whitespace.
- Compare case-insensitively.
- Treat exact spelling as correct.
- Record the child's submitted answer for review.
- Do not silently autocorrect answers.

Open gameplay questions:

- Should sessions use exactly 10 words, exactly 12 words, or a configurable count?
  - Let's just go 10 words
- How many attempts should a child get per word?
  - Just one
- Should hints be available?
  - Yes.  The child may ask for a hint and one letter can be populated.  They can ask two times per word.
- If hints are available, which types should exist: definition, example sentence,
first letter, syllables, word length, or replay audio?
  - See above
- Should hint usage reduce points or only affect mastery?
  - No
- Should the correct spelling be shown immediately after a miss?
  - Yes
- Should missed words reappear within the same session?
  - No
- Should a child be able to pause or abandon a session?
  - If they do, progress is lost.
- Should the app include a daily goal or streak target?
  - No



## Content and Curriculum

Initial content should use three grade-level pools:

- Grade 2: appropriate for the 7-year-old.
- Grade 5: appropriate for the 10-year-old.
- Grade 7: appropriate for the 12-year-old.

Each pool should include many more words than a single session so practice does
not become repetitive. Sessions should sample a subset of words, with missed and
not-yet-mastered words appearing more often once progress history exists.

Recommended word record fields:

- `id`: stable identifier.
- `word`: spelling word.
- `grade_level`: Grade 2, Grade 5, or Grade 7.
- `definition`: optional child-friendly definition.
- `example_sentence`: optional sentence used for hints or audio.
- `difficulty_tags`: optional tags such as common, challenge, homophone, prefix,
suffix, or tricky.
- `theme_tags`: optional links to themes if a word is relevant to a theme.
- `audio_word_path`: path to primary audio prompt.
- `audio_sentence_path`: optional path to sentence audio.

Open content questions:

- Should grade levels use strict curriculum lists or flexible age-appropriate
challenge pools?
  - Flexible is fine
- Should each level include stretch words above grade level?
  - If the child gets 100% of earlier questions right
- Should proper nouns from favorite media be included?
  - Sure
- Should media-related words be mixed into normal sessions or kept in themed bonus
sessions?
  - Themed bonus sessions
- Should parent word editing/import be part of V1 or deferred to V2?
  - v1
- Should word definitions and example sentences be required before a word can ship?
  - No



## Audio Requirements

Preferred V1 audio approach:

- Pre-generate audio clips before gameplay.
- Serve generated audio as static files.
- Use Kokoro as the likely generation system.
- Store audio paths with word records.
- Keep playback instant during sessions by avoiding runtime generation.

Recommended clip style:

- Primary word prompt: "Your word is: [word]. [word]."
- Optional sentence prompt: "[word]. [example sentence]. [word]."
- Optional hint prompt: child-friendly definition or syllable cue.

Reasons to prefer pre-generated audio:

- More reliable during gameplay.
- No latency while a child is waiting.
- No need for a running TTS service during every session.
- Easier to test missing audio files.

Possible fallback:

- Browser speech synthesis can be used later as a fallback if an audio file is
missing.

Open audio questions:

- Which Kokoro voice should be the default?
  - Let's use **af_heart**
- Should each child choose a voice?
  - No, not yet.
- Should each theme have its own voice or sound treatment?
  - No
- Should audio generation be a separate script or part of app admin tooling?
  - I don't understand the difference.  Your call.
- Should the repo store generated audio files, or should they be generated into a
local ignored directory?
  - Repo can store them.
- Should clips include word only, word plus sentence, word plus definition, or all
of these?
  - I'm fine with word plus sentence.



## Progress Tracking Requirements

Progress is per child and should be stored in SQLite on the server so multiple
devices on the home network share the same history.

Minimum tracked data:

- Child profiles.
- Sessions completed.
- Session start and completion timestamps.
- Grade level selected.
- Theme selected, if applicable.
- Words attempted.
- Submitted answers.
- Correct/incorrect result.
- Number of attempts per word.
- Hints used.
- Recent misses.
- Current streaks.
- Mastery state per word.

Recommended mastery model:

- A word starts as new.
- Correct answers increase mastery.
- Incorrect answers decrease or delay mastery.
- Missed words become higher priority for future sessions.
- A word becomes mastered only after repeated correct answers across multiple
sessions or days.

The exact mastery rule is not yet confirmed and should be answered before coding
the spaced-review logic.

Open progress questions:

- What exact rule defines a mastered word?
  - A word that's spelled correctly three times in a row.
- Should mastery require correctness on multiple different days?
  - No
- Should missed words automatically repeat in the next session?
  - No, just eventually
- Should there be separate mastery per grade level if the same word appears in
more than one pool?
  - No
- Should parents be able to reset a child's progress?
  - No
- Should the app support export or backup of progress data?
  - No, repo is fine.
- Should there be a parent dashboard in V1?
  - Yes



## Likely Technical Direction

The repository is currently empty except for `.git`, so the app stack is not yet
locked. A future implementer should choose a simple local-network architecture
that fits the product rather than overbuilding.

Recommended default direction:

- Frontend: React with Vite.
- Backend: lightweight Node/Express or Python/FastAPI service.
- Database: SQLite.
- Assets: static images, icons, sound effects, and generated audio served by the
backend or frontend public asset directory.
- Running locally: one command should start the local server if possible.
- Local network: server should be able to bind to a LAN-accessible host, such as
`0.0.0.0`, when the user wants access from tablets or other computers.

Important implementation notes:

- Keep the first version easy to run on a family computer.
- Avoid requiring cloud services for normal gameplay.
- Avoid requiring login passwords unless a parent/admin screen later needs a
simple gate.
- Use SQLite migrations or a clear initialization path so the database can be
recreated from scratch.
- Keep word lists in editable structured files, such as JSON, YAML, or SQLite seed
data.
- Keep generated audio and media asset organization predictable.

Potential first database concepts:

- `children`
- `word_levels`
- `words`
- `sessions`
- `session_words`
- `word_attempts`
- `word_mastery`
- `themes`
- `child_theme_unlocks`

These are conceptual only. Do not treat this as a final schema until the open
questions are answered.

## V2 Ideas

Potential V2 improvements:

- Parent dashboard.
- Parent word import/editing.
- More grade levels.
- More mini-games.
- Rich theme unlock systems.
- More detailed achievements and badges.
- Audio generation workflow UI.
- Browser speech fallback for missing clips.
- Printable practice sheets.
- Daily or weekly goals.
- Backup/export/import of SQLite data.
- Review mode focused only on missed words.
- Placement test to suggest a challenge level.
- Optional local-only parent PIN.



## Open Questions For The User

Answering these will let the next Codex session create a decision-complete build
plan before app scaffolding begins.

Profiles:

- What are the three child profile names or nicknames?
  - PT
  - Smallfry
  - TomTom
- Should each profile have an avatar, color, or default theme?
  - No, they can pick
- Should children be able to edit their own profile choices?
  - Yes



Rewards and themes:

- Should themes be available immediately or unlocked?
  - I like the idea of unlocking.  Let them unlock as they get more words correct.
- Which theme should be implemented first?
  - You pick
- Should each child have separate theme unlocks?
  - If you mean does each child need to unlock them, yes.
- Should rewards be badges, ranks, points, collectibles, animations, or a mix?
  - Let's do a mix of badges and animations that unlock as they progress.
- Should theme visuals use direct media assets, original inspired assets, or a mix?
  - All of the above

Audio:

- Should browser speech synthesis exist as a fallback in V1?
  - No

Technical:

- Should the first implementation use Node/Express, Python/FastAPI, or another
preferred backend?
  - Your call
- Should the app target tablets, laptops, or both?
  - Both
- Should setup prioritize one-command local development?
  - Not necessarily
- Should deployment be local-only on one machine, or should it eventually run on a
small always-on home server?
  - Home server



## Acceptance Criteria For The Manifest

- The repo contains `PROJECT_MANIFEST.md` at the root.
- The document preserves the context from the initial planning conversation.
- Confirmed decisions are clearly separated from open questions.
- V1 scope is distinguished from V2 ideas.
- The manifest does not scaffold application code.
- The manifest does not lock a final stack beyond a likely technical direction.
- A future Codex session can read this file and continue planning or implementation
without needing the original chat history.

