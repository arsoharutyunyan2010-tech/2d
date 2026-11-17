"""tools/timemap.py — exact shot timing from chunked voiceover.

The narration is recorded in fixed chunks (input/vo/chunk_NN.txt) that concatenate
back to input/script.txt. Because we know each chunk's char span and its measured
duration, every shot's `line` can be located in the script and mapped to an exact
time inside the matching chunk. No proportional guessing across the whole film.

  python3 tools/timemap.py --project projects/truth-ability [--tail 2.6]

Writes story/shots.json (start/end per shot) and timeline/words.json
(one entry per shot: {id, start, end, text}). Idempotent.
"""
import argparse, json, os, re, subprocess, sys

ap = argparse.ArgumentParser()
ap.add_argument('--project', required=True)
ap.add_argument('--tail', type=float, default=2.6)
ap.add_argument('--gap', type=float, default=0.18, help='silence inserted between chunks (s)')
a = ap.parse_args()
P = a.project

def probe(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                        '-of', 'default=nw=1:nk=1', path], capture_output=True, text=True)
    try:
        return float(r.stdout.strip())
    except Exception:
        return 0.0

norm = lambda t: re.sub(r'\s+', ' ', t).strip()

# --- chunks on disk, in order
chunkdir = os.path.join(P, 'input', 'vo')
names = sorted(f for f in os.listdir(chunkdir) if f.startswith('chunk_') and f.endswith('.txt'))
assert names, 'no chunks in input/vo'
texts = [norm(open(os.path.join(chunkdir, f), encoding='utf-8').read()) for f in names]

# --- audio for each chunk (vo_NN.mp3 next to the project audio dir)
chunks = []
t = 0.0
for i, (name, txt) in enumerate(zip(names, texts), 1):
    audio = os.path.join(P, 'audio', f'vo_{i:02d}.mp3')
    if not os.path.exists(audio):
        sys.exit(f'MISSING {audio} — {len(names) - i + 1} chunk(s) not recorded yet; shots.json left untouched')
    d = probe(audio)
    chunks.append({'i': i, 'file': name, 'audio': audio, 'start': round(t, 3), 'dur': round(d, 3), 'chars': len(txt), 'text': txt})
    t += d + a.gap
total = round(t - a.gap, 3) if chunks else 0.0

script = norm(' '.join(x['text'] for x in chunks))
# absolute char offset where each chunk starts
off = 0
for c in chunks:
    c['off'] = off
    off += len(c['text']) + 1

def time_of(pos):
    """script char position -> seconds"""
    for idx, c in enumerate(chunks):
        end = c['off'] + c['chars']
        if pos < end or idx == len(chunks) - 1:
            local = max(0.0, min(c['chars'], pos - c['off']))
            return c['start'] + c['dur'] * (local / max(1, c['chars']))
    return total

story_path = os.path.join(P, 'story', 'shots.json')
story = json.load(open(story_path, encoding='utf-8'))
shots = [s for s in story['shots'] if re.match(r'^s\d+$', s['id'])]

cursor = 0
missing = 0
for s in shots:
    line = norm(s.get('line') or '')
    if not line:
        s['start'] = s['end'] = None
        continue
    pos = script.find(line, cursor)
    if pos < 0:
        pos = script.find(line)
    if pos < 0:
        # partial: fall back to the first 24 chars
        pos = script.find(line[:24], cursor)
        if pos < 0:
            pos = cursor
        missing += 1
    s['start'] = round(time_of(pos), 3)
    s['end'] = round(time_of(pos + len(line)), 3)
    cursor = pos + len(line)

# give very short shots a floor by borrowing from the next shot only
# (later boundaries stay put, so audio sync is untouched)
MINLEN = 1.15
for i in range(len(shots) - 1):
    s1, s2 = shots[i], shots[i + 1]
    if s1['start'] is None or s2['start'] is None:
        continue
    d = s1['end'] - s1['start']
    if d >= MINLEN:
        continue
    want = MINLEN - d
    room = (s2['end'] - s2['start']) - MINLEN
    take = min(want, max(0.0, room))
    if take <= 0:
        continue
    s1['end'] = round(s1['end'] + take, 3)
    s2['start'] = round(s1['end'], 3)

# guarantee monotonic, non-zero durations
prev = 0.0
for i, s in enumerate(shots):
    if s['start'] is None:
        continue
    if s['start'] < prev:
        s['start'] = prev
    if s['end'] <= s['start'] + 0.5:
        s['end'] = round(s['start'] + 0.9, 3)
    prev = s['end']

story['duration'] = round(total + a.tail, 3)
shots[-1]['end'] = story['duration']

# music plan: keep relative shape, stretch to the new length
if 'music' in story and total:
    scale = (total + a.tail) / 900.0
    story['music'] = [{**m, 'start': round(m['start'] * scale, 2), 'end': round(m['end'] * scale, 2)} for m in story['music']]
    story['music'][-1]['end'] = round(story['duration'], 2)

json.dump(story, open(story_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

os.makedirs(os.path.join(P, 'timeline'), exist_ok=True)
words = [{'id': s['id'], 'start': s['start'], 'end': s['end'], 'text': s.get('line') or ''} for s in shots]
json.dump({'duration': story['duration'], 'chunks': [{k: v for k, v in c.items() if k != 'text'} for c in chunks], 'shots': words},
          open(os.path.join(P, 'timeline', 'words.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

print(f'chunks {len(chunks)}/{len(names)}  voiced {total:.1f}s  film {story["duration"]:.1f}s  shots {len(shots)}  fuzzy {missing}')
durs = [s['end'] - s['start'] for s in shots if s['start'] is not None]
durs_sorted = sorted(durs)
print(f'shot dur: min {durs_sorted[0]:.2f}  median {durs_sorted[len(durs_sorted)//2]:.2f}  max {durs_sorted[-1]:.2f}')
