# Production notes — ՈՉ ՈՔ ՉԻ ԿԱՐՈՂ ՔԵԶ ԽԱԲԵԼ

## Source material
- Voiceover: repository root `voiceover_hy.mp3`
- Script: repository root `New Text File (1).txt`
- Target: 16:9, 1080p, 24 fps
- Initial visual style: `dusk`
- Captions: off by default; add only if requested.
- Music and SFX: generated cinematic score + timed sound effects.

## Prepared
- `story/bible.md`: story arc, recurring cast, sets, visual motifs, key-shot options and music arc.
- `scenes/cast.js`: fixed character outfits and signature colours.

## Required before rendering
1. Install/copy the bundled `skills/make-2d-video/kit/` into a writable `razgon-2d-studio/` workspace following `skills/make-2d-video/references/install.md`.
2. Copy the two source files into `projects/no-one-can-lie/input/` as `voiceover_hy.mp3` and `script.txt`.
3. Create the project config and run Whisper transcription against the Armenian voiceover with language `hy`. The transcript must be aligned to the actual audio; do not guess shot boundaries.
4. Generate the beat sheet, then write contiguous `story/shots.json` with 15–25 shots/minute.
5. Build the reusable sets and shot modules, render style samples/contact sheets, inspect them, then render and QC the final MP4.

## Important limitation
This repository update prepares the creative pre-production files only. It does not claim that the audio has been transcribed, the scene modules rendered, or an MP4 produced. The final renderer requires Node.js, FFmpeg, Python, Playwright Chromium and the bundled studio kit to execute in a Linux/macOS/Windows workspace.
