# Razgon 2D Studio on Android (Termux)

Everything here is for running **this repo** on a phone: no PC, no image/video AI,
every frame is drawn by code and encoded with ffmpeg.

## 0. What you need
- Termux from F-Droid (the Play Store build is outdated), ~3 GB free, charger.
- A phone with 4 GB RAM or more (2 GB works, but slowly and with `--workers 1`).
- Your API key (`sk-tyl-…`) from TylerTokens.

## 1. Install (once, ~10–15 min)
```bash
pkg update && pkg install -y git
git clone https://github.com/arsoharutyunyan2010-tech/2d
cd 2d
bash termux/studio.sh setup
```
`setup` installs ffmpeg, Node, Python, Chromium (from the Termux X11 repo),
numpy/scipy, copies the studio to `razgon-2d-studio/` and runs the self-test.
Then check:
```bash
bash termux/studio.sh doctor
```

## 2. Save your key and start Claude Code
```bash
bash termux/studio.sh key sk-tyl-ВАШ_КЛЮЧ
bash termux/studio.sh claude
```
`claude` (Claude Code) is installed by Anthropic as a native binary that needs
glibc, which Termux does not have, so this command starts it **inside Ubuntu**
(proot-distro), with your repo mounted at `/work`. Your key is passed through
`ANTHROPIC_BASE_URL=https://tyler-tokens.life` + `ANTHROPIC_AUTH_TOKEN=…`, so no
login is needed. The files stay in `/work` = this repo on the phone.

Inside Claude Code, ask in plain words, for example:
> Прочитай `skills/make-2d-video/SKILL.md` и `references/install.md`.
> Мы в Termux/Android, Playwright-браузер не ставится — используй
> `razgon-2d-studio/tools/render_screenshots.py` и `render_frames.py`.
> Сделай видео по моему сценарию из `razgon-2d-studio/projects/<имя>/input/script.md`.

## 3. What actually works on the phone, and what does not

| Stage | On Android | Why |
|---|---|---|
| Scenes, sets, story, shots.json | ✅ | plain code + JSON |
| Contact sheets / stills | ✅ `python tools/render_screenshots.py --project projects/X --sheet` | one Chromium process, DevTools, ~5 s per project |
| Video render | ✅ `python tools/render_frames.py --project projects/X` | same Chromium, frames piped to ffmpeg |
| Music + SFX + mix | ✅ `python audio/mix.py --project projects/X` | numpy/scipy |
| Automatic transcription (Whisper) | ⚠️ usually no | `faster-whisper` has no Android wheel. **Give the script with timecodes instead** (`.srt`, or `[00:12.5] text` lines) and the pipeline skips Whisper. |
| `node render.mjs` (the Playwright path) | ⚠️ | it works too if you point it at the system Chromium: `CHROMIUM_PATH=$(command -v chromium-browser) node render.mjs --project …` |
| 4K, long videos | 🐢 | a phone renders 720p at maybe 1–3 fps. 9:16 720p, 20–40 s clips are the sweet spot. |

## 4. Speed tips
- Render at `--scale 0.5` (≈ half resolution) for previews, full only for the final.
- `--workers 2` is the sweet spot on a modern phone; `--workers 1` if it crashes.
- `--step 2` renders every second frame: half the time, slightly choppier motion.
- Keep Termux in the foreground, screen on, phone charging (`termux-wake-lock` is
  already used by `studio.sh render`).
- 9:16 (`--aspect 9:16`) is much faster than 16:9 at the same "short side" and is
  what TikTok/Reels/Shorts want anyway.

## 5. Getting the file out
```bash
bash termux/studio.sh pull my-video      # copies out/<title>.mp4 to /sdcard/Movies
```
Or open the path it prints with any file manager.

## 6. Troubleshooting
- **`chromium: not found`** → `pkg install x11-repo && pkg install chromium`.
- **3D shots are black** → `--gl` is not used in this path; try `--workers 1`, or
  skip 3D shots (`kind: '3d'`) in `shots.json`.
- **`npm install` errors about Playwright** → expected on Android. Node packages
  (three, fonts) are what matter; the renderer falls back to system Chromium.
- **`claude: command not found`** outside Ubuntu → that is expected; always use
  `bash termux/studio.sh claude`.
- **Out of memory** → `--workers 1`, smaller `--scale`, close other apps.
