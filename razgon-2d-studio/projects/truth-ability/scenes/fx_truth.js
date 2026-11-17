// fx_truth.js — the film's visual language: the truth/lie glyph, gold threads, cracks, UI cards, blueprint helpers.
import { E, V, S, mood, clamp, lerp, ease, prog, rng, noise, alpha, shade, mix, seg, circle, ring, poly, rr, linGrad, radGrad, glow, text, measure, layer, blurLayer, veil, backdrop, wordTime, FONTS } from '/engine/core.js';
import { spring } from '/engine/motion.js';
import { drawFigure, POSES, posesAt, breathe, bigFace, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';

export const GOLD = '#ffd47e';
export const GOLD_HI = '#fff2cf';
export const LIE = '#ff5a58';
export const LIE_HI = '#ffb0a8';
export const CYAN = '#8fe0ff';
export const W = () => S().ui;

// ---------- the truth glyph ----------
// diamond with a tick (truth) or a fracture (lie); kAnim 0..1 pops it in with weight
export function glyph(g, x, y, o = {}) {
  const { state = 'truth', s = 34, a = 1, k = 1, rot = 0, glow: gl = 1, ring: rg = 0, seed = 1 } = o;
  if (a <= 0.001 || k <= 0.001) return;
  const col = state === 'truth' ? GOLD : state === 'lie' ? LIE : state === 'hidden' ? '#8a93b0' : '#6f7a99';
  const R = s * 0.62 * (0.6 + 0.4 * k);
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(rot + (1 - k) * 0.5);
  if (gl > 0) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, 0, 0, R * 3.1, col, 0.5 * gl); g.restore(); }
  // outer thin ring on reveal
  if (k < 1) ring(g, 0, 0, R * (2.6 - 1.6 * k), 2.5, alpha(col, 0.6 * (1 - k)));
  if (rg > 0) for (let i = 0; i < 2; i++) { const ph = (rg + i * 0.5) % 1; ring(g, 0, 0, R * (1.2 + ph * 2.2), 2.4 * (1 - ph), alpha(col, 0.5 * (1 - ph))); }
  // diamond body
  poly(g, [[0, -R], [R * 0.82, 0], [0, R], [-R * 0.82, 0]], alpha(shade(col, -0.72), 0.92));
  poly(g, [[0, -R], [R * 0.82, 0], [0, R], [-R * 0.82, 0]], null);
  g.strokeStyle = col; g.lineWidth = Math.max(1.6, s * 0.075); g.lineJoin = 'round'; g.beginPath();
  g.moveTo(0, -R); g.lineTo(R * 0.82, 0); g.lineTo(0, R); g.lineTo(-R * 0.82, 0); g.closePath(); g.stroke();
  if (state === 'truth') {
    // glossy tick
    g.strokeStyle = GOLD_HI; g.lineWidth = Math.max(2, s * 0.12); g.lineCap = 'round';
    g.beginPath(); g.moveTo(-R * 0.38, R * 0.02); g.lineTo(-R * 0.1, R * 0.32); g.lineTo(R * 0.42, -R * 0.30); g.stroke();
    g.fillStyle = alpha('#ffffff', 0.16); poly(g, [[0, -R], [R * 0.82, 0], [0, -R * 0.16], [-R * 0.82, 0]], g.fillStyle);
  } else if (state === 'lie') {
    // fracture: jagged crack through the diamond
    g.strokeStyle = LIE_HI; g.lineWidth = Math.max(1.8, s * 0.095); g.lineCap = 'round'; g.lineJoin = 'miter';
    const r = rng(seed); const pts = [[-R * 0.14, -R * 1.0], [-R * 0.02, -R * 0.45], [R * 0.18, -R * 0.22], [-R * 0.06, R * 0.06], [R * 0.16, R * 0.4], [R * 0.02, R * 1.0]];
    g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0] + (i % 2 ? R * 0.06 : -R * 0.05), p[1]) : g.moveTo(p[0], p[1])); g.stroke();
    for (let i = 0; i < 4; i++) { const [ox, oy] = pts[1 + i % 4]; poly(g, [[ox, oy], [ox + (r() - 0.5) * R * 0.9, oy + (r() - 0.5) * R * 0.6], [ox + (r() - 0.5) * R * 0.5, oy + (r() - 0.5) * R * 0.8]], alpha(LIE, 0.35)); }
  } else if (state === 'question') {
    text(g, '?', 0, R * 0.06, { size: R * 1.15, color: col, font: FONTS.title, weight: 700, glow: 14, glowColor: alpha(col, 0.7) });
  }
  g.restore();
}
// helper: glyph that pops (spring) at t0 over a character, switching truth -> lie at tLie
export function talkGlyph(g, t, x, y, o = {}) {
  const { t0 = 0, lieAt = null, state = 'truth', s = 34, seed = 3, drift = 1 } = o;
  const k = spring(t, t0, { freq: 2.1, damp: 0.5 });
  if (k <= 0.001) return;
  const st = lieAt != null && t >= lieAt ? 'lie' : state;
  const pop = lieAt != null && t >= lieAt ? 0.35 * Math.exp(-(t - lieAt) * 8) : 0;
  const bobY = Math.sin(t * 1.6 + seed) * 3 * drift;
  glyph(g, x, y + bobY, { state: st, s: s * (1 + pop), k: clamp(k), a: clamp(k * 1.4), seed, ring: lieAt != null && t >= lieAt ? clamp((t - lieAt) / 0.9) : 0 });
}

