#!/data/data/com.termux/files/usr/bin/bash
# studio.sh — install / run the Razgon 2D Studio on an Android phone (Termux).
#
#   bash termux/studio.sh setup              # install everything (once)
#   bash termux/studio.sh doctor             # what is missing
#   bash termux/studio.sh install            # copy the studio into razgon-2d-studio/
#   bash termux/studio.sh demo               # render the bundled example (test)
#   bash termux/studio.sh claude             # start Claude Code pointed at your API key
#   bash termux/studio.sh key sk-...         # save your TylerTokens key
#   bash termux/studio.sh sheet my-video     # preview stills (no Playwright)
#   bash termux/studio.sh clips my-video 12,40   # render a short range (no Playwright)
#   bash termux/studio.sh render my-video    # full render + sound + copy to Movies
#   bash termux/studio.sh pull my-video      # copy the finished MP4 to /sdcard/Movies
set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STUDIO="$HERE/razgon-2d-studio"
KIT="$HERE/skills/make-2d-video/kit"
ENVF="$HOME/.tyler-tokens.env"

say() { printf '\033[1;35m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[!]\033[0m %s\n' "$*"; }
die() { printf '\033[1;31m[x]\033[0m %s\n' "$*" >&2; exit 1; }

install_studio() {
  [ -f "$KIT/render.mjs" ] || die "kit not found: $KIT"
  if [ ! -f "$STUDIO/render.mjs" ]; then
    say "copying the studio into $STUDIO"
    mkdir -p "$STUDIO" && cp -r "$KIT/." "$STUDIO/"
  else
    say "studio already installed — updating engine/tools, keeping projects/"
    ( cd "$KIT" && tar cf - --exclude=projects --exclude=node_modules . ) | ( cd "$STUDIO" && tar xf - )
  fi
  say "npm install (Playwright's browser download is expected to fail on Android; Node packages work)"
  ( cd "$STUDIO" && npm install --no-audit --no-fund >/tmp/npm.log 2>&1 ) || warn "npm reported errors — see /tmp/npm.log"
  ( cd "$STUDIO" && python tools/verify_kit.py | tail -1 )
}

setup_pip() {
  python -m pip install --quiet --upgrade pip || true
  if python -m pip install --quiet numpy scipy 2>/dev/null; then say "numpy + scipy ok"; else
    warn "numpy/scipy failed in Termux — render still works, music/SFX need them (try inside proot Ubuntu)"
  fi
  if python -m pip install --quiet faster-whisper 2>/dev/null; then say "faster-whisper ok (automatic transcription)"
  else warn "faster-whisper has no Android wheel — feed the script WITH timecodes instead (parse_script.py)"; fi
}

node_test_chromium() {
  ( cd "$STUDIO" && node -e "import('playwright').then(p=>{const e=p.chromium.executablePath();console.log('playwright chromium:',e,require('fs').existsSync(e)?'present':'missing')}).catch(e=>console.log('playwright:',e.message))" )
}

cmd_setup() {
  say "1/6 packages: ffmpeg, node, python, proot-distro (~500 MB)"
  pkg update -y || warn "pkg update had errors, continuing"
  pkg install -y ffmpeg nodejs-lts python proot-distro termux-api git \
    || pkg install -y ffmpeg nodejs python proot-distro termux-api git
  say "2/6 Chromium (from the X11 repo)"
  pkg install -y x11-repo && pkg install -y chromium || warn "chromium install failed — stills/frames need it"
  say "3/6 python packages"
  setup_pip
  say "4/6 studio + node packages"
  install_studio
  say "5/6 Playwright check (informational)"
  node_test_chromium
  say "6/6 done"
  cmd_doctor
  cat <<'EOF'

Next:
  1. bash termux/studio.sh key sk-tyl-xxxxxxxx     (save your TylerTokens key)
  2. bash termux/studio.sh demo                    (test render of the bundled example)
  3. bash termux/studio.sh claude                  (Claude Code, key already wired)
     then tell it in plain words what to make, e.g.:
     "Открой проект razor-2d-studio, прочитай skills/make-2d-video/SKILL.md
      и сделай видео по сценарию из input/script.md"
EOF
}

