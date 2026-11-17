"""tools/layout.py — lay out story/shots.json timing from the narration and the VO length.

  python3 tools/layout.py --project P [--duration SECONDS] [--min 1.2] [--max 8.5]

Each shot has a `line` (the narration it illustrates). Shots get time proportional to how much text
they own, with a floor so short beats still breathe. The total is stretched to the voiceover length
(+ tail). Idempotent: re-running after adding voice clips re-times everything.
"""
import argparse, json, os, subprocess, sys

ap = argparse.ArgumentParser()
ap.add_argument('--project', required=True)
ap.add_argument('--duration', type=float)
ap.add_argument('--tail', type=float, default=2.2)
ap.add_argument('--min', type=float, default=1.15)
ap.add_argument('--max', type=float, default=8.5)
ap.add_argument('--voice')
a = ap.parse_args()

P = a.project
story_path = os.path.join(P, 'story', 'shots.json')
cfg_path = os.path.join(P, 'config.json')
story = json.load(open(story_path, encoding='utf-8'))
cfg = json.load(open(cfg_path, encoding='utf-8')) if os.path.exists(cfg_path) else {}

def probe(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', path],
                       capture_output=True, text=True)
    try:
        return float(r.stdout.strip())
    except Exception:
        return 0.0

duration = a.duration
if duration is None:
    voice = a.voice or cfg.get('voiceover')
    if voice and os.path.exists(os.path.join(P, voice)):
        duration = probe(os.path.join(P, voice))
if not duration:
    print('no voiceover / --duration; using the current shot sum')
    duration = sum(s['end'] - s['start'] for s in story['shots'])

shots = story['shots']
target = duration + a.tail

# weights: characters of narration, with a floor and a preference for short beats
weights = []
for s in shots:
    n = len((s.get('line') or '').strip())
    weights.append(max(n * 1.25, 46) ** 0.92)

raw = [w / sum(weights) * target for w in weights]
# clamp, then redistribute the difference
for _ in range(60):
    total = sum(raw)
    diff = target - total
    if abs(diff) < 0.01:
        break
    free = [i for i, d in enumerate(raw) if (diff > 0 and d < a.max) or (diff < 0 and d > a.min)]
    if not free:
        break
    per = diff / len(free)
    for i in free:
        raw[i] = min(a.max, max(a.min, raw[i] + per))

t = 0.0
for s, d in zip(shots, raw):
    s['start'] = round(t, 3)
    t += d
    s['end'] = round(t, 3)
shots[-1]['end'] = round(target, 3)
story['duration'] = round(target, 3)

# re-time the music plan proportionally to the acts it was written for
if 'music' in story and duration:
    scale = target / 900.0
    story['music'] = [{**m, 'start': round(m['start'] * scale, 2), 'end': round(m['end'] * scale, 2)} for m in story['music']]
    story['music'][-1]['end'] = round(target, 2)

json.dump(story, open(story_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
if os.path.exists(cfg_path):
    cfg['duration'] = round(target, 3)
    json.dump(cfg, open(cfg_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
durs = [s['end'] - s['start'] for s in shots]
durs_sorted = sorted(durs)
print(f'{len(shots)} shots, total {story["duration"]}s, median {durs_sorted[len(durs)//2]:.2f}s, '
      f'min {min(durs):.2f}s, max {max(durs):.2f}s')
print(f'{len(shots) / (story["duration"] / 60):.1f} shots/min')