// ---------- gold truth thread ----------
export function goldThread(g, t, pts, o = {}) {
  const { p = 1, color = GOLD, w = 2.6, a = 0.8, dash = false } = o;
  if (p <= 0) return;
  g.save(); g.globalCompositeOperation = 'lighter';
  if (dash) { g.setLineDash([12, 10]); g.lineDashOffset = -t * 40; }
  g.strokeStyle = alpha(color, a); g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round';
  const n = pts.length - 1, upto = Math.max(1, Math.floor(n * clamp(p)));
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i <= upto; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.stroke();
  g.restore();
}
// particles: gold sparks that fly from a point
export function sparkBurst(g, t, x, y, o = {}) {
  const { t0 = 0, n = 16, color = GOLD, speed = 260, life = 0.9, size = 3.4, seed = 7 } = o;
  const x0 = t - t0; if (x0 < 0 || x0 > life) return;
  const r = rng(seed); g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const ang = r() * Math.PI * 2, sp = speed * (0.4 + r() * 0.9), k = x0 / life;
    const px = x + Math.cos(ang) * sp * x0 * (1 - k * 0.4), py = y + Math.sin(ang) * sp * x0 * 0.7 + 300 * x0 * x0;
    circle(g, px, py, size * (1 - k), alpha(color, 0.9 * (1 - k)));
  }
  g.restore();
}
// thin white fracture lines spreading from a point (on lies/truth breaking)
export function cracks(g, x, y, o = {}) {
  const { p = 1, n = 7, len = 320, color = '#ffffff', a = 0.5, seed = 5, w = 1.6, spread = Math.PI * 2, angle0 = 0 } = o;
  if (p <= 0) return;
  const r = rng(seed); g.save();
  for (let i = 0; i < n; i++) {
    const ang = angle0 + spread * (i / n) + (r() - 0.5) * 0.5;
    const L = len * (0.45 + r() * 0.85) * ease.out(clamp(p * 1.3));
    g.strokeStyle = alpha(color, a * (0.5 + r() * 0.5)); g.lineWidth = w * (0.6 + r() * 0.8); g.lineCap = 'round';
    g.beginPath(); g.moveTo(x, y);
    let px = x, py = y;
    const steps = 4;
    for (let k = 1; k <= steps; k++) { const d = L * k / steps, j = (r() - 0.5) * L * 0.22; px = x + Math.cos(ang) * d + Math.cos(ang + 1.57) * j; py = y + Math.sin(ang) * d + Math.sin(ang + 1.57) * j; g.lineTo(px, py); }
    g.stroke();
  }
  g.restore();
}
// soft rectangular UI card used for diagrams/chat/data
export function card(g, x, y, w, h, o = {}) {
  const ui = W(), { a = 1, r = 18, fill = null, line = null, accent = null, glowA = 0 } = o;
  g.save(); g.globalAlpha *= a;
  if (glowA > 0) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, x + w / 2, y + h / 2, Math.max(w, h) * 0.7, accent || CYAN, glowA); g.restore(); }
  rr(g, x, y, w, h, r); g.fillStyle = fill || 'rgba(10,16,30,0.88)'; g.fill();
  g.strokeStyle = line || 'rgba(150,190,240,0.28)'; g.lineWidth = 2; g.stroke();
  if (accent) { rr(g, x, y, 6, h, 3); g.fillStyle = accent; g.fill(); }
  g.restore();
}
// small avatar circle for chat/notification shots
export function avatar(g, x, y, r, o = {}) { const { color = '#3a5a8a', M = null } = o; circle(g, x, y, r, shade(color, -0.3)); circle(g, x, y - r * 0.18, r * 0.34, alpha('#ffffff', 0.5)); g.fillStyle = alpha('#ffffff', 0.5); g.beginPath(); g.arc(x, y + r * 0.45, r * 0.5, Math.PI, 0); g.fill(); }
// cyan digital screen glow (phones / LED)
export function screenGlow(g, x, y, r, color = CYAN, a = 0.4) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, x, y, r, color, a); g.restore(); }
// freeze-frame particles hanging in the air (badge moments)
export function frozenAir(g, t, o = {}) { FX.drops(g, t * 0.15, { count: o.count || 60, area: o.area || [0, 0, E.W, E.H], rMin: 2, rMax: 9, color: o.color || '#dfe8ff', drift: 1.2 }); FX.dust(g, t * 0.2, { count: 40, color: o.color || '#ffe9d2', a: 0.3, size: 2.4 }); }
// grain-ish horizontal light streak
export function lensFlare(g, x, y, w = E.W, color = '#ffe6cc', a = 0.3) { FX.lensStreak(g, x, y, w, color, a, 2); FX.lensStreak(g, x, y, w * 0.5, color, a * 0.6, 7); }
// narrator-style kinetic word (Armenian-safe: whole word, not per letter)
export function wordPop(g, t, str, x, y, o = {}) {
  const { t0 = 0, dur = 1.6, size = 78, color = GOLD_HI, align = 'center', font = FONTS.title, weight = 700, spacing = 2, mode = 'drop', glowA = 26, out = null } = o;
  const lt = t - t0; if (lt < 0) return 0;
  const s = mode === 'slam' ? 1 + 1.2 * (1 - clamp(spring(lt, 0, { freq: 2.6, damp: 0.55 }))) : 1;
  const k = mode === 'drop' ? spring(lt, 0, { freq: 2.2, damp: 0.45 }) : clamp(spring(lt, 0, { freq: 2.6, damp: 0.6 }));
  const dy = mode === 'drop' ? -(1 - k) * size * 1.2 : mode === 'rise' ? (1 - k) * size * 0.8 : 0;
  const a = clamp(lt / 0.16) * (out != null ? 1 - ease.inOut(prog(t, out, out + 0.3)) : 1);
  g.save(); g.globalAlpha *= a; g.translate(x, y + dy); g.scale(s, s);
  text(g, str, 0, 0, { size, color, font, weight, align, glow: glowA, glowColor: alpha(color, 0.65), spacing });
  g.restore(); return k;
}
// convenience: draw a figure with standard rim from a mood
export function fig(g, o) { const M = o.M || mood('dusk'); return drawFigure(g, { rim: { color: M.rim, dir: [-0.7, -0.55], w: 4.2 }, ...o }); }
// blink helper
export const blink = (t, seed = 0) => ((t + seed * 1.37) % (3.1 + seed * 0.4)) > (2.96 + seed * 0.4);
