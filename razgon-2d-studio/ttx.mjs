import fs from 'node:fs'; import path from 'node:path'; import { createCanvas, GlobalFonts } from '@napi-rs/canvas'; import { register } from 'node:module';
const ROOT = path.dirname(new URL(import.meta.url).pathname);
process.env.RAZGON_STUDIO = ROOT; process.env.RAZGON_PROJECT = path.join(ROOT,'projects/truth-ability');
register('file://' + path.join(ROOT, 'hooks.mjs'));
globalThis.document = { createElement() { return createCanvas(1,1); } };
for (const [file, fam] of [['NotoSansArmenian.ttf','Nunito'],['NotoSansArmenian.ttf','Fredoka'],['Nunito.ttf','Nunito'],['PlayfairDisplay.ttf','Playfair Display']]) { try { GlobalFonts.registerFromPath(path.join(ROOT,'fonts',file), fam); } catch(e){} }
const core = await import('file://' + path.join(ROOT,'engine/core.js'));
const c = createCanvas(900,300), g = c.getContext('2d');
g.fillStyle='#08101c'; g.fillRect(0,0,900,300);
core.text(g, 'ԱՌԱՋԻՆ ՕՐԸ', 450, 70, { size: 56, font: core.FONTS.title, weight: 700, spacing: 6 });
core.text(g, 'ՍՏԻ ՀՈՒՍԱԼԻ', 450, 160, { size: 56, font: core.FONTS.ui, weight: 900 });
core.text(g, 'ՉԵՆ ԱՊԱՑՈՒՅՑ', 450, 245, { size: 56, font: core.FONTS.title, weight: 700 });
fs.writeFileSync('/tmp/tx.png', c.toBuffer('image/png')); console.log('ok');
