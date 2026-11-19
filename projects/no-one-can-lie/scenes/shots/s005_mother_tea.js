// s005 — the mother and the tea: the hero recognises her worry, then chooses kindness over exposure.
import { E, V, registerShot, ease, layer, text, rr, glow } from '/engine/core.js';
import { drawFigure, posesAt, breathe } from '/engine/rig2d.js';
import { kitchenSet } from '../sets/kitchen.js';
import { HERO, MOTHER } from '../cast.js';
import * as FX from '/engine/fx2d.js';
import { camPath, impact } from '/engine/motion.js';

registerShot('s005', {
  draw(g, t, info) {
    const p = Math.max(0, Math.min(1, t / info.dur));
    const cam = camPath(t, [
      [0, { z: 1.02, x: 40, y: 0, r: 0 }],
      [info.dur * 0.42, { z: 1.1, x: 0, y: -4, r: 0 }],
      [info.dur, { z: 1.16, x: -24, y: -8, r: 0 }]
    ]);
    const { GY, CX, M } = kitchenSet(g, t, cam, 'interiorWarm');
    layer(g, cam, 1, q => {
      drawFigure(q, { x: CX - V(300, 390), y: GY, s: 1.55, facing: 1, outfit: HERO,
        pose: breathe(posesAt(t, [[0, 'sit'], [info.dur * 0.35, 'think'], [info.dur * 0.72, 'reach']]), t),
        expr: p > 0.72 ? 'sad' : 'thinking', rim: { color: M.rim, dir: [0.8, -1], w: 5 } });
      drawFigure(q, { x: CX + V(290, 370), y: GY, s: 1.58, facing: -1, outfit: MOTHER,
        pose: breathe(posesAt(t, [[0, 'stand'], [info.dur * 0.28, 'explain'], [info.dur * 0.68, 'relaxed']]), t),
        expr: p > 0.6 ? 'worried' : 'smile', rim: { color: M.rim, dir: [-0.7, -1], w: 5 } });
    });
    // A small tea cup is the warm visual anchor between them.
    const cupX = CX + V(20, 28), cupY = GY - V(210, 270);
    rr(g, cupX - V(32, 42), cupY - V(28, 36), V(64, 84), V(54, 70), 9);
    g.fillStyle = '#b77b56'; g.fill();
    g.strokeStyle = 'rgba(235,205,165,.75)'; g.lineWidth = 5;
    g.beginPath(); g.ellipse(cupX + V(34, 44), cupY, V(16, 21), V(18, 24), 0, -1.2, 1.2); g.stroke();
    glow(g, cupX, cupY - V(20, 26), V(90, 115), M.practical, 0.18);
    if (p > 0.58) {
      const a = ease.outBack(Math.min(1, (p - 0.58) * 3.6));
      g.save(); g.globalAlpha = a;
      text(g, 'JUST BE THERE', CX, GY - V(610, 790), { size: V(34, 46), color: '#e8c99d', align: 'center', weight: 900 });
      g.restore();
      const hit = impact(t, info.dur * 0.64, { amp: 2.2, decay: 8 });
      FX.rings(g, cupX, cupY, 18 + Math.abs(hit.x), M.rim, 0.24);
    }
    FX.dust(g, t, { count: 10, seed: 74 });
  }
});