cmd_doctor() {
  printf '\n  %-14s %s\n' node "$(node --version 2>/dev/null || echo missing)"
  printf '  %-14s %s\n' python "$(python --version 2>&1 | head -1)"
  printf '  %-14s %s\n' ffmpeg "$(ffmpeg -version 2>/dev/null | head -1 | cut -c1-40 || echo missing)"
  printf '  %-14s %s\n' chromium "$(command -v chromium-browser || command -v chromium || echo missing)"
  printf '  %-14s %s\n' studio "$([ -f "$STUDIO/render.mjs" ] && echo "$STUDIO" || echo 'not installed: bash termux/studio.sh install')"
  printf '  %-14s %s\n' node_modules "$([ -d "$STUDIO/node_modules/three" ] && echo ok || echo 'missing: cd razgon-2d-studio && npm install')"
  printf '  %-14s %s\n' "api key" "$([ -f "$ENVF" ] && echo "saved ($ENVF)" || echo 'none: bash termux/studio.sh key sk-...')"
  python - <<'PY' 2>/dev/null || true
import importlib.util as u
print("  %-14s %s" % ("numpy/scipy", "ok" if u.find_spec("numpy") and u.find_spec("scipy") else "missing (music/SFX off)"))
print("  %-14s %s" % ("faster-whisper", "ok" if u.find_spec("faster_whisper") else "missing (needs a script with timecodes)"))
PY
  echo
}

