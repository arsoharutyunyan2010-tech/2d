// interview_office — formal, cold room with a tall window and a long table.
import { E, V, mood, layer, backdrop, rr, circle, glow, shade, linGrad } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export function interviewOffice(g, t, cam, moodName = 'dusk') {
  const M = mood(moodName), GY = E.H * V(0.82, 0.68), CX = E.W / 2;
  layer(g, cam, 0.12, q => {
    backdrop(q, [shade(M.sky[0], -0.3), shade(M.sky[1], -0.48)]);
    FX.skyline(q, { x: -E.W, y: GY - V(440, 650), w: E.W * 3, minH: 100, maxH: V(300, 420), color: shade(M.wall, -0.6), windowColor: M.practical, lit: 0.18, seed: 42 });
  });
  layer(g, cam, 0.5, q => {
    q.fillStyle = linGrad(q, 0, 0, 0, GY, [shade(M.wall, -0.22), shade(M.wall, -0.5), shade(M.dark, -0.35)]);
    q.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
    const wx = CX + V(390, 560), wy = GY - V(650, 850), ww = V(420, 560), wh = V(570, 720);
    FX.windowFrame(q, { x: wx, y: wy, w: ww, h: wh, cols: 2, rows: 2, frame: shade(M.dark, -0.55), bar: 12 }, (wq, x, y, w, h) => {
      wq.fillStyle = linGrad(wq, x, y, x, y + h, [shade(M.sky[1], 0.12), shade(M.sky[0], -0.3)]);
      wq.fillRect(x, y, w, h);
      for (let i = 0; i < 4; i++) {
        const bx = x + 28 + i * (w - 56) / 4;
        glow(wq, bx, y + h * 0.65, 46, M.practical, 0.22);
        circle(wq, bx, y + h * 0.65, 3, M.practical);
      }
    });
    // Framed wall panels and a restrained office clock.
    for (let i = 0; i < 3; i++) {
      rr(q, CX - 850 + i * 310, GY - V(590, 760), 230, V(210, 270), 8);
      q.fillStyle = shade(M.dark, -0.48); q.fill();
      q.fillStyle = 'rgba(210,205,190,.08)'; q.fillRect(CX - 835 + i * 310, GY - V(575, 742), 200, V(180, 240));
    }
    FX.clock(q, { x: CX - V(650, 820), y: GY - V(520, 680), r: V(48, 62), color: '#d4c5a4' });
    // Long conference table creates a strong leading line.
    rr(q, CX - V(820, 1050), GY - V(175, 225), V(1640, 2100), V(70, 88), 16);
    q.fillStyle = shade(M.dark, -0.52); q.fill();
    q.fillStyle = 'rgba(220,190,145,.24)'; q.fillRect(CX - V(790, 1010), GY - V(175, 225), V(1580, 2020), 5);
  });
  layer(g, cam, 0.9, q => {
    q.fillStyle = linGrad(q, 0, GY, 0, GY + E.H, [shade(M.floor, -0.2), shade(M.dark, -0.55)]);
    q.fillRect(-E.W, GY, E.W * 3, E.H * 2);
    FX.floorLines(q, GY, GY + 600, 'rgba(0,0,0,.28)', 0.08);
    FX.pool(q, CX - V(620, 780), GY + 8, 230, 34, M.practical, 0.12);
  });
  FX.dust(g, t, { count: 12, seed: 44 });
  return { GY, CX, M };
}
