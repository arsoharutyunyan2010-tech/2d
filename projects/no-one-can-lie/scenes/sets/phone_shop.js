// phone_shop — cool showroom with glowing phone displays and a reflective counter.
import { E, V, mood, layer, backdrop, rr, circle, glow, shade, linGrad } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export function phoneShop(g, t, cam, moodName = 'dusk') {
  const M = mood(moodName), GY = E.H * V(0.82, 0.68), CX = E.W / 2;
  layer(g, cam, 0.12, q => {
    backdrop(q, [shade(M.sky[0], -0.18), shade(M.sky[1], -0.35)]);
    FX.skyline(q, { x: -E.W, y: GY - V(350, 520), w: E.W * 3, minH: 80, maxH: V(230, 330), color: shade(M.wall, -0.5), windowColor: M.practical, lit: 0.2, seed: 28 });
  });
  layer(g, cam, 0.5, q => {
    q.fillStyle = linGrad(q, 0, 0, 0, GY, [shade(M.wall, -0.12), shade(M.wall, -0.4), shade(M.dark, -0.3)]);
    q.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
    const top = GY - V(570, 760), ww = V(300, 420), wh = V(360, 460);
    for (let i = -2; i <= 2; i++) {
      const x = CX + i * V(310, 410) - ww / 2, y = top + (i % 2 ? 20 : 0);
      rr(q, x - 12, y - 12, ww + 24, wh + 24, 12); q.fillStyle = shade(M.dark, -0.48); q.fill();
      q.fillStyle = linGrad(q, x, y, x, y + wh, [shade(M.sky[1], 0.15), shade(M.sky[0], -0.2)]);
      q.fillRect(x, y, ww, wh);
      for (let k = 0; k < 3; k++) {
        const px = x + 48 + k * (ww - 96) / 2, py = y + wh * 0.56;
        glow(q, px, py, 72, M.rim, 0.25);
        rr(q, px - 25, py - 48, 50, 92, 8); q.fillStyle = '#11131d'; q.fill();
        rr(q, px - 20, py - 42, 40, 78, 5); q.fillStyle = k === 1 ? '#e5bb71' : '#8cb8cf'; q.fill();
      }
      glow(q, x + ww / 2, y + wh / 2, 180, M.practical, 0.12);
    }
    // Branded-free luminous ceiling strips and back wall seams.
    for (let i = 0; i < 5; i++) {
      const x = CX - 700 + i * 350;
      q.fillStyle = 'rgba(190,215,255,.28)'; q.fillRect(x, top - 42, 190, 5);
      glow(q, x + 95, top - 40, 80, M.rim, 0.12);
    }
    FX.counter(q, { x: CX - V(800, 1000), y: GY - V(110, 145), w: V(1600, 2000), h: V(120, 150), color: shade(M.dark, -0.45), top: shade(M.wall, -0.08) });
  });
  layer(g, cam, 0.9, q => {
    q.fillStyle = linGrad(q, 0, GY, 0, GY + E.H, [shade(M.floor, -0.15), shade(M.dark, -0.5)]);
    q.fillRect(-E.W, GY, E.W * 3, E.H * 2);
    FX.floorLines(q, GY, GY + 560, 'rgba(0,0,0,.25)', 0.08);
    FX.pool(q, CX, GY + 16, 420, 42, M.rim, 0.12);
  });
  FX.dust(g, t, { count: 16, seed: 31 });
  return { GY, CX, M };
}
