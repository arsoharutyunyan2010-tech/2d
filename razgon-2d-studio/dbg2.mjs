import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { register } from 'node:module';
import fs from 'node:fs'; import path from 'node:path';
const ROOT = '/home/user/2d/razgon-2d-studio';
process.env.RAZGON_STUDIO = ROOT; process.env.RAZGON_PROJECT = ROOT + '/projects/truth-ability';
register('file://' + ROOT + '/hooks.mjs');
for (const f of fs.readdirSync(ROOT + '/fonts')) { try { GlobalFonts.registerFromPath(path.join(ROOT,'fonts',f)); } catch {} }
const rig = await import('file://' + ROOT + '/engine/rig2d.js');
const core = await import('file://' + ROOT + '/engine/core.js');
core.setStyle('dusk');
console.log('POSES.sit', JSON.stringify(rig.POSES.sit));
const c = createCanvas(600, 400), g = c.getContext('2d');
g.fillStyle = '#222'; g.fillRect(0,0,600,400);
g.save(); g.translate(300, 330); g.scale(1.4,1.4);
rig.drawFigure(g, { x: 0, y: 0, s: 1, facing: 1, pose: rig.POSES.sit, outfit: { top: 'hoodie', color: '#d64a33' }, expr: 'smile', shadow: false, rim: { color: '#ffc68a', dir: [0,-1], w: 4 } });
g.restore();
fs.writeFileSync('/tmp/sitpose.png', c.toBuffer('image/png'));
