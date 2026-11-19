// s003 — interview: Mr Black offers a polished promise; the hero senses a hidden agenda.
import { E, V, registerShot, ease, layer, text, rr, glow } from '/engine/core.js';
import { drawFigure, posesAt, breathe } from '/engine/rig2d.js';
import { interviewOffice } from '../sets/interview_office.js';
import { HERO, MR_BLACK } from '../cast.js';
import * as FX from '/engine/fx2d.js';
import { camPath, impact } from '/engine/motion.js';

registerShot('s003', {
  draw(g, t, info) {
    const p = Math.max(0, Math.min(1, t / info.dur));
    const cam = camPath(t, [
      [0, { z: 1.0, x: 60, y: 0, r: 0 }],
      [info.dur * 0.45, { z: 1.12, x: 0, y: 0, r: 0 }],
      [info.dur, { z: 1.22, x: -30, y: -8, r: 0 }]
    ]);
    const { GY, CX, M } = interviewOffice(g, t, cam, 'dusk');
    layer(g, cam, 1, q => {
      drawFigure(q, { x: CX - V(360, 470), y: GY, s: 1.5, facing: 1,
        outfit: HERO, pose: breathe(posesAt(t, [[0, 'sit'], [info.dur * 0.45, 'think'], [info.dur * 0.76, 'ready']]), t),
        expr: p > 0.72 ? 'determined' : 'thinking', rim: { color: M.rim, dir: [0.7, -1], w: 5 } });
      drawFigure(q, { x: CX + V(360, 470), y: GY, s: 1.62, facing: -1,
        outfit: MR_BLACK, pose: breathe(posesAt(t, [[0, 'sit'], [info.dur * 0.35, 'explain'], [info.dur * 0.78, 'point']]), t),
        expr: 'smile', rim: { color: M.rim, dir: [-0.6, -1], w: 5 } });
    });
    // Contract folder: a tangible object between them, kept deliberately unreadable.
    const fx = CX, fy = GY - V(210, 270);
    rr(g, fx - V(110, 140), fy - V(70, 86), V(220, 280), V(140, 172), 8);
    g.fillStyle = '#4b3441'; g.fill();
    g.fillStyle = 'rgba(235,207,160,.72)'; g.fillRect(fx - V(88, 112), fy - V(42, 52), V(176, 224), 3);
    glow(g, fx, fy, 110 + 22 * Math.sin(t * 3), M.rim, 0.14);
    if (p > 0.56) {
      const a = ease.outBack(Math.min(1, (p - 0.56) * 3.6));
      g.save(); g.globalAlpha = a;
      text(g, 'A HIDDEN AGENDA', CX, GY - V(570, 770), { size: V(38, 54), color: '#e9c27c', align: 'center', weight: 900 });
      g.restore();
      const hit = impact(t, info.dur * 0.58, { amp: 3, decay: 9 });
      FX.rings(g, CX, fy, 20 + Math.abs(hit.x) * 2, M.rim, 0.32);
    }
    FX.dust(g, t, { count: 10, seed: 12 });
  }
});
