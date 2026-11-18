#!/usr/bin/env python3
"""Render project stills with a ready Chromium (no Playwright install needed).

The studio's render.mjs drives Chromium through Playwright, whose bundled browser
cannot be installed on Android/Termux. This script can use either:

  * a Chromium that is already on the machine (Termux: `pkg install chromium`),
    launched once over the DevTools protocol and reused for every still — the fast
    path; or
  * Chromium's own `--screenshot` mode (one process per still, simplest, slow on
    phones) with `--mode shot`.

  python tools/render_screenshots.py --project projects/my-video --sheet
  python tools/render_screenshots.py --project projects/my-video --stills 3,12,40
  python tools/render_screenshots.py --project projects/my-video --styles dusk,midnight --at 3,12

Options: --scale K --chrome PATH --port N --mode cdp|shot --timeout S
Needs: python3 (stdlib only) + Chromium/Chrome.
"""
import argparse, base64, functools, glob, json, os, shutil, socket, struct, subprocess, sys, tempfile, threading, time, urllib.parse, urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MIME = {".json": "application/json", ".js": "text/javascript", ".mjs": "text/javascript",
        ".html": "text/html", ".png": "image/png", ".jpg": "image/jpeg", ".woff2": "font/woff2",
        ".txt": "text/plain", ".srt": "text/plain", ".mp3": "audio/mpeg", ".wav": "audio/wav"}

CANDIDATES = [
    os.environ.get("CHROMIUM_PATH", ""), os.environ.get("CHROME_PATH", ""),
    "/data/data/com.termux/files/usr/bin/chromium-browser",
    "/data/data/com.termux/files/usr/bin/chromium",
    "/usr/bin/chromium", "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
]
for pat in ("/root/.cache/ms-playwright/chromium-*/chrome-linux/chrome",
            os.path.expanduser("~/.cache/ms-playwright/chromium-*/chrome-linux/chrome")):
    CANDIDATES += sorted(glob.glob(pat), reverse=True)


def find_chrome(explicit=None):
    for c in ([explicit] if explicit else []) + CANDIDATES:
        if c and os.path.isfile(c) and os.access(c, os.X_OK):
            return c
    for name in ("chromium-browser", "chromium", "google-chrome", "chrome"):
        p = shutil.which(name)
        if p:
            return p
    return None


# ---------------------------------------------------------------- DevTools client
class WS:
    """Bare-bones WebSocket client (stdlib only) for the DevTools protocol."""

    def __init__(self, url):
        _, rest = url.split("://", 1)
        hostport, path = rest.split("/", 1)
        host, port = hostport.split(":")
        self.s = socket.create_connection((host, int(port)), timeout=120)
        key = base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET /{path} HTTP/1.1\r\nHost: {hostport}\r\nUpgrade: websocket\r\n"
                        f"Connection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        buf = b""
        while b"\r\n\r\n" not in buf:
            buf += self.s.recv(4096)
        head, self.buf = buf.split(b"\r\n\r\n", 1)
        if b" 101 " not in head.split(b"\r\n")[0]:
            raise ConnectionError("devtools handshake refused: " + head.decode("latin-1").splitlines()[0])

    def _read(self, n):
        while len(self.buf) < n:
            chunk = self.s.recv(65536)
            if not chunk:
                raise ConnectionError("devtools socket closed")
            self.buf += chunk
        out, self.buf = self.buf[:n], self.buf[n:]
        return out

    def send(self, text):
        data = text.encode()
        head = bytearray([0x81])
        n = len(data)
        if n < 126:
            head.append(0x80 | n)
        elif n < 65536:
            head.append(0x80 | 126); head += struct.pack(">H", n)
        else:
            head.append(0x80 | 127); head += struct.pack(">Q", n)
        mask = os.urandom(4)
        head += mask
        self.s.sendall(bytes(head) + bytes(b ^ mask[i % 4] for i, b in enumerate(data)))

    def recv(self):
        while True:
            b1, b2 = self._read(2)
            op, n = b1 & 0x0F, b2 & 0x7F
            if n == 126:
                n = struct.unpack(">H", self._read(2))[0]
            elif n == 127:
                n = struct.unpack(">Q", self._read(8))[0]
            payload = self._read(n)
            if op == 0x9:          # ping
                self.s.sendall(bytes([0x8A, 0x80]) + os.urandom(4))
                continue
            if op == 0x8:
                raise ConnectionError("devtools closed")
            return payload.decode("utf-8", "replace")


