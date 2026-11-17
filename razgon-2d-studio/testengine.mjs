import fs from 'node:fs'; import path from 'node:path';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
const ROOT = '/home/user/2d/razgon-2d-studio';
globalThis.document = { createElement(){ return createCanvas(1,1); } };
for (const f of fs.readdirSync('/tmp/fonts')) { try { GlobalFonts.registerFromPath(path.join('/tmp/fonts', f)); } catch(e) { console.log('font fail', f); } }
for (const f of fs.readdirSync('/tmp/fonts')) { for (const fam of ['Fredoka','Nunito','Playfair Display','NotoArm']) { try { GlobalFonts.registerFromPath(path.join('/tmp/fonts', f), fam); } catch {} } }
const core = await import(ROOT + '/engine/core.js');
const { E, setStyle, getShot } = core;
const P = '/tmp/enginetest/project';
const cfg = JSON.parse(fs.readFileSync(P + '/config.json'));
const story = JSON.parse(fs.readFileSync(P + '/story/shots.json'));
Object.assign(E, { vertical: false, W: 1920, H: 1080, fps: 24, cfg, words: [], shots: story.shots });
E.PX = 1; setStyle('dusk');
const main = createCanvas(1920, 1080), mg = main.getContext('2d');
function list(d){ let o=[]; for (const f of fs.readdirSync(d)) { const p=path.join(d,f); if (fs.statSync(p).isDirectory()) o=o.concat(list(p)); else if (f.endsWith('.js')) o.push(p);} return o; }
for (const p of list(P + '/scenes')) { try { await import(p); } catch(e) { console.log('IMPORT ERR', p, e.message); } }
for (const s of story.shots) {
  const def = getShot(s.id);
  if (!def) { console.log('missing', s.id); continue; }
  const lt = (s.end - s.start) * 0.45;
  const info = { ...(s.params||{}), shot: s, dur: s.end - s.start, globalT: s.start + lt, p: lt/(s.end-s.start), line: s.line };
  mg.setTransform(1,0,0,1,0,0); mg.fillStyle='#000'; mg.fillRect(0,0,1920,1080); mg.setTransform(1,0,0,1,0,0);
  try { mg.save(); def.draw(mg, lt, info); mg.restore(); console.log('ok', s.id); }
  catch(e) { console.log('ERR', s.id, e.message); }
}
fs.writeFileSync('/tmp/enginetest/frame.png', main.toBuffer('image/png'));
console.log('done');
console.log('registered shots', Object.keys((await import(ROOT + '/engine/core.js')).allShots?.() || {}));