cmd_key() {
  [ $# -ge 1 ] || die "usage: bash termux/studio.sh key sk-tyl-..."
  cat > "$ENVF" <<EOF
# TylerTokens key for the Razgon studio (Claude Code). Keep this file private.
export ANTHROPIC_BASE_URL="https://tyler-tokens.life"
export ANTHROPIC_AUTH_TOKEN="$1"
EOF
  chmod 600 "$ENVF"
  say "saved to $ENVF (readable only by you)"
}

cmd_claude() {
  if [ -f "$ENVF" ]; then . "$ENVF"; else warn "no key saved — Claude Code will ask you to log in instead"; fi
  export ANTHROPIC_MODEL="${ANTHROPIC_MODEL:-claude-opus-4-5}"
  say "base URL: ${ANTHROPIC_BASE_URL:-default}, model: $ANTHROPIC_MODEL"
  if command -v claude >/dev/null 2>&1; then exec claude "$@"; fi
  warn "claude is not installed in Termux (2.1.113+ needs glibc). Starting it inside Ubuntu…"
  proot-distro install ubuntu 2>/dev/null || true
  proot-distro login ubuntu --bind "$HERE:/work" -- /bin/bash -lc '
    export DEBIAN_FRONTEND=noninteractive
    command -v node >/dev/null || { apt-get update -qq && apt-get install -y -qq nodejs npm curl ca-certificates; }
    export PATH="$HOME/.local/bin:$PATH"
    command -v claude >/dev/null || curl -fsSL https://claude.ai/install.sh | bash
    cd /work
    exec bash
  '
}

project_path() {   # project name -> absolute dir; empty -> list projects
  if [ -z "${1:-}" ]; then
    ls "$STUDIO/projects" 2>/dev/null || die "no projects yet"
    exit 0
  fi
  case "$1" in /*) echo "$1" ;; *) echo "$STUDIO/projects/$1" ;; esac
}

cmd_sheet() {
  P="$(project_path "${1:-}")"; [ -d "$P" ] || die "no such project"
  ( cd "$STUDIO" && python tools/render_screenshots.py --project "$P" --sheet --scale "${2:-0.5}" )
  say "open the PNGs: $P/build/sheets   (termux-open <file.png> shows one)"
}

cmd_stills() {
  P="$(project_path "${1:-}")"; [ -d "$P" ] || die "no such project"
  ( cd "$STUDIO" && python tools/render_screenshots.py --project "$P" --stills "${2:?times, e.g. 3,12,40}" --scale "${3:-0.5}" )
}

cmd_clips() {   # clips <project> [times like 12,40] [--scale K]
  P="$(project_path "${1:-}")"; [ -d "$P" ] || die "no such project"
  RANGE=()
  if [ -n "${2:-}" ]; then
    R="$( cd "$STUDIO" && python tools/shot_ranges.py --project "$P" --t "$2" )" || die "bad times"
    RANGE=(--from "${R% *}" --to "${R#* }")
  fi
  ( cd "$STUDIO" && python tools/render_frames.py --project "$P" "${RANGE[@]}" \
      --scale "${SCALE:-0.5}" --workers "${WORKERS:-2}" --chrome "${CHROMIUM_PATH:-}" \
      --out "$P/build/$(basename "$P")_clips.mp4" ) || die "render failed"
  say "video: $P/build/$(basename "$P")_clips.mp4"
}

cmd_render() {
  P="$(project_path "${1:-}")"; [ -d "$P" ] || die "no such project"
  say "full render — keep Termux in the foreground and the phone charging"
  ( cd "$STUDIO" && termux-wake-lock 2>/dev/null
    python tools/render_frames.py --project "$P" --workers "${2:-2}" --scale "${SCALE:-1}" \
      --chrome "${CHROMIUM_PATH:-}" --out "$P/build/video_silent.mp4"
    termux-wake-unlock 2>/dev/null )
  cmd_mix "$P"
}

cmd_mix() {
  P="$(project_path "${1:-}")"; [ -d "$P" ] || die "no such project"
  ( cd "$STUDIO" && python audio/mix.py --project "$P" ) && cmd_pull "$P"
}

cmd_pull() {
  P="$(project_path "${1:-}")"
  f="$(ls -t "$P"/out/*.mp4 2>/dev/null | head -1)"
  [ -n "$f" ] || f="$(ls -t "$P"/build/*.mp4 2>/dev/null | head -1)"
  [ -n "$f" ] || die "no MP4 in $P/out or $P/build"
  termux-setup-storage 2>/dev/null || true
  if [ -d "$HOME/storage/movies" ]; then
    cp "$f" "$HOME/storage/movies/$(basename "$f")" && say "copied to Movies/ (visible in your gallery/Files app)"
  else
    say "your video: $f"
  fi
}

cmd_demo() {
  [ -f "$STUDIO/render.mjs" ] || install_studio
  P="$STUDIO/examples/reaction-time"
  say "demo stills"
  ( cd "$STUDIO" && python tools/render_screenshots.py --project "$P" --sheet --scale 0.4 )
  say "demo 8-second clip"
  ( cd "$STUDIO" && python tools/render_frames.py --project "$P" --to 8 --scale 0.5 --workers 2 --out "$P/build/demo.mp4" )
  say "video: $P/build/demo.mp4  — copy it: cp \"$P/build/demo.mp4\" \"\$HOME/storage/movies/\""
}

case "${1:-}" in
  setup) shift; cmd_setup "$@" ;;
  doctor) shift; cmd_doctor "$@" ;;
  install) shift; install_studio "$@" ;;
  key) shift; cmd_key "$@" ;;
  claude) shift; cmd_claude "$@" ;;
  sheet) shift; cmd_sheet "$@" ;;
  stills) shift; cmd_stills "$@" ;;
  clips) shift; cmd_clips "$@" ;;
  render) shift; cmd_render "$@" ;;
  mix) shift; cmd_mix "$@" ;;
  pull) shift; cmd_pull "$@" ;;
  demo) shift; cmd_demo "$@" ;;
  *) sed -n '3,14p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//' ;;
esac
