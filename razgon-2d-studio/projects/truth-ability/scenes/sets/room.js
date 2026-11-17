// sets/room.js — every interior in the film. Layered: sky/window glow → back wall → furniture → floor.
// Colours come from mood() so the style grade re-themes everything.
import { E, V, mood, layer, backdrop, rr, seg, circle, ring, poly, linGrad, radGrad, glow, alpha, shade, mix, ease, clamp, lerp, rng } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const GY = () => E.H * V(0.82, 0.68);
export const CX = () => E.W / 2;

// ---------- shared bits ----------
export function wallGrad(g, x, y, w, h, M, k = 0) {
  g.fillStyle = linGrad(g, 0, y, 0, y + h, [shade(M.wall, 0.05 + k), shade(M.wall, -0.18), shade(M.wall, -0.45)]);
  g.fillRect(x, y, w, h);
}
// big sunset window (the signature element): sky gradient, low sun, city, mullions
export function sunsetWindow(g, o = {}) {
  const { x, y, w, h, M, cols = 3, rows = 2, bar = 10, sunY = 0.62, frame = null, sunR = null, skyline = true } = o;
  const fr = frame || shade(M.wall, -0.55);
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.fillStyle = linGrad(g, 0, y, 0, y + h, [M.sky[0], M.sky[1], M.sky[2] || M.sky[1], '#f7cf98']);
  g.fillRect(x, y, w, h);
  // low sun
  const sx = x + w * 0.58, sy = y + h * sunY, sr = sunR || h * 0.075;
  FX.sun(g, sx, sy, sr, '#fff3dc', M.key, 6);
  if (skyline) FX.skyline(g, { x, y: y + h, w, minH: h * 0.10, maxH: h * 0.30, color: mix(M.sky[1], M.wall, 0.62), windowColor: alpha(M.practical, 0.55), lit: 0.3, seed: o.seed || 4, minW: 18, maxW: 46 });
  // horizon haze
  g.fillStyle = linGrad(g, 0, y + h * 0.55, 0, y + h, [alpha(M.fog, 0), alpha(M.fog, 0.35)]);
  g.fillRect(x, y + h * 0.55, w, h * 0.45);
  g.restore();
  // frame + mullions
  g.strokeStyle = fr; g.lineWidth = bar * 1.3; g.strokeRect(x, y, w, h);
  g.fillStyle = fr;
  for (let i = 1; i < cols; i++) g.fillRect(x + (w * i) / cols - bar / 2, y, bar, h);
  for (let i = 1; i < rows; i++) g.fillRect(x, y + (h * i) / rows - bar / 2, w, bar);
  // sill
  g.fillStyle = shade(M.wall, -0.35); g.fillRect(x - bar * 1.6, y + h - 4, w + bar * 3.2, bar * 1.8);
  g.fillStyle = alpha('#ffffff', 0.06); g.fillRect(x - bar * 1.6, y + h - 4, w + bar * 3.2, 4);
  glow(g, x + w / 2, y + h * 0.62, w * 0.75, M.key, 0.20);
  return { sx: x + w * 0.58, sy: y + h * sunY, frame: fr };
}
// simple warm table lamp with a pool of light
export function tableLamp(g, x, y, o = {}) {
  const { M, s = 1, on = true, color = null } = o; const c = color || M.practical;
  seg(g, [[x, y], [x, y - 96 * s]], 7 * s, shade(M.dark, 0.1));
  g.fillStyle = shade(M.dark, 0.05); g.beginPath(); g.ellipse(x, y - 2, 26 * s, 7 * s, 0, 0, 7); g.fill();
  poly(g, [[x - 34 * s, y - 92 * s], [x + 34 * s, y - 92 * s], [x + 22 * s, y - 138 * s], [x - 22 * s, y - 138 * s]], on ? shade(c, -0.45) : shade(M.dark, 0.2));
  if (on) { glow(g, x, y - 92 * s, 190 * s, c, 0.55); glow(g, x, y - 92 * s, 64 * s, '#fff3d6', 0.7); }
  return { x, y: y - 92 * s };
}
// sofa
// sofa: seat cushion top at (y - seatTop), backrest up to (y - backTop), feet on the floor y
export function sofa(g, x, y, w, o = {}) {
  const { M, color = null, seatTop = 140, backTop = 300 } = o, c = shade(color || M.wall, 0.08), dc = shade(c, -0.36);
  // backrest (tall, so seated figures are properly nested)
  rr(g, x - 26, y - backTop, w + 52, backTop - seatTop + 34, 26); g.fillStyle = dc; g.fill();
  g.save(); g.globalCompositeOperation = 'lighter'; glow(g, x + w / 2, y - backTop + 40, w * 0.36, M.key, 0.07); g.restore();
  g.fillStyle = alpha('#ffffff', 0.04); rr(g, x - 26, y - backTop, w + 52, 6, 3); g.fill();
  // seat cushions (top edge = y - seatTop)
  for (let i = 0; i < 3; i++) { rr(g, x + 10 + i * (w - 20) / 3, y - seatTop - 6, (w - 20) / 3 - 12, 54, 16); g.fillStyle = i === 1 ? shade(c, 0.06) : c; g.fill(); }
  // front apron + legs
  rr(g, x - 4, y - seatTop + 44, w + 8, seatTop - 84, 10); g.fillStyle = shade(c, -0.22); g.fill();
  g.fillStyle = shade(c, -0.5); g.fillRect(x + 30, y - 42, 16, 42); g.fillRect(x + w - 46, y - 42, 16, 42);
  // arms
  for (const ax of [x - 34, x + w - 46]) { rr(g, ax, y - seatTop - 118, 80, seatTop + 96, 20); g.fillStyle = shade(c, -0.08); g.fill(); g.fillStyle = alpha('#ffffff', 0.07); rr(g, ax + 6, y - seatTop - 114, 68, 6, 3); g.fill(); }
  // pillows at the ends, behind the sitters
  g.strokeStyle = alpha('#ffffff', 0.05); g.lineWidth = 3;
  for (let i = 1; i < 3; i++) { g.beginPath(); g.moveTo(x + (w * i) / 3, y - seatTop - 120); g.lineTo(x + (w * i) / 3, y - backTop + 30); g.stroke(); }
}
// kitchen counter + kettle + cup with steam
export function kitchen(g, t, o = {}) {
  const { M, GY: gy } = o, gy2 = gy ?? GY();
  const cw = E.W * 0.72, cx = E.W / 2;
  g.fillStyle = shade(M.wall, -0.25); g.fillRect(cx - cw / 2, gy2 - 210, cw, 210);
  g.fillStyle = shade(M.wall, 0.02); g.fillRect(cx - cw / 2 - 14, gy2 - 222, cw + 28, 18);
  g.fillStyle = alpha('#ffffff', 0.06); g.fillRect(cx - cw / 2 - 14, gy2 - 222, cw + 28, 3);
  for (let i = 1; i < 5; i++) { g.fillStyle = alpha(M.dark, 0.55); g.fillRect(cx - cw / 2 + (cw * i) / 5, gy2 - 196, 3, 180); }
  for (let i = 0; i < 4; i++) { const kx = cx - cw / 2 + 70 + i * 90; g.fillStyle = alpha(M.dark, 0.5); g.fillRect(kx, gy2 - 200, 54, 4); g.fillRect(kx, gy2 - 118, 54, 4); }
  // kettle on the lid
  const kx = cx - cw * 0.13;
  rr(g, kx - 34, gy2 - 276, 68, 54, 10); g.fillStyle = shade(M.dark, 0.18); g.fill();
  seg(g, [[kx + 30, gy2 - 262], [kx + 58, gy2 - 252]], 8, shade(M.dark, 0.22));
  g.beginPath(); g.arc(kx, gy2 - 280, 22, Math.PI, 0); g.strokeStyle = shade(M.dark, 0.22); g.lineWidth = 6; g.stroke();
  glow(g, kx, gy2 - 250, 60, M.practical, 0.12);
  // steam
  for (let k = 0; k < 3; k++) {
    const ph = (t * 0.5 + k * 0.33) % 1;
    g.strokeStyle = alpha('#fff3e0', 0.16 * (1 - ph)); g.lineWidth = 3.4; g.beginPath();
    g.moveTo(kx + Math.sin(ph * 8 + k) * 5, gy2 - 288 - ph * 40);
    g.bezierCurveTo(kx + 16, gy2 - 316 - ph * 40, kx - 16, gy2 - 340 - ph * 40, kx + Math.sin(ph * 6) * 8, gy2 - 372 - ph * 40);
    g.stroke();
  }
  return { kx, top: gy2 - 222 };
}
// a small cup of tea (insert shots)
export function teaCup(g, x, y, s = 1, t = 0, o = {}) {
  const M = o.M || mood('interiorWarm');
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = shade(M.practical, -0.25); g.fillRect(-30, 24, 60, 12);
  g.beginPath(); g.moveTo(-38, -22); g.lineTo(38, -22); g.lineTo(30, 30); g.lineTo(-30, 30); g.closePath(); g.fillStyle = '#f2ece4'; g.fill();
  g.fillStyle = alpha('#ffffff', 0.35); g.fillRect(-38, -22, 76, 6);
  g.beginPath(); g.arc(-38, 2, 18, Math.PI * 0.5, Math.PI * 1.5, true); g.strokeStyle = '#f2ece4'; g.lineWidth = 7; g.stroke();
  g.beginPath(); g.arc(0, -22, 37, 0, 7); g.fillStyle = '#8a4a2a'; g.fill();
  g.beginPath(); g.arc(0, -22, 37, 0, 7); g.fillStyle = alpha('#f7cf98', 0.55); g.fill();
  glow(g, 0, -22, 78, M.practical, 0.35);
  for (let k = 0; k < 3; k++) { const ph = (t * 0.45 + k * 0.34) % 1; g.strokeStyle = alpha('#fff3e0', 0.22 * (1 - ph)); g.lineWidth = 5; g.beginPath(); g.moveTo(-10 + k * 10, -46 - ph * 70); g.bezierCurveTo(14, -90 - ph * 60, -16, -120 - ph * 60, 4, -160 - ph * 40); g.stroke(); }
  g.restore();
}
// door (can be opened) on a wall
export function door(g, o = {}) {
  const { x, y, w = 190, h = 330, M, open = 0, light = null, frame = null } = o;
  const fr = frame || shade(M.wall, -0.5), lc = light || M.practical;
  g.fillStyle = fr; g.fillRect(x - 12, y - h - 16, w + 24, h + 20);
  if (open > 0.02) { g.fillStyle = alpha(lc, 0.12 + 0.5 * open); g.fillRect(x, y - h, w, h); glow(g, x + w / 2, y - h / 2, h * 0.9, lc, 0.35 * open); }
  g.save(); g.translate(x, y); g.scale(1 - open * 0.82, 1); g.fillStyle = shade(fr, 0.1); g.fillRect(0, -h, w, h);
  g.fillStyle = shade(fr, -0.2); g.fillRect(10, -h + 22, w - 20, 4); g.fillRect(10, -h * 0.45, w - 20, 4);
  circle(g, w - 26, -h * 0.52, 7, shade(fr, 0.4)); g.restore();
  g.strokeStyle = fr; g.lineWidth = 6; g.strokeRect(x - 12, y - h - 16, w + 24, h + 20);
}
// photo frames, clock, plant: quick set dressing
export function photoWall(g, x, y, o = {}) { const { M, seed = 2 } = o; const cols = ['#3a2a30', '#2e3448', '#40302a'];
  [[0, 0, 120, 90, -0.04], [150, 26, 96, 118, 0.03], [-130, 40, 86, 70, -0.08], [36, 150, 150, 104, 0.02]].forEach(([dx, dy, w, h, r], i) => {
    g.save(); g.translate(x + dx, y + dy); g.rotate(r); g.fillStyle = shade(M.wall, -0.5); g.fillRect(-w / 2 - 6, -h / 2 - 6, w + 12, h + 12);
    g.fillStyle = cols[i % 3]; g.fillRect(-w / 2, -h / 2, w, h); g.fillStyle = alpha(M.practical, 0.25); g.beginPath(); g.arc(0, -6, Math.min(w, h) * 0.16, 0, 7); g.fill();
    g.fillStyle = alpha(M.practical, 0.18); g.fillRect(-w / 2, h * 0.16, w, h * 0.34); g.restore(); }); }