class Devtools:
    def __init__(self, chrome, extra_args=()):
        self.profile = tempfile.mkdtemp(prefix="studio-chrome-")
        self.proc = subprocess.Popen(
            [chrome, "--headless=new", "--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars",
             "--disable-gpu-sandbox", "--remote-debugging-port=0", f"--user-data-dir={self.profile}",
             "--no-first-run", "--no-default-browser-check", *extra_args, "about:blank"],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        port_file = os.path.join(self.profile, "DevToolsActivePort")
        txt = None
        for _ in range(600):
            if os.path.exists(port_file):
                txt = open(port_file).read().split()
                if len(txt) >= 2:
                    self.port = int(txt[0]); break
            if self.proc.poll() is not None:
                raise RuntimeError("Chromium exited immediately — try --mode shot or check the binary")
            time.sleep(0.05)
        else:
            raise RuntimeError("Chromium did not open a DevTools port")
        target = None
        for _ in range(200):        # the browser socket has no Page domain: attach to a page target
            try:
                listing = json.loads(urllib.request.urlopen(f"http://127.0.0.1:{self.port}/json/list", timeout=5).read())
            except Exception:
                time.sleep(0.05); continue
            pages = [t for t in listing if t.get("type") == "page" and t.get("webSocketDebuggerUrl")]
            if pages:
                target = pages[0]; break
            time.sleep(0.05)
        if not target:
            raise RuntimeError("no page target for DevTools")
        self.ws = WS(target["webSocketDebuggerUrl"])
        self.id = 0
        self.events = []

    def send(self, method, **params):
        self.id += 1
        self.ws.send(json.dumps({"id": self.id, "method": method, "params": params}))
        while True:
            msg = json.loads(self.ws.recv())
            if msg.get("id") == self.id:
                if "error" in msg:
                    raise RuntimeError(f"{method}: {msg['error'].get('message')}")
                return msg.get("result", {})
            self.events.append(msg)

    def page(self, url, width, height):
        self.send("Emulation.setDeviceMetricsOverride", width=width, height=height, deviceScaleFactor=1, mobile=False)
        self.send("Page.enable")
        self.send("Page.navigate", url=url)
        return self

    def evaluate(self, expr, await_promise=False):
        r = self.send("Runtime.evaluate", expression=expr, awaitPromise=await_promise, returnByValue=True)
        if r.get("exceptionDetails"):
            raise RuntimeError(str(r["exceptionDetails"].get("exception", {}).get("description")))
        return r.get("result", {}).get("value")

    def wait_event(self, name, timeout=180):
        end = time.time() + timeout
        for i, e in enumerate(self.events):
            if e.get("method") == name:
                return self.events.pop(i)
        while time.time() < end:
            msg = json.loads(self.ws.recv())
            if msg.get("method") == name:
                return msg
            self.events.append(msg)
        raise TimeoutError(f"no '{name}' event")

    def screenshot(self, path):
        self.evaluate("new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(1))))", await_promise=True)
        data = self.send("Page.captureScreenshot", format="png", fromSurface=True)["data"]
        with open(path, "wb") as f:
            f.write(base64.b64decode(data))

    def close(self):
        try:
            self.ws.s.close()
        except Exception:
            pass
        self.proc.kill()
        shutil.rmtree(self.profile, ignore_errors=True)


# ---------------------------------------------------------------- static server
class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def do_GET(self):
        if self.path.split("?")[0] == "/__sheet" and getattr(self.server, "sheet_html", None):
            body = self.server.sheet_html.encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if self.path.split("?")[0] == "/__manifest":
            proj = self.server.project
            out = []
            for dirpath, _, files in os.walk(os.path.join(proj, "scenes")):
                for f in sorted(files):
                    if f.endswith(".js") and not f.startswith("_"):
                        out.append("/project/" + os.path.relpath(os.path.join(dirpath, f), proj).replace(os.sep, "/"))
            body = json.dumps(out).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        # a project lives outside the studio folder: /project/... is served from it
        if self.path.startswith("/project/"):
            proj = getattr(self.server, "project", None)
            if proj:
                rel = self.path[len("/project/"):].split("?")[0]
                target = os.path.join(proj, rel)
                if os.path.isfile(target):
                    self.send_response(200)
                    self.send_header("Content-Type", MIME.get(os.path.splitext(target)[1], "application/octet-stream"))
                    self.send_header("Content-Length", str(os.path.getsize(target)))
                    self.end_headers()
                    with open(target, "rb") as f:
                        self.wfile.write(f.read())
                    return
            self.send_response(404)
            self.end_headers()
            return
        return super().do_GET()


def serve(proj, port):
    httpd = ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Handler, directory=ROOT))
    httpd.project = proj
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def make_contact_sheet(chrome, port, proj, outdir, names, cols=4, cell=440):
    """Grid of all stills as one PNG, rendered by the browser itself."""
    names = sorted(n for n in names if n.lower().endswith(".png"))
    if not names:
        return
    rel_dir = os.path.relpath(outdir, proj).replace(os.sep, "/")
    base = f"http://127.0.0.1:{port}/project/{rel_dir}"
    cells = "".join(f'<div class="c"><img src="{base}/{n}"><span>{os.path.splitext(n)[0]}</span></div>' for n in names)
    html = ("<html><body style=\"margin:0;background:#111;font:600 14px sans-serif;color:#ddd\">"
            f'<div class="g">{"".join(cells)}</div>'
            f"<style>.g{{display:flex;flex-wrap:wrap;gap:8px;padding:8px;align-items:flex-start}}"
            f".c{{width:{cell}px}}img{{width:100%;display:block;border-radius:4px}}"
            f"span{{display:block;padding:3px 1px}}"
            f"body{{animation:keep 1s linear infinite}}@keyframes keep{{to{{opacity:.998}}}}</style></body></html>")
    # serve the grid from the same origin as the stills (data: pages cannot load them)
    srv = getattr(make_contact_sheet, "_httpd", None)
    if srv is None:
        srv = make_contact_sheet._httpd = serve(proj, port + 3)
    srv.sheet_html = html
    data = f"http://127.0.0.1:{port + 3}/__sheet"
    W = cols * (cell + 8) + 8
    H = 40  # replaced by the measured height below
    d = Devtools(chrome)
    try:
        d.page(data, W, max(H, 400))
        d.wait_event("Page.loadEventFired", timeout=60)
        for _ in range(200):                       # wait until every still actually decoded
            if d.evaluate("Array.from(document.images).every(i=>i.complete&&i.naturalWidth>0)"):
                break
            time.sleep(0.1)
        d.evaluate("new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(1))))", await_promise=True)
        H = int(d.evaluate("document.body.scrollHeight"))
        d.send("Emulation.setDeviceMetricsOverride", width=W, height=H, deviceScaleFactor=1, mobile=False)
        out = os.path.join(outdir, "contact_sheet.png")
        data_png = d.send("Page.captureScreenshot", format="png", captureBeyondViewport=True,
                          clip={"x": 0, "y": 0, "width": W, "height": H, "scale": 1})["data"]
        with open(out, "wb") as f:
            f.write(base64.b64decode(data_png))
        print(f"  contact sheet: {out}")
    finally:
        d.close()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--project", required=True)
    ap.add_argument("--sheet", action="store_true")
    ap.add_argument("--stills")
    ap.add_argument("--styles")
    ap.add_argument("--at")
    ap.add_argument("--scale", default="1")
    ap.add_argument("--chrome")
    ap.add_argument("--port", type=int, default=0)
    ap.add_argument("--mode", choices=["cdp", "shot"], default="cdp")
    ap.add_argument("--timeout", type=int, default=120)
    ap.add_argument("--no-contact", dest="contact", action="store_false", help="skip the contact-sheet PNG")
    a = ap.parse_args()

    proj = os.path.abspath(a.project)
    cfg = json.load(open(os.path.join(proj, "config.json"), encoding="utf-8"))
    fps = cfg.get("fps", 24)
    small = cfg.get("resolution", "1080p")
    base_w = 1080 if cfg.get("aspect") == "9:16" else 1920
    base_h = 1920 if cfg.get("aspect") == "9:16" else 1080
    W, H = int(base_w * float(a.scale)), int(base_h * float(a.scale))

    styles = [s for s in (a.styles or "").split(",") if s] or [None]
    if a.sheet:
        st = json.load(open(os.path.join(proj, "story", "shots.json"), encoding="utf-8"))
        targets = [(s["id"], s["start"] + (s["end"] - s["start"]) * 0.45) for s in st["shots"]]
    else:
        times = a.at or a.stills or "1"
        targets = [(f"{float(t):.2f}", float(t)) for t in times.split(",")]

    outdir = os.path.join(proj, "build", "styles" if a.styles else "sheets" if a.sheet else "stills")
    shutil.rmtree(outdir, ignore_errors=True)
    os.makedirs(outdir, exist_ok=True)

    chrome = find_chrome(a.chrome)
    if not chrome:
        sys.exit("Chromium not found. Termux: pkg install chromium  (or pass --chrome PATH)")
    port = a.port or 8765
    httpd = serve(proj, port)
    url_base = f"http://127.0.0.1:{port}"
    written = 0
    try:
        dev = None
        if a.mode == "cdp":
            try:
                dev = Devtools(chrome)
            except Exception as e:
                print(f"  DevTools launch failed ({e}); falling back to --screenshot mode")
        for st in styles:
            if dev:
                # one page per style: from then on every still is just renderFrame(n) + screenshot
                qs = f"?scale={a.scale}" + (f"&style={st}" if st else "")
                dev.page(f"{url_base}/player.html{qs}", W, H)
                dev.wait_event("Page.loadEventFired", timeout=a.timeout)
                for _ in range(600):
                    if dev.evaluate("!!(window.READY||window.BOOT_ERROR)"):
                        break
                    time.sleep(0.1)
                boot = dev.evaluate("window.BOOT_ERROR||''")
                if boot:
                    sys.exit("player failed to boot: " + boot.splitlines()[0])
                for label, t in targets:
                    frame = round(t * fps)
                    dev.evaluate(f"window.renderFrame({frame})")
                    name = f"{st + '_' if st else ''}{label.replace(' ', '_').replace('/', '-')}.png"
                    dev.screenshot(os.path.join(outdir, name))
                    print(f"  {name}  ({t:.1f}s, frame {frame})")
                    written += 1
            else:
                prof = tempfile.mkdtemp(prefix="studio-chrome-")
                for label, t in targets:
                    frame = round(t * fps)
                    qs = f"?scale={a.scale}" + (f"&style={st}" if st else "")
                    name = f"{st + '_' if st else ''}{label.replace(' ', '_').replace('/', '-')}.png"
                    dest = os.path.join(outdir, name)
                    cmd = [chrome, "--headless=new", "--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars",
                           "--use-gl=swiftshader", "--enable-unsafe-swiftshader", f"--user-data-dir={prof}",
                           "--virtual-time-budget=4000", f"--window-size={W},{H}",
                           f"{url_base}/player.html{qs}#f={frame}", "--screenshot=" + dest]
                    r = subprocess.run(cmd, capture_output=True, text=True, timeout=a.timeout)
                    if not os.path.exists(dest):
                        sys.exit("chromium produced no image — " + "\n  ".join((r.stderr or "").strip().splitlines()[-4:]))
                    print(f"  {name}  ({t:.1f}s)")
                    written += 1
                shutil.rmtree(prof, ignore_errors=True)
        if written and (a.sheet or a.styles) and a.contact:   # while the stills are still being served
            try:
                make_contact_sheet(chrome, port, proj, outdir, os.listdir(outdir))
            except Exception as e:
                print(f"  (contact sheet skipped: {e})")
    finally:
        if dev:
            dev.close()
        httpd.shutdown()
    print(f"Wrote {written} still(s) to {outdir}")
    print("Open the PNGs there (deleted browsers: copy to /sdcard/Pictures to view them in the gallery).")


if __name__ == "__main__":
    main()
