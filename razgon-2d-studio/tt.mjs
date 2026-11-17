import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import fs from 'node:fs';
for (const [f, fam] of [['NotoSansArmenian.ttf','Nunito'],['NotoSansArmenian.ttf','Fredoka'],['Nunito.ttf','Nunito']]) { try { GlobalFonts.registerFromPath('/home/user/2d/razgon-2d-studio/fonts/'+f, fam); } catch {} }
const c = createCanvas(900, 400), g = c.getContext('2d');
g.fillStyle = '#08101c'; g.fillRect(0,0,900,400);
g.fillStyle = '#fff'; g.font = '800 40px Nunito'; g.textAlign = 'center'; g.textBaseline = 'middle';
g.fillText('ՍՏԻ ՀՈՒՍԱԼԻ', 450, 60);
if ('letterSpacing' in g) g.letterSpacing = '5px';
g.fillText('ՍՏԻ ՀՈՒՍԱԼԻ', 450, 130);
g.letterSpacing = '0px';
// after a scaled translate like my code
g.save(); g.translate(450, 220); g.scale(1.4, 1.4); g.fillText('ՉԵՆ ԱՊԱՑՈՒՅՑ', 0, 0); g.restore();
// after arc/ellipse path
g.beginPath(); g.ellipse(450, 330, 300, 40, 0, 0, 7); g.strokeStyle='#7cf'; g.lineWidth=3; g.stroke();
g.fillText('ՎԵՐՋԻ ՏՈՂԸ', 450, 330);
fs.writeFileSync('/tmp/tt.png', c.toBuffer('image/png'));
console.log('ok');
