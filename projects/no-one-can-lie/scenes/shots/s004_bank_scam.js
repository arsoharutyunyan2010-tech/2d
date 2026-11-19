// s004 — the fake bank-security call: the phone glows, the hero recognises the lie.
import { E, V, registerShot, ease, layer, text, rr, circle, glow } from '/engine/core.js';
import { drawFigure, posesAt, breathe } from '/engine/rig2d.js';
import { bankCallSet } from '../sets/bank_call.js';
import { HERO } from '../cast.js';
import * as FX from '/engine/fx2d.js';
import { camPath, impact, spring } from '/engine/motion.js';

registerShot('s004', {
  draw(g, t, info) {
    const p = Math.max(0, Math.min(1, t / info.dur));
    const cam = camPath(t, [
      [0, { z: 1.02, x: 55, y: 0, r: 0 }],
      [info.dur * 0.42, { z: 1.12, x: 8, y: -8, r: 0 }],
      [info.dur * 0.72, { z: 1.2, x: -18, y: -10, r: 0 }],
      [info.dur, { z: 1.16, x: -28, y: 0, r: 0 }]
    ]);
    const { GY, CX, M } = bankCallSet(g, t, cam, 'night');
    layer(g, cam, 1, q => {
      drawFigure(q, { x: CX - V(250, 300), y: GY, s: 1.65, facing: 1, outfit: HERO,
        pose: breathe(posesAt(t, [[0, 'relaxed'], [info.dur * 0.22, 'phone'], [info.dur * 0.7, 'ready']]), t),
        expr: p > 0.68 ? 'determined' : 'thinking', rim: { color: M.rim, dir: [0.8, -1], w: 5 } });
    });
    // Phone insert: a caller ID panel with a deliberately generic bank label.
    const reveal = spring(t, info.dur * 0.16, { freq: 5, damp: 0.72 });
    const px = CX + V(340, 440), py = GY - V(410, 540);
    g.save();
    g.translate(px, py);
    g.rotate(-0.08 + 0.025 * Math.sin(t * 2));
    rr(g, -V(92, 118), -V(164, 210), V(184, 236), V(328, 420), 22);
    g.fillStyle = '#171522'; g.fill();
    rr(g, -V(76, 98), -V(145, 186), V(152, 196), V(290, 372), 12);
    g.fillStyle = '#d9d0c2'; g.fill();
    glow(g, 0, -V(55, 70), V(110, 140), '#e6b66d', 0.16);
    circle(g, 0, -V(82, 104), V(23, 29), '#d28c45');
    text(g, 'BANK', 0, -V(22, 28), { size: V(22, 28), color: '#30283a', align: 'center', weight: 900 });
    text(g, 'SECURITY ALERT', 0, V(24, 32), { size: V(12, 16), color: '#554653', align: 'center', weight: 800 });
    text(g, 'MOVE YOUR MONEY', 0, V(58, 76), { size: V(10, 14), color: '#9a433d', align: 'center', weight: 900 });
    g.restore();
    if (p > 0.48) {
      const a = ease.outBack(Math.min(1, (p - 0.48) * 3.2));
      g.save(); g.globalAlpha = a;
      rr(g, CX - V(300, 390), GY - V(690, 900), V(600, 780), V(82, 104), 12);
      g.fillStyle = 'rgba(126,45,54,.9)'; g.fill();
      text(g, 'SCAM', CX, GY - V(635, 825), { size: V(38, 50), color: '#fff0dc', align: 'center', weight: 900 });
      g.restore();
      const hit = impact(t, info.dur * 0.52, { amp: 4, decay: 10 });
      FX.rings(g, CX + V(340, 440), py, 26 + Math.abs(hit.x) * 2, M.rim, 0.35);
    }
    FX.dust(g, t, { count: 9, seed: 62 });
  }
});
