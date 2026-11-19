// kitchen — warm late-evening kitchen, with a tea-lit table and a familiar doorway.
import { E, V, mood, layer, backdrop, rr, circle, glow, shade, linGrad } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export function kitchenSet(g, t, cam, moodName = 'interiorWarm') {
  const M = mood(moodName), GY = E.H * V(0.82, 0.68), CX = E.W / 2;
  layer(g, cam, 0.14, q => {
    backdrop(q, [shade(M.sky[0], -0.28), shade(M.sky[1], -0.42)]);
    FX.windowFrame(q, { x: CX + V(430, 600), y: GY - V(650, 820), w: V(430, 560), h: V(520, 680), cols: 2, rows: 2, frame: shade(M.dark, -0.5), bar: 12 }, (wq, x, y, w, h) => {
      wq.fillStyle = linGrad(wq, x, y, x, y + h, [shade(M.sky[1], 0.12), shade(M.sky[0], -0.32)]);
      wq.fillRect(x, y, w, h);
      glow(wq, x + w * 0.5, y + h * 0.65, V(150, 190), M.practical, 0.16);
    });
  });
  layer(g, cam, 0.55, q => {
    q.fillStyle = linGrad(q, 0, 0, 0, GY, [shade(M.wall, -0.12), shade(M.wall, -0.42)]);
    q.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
    // Cabinets and a small backsplash, kept graphic and uncluttered.
    for (let i = 0; i < 4; i++) {
      rr(q, CX - V(820, 1060) + i * V(220, 285), GY - V(610, 780), V(198, 255), V(250, 320), 8);
      q.fillStyle = shade(M.dark, -0.42); q.fill();
      q.fillStyle = 'rgba(230,205,170,.08)';
      q.fillRect(CX - V(805, 1040) + i * V(220, 285), GY - V(590, 755), V(168, 215), 4);
    }
    rr(q, CX - V(650, 840), GY - V(330, 430), V(1300, 1680), V(72, 92), 10);
    q.fillStyle = shade(M.dark, -0.5); q.fill();
    q.fillStyle = 'rgba(226,190,137,.18)'; q.fillRect(CX - V(640, 825), GY - V(330, 430), V(1280, 1650), 5);
    FX.clock(q, { x: CX - V(600, 780), y: GY - V(720, 930), r: V(42, 54), color: '#d9c49f' });
  });
  layer(g, cam, 0.9, q => {
    q.fillStyle = linGrad(q, 0, GY, 0, GY + E.H, [shade(M.floor, -0.16), shade(M.dark, -0.48)]);
    q.fillRect(-E.W, GY, E.W * 3, E.H * 2);
    FX.floorLines(q, GY, GY + 560, 'rgba(0,0,0,.24)', 0.08);
    const tx = CX, ty = GY - V(175, 225);
    rr(q, tx - V(360, 470), ty, V(720, 940), V(42, 54), 8);
    q.fillStyle = '#49343b'; q.fill();
    glow(q, tx + V(170, 220), ty - V(85, 110), V(120, 155), M.practical, 0.2);
    circle(q, tx + V(170, 220), ty - V(85, 110), V(22, 28), '#d9a86b');
  });
  FX.dust(g, t, { count: 10, seed: 73 });
  return { GY, CX, M };
}
