#!/usr/bin/env python3
"""Print a contiguous frame range that covers the shots you want to preview.

  python tools/shot_ranges.py --project projects/my-video                # every shot
  python tools/shot_ranges.py --project projects/my-video --shots s003,s004
  python tools/shot_ranges.py --project projects/my-video --t 12.5,40

Prints e.g. "3.42 9.10" = pass --from 3.42 --to 9.10 to tools/render_frames.py.
"""
import argparse, json, os, sys

ap = argparse.ArgumentParser()
ap.add_argument("--project", required=True)
ap.add_argument("--shots", help="comma-separated shot ids")
ap.add_argument("--t", help="comma-separated times in seconds")
ap.add_argument("--pad", type=float, default=0.0)
a = ap.parse_args()
cfg = json.load(open(os.path.join(a.project, "config.json"), encoding="utf-8"))
st = json.load(open(os.path.join(a.project, "story", "shots.json"), encoding="utf-8"))
fps = cfg.get("fps", 24)
if a.t:
    ts = [float(x) for x in a.t.split(",")]
    lo, hi = min(ts), max(ts) + 1.0 / fps
elif a.shots:
    ids = {s.strip() for s in a.shots.split(",")}
    sel = [s for s in st["shots"] if s["id"] in ids]
    missing = ids - {s["id"] for s in sel}
    if missing:
        sys.exit("unknown shot id(s): " + ", ".join(sorted(missing)))
    lo, hi = min(s["start"] for s in sel), max(s["end"] for s in sel)
else:
    lo, hi = 0.0, st.get("duration") or st["shots"][-1]["end"]
lo, hi = max(0.0, lo - a.pad), hi + a.pad
print(f"{lo:.2f} {hi:.2f}")
