// render-node.mjs — headless frame renderer that draws with Skia (@napi-rs/canvas) instead of Chromium.
// Same look, same engine files, same shots.json; frames are encoded with ffmpeg.
//
//   node render-node.mjs --project projects/my-video                     full video -> build/video_silent.mp4
//   node render-node.mjs --project P --from 30 --to 45 --scale 0.5        preview a range
//   node render-node.mjs --project P --sheet                              one still per shot -> build/sheets/
//   node render-node.mjs --project P --stills 3.5,12,40                   stills -> build/stills/
//   node render-node.mjs --project P --styles dusk,midnight --at 3.5,12   style comparison grid
// Options: --scale K  --style ID  --format jpeg|png  --crf 18  --fps N  --out FILE
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createCanvas, GlobalFonts, ImageData as SkiaImageData } from '@napi-rs/canvas';
import { register } from 'node:module';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const args = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) { if (a[i].startsWith('--')) { const k = a[i].slice(2); const v = a[i + 1] && !a[i + 1].startsWith('--') ? a[++i] : true; args[k] = v; } } }
if (!args.project) { console.error('usage: node render-node.mjs --project projects/<name> [options]'); process.exit(1); }
const PROJECT = path.resolve(String(args.project));
// scene files import '/engine/...' and '/project/...' the way the browser player serves them
process.env.RAZGON_STUDIO = ROOT; process.env.RAZGON_PROJECT = PROJECT;
register('data:text/javascript,' + encodeURIComponent(`
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const STUDIO = process.env.RAZGON_STUDIO, PROJECT = process.env.RAZGON_PROJECT;
export async function resolve(spec, ctx, next) {
  if (spec.startsWith('/engine/')) return next(pathToFileURL(path.join(STUDIO, spec.slice(1))).href, ctx);
  if (spec.startsWith('/node_modules/')) return next(pathToFileURL(path.join(STUDIO, spec.slice(1))).href, ctx);
  if (spec.startsWith('/project/')) return next(pathToFileURL(path.join(PROJECT, spec.slice(9))).href, ctx);
  return next(spec, ctx);
}`));
const BUILD = path.join(PROJECT, 'build'); fs.mkdirSync(BUILD, { recursive: true });

// ---------- browser shims the engine expects ----------
globalThis.document = { createElement(tag) { if (tag !== 'canvas') throw new Error('only canvas'); return createCanvas(1, 1); } };
if (typeof globalThis.ImageData === 'undefined') globalThis.ImageData = SkiaImageData;

// ---------- fonts ----------
const FONTS = [
  ['NotoSansArmenian.ttf', ['Nunito', 'Fredoka', 'NotoArm']],   // covers Armenian + Cyrillic + Latin
  ['Nunito.ttf', ['Nunito', 'NotoArm']],
  ['PlayfairDisplay.ttf', ['Playfair Display']],
];
const FONT_DIRS = [path.join(ROOT, 'fonts'), path.join(ROOT, 'node_modules'), path.join(ROOT, 'node_modules/@fontsource')];
for (const dir of FONT_DIRS) {
  if (!fs.existsSync(dir)) continue;
  const walk = (d, depth = 0) => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) { if (depth < 4) walk(p, depth + 1); } else if (/\.(ttf|otf|woff2)$/i.test(f)) { try { GlobalFonts.registerFromPath(p); } catch {} } } };
  walk(dir);
}
// explicitly alias so "Fredoka"/"Nunito"/"Playfair Display" resolve to fonts that contain Armenian + Latin
const alias = [['NotoSansArmenian.ttf', ['Nunito', 'Fredoka', 'NotoArm', 'Playfair Display']], ['Nunito.ttf', ['Nunito', 'NotoArm']], ['PlayfairDisplay.ttf', ['Playfair Display']]];
for (const [file, families] of alias) for (const dir of [path.join(ROOT, 'fonts')]) { const p = path.join(dir, file); if (fs.existsSync(p)) for (const fam of families) { try { GlobalFonts.registerFromPath(p, fam); } catch {} } }

