// bank_call — a quiet night interior lit by the phone and a distant city window.
import { E, V, mood, layer, backdrop, rr, circle, glow, shade, linGrad } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export function bankCallSet(g, t, cam, moodName = 'night') {
  const M = mood(moodName), GY = E.H * V(0.82, 0.68), CX = E.W / 2;
  layer(g, cam, 0.12, q => {
    backdrop(q, [shade(M.sky[0], -0.42), shade(M.sky[1], -0.58)]);
    FX.skyline(q, { x: -E.W, y: GY - V(420, 620), w: E.W * 3, minH: 100, maxH: V(280, 390), color: shade(M.wall, -0.62), windowColor: M.practical, lit: 0.3, seed: 61 });
  });
  layer(g, cam, 0.52, q => {
    q.fillStyle = linGrad(q, 0, 0, 0, GY, [shade(M.wall, -0.28), shade(M.dark, -0.52)]);
    q.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
    // A single window and a narrow amber desk lamp create the scene's two light pools.
    const wx = CX + V(520, 720), wy = GY - V(640, 840), ww = V(360, 470), wh = V(520, 680);
    FX.windowFrame(q, { x: wx, y: wy, w: ww, h: wh, cols: 2, rows: 2, frame: shade(M.dark, -0.5), bar: 12 }, (wq, x, y, w, h) => {
      wq.fillStyle = linGrad(wq, x, y, x, y + h, [shade(M.sky[1], 0.12), shade(M.sky[0], -0.32)]);
      wq.fillRect(x, y, w, h);
    });
    rr(q, CX - V(610, 760), GY - V(260, 330), V(440, 570), V(180, 230), 10);
    q.fillStyle = shade(M.dark, -0.48); q.fill();
    glow(q, CX - V(360, 450), GY - V(360, 450), V(170, 220), M.practical, 0.18);
    FX.lampPost(q, CX - V(360, 450), GY - V(430, 550), V(180, 220), { color: shade(M.dark, -0.5), light: M.practical, on: true, a: 0.18 });
  });
  layer(g, cam, 0.9, q => {
    q.fillStyle = linGrad(q, 0, GY, 0, GY + E.H, [shade(M.floor, -0.24), shade(M.dark, -0.58)]);
    q.fillRect(-E.W, GY, E.W * 3, E.H * 2);
    FX.floorLines(q, GY, GY + 600, 'rgba(0,0,0,.28)', 0.08);
    FX.pool(q, CX - V(260, 340), GY + 4, V(230, 300), 34, M.practical, 0.12);
  });
  FX.dust(g, t, { count: 12, seed: 61 });
  return { GY, CX, M };
}
