"""tools/concat_vo.py — assemble the chunked narration into one voiceover + report the chunk map.

  python3 tools/concat_vo.py --project projects/truth-ability [--gap 0.18]

Reads audio/vo_NN.mp3 (one per input/vo/chunk_NN.txt), inserts `--gap` seconds of silence
between chunks, writes input/voiceover.wav (48 kHz stereo) and timeline/chunks.json
{start, dur, chars} per chunk. Exits non-zero if a chunk is missing.
"""
import argparse, json, os, subprocess, sys

ap = argparse.ArgumentParser()
ap.add_argument('--project', required=True)
ap.add_argument('--gap', type=float, default=0.18)
ap.add_argument('--sr', type=int, default=48000)
a = ap.parse_args()
P = a.project

chunkdir = os.path.join(P, 'input', 'vo')
names = sorted(f for f in os.listdir(chunkdir) if f.startswith('chunk_') and f.endswith('.txt'))
missing = [i for i in range(1, len(names) + 1) if not os.path.exists(os.path.join(P, 'audio', f'vo_{i:02d}.mp3'))]
if missing:
    sys.exit(f'{len(missing)} chunk(s) missing: {missing}')

def probe(p):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', p],
                       capture_output=True, text=True)
    return float(r.stdout.strip())

work = os.path.join(P, 'build', 'vo_parts')
os.makedirs(work, exist_ok=True)
parts, chunks, t = [], [], 0.0
for i, name in enumerate(names, 1):
    src = os.path.join(P, 'audio', f'vo_{i:02d}.mp3')
    d = probe(src)
    wav = os.path.join(work, f'part_{i:02d}.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-ar', str(a.sr), '-ac', '2',
                    '-af', 'highpass=f=70,lowpass=f=15500,dynaudnorm=f=200:g=5:p=0.9', wav], check=True)
    parts.append(wav)
    gap = os.path.join(work, 'gap.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i',
                    f'anullsrc=r={a.sr}:cl=stereo', '-t', str(a.gap), gap], check=True)
    chunks.append({'i': i, 'file': name, 'start': round(t, 3), 'dur': round(d, 3),
                   'chars': len(open(os.path.join(chunkdir, name), encoding='utf-8').read().strip())})
    t += d + a.gap
    if i < len(names):
        parts.append(gap)

lst = os.path.join(work, 'list.txt')
with open(lst, 'w') as f:
    for pth in parts:
        f.write("file '%s'\n" % os.path.abspath(pth))
out = os.path.join(P, 'input', 'voiceover.wav')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst,
                '-ar', str(a.sr), '-ac', '2', out], check=True)
total = probe(out)
os.makedirs(os.path.join(P, 'timeline'), exist_ok=True)
json.dump({'duration': round(total, 3), 'gap': a.gap, 'chunks': chunks},
          open(os.path.join(P, 'timeline', 'chunks.json'), 'w'), indent=1)
print(f'wrote {out}  {total:.2f}s  from {len(chunks)} chunks (gap {a.gap}s)')