// ---------- import the engine ----------
const core = await import(pathToFileURL(path.join(ROOT, 'engine/core.js')).href);
const playerish = await import(pathToFileURL(path.join(ROOT, 'engine/ui2d.js')).href);
const { E, V, setStyle, getShot, clamp, lerp, ease, prog, alpha, text, FONTS: F } = core;
const { STYLES } = await import(pathToFileURL(path.join(ROOT, 'engine/styles.js')).href);

const CFG = JSON.parse(fs.readFileSync(path.join(PROJECT, 'config.json'), 'utf8'));
const STORY = JSON.parse(fs.readFileSync(path.join(PROJECT, 'story/shots.json'), 'utf8'));
let WORDS = [];
try { WORDS = JSON.parse(fs.readFileSync(path.join(PROJECT, 'timeline/words.json'), 'utf8')).words || []; } catch {}
try { const alt = JSON.parse(fs.readFileSync(path.join(PROJECT, 'timeline/words.json'), 'utf8')); WORDS = alt.words || alt; } catch {}
if (!Array.isArray(WORDS)) WORDS = [];

const SCALE = +(args.scale || 1);
const RES = { '720p': 720, '1080p': 1080, '1440p': 1440, '2160p': 2160, '4k': 2160 };
const vertical = (CFG.aspect || '16:9') === '9:16';
const short = RES[CFG.resolution || '1080p'] || 1080, long = Math.round((short * 16) / 9 / 2) * 2;
const outW = Math.round(((vertical ? short : long) * SCALE) / 2) * 2, outH = Math.round(((vertical ? long : short) * SCALE) / 2) * 2;
const FPS = +(args.fps || CFG.fps || 24);

Object.assign(E, { vertical, W: vertical ? 1080 : 1920, H: vertical ? 1920 : 1080, fps: FPS, cfg: CFG, words: WORDS, shots: STORY.shots, outW, outH });
E.PX = outW / E.W;
setStyle(String(args.style || CFG.style || 'dusk'));

