// s001_hook — cold open: phone insert, then reveal the brother in the living room.
import { E, V, registerShot, mood, layer, ease, rr, circle, seg, glow, text } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe } from '/engine/rig2d.js';
import { friendsRoom } from '../sets/friends_room.js';
import { HERO, BROTHER } from '../cast.js';
import * as FX from '/engine/fx2d.js';
import { camPath, impact, camAdd } from '/engine/motion.js';

registerShot('s001', {
  draw(g, t, info) {
    const p = Math.max(0, Math.min(1, t / info.dur));
    const cam = camAdd(camPath(t, [
      [0, { z: 1.12, x: 90, y: 18, r: -0.012 }],
      [info.dur * 0.56, { z: 1.34, x: -18, y: 4, r: 0 }],
      [info.dur, { z: 1.08, x: -55, y: 0, r: 0 }]
    ]), { x: impact(t, info.dur * 0.58, { amp: 5, decay: 8 }).x, y: 0, r: 0 });
    const { GY, CX, M } = friendsRoom(g, t, cam, 'dusk');
    // The phone catches the first pool of light: a clear insert, not a generic UI card.
    layer(g, cam, 1, q => {
      const rise = ease.outBack(Math.min(1, p * 2.8));
      q.save(); q.translate(CX + V(390, 530), GY - V(220, 300) - rise * 95); q.rotate(-0.16 + 0.05 * Math.sin(t * 2));
      glow(q, 0, -105, 190, M.rim, 0.24);
      rr(q, -82, -150, 164, 300, 24); q.fillStyle = '#11101a'; q.fill();
      rr(q, -70, -136, 140, 270, 15); q.fillStyle = '#28263a'; q.fill();
      rr(q, -58, -112, 116, 205, 8); q.fillStyle = '#d9a85d'; q.fill();
      circle(q, 0, 122, 5, '#f4d9ad');
      q.restore();
    });
    // Hero notices the missing phone; brother tries to look casual behind him.
    layer(g, cam, 1, q => {
      drawFigure(q, { x: CX - V(300, 410), y: GY, s: 1.65, facing: 1,
        outfit: HERO, pose: breathe(posesAt(t, [[0, 'think'], [info.dur * 0.38, 'point'], [info.dur * 0.72, 'determined']]), t, 1, 4),
        expr: p > 0.55 ? 'shocked' : 'thinking', blink: (t % 3.1) > 3.0,
        rim: { color: M.rim, dir: [0.7, -1], w: 5 } });
      drawFigure(q, { x: CX + V(320, 440), y: GY, s: 1.35, facing: -1,
        outfit: BROTHER, pose: breathe(posesAt(t, [[0, 'stand'], [info.dur * 0.55, 'shrug']]), t, 1, 8),
        expr: p > 0.6 ? 'smirk' : 'neutral', blink: (t % 2.7) > 2.58,
        rim: { color: M.rim, dir: [-0.5, -1], w: 5 } });
    });
    if (p > 0.48) {
      const a = ease.outBack(Math.min(1, (p - 0.48) * 4));
      g.save(); g.globalAlpha = a;
      text(g, 'HE TOOK IT.', CX, GY - V(520, 740), { size: V(54, 72), color: '#f4c46c', align: 'center', weight: 900 });
      g.restore();
    }
    FX.rings(g, CX - V(300, 410), GY - V(520, 720), 18 + 8 * Math.sin(t * 5), M.rim, 0.4);
    FX.dust(g, t);
  }
});
