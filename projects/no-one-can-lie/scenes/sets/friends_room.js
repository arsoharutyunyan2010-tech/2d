// Opening living room: evening city window, warm practicals, dark cinematic foreground.
import { E, V, mood, layer, backdrop, rr, circle, glow, shade, linGrad } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export function friendsRoom(g, t, cam, moodName = 'dusk') {
  const M = mood(moodName);
  const GY = E.H * V(0.82, 0.68);
  const CX = E.W / 2;
  layer(g, cam, 0.12, q => {
    backdrop(q, M.sky);
    FX.skyline(q, { x: -E.W, y: GY - V(420, 650), w: E.W * 3, minH: 100, maxH: V(300, 430), color: shade(M.wall, -0.55), windowColor: M.practical, lit: 0.28, seed: 14 });
  });
  layer(g, cam, 0.52, q => {
    q.fillStyle = linGrad(q, 0, 0, 0, GY, [shade(M.wall, -0.22), shade(M.wall, -0.42), shade(M.dark, -0.2)]);
    q.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
    const wx = CX - V(470, 650), wy = GY - V(560, 720), ww = V(940, 1300), wh = V(500, 690);
    rr(q, wx - 18, wy - 18, ww + 36, wh + 36, 8); q.fillStyle = shade(M.dark, -0.45); q.fill();
    q.fillStyle = linGrad(q, wx, wy, wx, wy + wh, [M.sky[0], M.sky[1], shade(M.sky[1], -0.25)]);
    q.fillRect(wx, wy, ww, wh);
    q.fillStyle = alphaSafe(M.rim, 0.5); q.fillRect(wx + ww * 0.49, wy, 8, wh); q.fillRect(wx, wy + wh * 0.58, ww, 7);
    for (let i = 0; i < 5; i++) {
      const bx = wx + 70 + i * (ww - 140) / 5;
      glow(q, bx, wy + wh * (0.35 + (i % 2) * 0.22), 55, M.practical, 0.24);
      circle(q, bx, wy + wh * (0.35 + (i % 2) * 0.22), 4, M.practical);
    }
    // Warm wall lamp and low couch silhouette.
    glow(q, CX + V(650, 850), GY - V(390, 480), 220, M.practical, 0.3);
    rr(q, CX - V(780, 980), GY - V(220, 290), V(1560, 1960), V(170, 210), 34);
    q.fillStyle = shade(M.wall, -0.55); q.fill();
    rr(q, CX - V(700, 900), GY - V(275, 350), V(1400, 1800), V(90, 110), 24);
    q.fillStyle = shade(M.wall, -0.38); q.fill();
  });
  layer(g, cam, 0.9, q => {
    q.fillStyle = linGrad(q, 0, GY, 0, GY + E.H, [shade(M.floor, -0.2), shade(M.dark, -0.5)]);
    q.fillRect(-E.W, GY, E.W * 3, E.H * 2);
    FX.floorLines(q, GY, GY + 520, 'rgba(0,0,0,.22)', 0.07);
    FX.pool(q, CX + V(650, 850), GY + 15, 260, 40, M.practical, 0.15);
  });
  FX.dust(g, t, { count: 20, seed: 19 });
  return { GY, CX, M };
}
function alphaSafe(c, a) { return typeof c === 'string' ? c : 'rgba(255,220,180,' + a + ')'; }