const main = createCanvas(outW, outH), mg = main.getContext('2d');
const mk = (w, h) => createCanvas(w, h);
const bufA = mk(outW, outH), bufB = mk(outW, outH), bufT = mk(outW, outH), bufC = mk(outW, outH);
const grainTiles = [];
{ const gw = Math.ceil(outW / 2), gh = Math.ceil(outH / 2);
  for (let k = 0; k < 4; k++) { const c = mk(gw, gh), x = c.getContext('2d'), id = x.createImageData(gw, gh); let s = 1234 + k * 999;
    for (let i = 0; i < id.data.length; i += 4) { s = (s * 1664525 + 1013904223) >>> 0; const v = s >>> 24; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
    x.putImageData(id, 0, 0); grainTiles.push(c); } }

// ---------- colour grade (same math as the player, but in place) ----------
let LUT = null, SAT = 1;
{ const gr = E.style.grade || {}; const lift = gr.lift || [0, 0, 0], gam = gr.gamma || [1, 1, 1], gain = gr.gain || [1, 1, 1], con = gr.contrast ?? 1; SAT = gr.sat ?? 1;
  const ident = con === 1 && lift.every(v => v === 0) && gam.every(v => v === 1) && gain.every(v => v === 1);
  if (!(ident && SAT === 1)) LUT = [0, 1, 2].map(c => { const a = new Uint8ClampedArray(256); for (let i = 0; i < 256; i++) { let x = i / 255; x = clamp((x - 0.5) * con + 0.5); x = clamp(gain[c] * (x + lift[c] * (1 - x))); x = Math.pow(x, 1 / gam[c]); a[i] = Math.round(x * 255); } return a; }); }
function applyGrade(W, H) {
  if (!LUT) return; const img = mg.getImageData(0, 0, W, H), d = img.data, [R, G, B] = LUT, s = SAT;
  for (let i = 0; i < d.length; i += 4) {
    let r = R[d[i]], g = G[d[i + 1]], b = B[d[i + 2]];
    if (s !== 1) { const l = 0.2126 * r + 0.7152 * g + 0.0722 * b; r = l + (r - l) * s; g = l + (g - l) * s; b = l + (b - l) * s; }
    d[i] = r; d[i + 1] = g; d[i + 2] = b;
  }
  mg.putImageData(img, 0, 0);
}

// ---------- shot loading ----------
const errors = [];
const SHOTS = {};
function listFiles(dir, base) { let out = []; if (!fs.existsSync(dir)) return out; for (const f of fs.readdirSync(dir).sort()) { const p = path.join(dir, f); if (fs.statSync(p).isDirectory()) out = out.concat(listFiles(p, `${base}/${f}`)); else if (f.endsWith('.js') && !f.startsWith('_')) out.push(path.join(dir, f)); } return out; }
for (const p of listFiles(path.join(PROJECT, 'scenes'), 'scenes')) {
  try { await import(pathToFileURL(p).href); } catch (e) { errors.push(`import ${path.relative(PROJECT, p)}: ${e.message}`); console.log('IMPORT ERROR', path.relative(PROJECT, p), e.message); }
}
function shotIndexAt(t) { const S = E.shots; for (let i = 0; i < S.length; i++) if (t < S[i].end) return i; return S.length - 1; }
function drawShot(buf, shot, lt) {
  const g = buf.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  g.fillStyle = '#000'; g.fillRect(0, 0, buf.width, buf.height); g.setTransform(E.PX, 0, 0, E.PX, 0, 0);
  const def = getShot(shot.id); const dur = shot.end - shot.start;
  const info = { ...(shot.params || {}), shot, dur, globalT: shot.start + lt, p: clamp(lt / dur), line: shot.line };
  if (!def) { g.fillStyle = '#20141c'; g.fillRect(0, 0, E.W, E.H); text(g, `MISSING SHOT ${shot.id}`, E.W / 2, E.H / 2 - 30, { size: 60, color: '#ff6f61' }); text(g, (shot.line || '').slice(0, 80), E.W / 2, E.H / 2 + 50, { size: 30, color: '#fff', font: F.ui, weight: 800 }); return; }
  try { g.save(); def.draw(g, lt, info); g.restore(); }
  catch (e) { const msg = `${shot.id}@${lt.toFixed(2)}: ${e.message}`; if (!errors.includes(msg) && errors.length < 200) { errors.push(msg); console.log('SHOT ERROR', msg, (e.stack || '').split('\n')[1] || ''); }
    g.setTransform(E.PX, 0, 0, E.PX, 0, 0); text(g, 'ERROR ' + msg.slice(0, 90), E.W / 2, E.H / 2, { size: 34, color: '#ff4040', font: F.ui, weight: 900 }); }
}
function drawShotMB(buf, shot, lt) {
  const mb = shot.mb ?? 0, n = typeof mb === 'object' ? mb.n : mb;
  if (!n || n < 2) return drawShot(buf, shot, lt);
  const sh = (typeof mb === 'object' && mb.shutter) || 0.5, g = buf.getContext('2d');
  for (let i = 0; i < n; i++) { drawShot(bufT, shot, Math.max(0, lt + (i / (n - 1) - 0.5) * sh / E.fps));
    g.setTransform(1, 0, 0, 1, 0, 0); g.filter = 'none'; g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1 / (i + 1); g.drawImage(bufT, 0, 0); }
  g.globalAlpha = 1;
}
function slide(k0, k1, W, H, dir, vertical2, n) {
  for (let s = 0; s < n; s++) {
    const kk = ease.inOut(clamp(lerp(k0, k1, n === 1 ? 0.5 : s / (n - 1)))), off = kk * (vertical2 ? H : W);
    const c = bufC.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    if (vertical2) { c.drawImage(bufB, 0, -dir * off); c.drawImage(bufA, 0, dir * (H - off)); }
    else { c.drawImage(bufB, -dir * off, 0); c.drawImage(bufA, dir * (W - off), 0); }
    mg.globalAlpha = 1 / (s + 1); mg.drawImage(bufC, 0, 0);
  }
  mg.globalAlpha = 1;
}
function drawAround(img, ax, ay, px, py, sc, a = 1) { mg.save(); mg.globalAlpha = a; mg.translate(px, py); mg.scale(sc, sc); mg.translate(-ax, -ay); mg.drawImage(img, 0, 0); mg.restore(); }
const BARS = () => ({ none: 0, wide: V(60, 0), scope: V(138, 170), thin: V(30, 60) });
const barVal = (s) => (typeof (s?.bars ?? E.cfg.bars) === 'number' ? (s.bars ?? E.cfg.bars) : BARS()[s?.bars ?? E.cfg.bars ?? V('wide', 'none')] ?? 0);
const DURATION = STORY.duration || E.shots[E.shots.length - 1].end;

function renderFrameTo(f) {
  const t = f / E.fps, i = shotIndexAt(t), shot = E.shots[i], lt = Math.max(0, t - shot.start);
  drawShotMB(bufA, shot, lt);
  const tr = shot.in || { type: 'cut' }, tdur = tr.dur ?? ({ whip: 0.35, push: 0.6, iris: 0.7, match: 0.6, smash: 0.45 }[tr.type] || 0.5);
  const W = main.width, H = main.height; mg.setTransform(1, 0, 0, 1, 0, 0); mg.globalAlpha = 1; mg.globalCompositeOperation = 'source-over';
  const grade = E.style.grade; mg.filter = grade.filter && grade.filter !== 'none' ? grade.filter : 'none';
  if (tr.type === 'smash' && i > 0 && lt < tdur) {
    const x = lt, amp = 16 * Math.exp(-x * 9) * E.PX, ox = Math.sin(x * 113) * amp * 0.6, oy = Math.cos(x * 92) * amp, sc = 1 + 0.035 * Math.exp(-x * 6);
    mg.fillStyle = '#000'; mg.fillRect(0, 0, W, H); drawAround(bufA, W / 2, H / 2, W / 2 + ox, H / 2 + oy, sc);
    if (lt < 1.5 / E.fps) { mg.filter = 'none'; mg.globalAlpha = 0.85; mg.fillStyle = '#fff'; mg.fillRect(0, 0, W, H); mg.globalAlpha = 1; }
  } else if (tr.type !== 'cut' && i > 0 && lt < tdur) {
    const prev = E.shots[i - 1], k = ease.inOut(lt / tdur); drawShotMB(bufB, prev, t - prev.start);
    if (tr.type === 'fade') { mg.drawImage(bufB, 0, 0); mg.globalAlpha = k; mg.drawImage(bufA, 0, 0); }
    else if (tr.type === 'dip' || tr.type === 'dipWhite') { const c = tr.type === 'dip' ? '#000' : '#fff'; mg.drawImage(k < 0.5 ? bufB : bufA, 0, 0); mg.filter = 'none'; mg.globalAlpha = k < 0.5 ? k * 2 : (1 - k) * 2; mg.fillStyle = c; mg.fillRect(0, 0, W, H); }
    else if (tr.type === 'flash') { mg.drawImage(bufA, 0, 0); mg.filter = 'none'; mg.globalAlpha = (1 - lt / tdur) ** 2; mg.fillStyle = '#fff'; mg.fillRect(0, 0, W, H); }
    else if (tr.type === 'whip' || tr.type === 'push') { const u = lt / tdur, du = 1 / (tdur * E.fps), sh = tr.shutter ?? (tr.type === 'whip' ? 1 : 0.5); slide(u - du * sh / 2, u + du * sh / 2, W, H, tr.dir || 1, !!tr.vertical, 10); }
    else if (tr.type === 'iris') { const [fx, fy] = tr.at || [0.5, 0.5], px = fx * W, py = fy * H, R = Math.hypot(Math.max(px, W - px), Math.max(py, H - py)) * ease.in(clamp(lt / tdur)) * 1.02 + (tr.r0 || 0) * E.PX;
      drawAround(bufB, px, py, px, py, 1 + 0.18 * k);
      mg.save(); mg.beginPath(); mg.arc(px, py, Math.max(0.1, R), 0, Math.PI * 2); mg.clip(); drawAround(bufA, px, py, px, py, 1.12 - 0.12 * k); mg.restore();
      mg.save(); mg.filter = 'none'; mg.strokeStyle = `rgba(255,255,255,${0.35 * (1 - k)})`; mg.lineWidth = 6 * E.PX; mg.beginPath(); mg.arc(px, py, Math.max(0.1, R), 0, Math.PI * 2); mg.stroke(); mg.restore(); }
    else if (tr.type === 'match') { const A = tr.from || [0.5, 0.5], B = tr.to || A, sc = tr.scale || 1.6, ax = A[0] * W, ay = A[1] * H, bx = B[0] * W, by = B[1] * H;
      const px = lerp(ax, bx, k), py = lerp(ay, by, k), m = Math.pow(sc, k), ki = ease.inOut(prog(lt / tdur, 0.2, 0.85));
      mg.fillStyle = '#000'; mg.fillRect(0, 0, W, H);
      if (sc >= 1) { drawAround(bufB, ax, ay, px, py, m, 1); drawAround(bufA, bx, by, px, py, m / sc, ki); }
      else { drawAround(bufA, bx, by, px, py, m / sc, 1); drawAround(bufB, ax, ay, px, py, m, 1 - ki); } }
    else if (tr.type === 'zoom') { mg.drawImage(bufB, 0, 0); const s = 1.15 - 0.15 * k; mg.globalAlpha = k; mg.translate(W / 2, H / 2); mg.scale(s, s); mg.drawImage(bufA, -W / 2, -H / 2); mg.setTransform(1, 0, 0, 1, 0, 0); }
    else mg.drawImage(bufA, 0, 0);
  } else mg.drawImage(bufA, 0, 0);
  mg.globalAlpha = 1; mg.filter = 'none'; mg.setTransform(1, 0, 0, 1, 0, 0);
  applyGrade(W, H);
  if (grade.tint) { mg.globalCompositeOperation = grade.tint[1]; mg.fillStyle = alpha(grade.tint[0], grade.tint[2]); mg.fillRect(0, 0, W, H); mg.globalCompositeOperation = 'source-over'; }
  if (shot.vignette !== false && grade.vignette > 0) { const v = mg.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.62); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${grade.vignette})`); mg.fillStyle = v; mg.fillRect(0, 0, W, H); }
  if (grade.grain > 0) { mg.save(); mg.globalAlpha = grade.grain; mg.globalCompositeOperation = 'overlay'; mg.drawImage(grainTiles[f % 4], 0, 0, W, H); mg.restore(); }
  mg.setTransform(E.PX, 0, 0, E.PX, 0, 0);
  if (E.cfg.captions && shot.captions !== false) playerish.captions(mg, t, E.cfg.captionStyle || {});
  const cur = barVal(shot), prevB = i > 0 ? barVal(E.shots[i - 1]) : cur, bar = prevB + (cur - prevB) * ease.inOut(prog(lt, 0, 0.6));
  if (bar > 0) { mg.fillStyle = '#000'; mg.fillRect(0, 0, E.W, bar); mg.fillRect(0, E.H - bar, E.W, bar); }
  const fi = E.cfg.fadeIn ?? 0.5, fo = E.cfg.fadeOut ?? 0.8, fade = Math.max(fi > 0 ? 1 - t / fi : 0, fo > 0 ? 1 - (DURATION - t) / fo : 0);
  if (fade > 0) { mg.fillStyle = `rgba(0,0,0,${clamp(fade)})`; mg.fillRect(0, 0, E.W, E.H); }
  mg.setTransform(1, 0, 0, 1, 0, 0);
  return shot;
}

// ---------- encoding ----------
function encode(img) { return FORMAT === 'jpeg' ? main.toBuffer('image/jpeg', 94) : main.toBuffer('image/png'); }
const FORMAT = args.format === 'png' ? 'png' : 'jpeg';
const fmtT = s => `${Math.floor(s / 60)}m${String(Math.round(s % 60)).padStart(2, '0')}s`;

async function writeVideo(from, to, outFile) {
  const total = Math.ceil(DURATION * FPS);
  const f0 = Math.max(0, Math.round(from * FPS)), f1 = Math.min(total, Math.round(to * FPS));
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', String(args.preset || 'medium'), '-crf', String(args.crf || 18), '-pix_fmt', 'yuv420p', '-r', String(FPS), outFile], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now(); let done = 0;
  for (let f = f0; f < f1; f++) {
    renderFrameTo(f);
    const img = encode();
    if (!ff.stdin.write(img)) await new Promise(r => ff.stdin.once('drain', r));
    done++;
    if (done % 48 === 0) { const el = (Date.now() - t0) / 1000, eta = (el / done) * (f1 - f0 - done); process.stdout.write(`  ${done}/${f1 - f0} frames  ${(done / el).toFixed(2)} fps  elapsed ${fmtT(el)}  eta ${fmtT(eta)}\n`); }
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  console.log(`\nDone: ${outFile}  (${fmtT((Date.now() - t0) / 1000)})`);
}

function contactSheet(items, outFile, cols = 4, cellW = 440) {
  const rows = Math.ceil(items.length / cols), cellH = Math.round((cellW * outH) / outW) + 40;
  const c = createCanvas(cols * (cellW + 12) + 12, rows * cellH + 12), g = c.getContext('2d');
  g.fillStyle = '#111'; g.fillRect(0, 0, c.width, c.height); g.font = '600 15px Nunito'; g.fillStyle = '#eee'; g.textBaseline = 'top';
  items.forEach((it, i) => { const x = 12 + (i % cols) * (cellW + 12), y = 12 + Math.floor(i / cols) * cellH;
    const im = createCanvas(cellW, Math.round((cellW * outH) / outW)); const ig = im.getContext('2d'); ig.drawImage(it.canvas, 0, 0, im.width, im.height);
    g.drawImage(im, x, y); g.fillText(it.label, x + 2, y + im.height + 6); });
  fs.writeFileSync(outFile, c.toBuffer('image/png'));
}

async function renderStills() {
  const dir = path.join(BUILD, args.styles ? 'styles' : args.sheet ? 'sheets' : 'stills');
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const styles = args.styles ? String(args.styles).split(',') : [String(args.style || CFG.style || 'dusk')];
  const all = [];
  for (const st of styles) {
    setStyle(st);
    let targets;
    if (args.sheet) targets = E.shots.map(s => ({ t: s.start + (s.end - s.start) * 0.45, label: `${s.id}  ${s.start.toFixed(1)}s${getShot(s.id) ? '' : '  (MISSING)'}` }));
    else targets = String(args.stills || args.at || '1').split(',').map(Number).map(t => ({ t, label: `${t}s` }));
    for (const tg of targets) {
      renderFrameTo(Math.round(tg.t * FPS));
      const copy = createCanvas(outW, outH); copy.getContext('2d').drawImage(main, 0, 0);
      fs.writeFileSync(path.join(dir, `${st}_${String(tg.t.toFixed(2)).replace('.', 'p')}.png`), copy.toBuffer('image/png'));
      all.push({ canvas: copy, label: `${args.styles ? `[${st}] ` : ''}${tg.label}` });
    }
  }
  if (all.length) {
    const per = 24; for (let i = 0; i < all.length; i += per) contactSheet(all.slice(i, i + per), path.join(dir, `sheet_${String(i / per + 1).padStart(2, '0')}.png`), args.styles ? Math.max(1, all.length / styles.length) : 4, args.styles ? 420 : 440);
  }
  console.log(`Wrote ${all.length} stills + contact sheet(s) to ${dir}`);
  if (errors.length) { console.log(`\n${errors.length} shot error(s):`); errors.slice(0, 30).forEach(e => console.log('  ' + e)); }
}

try {
  if (args.sheet || args.stills || args.styles) await renderStills();
  else {
    const from = +(args.from || 0), to = args.to ? +args.to : DURATION;
    const out = path.resolve(String(args.out || path.join(BUILD, args.from || args.to ? 'preview.mp4' : 'video_silent.mp4')));
    const missing = E.shots.filter(s => !getShot(s.id)).map(s => s.id);
    if (missing.length) console.log(`WARNING: ${missing.length} shots have no scene file: ${missing.slice(0, 12).join(', ')}${missing.length > 12 ? ' …' : ''}`);
    console.log(`Rendering ${(to - from).toFixed(1)}s at ${outW}x${outH} @${FPS}fps (${Math.round((to - from) * FPS)} frames)…`);
    await writeVideo(from, to, out);
    if (errors.length) { console.log(`\n${errors.length} shot error(s):`); errors.slice(0, 30).forEach(e => console.log('  ' + e)); }
  }
} catch (e) { console.error('RENDER FAILED:', e.message, e.stack); process.exitCode = 1; }