export function plant(g, x, y, s = 1, color = '#1d3a2c') {
  poly(g, [[x - 26 * s, y], [x + 26 * s, y], [x + 18 * s, y - 34 * s], [x - 18 * s, y - 34 * s]], '#2a2028');
  for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.34 + Math.sin(i) * 0.1; g.save(); g.translate(x, y - 34 * s); g.rotate(a); g.fillStyle = shade(color, (i % 3) * 0.06); g.beginPath(); g.ellipse(0, -46 * s, 13 * s, 46 * s, 0, 0, 7); g.fill(); g.restore(); }
}
// ---------- locations ----------
// friends' hangout room at dusk: wide sofa, low table, big sunset window, bookshelf, plants
export const SOFA_W = () => V(1460, 1180);
export const SEAT_DY = 112;                        // default cushion height (hip height of a figure at s=1.55)
export const sofaSeats = () => { const gy = GY(), cx = CX(), w = SOFA_W(); return { x: [cx - w * 0.345, cx - w * 0.115, cx + w * 0.115, cx + w * 0.345], y: gy }; };
export function hangout(g, t, cam, o = {}) {
  const M = mood(o.mood || 'dusk'), gy = GY(), cx = CX(), w = SOFA_W();
  layer(g, cam, 0.15, (g) => { backdrop(g, M.sky); FX.stars(g, t, { count: 70, color: '#ffffff', area: [0, 0, E.W, E.H * 0.32] }); });
  layer(g, cam, 0.62, (g) => {
    wallGrad(g, -E.W, -E.H, E.W * 3, gy + E.H, M);
    // wall panel mouldings
    g.strokeStyle = alpha(M.dark, 0.5); g.lineWidth = 3;
    for (let i = 0; i < 5; i++) { const x = cx - w * 0.9 + i * w * 0.45; g.strokeRect(x, gy - 700, w * 0.34, 430); }
    const ww = V(760, 640), wh = V(440, 540), wx = cx - ww * 0.62, wy = gy - V(660, 720);
    sunsetWindow(g, { x: wx, y: wy, w: ww, h: wh, M, cols: 3, rows: 2, bar: 13 });
    // curtains
    for (const sx of [-1, 1]) { const cxp = sx < 0 ? wx - 30 : wx + ww + 30;
      g.fillStyle = linGrad(g, cxp - sx * 80, 0, cxp + sx * 80, 0, [shade(M.wall, -0.68), shade(M.wall, -0.34), shade(M.wall, -0.68)]);
      g.beginPath(); g.moveTo(cxp - sx * 96, wy - 60); g.lineTo(cxp + sx * 42, wy - 60); g.lineTo(cxp + sx * 26, wy + wh + 120); g.lineTo(cxp - sx * 104, wy + wh + 120); g.closePath(); g.fill();
      seg(g, [[cxp - sx * 100, wy - 62], [cxp + sx * 44, wy - 62]], 7, shade(M.dark, 0.1)); }
    // bookshelf on the right
    const bx = cx + w * 0.56, bw = V(380, 320), bh = V(430, 400), by = gy - 40;
    g.fillStyle = shade(M.dark, 0.04); g.fillRect(bx, by - bh, bw, bh);
    for (let s2 = 0; s2 < 3; s2++) { g.fillStyle = shade(M.dark, 0.14); g.fillRect(bx, by - bh + s2 * bh / 3 + bh / 3 - 8, bw, 8);
      const rr2 = rng(bx + s2 * 7); for (let i = 0; i < 11; i++) { const bwd = 14 + rr2() * 16, bhh = bh / 3 - 26 - rr2() * 14, bxx = bx + 14 + i * (bw - 28) / 11; g.fillStyle = [shade(M.wall, -0.1), shade(M.grass, -0.2), shade(M.practical, -0.62), shade(M.wall, -0.4)][i % 4]; g.fillRect(bxx, by - bh + (s2 + 1) * bh / 3 - 8 - bhh - 6, bwd, bhh); } }
    photoWall(g, cx - w * 0.66, gy - 500, { M, seed: 3 });
    tableLamp(g, cx + w * 0.72, gy - 236, { M, s: 1.15 });
    // hanging pendant
    seg(g, [[cx + w * 0.36, -120], [cx + w * 0.36, gy - 560]], 3, shade(M.dark, 0.2));
    poly(g, [[cx + w * 0.36 - 58, gy - 540], [cx + w * 0.36 + 58, gy - 540], [cx + w * 0.36 + 32, gy - 600], [cx + w * 0.36 - 32, gy - 600]], shade(M.practical, -0.52));
    glow(g, cx + w * 0.36, gy - 534, 170, M.practical, 0.5);
  });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, gy, 0, gy + 470, [shade(M.floor, 0.04), shade(M.floor, -0.42), shade(M.dark, -0.3)]); g.fillRect(-E.W, gy, E.W * 3, E.H);
    FX.floorLines(g, gy, gy + 540, 'rgba(0,0,0,.26)', 0.085);
    FX.pool(g, cx - 80, gy + 80, V(700, 560), 84, M.key, 0.16);
    const st = (o.seatScale ? 72 * o.seatScale : SEAT_DY) + 4;
    sofa(g, cx - w / 2, gy, w, { M, color: shade(M.wall, 0.04), seatTop: st, backTop: st + (o.seatScale ? 74 * o.seatScale + 26 : 216) });
    // low table in front, clear of the sofa's feet
    const tx = cx + V(60, 20), ty = gy + 96;
    rr(g, tx - V(250, 220), ty - 96, V(500, 440), 18, 9); g.fillStyle = shade(M.dark, 0.08); g.fill();
    g.fillStyle = alpha('#ffffff', 0.05); g.fillRect(tx - V(250, 220), ty - 96, V(500, 440), 3);
    for (const dx of [-1, 1]) seg(g, [[tx + dx * V(190, 160), ty - 82], [tx + dx * V(204, 172), ty]], 10, shade(M.dark, 0.08));
    for (const [dx, dd] of [[-120, 0], [-20, 1], [90, 2]]) { const cxp = tx + dx * V(1, 0.9); rr(g, cxp - 13, ty - 122, 26, 28, 4); g.fillStyle = '#f2ece4'; g.fill(); g.fillStyle = alpha('#8a4a2a', 0.9); g.fillRect(cxp - 13, ty - 122, 26, 6); glow(g, cxp, ty - 118, 46, '#ffd59a', 0.1); }
    plant(g, cx - w * 0.62, gy - 2, V(1.15, 1.2), shade(M.grass, -0.28));
    plant(g, cx + w * 0.60, gy - 60, V(0.9, 0.95), shade(M.grass, -0.34));
    // rug
    g.save(); g.globalAlpha = 0.5; g.fillStyle = shade(M.wall, -0.2); g.beginPath(); g.ellipse(cx, gy + 150, V(620, 520), 70, 0, 0, 7); g.fill(); g.restore();
  });
  return { GY: gy, M, CX: cx, seats: sofaSeats(), sofaW: w };
}
// kitchen-dining: counter, window, warm interior
export function kitchenRoom(g, t, cam, o = {}) {
  const M = mood(o.mood || 'interiorWarm'), gy = GY();
  layer(g, cam, 0.18, (g) => { backdrop(g, [shade(M.wall, -0.4), shade(M.wall, -0.1)]); });
  layer(g, cam, 0.6, (g) => {
    wallGrad(g, -E.W, -E.H, E.W * 3, gy + E.H, M);
    // tiles backsplash
    g.strokeStyle = alpha(M.dark, 0.28); g.lineWidth = 2;
    for (let x = -E.W; x < E.W * 2; x += 96) { g.beginPath(); g.moveTo(x, gy - 250); g.lineTo(x, gy - 30); g.stroke(); }
    for (let y = gy - 250; y < gy - 20; y += 66) { g.beginPath(); g.moveTo(-E.W, y); g.lineTo(E.W * 2, y); g.stroke(); }
    const ww = V(420, 420), wh = V(300, 360), wx = CX() + V(330, 120);
    sunsetWindow(g, { x: wx, y: gy - V(600, 660), w: ww, h: wh, M, cols: 2, rows: 1, bar: 10, sunY: 0.55, seed: 9 });
    FX.hills(g, { y: gy - V(470, 520), amp: 60, color: mix(M.sky[1], M.wall, 0.7), seed: 3 });
    photoWall(g, CX() - V(520, 380), gy - 500, { M, seed: 5 });
    tableLamp(g, CX() + V(620, 420), gy - 240, { M, s: 1.1 });
  });
  layer(g, cam, 0.95, (g) => {
    g.fillStyle = linGrad(g, 0, gy, 0, gy + 400, [shade(M.floor, 0.05), shade(M.floor, -0.35)]); g.fillRect(-E.W, gy, E.W * 3, E.H);
    kitchen(g, t, { M, GY: gy });
    g.fillStyle = shade(M.floor, -0.2); g.fillRect(-E.W, gy, E.W * 3, 20); g.fillStyle = alpha('#ffffff', 0.05); g.fillRect(-E.W, gy, E.W * 3, 3);
    // two stools by the counter
    FX.stool(g, CX() - V(230, 200), gy - 2, V(1.15, 1.2), shade(M.dark, 0.12));
    FX.stool(g, CX() + V(250, 180), gy - 2, V(1.15, 1.2), shade(M.dark, 0.12));
  });
  return { GY: gy, M, CX: CX() };
}
// bedroom, night, moonlight through the window
export function bedroom(g, t, cam, o = {}) {
  const M = mood(o.mood || 'interiorCool'), gy = GY();
  layer(g, cam, 0.18, (g) => backdrop(g, [shade(M.sky[0], -0.2), shade(M.sky[1], -0.1)]));
  layer(g, cam, 0.58, (g) => {
    wallGrad(g, -E.W, -E.H, E.W * 3, gy + E.H, M);
    const ww = V(460, 460), wh = V(360, 440), wx = CX() - V(150, 60), wy = gy - V(640, 700);
    g.save(); g.beginPath(); g.rect(wx, wy, ww, wh); g.clip();
    g.fillStyle = linGrad(g, 0, wy, 0, wy + wh, [M.sky[0], shade(M.sky[1], 0.05), shade(M.sky[2] || M.sky[1], 0.12)]); g.fillRect(wx, wy, ww, wh);
    FX.stars(g, t, { count: 90, area: [wx, wy, ww, wh * 0.7], color: '#ffffff', seed: 21 });
    FX.moon(g, wx + ww * 0.68, wy + wh * 0.28, 46, '#e8ecff');
    FX.skyline(g, { x: wx, y: wy + wh, w: ww, minH: 40, maxH: 120, color: shade(M.sky[0], -0.25), windowColor: alpha(M.practical, 0.5), lit: 0.35, seed: 12, minW: 16, maxW: 40 });
    g.restore();
    g.strokeStyle = shade(M.wall, -0.55); g.lineWidth = 14; g.strokeRect(wx, wy, ww, wh); g.fillStyle = shade(M.wall, -0.55); g.fillRect(wx + ww / 2 - 5, wy, 10, wh);
    // moonlight shaft on the floor
    g.save(); g.globalCompositeOperation = 'lighter';
    g.fillStyle = linGrad(g, wx, wy, wx + 200, gy, [alpha('#bcd0ff', 0.16), alpha('#bcd0ff', 0.02)]); poly(g, [[wx + 30, wy + wh], [wx + ww - 30, wy + wh], [wx + ww + 260, gy], [wx - 120, gy]], g.fillStyle); g.restore();
    photoWall(g, CX() + V(560, 380), gy - 520, { M, seed: 7 });
  });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, gy, 0, gy + 420, [shade(M.floor, 0.03), shade(M.floor, -0.4)]); g.fillRect(-E.W, gy, E.W * 3, E.H);
    // bed
    const bx = CX() - V(520, 430), bw = V(720, 680), by = gy - 150;
    g.fillStyle = shade(M.dark, 0.08); g.fillRect(bx - 20, by - 60, 24, 210);
    rr(g, bx, by - 20, bw, 150, 12); g.fillStyle = shade(M.wall, -0.12); g.fill();
    rr(g, bx + 10, by - 60, bw - 20, 70, 16); g.fillStyle = shade('#5a5aa0', -0.35); g.fill();
    rr(g, bx + 26, by - 108, 150, 56, 16); g.fillStyle = shade('#e8e4f4', -0.1); g.fill();
    g.fillStyle = alpha('#ffffff', 0.05); g.fillRect(bx + 10, by - 58, bw - 20, 4);
    // rug + moon pool
    FX.pool(g, bx + bw * 0.6, gy + 30, 300, 54, '#bcd0ff', 0.16);
    // desk with a phone lying face-down
    const dx = CX() + V(420, 300), dy = gy - 2;
    rr(g, dx - 130, dy - 150, 260, 14, 7); g.fillStyle = shade(M.dark, 0.1); g.fill();
    for (const sx of [-1, 1]) seg(g, [[dx + sx * 100, dy - 140], [dx + sx * 110, dy]], 8, shade(M.dark, 0.1));
    rr(g, dx - 26, dy - 160, 56, 12, 3); g.fillStyle = '#0c0e18'; g.fill();
    glow(g, dx + 2, dy - 156, 60, '#8fd0ff', 0.18);
  });
  return { GY: gy, M, CX: CX() };
}
// shop interior: shelves of phones, harsh practical light
export function shop(g, t, cam, o = {}) {
  const M = mood(o.mood || 'interiorCool'), gy = GY();
  layer(g, cam, 0.18, (g) => backdrop(g, [shade(M.sky[0], -0.1), shade(M.sky[1], -0.2)]));
  layer(g, cam, 0.6, (g) => {
    wallGrad(g, -E.W, -E.H, E.W * 3, gy + E.H, M);
    // fluorescent strips on the ceiling
    for (const yy of [gy - V(760, 800), gy - V(700, 740)]) { rr(g, CX() - V(560, 460), yy, V(1120, 920), 16, 8); g.fillStyle = '#eaf4ff'; g.fill(); glow(g, CX(), yy + 8, V(700, 600), '#cfe6ff', 0.35); }
    // shelves of phones
    for (let s = 0; s < 3; s++) {
      const sy = gy - V(520, 560) + s * V(150, 150), sw = V(1000, 860), sx = CX() - sw / 2;
      g.fillStyle = shade(M.dark, 0.12); g.fillRect(sx, sy, sw, 14);
      for (let i = 0; i < 9; i++) { const px = sx + 30 + i * (sw - 60) / 8; rr(g, px - 13, sy - 62, 26, 54, 4); g.fillStyle = '#0e1220'; g.fill(); g.fillStyle = alpha('#7fd0ff', 0.35 + 0.1 * Math.sin(t * 2 + i)); g.fillRect(px - 10, sy - 58, 20, 40); }
      glow(g, sx + sw / 2, sy, sw * 0.6, '#7fd0ff', 0.08);
    }
    // big price tag board
    rr(g, CX() + V(430, 260), gy - V(700, 720), V(300, 260), 150, 14); g.fillStyle = alpha('#0b1324', 0.9); g.fill();
    g.strokeStyle = alpha('#8fb8e8', 0.5); g.lineWidth = 3; g.stroke();
  });
  layer(g, cam, 0.95, (g) => {
    g.fillStyle = linGrad(g, 0, gy, 0, gy + 420, [shade(M.floor, 0.08), shade(M.floor, -0.3)]); g.fillRect(-E.W, gy, E.W * 3, E.H);
    FX.floorLines(g, gy, gy + 460, 'rgba(180,220,255,.06)', 0.1);
    // glass counter
    const cx = CX(), cw = V(760, 700);
    g.fillStyle = alpha('#cfe6ff', 0.10); g.fillRect(cx - cw / 2, gy - 190, cw, 150);
    g.strokeStyle = alpha('#cfe6ff', 0.35); g.lineWidth = 3; g.strokeRect(cx - cw / 2, gy - 190, cw, 150);
    g.fillStyle = shade(M.dark, 0.1); g.fillRect(cx - cw / 2 - 12, gy - 46, cw + 24, 46);
    g.fillStyle = alpha('#ffffff', 0.08); g.fillRect(cx - cw / 2 - 12, gy - 46, cw + 24, 4);
    for (let i = 0; i < 4; i++) { const px = cx - cw / 2 + 120 + i * (cw - 240) / 3; rr(g, px - 22, gy - 168, 44, 86, 6); g.fillStyle = '#0e1220'; g.fill(); g.fillStyle = alpha('#9fd8ff', 0.45); g.fillRect(px - 17, gy - 160, 34, 70); }
    FX.pool(g, cx, gy + 40, 420, 50, '#cfe6ff', 0.16);
  });
  return { GY: gy, M, CX: CX() };
}
// office: Black's glass desk, blinds, cold key
export function office(g, t, cam, o = {}) {
  const M = mood(o.mood || 'interiorCool'), gy = GY();
  layer(g, cam, 0.18, (g) => backdrop(g, [shade(M.sky[0], -0.15), shade(M.sky[1], -0.2)]));
  layer(g, cam, 0.58, (g) => {
    wallGrad(g, -E.W, -E.H, E.W * 3, gy + E.H, M);
    // venetian blinds window behind the desk
    const ww = V(900, 720), wh = V(560, 620), wx = CX() - ww / 2, wy = gy - V(800, 860);
    g.save(); g.beginPath(); g.rect(wx, wy, ww, wh); g.clip();
    g.fillStyle = linGrad(g, 0, wy, 0, wy + wh, [shade(M.sky[0], 0.1), M.sky[1], shade(M.key, 0.1)]); g.fillRect(wx, wy, ww, wh);
    FX.skyline(g, { x: wx, y: wy + wh, w: ww, minH: 60, maxH: 220, color: shade(M.sky[0], -0.3), windowColor: alpha(M.practical, 0.4), lit: 0.3, seed: 15 });
    for (let y = wy; y < wy + wh; y += 26) { g.fillStyle = alpha(shade(M.dark, -0.2), 0.55); g.fillRect(wx, y, ww, 15); }
    g.restore();
    g.strokeStyle = shade(M.dark, -0.2); g.lineWidth = 12; g.strokeRect(wx, wy, ww, wh);
    // light blades through the blinds
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 6; i++) { g.fillStyle = alpha('#cfe0ff', 0.05); poly(g, [[wx + 60 + i * 130, wy + wh], [wx + 110 + i * 130, wy + wh], [wx + 300 + i * 60, gy + 120], [wx + 210 + i * 60, gy + 120]], g.fillStyle); }
    g.restore();
    // framed "VALUES" sign
    rr(g, CX() - V(760, 560), gy - V(620, 660), V(300, 260), 130, 8); g.fillStyle = alpha('#0b1324', 0.85); g.fill(); g.strokeStyle = alpha('#8fb8e8', 0.4); g.lineWidth = 3; g.stroke();
  });
  layer(g, cam, 0.95, (g) => {
    g.fillStyle = linGrad(g, 0, gy, 0, gy + 420, [shade(M.floor, 0.06), shade(M.floor, -0.35)]); g.fillRect(-E.W, gy, E.W * 3, E.H);
    // desk
    const dw = V(900, 800), dx = CX() - dw / 2;
    rr(g, dx, gy - 200, dw, 18, 8); g.fillStyle = shade(M.dark, 0.14); g.fill();
    g.fillStyle = shade(M.dark, 0.05); g.fillRect(dx + 40, gy - 186, 16, 186); g.fillRect(dx + dw - 56, gy - 186, 16, 186);
    g.fillStyle = alpha('#9fd8ff', 0.10); g.fillRect(dx + 60, gy - 182, dw - 120, 120);
    // papers + name plate
    for (let i = 0; i < 3; i++) { g.save(); g.translate(dx + dw * 0.72, gy - 196); g.rotate(-0.06 + i * 0.05); g.fillStyle = '#e8e4dc'; g.fillRect(-70, -8 - i * 2, 140, 8); g.restore(); }
    rr(g, dx + dw * 0.16, gy - 232, 190, 36, 4); g.fillStyle = shade(M.dark, 0.2); g.fill();
    // chair behind
    g.fillStyle = shade(M.dark, -0.1); rr(g, CX() + V(140, 90), gy - 420, 190, 250, 26); g.fill();
  });
  return { GY: gy, M, CX: CX() };
}
// bank: glass, screens, a clerk behind the counter
export function bank(g, t, cam, o = {}) {
  const M = mood(o.mood || 'interiorCool'), gy = GY();
  layer(g, cam, 0.18, (g) => backdrop(g, [shade(M.sky[0], -0.2), shade(M.sky[1], -0.25)]));
  layer(g, cam, 0.6, (g) => {
    wallGrad(g, -E.W, -E.H, E.W * 3, gy + E.H, M);
    // brand wall: big blue glow panel + logo circle
    rr(g, CX() - V(620, 480), gy - V(760, 800), V(1240, 960), V(380, 400), 18); g.fillStyle = alpha('#0d1a33', 0.85); g.fill();
    glow(g, CX(), gy - V(560, 600), V(700, 620), '#2f6fd0', 0.22);
    ring(g, CX() - V(220, 170), gy - V(570, 610), 54, 9, alpha('#8fc0ff', 0.8));
    circle(g, CX() - V(220, 170), gy - V(570, 610), 26, alpha('#8fc0ff', 0.8));
    g.fillStyle = alpha('#8fc0ff', 0.5); for (let i = 0; i < 4; i++) g.fillRect(CX() - V(130, 100), gy - V(600, 640) + i * 20, V(380, 300) * (1 - i * 0.12), 8);
    // ceiling spots
    for (let i = 0; i < 5; i++) { const lx = CX() + (i - 2) * V(360, 220); glow(g, lx, gy - V(880, 900), 120, '#cfe6ff', 0.2); FX.lightCone(g, lx, gy - V(880, 900), { angle: Math.PI / 2, spread: 0.36, len: V(700, 760), color: '#cfe6ff', a: 0.05 }); }
  });
  layer(g, cam, 0.95, (g) => {
    g.fillStyle = linGrad(g, 0, gy, 0, gy + 420, [shade(M.floor, 0.1), shade(M.floor, -0.3)]); g.fillRect(-E.W, gy, E.W * 3, E.H);
    // counter with a glass screen
    const cw = E.W, cx = CX();
    g.fillStyle = shade(M.dark, 0.16); g.fillRect(-E.W, gy - 210, E.W * 3, 210);
    g.fillStyle = shade(M.dark, 0.26); g.fillRect(-E.W, gy - 222, E.W * 3, 16);
    g.fillStyle = alpha('#cfe6ff', 0.07); g.fillRect(cx - cw * 0.36, gy - 420, cw * 0.18, 200);
    g.strokeStyle = alpha('#cfe6ff', 0.3); g.lineWidth = 3; g.strokeRect(cx - cw * 0.36, gy - 420, cw * 0.18, 200);
    // terminal + card reader
    rr(g, cx - 120, gy - 300, 120, 84, 8); g.fillStyle = '#0e1220'; g.fill();
    g.fillStyle = alpha('#7fd0ff', 0.5); g.fillRect(cx - 110, gy - 292, 100, 60);
    FX.pool(g, cx, gy + 30, 500, 56, '#cfe6ff', 0.12);
  });
  return { GY: gy, M, CX: CX() };
}
// street at night: facades, lamps, wet asphalt
export function street(g, t, cam, o = {}) {
  const M = mood(o.mood || 'night'), gy = gyStreet();
  function gyStreet() { return E.H * V(0.8, 0.66); }
  layer(g, cam, 0.14, (g) => { backdrop(g, [M.sky[0], M.sky[1], M.sky[2] || M.sky[1]]); FX.stars(g, t, { count: 80, area: [0, 0, E.W, E.H * 0.4] }); FX.clouds(g, { y: E.H * 0.06, h: 160, color: '#8fa0d0', a: 0.08, seed: 4 }); });
  layer(g, cam, 0.42, (g) => {
    FX.skyline(g, { x: -E.W, y: gy - 200, w: E.W * 3, minH: 120, maxH: 420, color: mix(M.sky[1], M.wall, 0.5), windowColor: alpha(M.practical, 0.4), lit: 0.25, seed: 6 });
  });
  layer(g, cam, 0.68, (g) => {
    FX.facade(g, { x: -E.W, y: gy, w: E.W * 3, h: V(560, 700), color: shade(M.wall, -0.15), win: alpha(M.practical, 0.75), dark: shade(M.dark, 0.05), cols: 14, rows: 4, lit: 0.45, seed: 9, door: false });
    g.fillStyle = shade(M.dark, -0.1); g.fillRect(-E.W, gy - 90, E.W * 3, 90);
    for (let i = 0; i < 5; i++) FX.door(g, { x: -E.W + 300 + i * 900, y: gy, w: 150, h: 210, color: shade(M.wall, -0.3), light: alpha(M.practical, 0.5), open: 0.15 });
  });
  layer(g, cam, 0.95, (g) => {
    // wet road
    g.fillStyle = linGrad(g, 0, gy, 0, gy + 460, [shade(M.road, 0.05), shade(M.road, -0.35), shade(M.dark, -0.2)]); g.fillRect(-E.W, gy, E.W * 3, E.H);
    // road reflections
    for (let i = 0; i < 6; i++) { g.fillStyle = alpha(i % 2 ? '#ffb860' : '#8fc0ff', 0.05); g.fillRect(-E.W + i * 520 + 120, gy + 40, 60, 380); }
    g.fillStyle = alpha('#ffffff', 0.10); for (let x = -E.W; x < E.W * 2; x += 260) g.fillRect(x, gy + 210, 130, 8);
    // lamp posts
    FX.lampPost(g, CX() - V(760, 600), gy, V(430, 460), { color: shade(M.dark, -0.05), light: M.practical, a: 0.2 });
    FX.lampPost(g, CX() + V(780, 560), gy, V(430, 460), { color: shade(M.dark, -0.05), light: M.practical, a: 0.2 });
    FX.tree(g, CX() - V(980, 760), gy, 1.3, shade(M.dark, 0.05));
    FX.pool(g, CX() - V(720, 560), gy + 60, 260, 46, M.practical, 0.18);
    FX.pool(g, CX() + V(820, 520), gy + 60, 260, 46, M.practical, 0.18);
  });
  return { GY: gy, M, CX: CX() };
}
// stage at a charity gala: giant LED screen, podium, crowd silhouettes
export function gala(g, t, cam, o = {}) {
  const M = mood(o.mood || 'storm'), gy = E.H * V(0.84, 0.68);
  layer(g, cam, 0.16, (g) => { backdrop(g, [shade(M.sky[0], -0.4), shade(M.sky[1], -0.45)]); FX.stars(g, t, { count: 50, area: [0, 0, E.W, E.H * 0.3], color: '#9fb6ff' }); });
  layer(g, cam, 0.55, (g) => {
    wallGrad(g, -E.W, -E.H, E.W * 3, gy + E.H, M);
    // truss + spotlights
    g.fillStyle = shade(M.dark, 0.05); g.fillRect(-E.W, gy - V(880, 900), E.W * 3, 26);
    for (let i = 0; i < 6; i++) { const lx = CX() + (i - 2.5) * V(330, 210); FX.lightCone(g, lx, gy - V(870, 890), { angle: Math.PI / 2 + (i - 2.5) * 0.06, spread: 0.30, len: V(900, 900), color: i % 2 ? '#cfe0ff' : '#ffe0b0', a: 0.07 }); }
    // giant LED screen with "100% FOR THE KIDS"
    const sw = V(980, 860), sh = V(430, 470), sx = CX() - sw / 2, sy = gy - V(780, 820);
    rr(g, sx - 14, sy - 14, sw + 28, sh + 28, 10); g.fillStyle = '#080a12'; g.fill();
    g.save(); g.beginPath(); g.rect(sx, sy, sw, sh); g.clip();
    g.fillStyle = linGrad(g, 0, sy, 0, sy + sh, ['#123a6a', '#1e6aa8', '#0d2340']); g.fillRect(sx, sy, sw, sh);
    for (let y = sy; y < sy + sh; y += 6) for (let x = sx; x < sx + sw; x += 6) { if ((x + y) % 12 === 0) { g.fillStyle = alpha('#cfe6ff', 0.06); g.fillRect(x, y, 3, 3); } }
    glow(g, sx + sw / 2, sy + sh / 2, sw * 0.6, '#7fd0ff', 0.15);
    const pulse = 0.75 + 0.25 * Math.sin(t * 2.2);
    g.save(); g.globalAlpha = pulse; g.fillStyle = '#eaf6ff'; g.font = `800 ${Math.round(sh * 0.30)}px NotoArm`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.screenText || '100%', sx + sw / 2, sy + sh * 0.40); g.restore();
    g.fillStyle = alpha('#eaf6ff', 0.8); g.font = `700 ${Math.round(sh * 0.12)}px NotoArm`; g.textAlign = 'center'; g.fillText(o.screenSub || 'ԵՐԵԽԱՆԵՐԻ ՀԱՄԱՐ', sx + sw / 2, sy + sh * 0.74);
    g.restore();
    glow(g, sx + sw / 2, sy + sh / 2, sw * 0.8, '#4a90d0', 0.22);
  });
  layer(g, cam, 0.92, (g) => {
    g.fillStyle = linGrad(g, 0, gy, 0, gy + 360, [shade(M.floor, 0.1), shade(M.floor, -0.3)]); g.fillRect(-E.W, gy, E.W * 3, E.H);
    // podium
    const px = CX() + V(60, 0), pw = V(260, 240);
    g.fillStyle = shade(M.dark, 0.14); g.fillRect(px - pw / 2, gy - 300, pw, 300);
    g.fillStyle = shade(M.dark, 0.24); g.fillRect(px - pw / 2 - 16, gy - 322, pw + 32, 24);
    glow(g, px, gy - 330, 160, '#cfe6ff', 0.22);
    FX.pool(g, px, gy + 20, 300, 40, '#cfe6ff', 0.14);
    // audience silhouettes (front, dark)
    g.fillStyle = '#07080f';
    for (let r = 0; r < 3; r++) for (let i = 0; i < 12; i++) { const ax = -100 + i * (E.W + 200) / 11 + (r % 2) * 60, ay = gy + 120 + r * 70, s = 0.9 + r * 0.18; circle(g, ax, ay - 70 * s + Math.sin(t * 1.6 + i) * 2, 24 * s, '#07080f'); g.fillRect(ax - 30 * s, ay - 50 * s, 60 * s, 120 * s); }
  });
  return { GY: gy, M, CX: CX() };
}
// newsroom / TV studio for the media beat
export function studio(g, t, cam, o = {}) {
  const M = mood(o.mood || 'interiorCool'), gy = GY();
  layer(g, cam, 0.2, (g) => backdrop(g, [shade(M.sky[0], -0.1), shade(M.sky[1], -0.2)]));
  layer(g, cam, 0.6, (g) => {
    wallGrad(g, -E.W, -E.H, E.W * 3, gy + E.H, M);
    // video wall of "headlines"
    const vw = V(1500, 900), vh = V(560, 620), vx = CX() - vw / 2, vy = gy - V(780, 820);
    rr(g, vx - 12, vy - 12, vw + 24, vh + 24, 10); g.fillStyle = '#06080f'; g.fill();
    for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) {
      const cw = vw / 6 - 14, chh = vh / 3 - 14, x = vx + c * vw / 6 + 7, y = vy + r * vh / 3 + 7;
      g.fillStyle = alpha(['#1e3a6a', '#3a2330', '#12304a'][r], 0.95); g.fillRect(x, y, cw, chh);
      g.fillStyle = alpha('#dce8ff', 0.5);
      for (let k = 0; k < 3; k++) g.fillRect(x + 10, y + 18 + k * 16, cw * (0.6 - k * 0.15), 6);
      if ((r + c) % 3 === 0) { g.fillStyle = alpha('#ff9080', 0.35); g.fillRect(x + 10, y + chh - 34, cw * 0.5, 10); }
    }
    glow(g, CX(), vy + vh / 2, vw * 0.55, '#4a90d0', 0.16);
  });
  layer(g, cam, 0.92, (g) => {
    g.fillStyle = linGrad(g, 0, gy, 0, gy + 400, [shade(M.floor, 0.08), shade(M.floor, -0.32)]); g.fillRect(-E.W, gy, E.W * 3, E.H);
    // news desk
    const dw = V(900, 780), dx = CX() - dw / 2;
    g.fillStyle = shade(M.dark, 0.14); g.fillRect(dx, gy - 240, dw, 240);
    g.fillStyle = alpha('#7fd0ff', 0.12); g.fillRect(dx + 8, gy - 236, dw - 16, 10);
    g.fillStyle = shade(M.dark, 0.24); g.fillRect(dx - 20, gy - 258, dw + 40, 22);
    FX.pool(g, CX(), gy + 30, 520, 60, '#4a90d0', 0.14);
  });
  return { GY: gy, M, CX: CX() };
}
