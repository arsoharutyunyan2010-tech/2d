import { createCanvas } from '@napi-rs/canvas';
import fs from 'node:fs';
const c = createCanvas(1920, 1080), g = c.getContext('2d');
console.log('filter prop:', 'filter' in g, 'letterSpacing:', 'letterSpacing' in g, 'roundRect:', typeof g.roundRect, 'ellipse:', typeof g.ellipse);
// blur test
const small = createCanvas(480, 270), sg = small.getContext('2d');
sg.fillStyle='#f00'; sg.fillRect(100,100,120,80);
g.fillStyle='#000'; g.fillRect(0,0,1920,1080);
g.filter = 'blur(12px)'; g.drawImage(small, 0, 0, 1920, 1080); g.filter='none';

fs.writeFileSync('/tmp/blurtest.png', c.toBuffer('image/png'));
// perf: heavy scene
const t0=Date.now();
for (let f=0; f<60; f++){
  const gg=g; gg.setTransform(1,0,0,1,0,0);
  const grd=gg.createLinearGradient(0,0,0,1080); grd.addColorStop(0,'#2a1a3a'); grd.addColorStop(1,'#0b0810');
  gg.fillStyle=grd; gg.fillRect(0,0,1920,1080);
  for(let i=0;i<120;i++){ gg.beginPath(); gg.arc((i*137+f*7)%1920, (i*91+f*3)%1080, 30+ i%40, 0, 6.28); gg.fillStyle=`rgba(${i*2},120,200,0.10)`; gg.fill(); }
  gg.strokeStyle='#ffcf9a'; gg.lineWidth=14; gg.lineCap='round';
  for(let i=0;i<40;i++){ gg.beginPath(); gg.moveTo(200+i*20, 900); gg.quadraticCurveTo(400+i*10, 500, 700+i*15, 800); gg.stroke(); }
  const img = c.data ? null : null;
}
const dt=(Date.now()-t0)/60; console.log('ms/frame heavy:', dt.toFixed(1), '=> fps', (1000/dt).toFixed(1));
const t1=Date.now();
for (let f=0; f<30; f++){ const b = c.toBuffer('image/png'); }
console.log('png encode ms:', ((Date.now()-t1)/30).toFixed(1));
const t2=Date.now();
for (let f=0; f<30; f++){ const b = c.toBuffer('image/jpeg', 92); }
console.log('jpeg encode ms:', ((Date.now()-t2)/30).toFixed(1));
