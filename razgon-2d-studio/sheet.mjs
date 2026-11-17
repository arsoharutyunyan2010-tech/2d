// sheet.mjs — dev tool: render several shots at a given local time into one labelled contact sheet.
//   node sheet.mjs --times 0.5 --shots s001,s002,s003 --out build/dev.png [--scale 0.35] [--set "s001=1.2,..."]
import fs from 'node:fs';
import path from 'node:path';
import { createCanvas, GlobalFonts, ImageData as SkiaImageData } from '@napi-rs/canvas';
import { register } from 'node:module';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const args = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { const k = a[i].slice(2); const v = a[i + 1] && !a[i + 1].startsWith('--') ? a[++i] : true; args[k] = v; } }
const PROJECT = path.resolve(args.project || path.join(ROOT, 'projects/truth-ability'));
process.env.RAZGON_STUDIO = ROOT; process.env.RAZGON_PROJECT = PROJECT;
register(pathToFileURLSafe(path.join(ROOT, 'hooks.mjs')));
function pathToFileURLSafe(p) { return 'file://' + p; }

globalThis.document = { createElement() { return createCanvas(1, 1); } };
if (typeof globalThis.ImageData === 'undefined') globalThis.ImageData = SkiaImageData;
for (const f of fs.readdirSync(path.join(ROOT, 'fonts'))) { try { GlobalFonts.registerFromPath(path.join(ROOT, 'fonts', f)); } catch {} }
for (const [file, fam] of [['NotoSansArmenian.ttf', 'Nunito'], ['NotoSansArmenian.ttf', 'Fredoka'], ['Nunito.ttf', 'Nunito'], ['PlayfairDisplay.ttf', 'Playfair Display']]) { try { GlobalFonts.registerFromPath(path.join(ROOT, 'fonts', file), fam); } catch {} }

const core = await import(pathToFileURLSafe(path.join(ROOT, 'engine/core.js')));
const { E, setStyle, getShot, clamp, ease, prog, alpha, text, FONTS: F } = core;
const { captions } = await import(pathToFileURLSafe(path.join(ROOT, 'engine/ui2d.js')));
const CFG = JSON.parse(fs.readFileSync(path.join(PROJECT, 'config.json'), 'utf8'));
const STORY = JSON.parse(fs.readFileSync(path.join(PROJECT, 'story/shots.json'), 'utf8'));
let WORDS = []; try { WORDS = JSON.parse(fs.readFileSync(path.join(PROJECT, 'timeline/words.json'), 'utf8')).words || []; } catch {}
const SCALE = +(args.scale || 0.35);
const vertical = (CFG.aspect || '16:9') === '9:16';
const outW = Math.round(1920 * SCALE), outH = Math.round(1080 * SCALE);
Object.assign(E, { vertical, W: 1920, H: 1080, fps: CFG.fps || 30, cfg: CFG, words: WORDS, shots: STORY.shots, outW, outH });
E.PX = outW / E.W;
setStyle(String(args.style || CFG.style || 'dusk'));
const canvas = createCanvas(outW, outH), g = canvas.getContext('2d');
function listFiles(dir) { let out = []; if (!fs.existsSync(dir)) return out; for (const f of fs.readdirSync(dir).sort()) { const p = path.join(dir, f); if (fs.statSync(p).isDirectory()) out = out.concat(listFiles(p)); else if (f.endsWith('.js') && (!f.startsWith('_') || args.dev)) out.push(p); } return out; }
const errors = [];
for (const p of listFiles(path.join(PROJECT, 'scenes'))) { try { await import(pathToFileURLSafe(p)); } catch (e) { console.log('IMPORT ERROR', path.relative(PROJECT, p), e.message); } }
const times = String(args.times || '0.5').split(',').map(Number);
const only = args.shots ? String(args.shots).split(',') : null;
const overrides = {}; if (args.set) for (const kv of String(args.set).split(',')) { const [k, v] = kv.split('='); overrides[k] = +v; }
const items = [];
for (const s of E.shots) {
  if (only && !only.includes(s.id)) continue;
  const def = getShot(s.id); if (!def) { console.log('missing', s.id); continue; }
  for (const lt of (overrides[s.id] != null ? [overrides[s.id]] : times)) {
    const t = Math.min(s.end - 0.001, s.start + lt);
    const info = { ...(s.params || {}), shot: s, dur: s.end - s.start, globalT: t, p: (t - s.start) / (s.end - s.start), line: s.line };
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#000'; g.fillRect(0, 0, outW, outH); g.setTransform(E.PX, 0, 0, E.PX, 0, 0);
    try { g.save(); def.draw(g, t - s.start, info); g.restore(); }
    catch (e) { errors.push(`${s.id}@${lt}: ${e.message}${args.trace ? '\n' + e.stack.split('\n').slice(1,5).join('\n') : ''}`); g.setTransform(E.PX, 0, 0, E.PX, 0, 0); text(g, 'ERR ' + e.message.slice(0, 70), E.W / 2, E.H / 2, { size: 40, color: '#ff5050', font: F.ui, weight: 900 }); }
    const copy = createCanvas(outW, outH); copy.getContext('2d').drawImage(canvas, 0, 0);
    items.push({ canvas: copy, label: `${s.id} ${lt}s` });
  }
}
const cols = Math.min(+(args.cols || 3), items.length), cellW = Math.round(560 * (args.cell || 1)), cellH = Math.round(cellW * 9 / 16) + 34;
const sheet = createCanvas(cols * (cellW + 12) + 12, Math.ceil(items.length / cols) * cellH + 12), sg = sheet.getContext('2d');
sg.fillStyle = '#111'; sg.fillRect(0, 0, sheet.width, sheet.height); sg.font = '600 16px Nunito'; sg.fillStyle = '#eee'; sg.textBaseline = 'top';
items.forEach((it, i) => { const x = 12 + (i % cols) * (cellW + 12), y = 12 + Math.floor(i / cols) * cellH; sg.drawImage(it.canvas, x, y, cellW, Math.round(cellW * 9 / 16)); sg.fillText(it.label, x + 2, y + Math.round(cellW * 9 / 16) + 6); });
const out = path.resolve(String(args.out || path.join(PROJECT, 'build/dev.png')));
fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, sheet.toBuffer('image/png'));
console.log('wrote', out, items.length, 'frames');
if (errors.length) { console.log('errors:'); errors.slice(0, 12).forEach(e => console.log('  ' + e)); }
