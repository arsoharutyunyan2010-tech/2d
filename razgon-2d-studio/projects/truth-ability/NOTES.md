# truth-ability — production notes

## Pipeline (in order)
1. `bash setup.sh` — restores ffmpeg (shims) after a sandbox reset.
2. `node tools/lint.mjs` — parse gate for every shot module. Must print all OK.
3. `./tools/qc.sh "s001,s002" 1.4 0.34 6 out.png` — contact sheet at a local time.
4. Voiceover: `input/vo/chunk_NN.txt` (13 chunks, ~800 chars each, concatenate back to `input/script.txt`).
   - `python3 tools/concat_vo.py --project projects/truth-ability` → `input/voiceover.wav` + `timeline/chunks.json`
   - `python3 tools/timemap.py --project projects/truth-ability --tail 2.6` → exact per-shot `start/end` + `timeline/words.json`
5. `python audio/mix.py --project projects/truth-ability` → `build/mix.wav` + `out/<title>.mp4`.
6. Final render: `node render-node.mjs --project projects/truth-ability --out out/<title>.mp4`.

## Status: COMPLETE
- Voiceover: 13/13 chunks recorded → `input/voiceover.wav` (759.76 s).
- `story/shots.json`: 195 shots, real timings, `duration` 762.36, 15 music sections, 147 SFX cues.
- Audio mix: `build/mix.wav` at −14.5 LUFS integrated.
- Final: `out/Ճշմարտության_գինը.mp4` — 1920×1080, 30 fps, 12:42.36, h264 + AAC stereo.

## Patching a finished render
Re-rendering all 195 shots takes ~37–38 min. For a handful of fixes, render only the
affected shots and splice:
1. `node render-node.mjs --project projects/truth-ability --from <start> --to <end> --scale 1 --crf 19 --out build/seg_<id>.mp4`
2. Cut the untouched stretches out of `build/video_silent.mp4` with `-ss/-to` + re-encode (veryfast).
3. Concat the parts in film order (absolute paths in the list), then re-mux with `audio/mix.py`.
Timing drift per splice is ≤ 0.03 s per shot; eye-sync tolerance holds up to a few shots.

## Current shot registry
- s001–s017 hook, s018–s027 rules, s028–s052 day, s053–s091 mid,
  s092–s111 Mia, s112–s126 mom, s127–s158 gala, s159–s195 ending.
- All 195 shots registered; `node render-node.mjs --sheet` renders 195 stills with 0 errors.
- Dev shots t1/t2 removed from both `shots.json` and the scene files.

## Known-good QC sheets
`build/sheets/sheet_01…sheet_09.png` — full-film contact sheets, reviewed shot by shot.
`build/sheets/qc_a…qc_x.png` — per-act detail sheets.
`build/qc/final_qc.png`, `final_qc2.png`, `fix_qc.png` — frames pulled from the encoded mp4.
