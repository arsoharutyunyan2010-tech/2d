// s002 — the phone shop: the seller's confident pitch fractures under the truth pulse.
import { E, V, registerShot, ease, layer, text, rr, glow, circle } from '/engine/core.js';
import { drawFigure, posesAt, breathe } from '/engine/rig2d.js';
import { phoneShop } from '../sets/phone_shop.js';
import { HERO, SELLER } from '../cast.js';
import * as FX from '/engine/fx2d.js';
import { camPath, impact } from '/engine/motion.js';

registerShot('s002', {
  draw(g, t, info) {
    const p = Math.max(0, Math.min(1, t / info.dur));
    const cam = camPath(t, [
      [0, { z: 1.04, x: 35, y: 8, r: 0 }],
      [info.dur * 0.52, { z: 1.16, x: -12, y: 0, r: 0 }],
      [info.dur, { z: 1.27, x: -42, y: -4, r: 0 }]
    ]);
    const { GY, CX, M } = phoneShop(g, t, cam, 'dusk');
    layer(g, cam, 1, q => {
      drawFigure(q, { x: CX - V(340, 440), y: GY, s: 1.48, facing: 1,
        outfit: HERO, pose: breathe(posesAt(t, [[0, 'think'], [info.dur * 0.36, 'point'], [info.dur * 0.72, 'ready']]), t),
        expr: p > 0.58 ? 'determined' : 'thinking', rim: { color: M.rim, dir: [0.7, -1], w: 5 } });
      drawFigure(q, { x: CX + V(350, 460), y: GY, s: 1.55, facing: -1,
        outfit: SELLER, pose: breathe(posesAt(t, [[0, 'explain'], [info.dur * 0.48, 'shrug'], [info.dur * 0.72, 'handsOnHead']]), t),
        expr: p > 0.64 ? 'nervous' : 'smile', rim: { color: M.rim, dir: [-0.6, -1], w: 5 } });
    });
    // A single display phone becomes the visual evidence point.
    const px = CX, py = GY - V(360, 470);
    glow(g, px, py, 150 + 35 * Math.sin(t * 4), M.rim, 0.22);
    rr(g, px - V(38, 48), py - V(76, 92), V(76, 96), V(152, 184), 12);
    g.fillStyle = '#11131d'; g.fill();
    rr(g, px - V(29, 37), py - V(65, 80), V(58, 74), V(130, 158), 7);
    g.fillStyle = '#c8d9e8'; g.fill();
    if (p > 0.42) {
      const a = ease.outBack(Math.min(1, (p - 0.42) * 3.5));
      g.save(); g.globalAlpha = a;
      text(g, 'NOT AS ADVERTISED', CX, GY - V(560, 760), { size: V(38, 54), color: '#f2c46e', align: 'center', weight: 900 });
      g.restore();
      FX.rings(g, px, py, 22 + 10 * Math.sin(t * 5), M.rim, 0.42);
    }
    const hit = impact(t, info.dur * 0.62, { amp: 4, decay: 10 });
    if (Math.abs(hit.x) > 0.1) {
      g.save(); g.translate(hit.x, 0); g.restore();
    }
    FX.dust(g, t, { count: 14, seed: 7 });
  }
});
