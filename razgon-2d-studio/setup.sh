#!/usr/bin/env bash
# setup.sh — prepare this sandbox/workspace for the Razgon 2D Studio (Skia renderer path).
# Installs: ffmpeg (static build via pip), numpy, the node deps, the native canvas, ffprobe shim.
set -e
STUDIO="$(cd "$(dirname "$0")" && pwd)"
cd "$STUDIO"

echo "1/5 ffmpeg + numpy"
python3 -m pip install --break-system-packages -q imageio-ffmpeg numpy 2>&1 | tail -2 || true
FF="$(python3 -c 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())')"
mkdir -p "$STUDIO/bin"
ln -sf "$FF" "$STUDIO/bin/ffmpeg"
cat > "$STUDIO/bin/ffprobe" <<'EOF'
#!/usr/bin/env python3
import subprocess, sys, re
args = sys.argv[1:]
files = [a for a in args if not a.startswith('-')]
src = files[-1] if files else ''
p = subprocess.run(['ffmpeg', '-hide_banner', '-i', src], capture_output=True, text=True)
m = re.search(r'Duration: (\d+):(\d+):(\d+\.\d+)', p.stderr)
dur = 0.0
if m:
    dur = int(m.group(1)) * 3600 + int(m.group(2)) * 60 + float(m.group(3))
if any('show_entries' in a for a in args):
    print(f"{dur:.6f}"); sys.exit(0)
print(p.stderr)
EOF
chmod +x "$STUDIO/bin/ffprobe"
sudo -n ln -sf "$STUDIO/bin/ffmpeg" /usr/local/bin/ffmpeg 2>/dev/null || true
sudo -n ln -sf "$STUDIO/bin/ffprobe" /usr/local/bin/ffprobe 2>/dev/null || true
export PATH="$STUDIO/bin:$PATH"

echo "2/5 node packages"
npm install --no-audit --no-fund --silent 2>&1 | tail -2
npm install --no-audit --no-fund --silent @napi-rs/canvas@0.1.80 2>&1 | tail -2

echo "3/5 fonts"
mkdir -p "$STUDIO/fonts"
python3 - <<'EOF'
import json, base64, subprocess, os
files = {
 'NotoSansArmenian.ttf': 'ofl/notosansarmenian/NotoSansArmenian%5Bwdth%2Cwght%5D.ttf',
 'Nunito.ttf': 'ofl/nunito/Nunito%5Bwght%5D.ttf',
 'PlayfairDisplay.ttf': 'ofl/playfairdisplay/PlayfairDisplay%5Bwght%5D.ttf',
}
for name, path in files.items():
    out = os.path.join('fonts', name)
    if os.path.exists(out) and os.path.getsize(out) > 10000:
        continue
    r = subprocess.run(['curl', '-sS', f'https://api.github.com/repos/google/fonts/contents/{path}'], capture_output=True, text=True)
    d = json.loads(r.stdout)
    if 'content' in d:
        open(out, 'wb').write(base64.b64decode(d['content']))
        print('  font', name)
    else:
        print('  font FAILED', name, d.get('message'))
EOF

echo "4/5 checking canvas"
node -e "const c=require('@napi-rs/canvas'); const cv=c.createCanvas(20,20); console.log('  canvas ok', cv.width)"

echo "5/5 ffmpeg"
ffmpeg -version | head -1
echo "setup done"
