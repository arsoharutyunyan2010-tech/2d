#!/usr/bin/env python3
"""Render a project to MP4 with a Chromium that is already installed.

Two engines:

  * ``cdp`` (default) — launch Chromium once per worker over the DevTools protocol,
    draw each frame in the page, grab PNGs, pipe them into ffmpeg. No Playwright
    browser download is needed, so this works on Android/Termux with
    ``pkg install chromium``.
  * ``playwright`` — the same path the studio's render.mjs uses (needs the
    Playwright Chromium).

The silence + music + SFX mixing is still done by ``audio/mix.py`` afterwards.

  python tools/render_frames.py --project projects/my-video
  python tools/render_frames.py --project projects/my-video --from 0 --to 10 --scale 0.5
  python tools/render_frames.py --project projects/my-video --sheet        # quick look, 1 frame per shot

Options: --engine cdp|playwright  --from S --to S --scale K  --workers N
         --step N  --chrome PATH  --out FILE  --crf N  --timeout S
"""
import argparse, base64, json, os, shutil, subprocess, sys, threading, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from render_screenshots import Devtools, find_chrome, serve  # noqa: E402


def ffmpeg_encoder(out, fps, crf):
    return subprocess.Popen(
        ["ffmpeg", "-y", "-v", "error", "-f", "image2pipe", "-framerate", str(fps), "-i", "-",
         "-c:v", "libx264", "-preset", "veryfast", "-crf", str(crf), "-pix_fmt", "yuv420p",
         "-r", str(fps), out], stdin=subprocess.PIPE)


def render_worker(chrome, url, frames, out, fps, crf, scale_w, scale_h, prog, timeout):
    dev = Devtools(chrome)
    try:
        dev.page(url, scale_w, scale_h)
        dev.wait_event("Page.loadEventFired", timeout=timeout)
        for _ in range(1200):
            if dev.evaluate("!!(window.READY||window.BOOT_ERROR)"):
                break
            time.sleep(0.1)
        boot = dev.evaluate("window.BOOT_ERROR||''")
        if boot:
            raise RuntimeError("player failed to boot: " + boot.splitlines()[0])
        enc = ffmpeg_encoder(out, fps, crf)
        for f in frames:
            dev.evaluate(f"window.renderFrame({f})")
            dev.evaluate("new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(1))))", await_promise=True)
            png = base64.b64decode(dev.send("Page.captureScreenshot", format="png", fromSurface=True)["data"])
            enc.stdin.write(png)
            prog()
        enc.stdin.close()
        if enc.wait() != 0:
            raise RuntimeError("ffmpeg failed for " + out)
    finally:
        dev.close()


def run_cdp(a, chrome, proj, frames, fps, out):
    cfg = json.load(open(os.path.join(proj, "config.json"), encoding="utf-8"))
    base_w, base_h = (1080, 1920) if cfg.get("aspect") == "9:16" else (1920, 1080)
    W, H = int(base_w * float(a.scale)), int(base_h * float(a.scale))
    httpd = serve(proj, a.port or 0)
    port = httpd.server_address[1]
    url = f"http://127.0.0.1:{port}/player.html?scale={a.scale}"
    parts_dir = os.path.join(proj, "build", "parts")
    shutil.rmtree(parts_dir, ignore_errors=True)
    os.makedirs(parts_dir, exist_ok=True)
    n = len(frames)
    workers = max(1, min(a.workers, n))
    per = (n + workers - 1) // workers
    done = {"n": 0}
    lock = threading.Lock()
    t0 = time.time()

    def prog():
        with lock:
            done["n"] += 1
            k = done["n"]
        if k % max(1, n // 20) == 0 or k == n:
            el = time.time() - t0
            print(f"  {k}/{n} frames  {k / el:.2f} fps  elapsed {el / 60:.1f}m  eta {el / k * (n - k) / 60:.1f}m")

    print(f"Rendering {n} frame(s) at {fps} fps with {workers} worker(s) → {W}x{H}")
    errs = []
    threads = []
    parts = []
    for i in range(workers):
        chunk = frames[i * per:(i + 1) * per]
        if not chunk:
            continue
        part = os.path.join(parts_dir, f"part_{i:03d}.mp4")
        parts.append(part)

        def job(chunk=chunk, part=part):
            try:
                render_worker(chrome, url, chunk, part, fps, a.crf, W, H, prog, a.timeout)
            except Exception as e:  # noqa: BLE001
                errs.append(f"worker {part}: {e}")

        th = threading.Thread(target=job)
        th.start()
        threads.append(th)
    for th in threads:
        th.join()
    httpd.shutdown()
    if errs:
        sys.exit("render failed:\n  " + "\n  ".join(errs))
    lst = os.path.join(parts_dir, "list.txt")
    with open(lst, "w") as f:
        for p in parts:
            f.write(f"file '{p}'\n")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst,
                    "-c", "copy", "-movflags", "+faststart", out], check=True)
    if not a.keep_frames:
        shutil.rmtree(parts_dir, ignore_errors=True)


def run_playwright(a, proj, out):
    cmd = ["node", os.path.join(ROOT, "render.mjs"), "--project", proj, "--out", out,
           "--scale", str(a.scale), "--workers", str(a.workers)]
    if a.t0:
        cmd += ["--from", str(a.t0)]
    if a.t1 is not None:
        cmd += ["--to", str(a.t1)]
    subprocess.run(cmd, cwd=ROOT, check=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--project", required=True)
    ap.add_argument("--engine", choices=["cdp", "playwright"], default="cdp")
    ap.add_argument("--from", dest="t0", type=float, default=0.0)
    ap.add_argument("--to", dest="t1", type=float)
    ap.add_argument("--scale", default="1")
    ap.add_argument("--workers", type=int, default=1)
    ap.add_argument("--step", type=int, default=1, help="render every Nth frame (quick tests)")
    ap.add_argument("--sheet", action="store_true", help="one frame per shot instead of a video")
    ap.add_argument("--chrome")
    ap.add_argument("--port", type=int, default=0)
    ap.add_argument("--crf", type=int, default=20)
    ap.add_argument("--timeout", type=int, default=300)
    ap.add_argument("--out")
    ap.add_argument("--keep-frames", action="store_true")
    a = ap.parse_args()

    proj = os.path.abspath(a.project)
    cfg = json.load(open(os.path.join(proj, "config.json"), encoding="utf-8"))
    story = json.load(open(os.path.join(proj, "story", "shots.json"), encoding="utf-8"))
    fps = cfg.get("fps", 24)

    if a.sheet:
        subprocess.run([sys.executable, os.path.join(ROOT, "tools", "render_screenshots.py"),
                        "--project", proj, "--sheet", "--scale", a.scale, *(["--chrome", a.chrome] if a.chrome else [])],
                       check=True)
        return

    dur = story.get("duration") or story["shots"][-1]["end"]
    t1 = a.t1 if a.t1 is not None else dur
    out = os.path.abspath(a.out or os.path.join(proj, "build", "video_silent.mp4"))

    if a.engine == "playwright":
        run_playwright(a, proj, out)
    else:
        chrome = find_chrome(a.chrome)
        if not chrome:
            sys.exit("Chromium not found. Termux: pkg install chromium   (or pass --chrome PATH)")
        frames = list(range(int(round(a.t0 * fps)), int(round(t1 * fps)), a.step))
        if not frames:
            sys.exit("empty frame range")
        run_cdp(a, chrome, proj, frames, fps / a.step, out)
    print(f"\nDone: {out}")
    print(f"Next: python audio/mix.py --project {os.path.relpath(proj, ROOT)}")


if __name__ == "__main__":
    main()
