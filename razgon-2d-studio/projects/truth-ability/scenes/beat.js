// beat.js — compact shot builders so the remaining acts can be one line per shot.
import { E, V, S, mood, clamp, lerp, ease, prog, rng, alpha, shade, mix, seg, circle, ring, poly, rr, linGrad, radGrad, glow, text, layer, blurLayer, veil, backdrop, FONTS, registerShot, talkAmount } from '/engine/core.js';
import { POSES, posesAt, breathe, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as SET from './sets/room.js';
import { glyph, talkGlyph, goldThread, sparkBurst, cracks, frozenAir, wordPop, fig, blink, GOLD, GOLD_HI, LIE, LIE_HI, CYAN } from './fx_truth.js';
import { camPath, drift, camAdd, spring, fg } from '/engine/motion.js';
import { camPush, camPull, ots, fgProp } from './lib.js';

export const GY = () => SET.GY();

// a pair facing each other inside any set; talk glyphs optional
export function pair(o) {
  return { draw(g, t, info) {
    const cam = camAdd(camPath(t, [[0, { z: o.z0 ?? 1.16, x: o.x0 ?? 0, y: o.y0 ?? 0 }], [info.dur, { z: o.z1 ?? 1.24, x: o.x1 ?? 0, y: o.y1 ?? 0 }]], { endEase: 0.3 }), drift(t, 2.6, o.seed || 3));
    const S2 = o.set(g, t, cam);
    const M = S2.M || mood(o.mood || 'dusk'), gy = S2.GY ?? GY(), sc = o.s ?? V(1.6, 1.65);
    if (o.behind) o.behind(g, t, cam, S2, M);
    layer(g, cam, 1, (g) => {
      const L = o.left, R = o.right;
      if (L) fig(g, { x: E.W * (L.x ?? 0.34), y: gy + (L.dy || 0), s: sc * (L.s || 1), facing: 1, outfit: L.who, pose: breathe(typeof L.pose === 'function' ? L.pose(t, info) : (L.pose ?? POSES.stand), t, 1, 2), expr: typeof L.expr === 'function' ? L.expr(t, info) : (L.expr || 'neutral'), rim: { color: M.rim, dir: [0.4, -1], w: L.rimW ?? 4.6 }, talk: L.talk ? talkAmount(info.globalT) : 0, blink: blink(t, 2), shadow: !!o.shadow, dim: !!L.dim, alpha: L.alpha });
      if (R) fig(g, { x: E.W * (R.x ?? 0.66), y: gy + (R.dy || 0), s: sc * (R.s || 1), facing: -1, outfit: R.who, pose: breathe(typeof R.pose === 'function' ? R.pose(t, info) : (R.pose ?? POSES.stand), t, 1, 5), expr: typeof R.expr === 'function' ? R.expr(t, info) : (R.expr || 'neutral'), rim: { color: M.rim, dir: [-0.4, -1], w: R.rimW ?? 4.6 }, talk: R.talk ? talkAmount(info.globalT) : 0, blink: blink(t, 1), shadow: !!o.shadow, dim: !!R.dim, alpha: R.alpha });
      if (L && L.glyph) { const hp = headPos({ x: E.W * (L.x ?? 0.34), y: gy + (L.dy || 0), s: sc * (L.s || 1), facing: 1, pose: typeof L.pose === 'function' ? L.pose(t, info) : (L.pose ?? POSES.stand) }); talkGlyph(g, t, hp[0] + 8, hp[1] - hp[2] * 2.05, { t0: L.glyph.t0 ?? 0.35, lieAt: L.glyph.lieAt, s: L.glyph.s ?? V(34, 31), seed: L.glyph.seed ?? 7, state: L.glyph.state || 'truth' }); }
      if (R && R.glyph) { const hp = headPos({ x: E.W * (R.x ?? 0.66), y: gy + (R.dy || 0), s: sc * (R.s || 1), facing: -1, pose: typeof R.pose === 'function' ? R.pose(t, info) : (R.pose ?? POSES.stand) }); talkGlyph(g, t, hp[0] - 8, hp[1] - hp[2] * 2.05, { t0: R.glyph.t0 ?? 0.35, lieAt: R.glyph.lieAt, s: R.glyph.s ?? V(34, 31), seed: R.glyph.seed ?? 8, state: R.glyph.state || 'truth' }); }
      if (o.onStage) o.onStage(g, t, info, { cam, M, gy, sc });
    });
    if (o.ots) ots(g, cam, o.ots);
    if (o.fg) fgProp(g, cam, o.fg);
    if (o.dust !== false) FX.dust(g, t, { count: o.dustCount || 32, color: o.dustColor || '#ffd8b4', a: 0.24 });
    if (o.overlay) o.overlay(g, t, info, M);
  } };
}

// single figure, set behind, strong camera push
export function solo(o) {
  return { draw(g, t, info) {
    const cam = camAdd(camPath(t, [[0, { z: o.z0 ?? 1.1, x: o.x0 ?? 0 }], [info.dur, { z: o.z1 ?? 1.2, x: o.x1 ?? -20 }]], { endEase: 0.26 }), drift(t, 2.8, o.seed || 2));
    const S2 = o.set(g, t, cam);
    const M = S2.M || mood(o.mood || 'dusk'), gy = S2.GY ?? GY(), sc = (o.s ?? V(1.7, 1.75)) * (o.f?.s || 1);
    const who = o.f || {};
    layer(g, cam, 1, (g) => {
      fig(g, { x: E.W * (who.x ?? 0.5), y: gy + (who.dy || 0), s: sc, facing: who.facing ?? 1, outfit: who.who, pose: breathe(typeof who.pose === 'function' ? who.pose(t, info) : (who.pose ?? POSES.stand), t, 1, 3), expr: typeof who.expr === 'function' ? who.expr(t, info) : (who.expr || 'neutral'), rim: { color: M.rim, dir: [who.facing === -1 ? -0.4 : 0.4, -1], w: 5 }, talk: who.talk ? talkAmount(info.globalT) : 0, blink: blink(t, 3), shadow: !!o.shadow });
      if (who.glyph) { const hp = headPos({ x: E.W * (who.x ?? 0.5), y: gy + (who.dy || 0), s: sc, facing: who.facing ?? 1, pose: typeof who.pose === 'function' ? who.pose(t, info) : (who.pose ?? POSES.stand) }); talkGlyph(g, t, hp[0], hp[1] - hp[2] * 2.05, { t0: who.glyph.t0 ?? 0.35, lieAt: who.glyph.lieAt, s: who.glyph.s ?? V(38, 35), seed: who.glyph.seed ?? 5 }); }
      if (o.onStage) o.onStage(g, t, info, { cam, M, gy, sc });
    });
    if (o.after) o.after(g, t, info, { cam, M, gy, sc });
    if (o.ots) ots(g, cam, o.ots);
    if (o.fg) fgProp(g, cam, o.fg);
    if (o.dust !== false) FX.dust(g, t, { count: 30, color: '#ffd8b4', a: 0.22 });
    if (o.overlay) o.overlay(g, t, info, M);
  } };
}

// a floating UI panel / data card with a title and rows
export function panel(o) {
  return { draw(g, t, info) {
    const M = mood(o.mood || 'void');
    backdrop(g, [shade(M.sky[0], -0.32), shade(M.sky[1], -0.4)]);
    if (o.behind) o.behind(g, t);
    FX.dust(g, t, { count: 24, color: '#bfe0ff', a: 0.16 });
    const k = clamp(spring(t - (o.t0 ?? 0.05), 0, { freq: 2.2, damp: 0.55 }));
    const w = o.w ?? V(880, 720), h = o.h ?? V(480, 420), cx = E.W / 2, cy = E.H * (o.cy ?? 0.5);
    g.save(); g.globalAlpha = k; g.translate(cx, cy); g.scale(lerp(0.9, 1, k), lerp(0.9, 1, k));
    rr(g, -w / 2, -h / 2, w, h, 22); g.fillStyle = 'rgba(10,16,30,0.92)'; g.fill();
    g.strokeStyle = alpha(o.line || CYAN, 0.30); g.lineWidth = 2.5; g.stroke();
    rr(g, -w / 2, -h / 2, 8, h, 4); g.fillStyle = alpha(o.accent || LIE, 0.9); g.fill();
    if (o.title) text(g, o.title, -w / 2 + 42, -h / 2 + 56, { size: V(44, 38), color: alpha('#ffffff', 0.94), font: FONTS.title, weight: 700, align: 'left', spacing: 2 });
    (o.rows || []).forEach((row, i) => {
      const y = -h / 2 + 138 + i * V(72, 64); const kk = clamp(spring(t - (o.t0 ?? 0.05) - 0.2 - i * 0.13, 0, { freq: 2.4 }));
      if (kk <= 0) return;
      g.save(); g.globalAlpha *= clamp(kk); g.translate((1 - kk) * 40, 0);
      if (row.tag) { rr(g, -w / 2 + 42, y - 24, V(132, 114), 48, 10); g.fillStyle = alpha(row.color || LIE, 0.18); g.fill(); text(g, row.tag, -w / 2 + 42 + V(66, 57), y + 1, { size: V(23, 20), color: alpha(row.color || LIE, 0.95), font: FONTS.ui, weight: 900 }); }
      text(g, row.t, -w / 2 + (row.tag ? V(196, 170) : 42), y + 2, { size: V(34, 29), color: alpha('#e8eefc', 0.9), font: FONTS.ui, weight: 800, align: 'left' });
      if (row.v) text(g, row.v, w / 2 - 42, y + 2, { size: V(34, 29), color: alpha(row.vColor || GOLD, 0.95), font: FONTS.ui, weight: 900, align: 'right' });
      g.restore();
    });
    g.restore();
    if (o.after) o.after(g, t, info);
    if (o.overlay) o.overlay(g, t, info, M);
  } };
}

// full-frame Armenian statement (kinetic, on dark)
export function statement(o) {
  return { draw(g, t, info) {
    const M = mood(o.mood || 'void');
    backdrop(g, [shade(o.c0 || M.sky[0], -0.42), shade(o.c1 || M.sky[1], -0.5)]);
    if (o.behind) o.behind(g, t);
    const k = clamp(spring(t - (o.t0 ?? 0.1), 0, { freq: 2.2, damp: 0.5 }));
    const sz = (o.size ?? V(78, 66)) * lerp(0.92, 1, k);
    g.save(); g.globalAlpha = clamp(k * 1.2);
    (o.lines || []).forEach((ln, i) => {
      const s2 = i === (o.hi ?? 0) ? 1 : 0.62;
      text(g, ln, E.W / 2, E.H * (o.y ?? 0.5) + (i - ((o.lines.length - 1) / 2)) * sz * 1.42, { size: sz * s2, color: i === (o.hi ?? 0) ? (o.color || GOLD_HI) : alpha('#cfd8ec', 0.72), font: FONTS.title, weight: 700, spacing: i === (o.hi ?? 0) ? 3 : 6, glow: i === (o.hi ?? 0) ? 26 : 0, glowColor: alpha(o.color || GOLD, 0.5) });
    });
    g.restore();
    if (o.dust !== false) FX.dust(g, t, { count: 26, color: '#ffe9d2', a: 0.2 });
    if (o.after) o.after(g, t, info);
  } };
}

// montage grid of small beats (2x2 or 3x2) — used for "everybody wants to hear you"
export function grid(o) {
  return { draw(g, t, info) {
    const M = mood(o.mood || 'void');
    backdrop(g, [shade(M.sky[0], -0.4), shade(M.sky[1], -0.5)]);
    const cols = o.cols || 3, rows = Math.ceil(o.cells.length / cols);
    const pad = V(26, 22), cw = (E.W - pad * (cols + 1)) / cols, ch = (E.H - pad * (rows + 1) - 70) / rows;
    o.cells.forEach((cell, i) => {
      const cx = pad + (i % cols) * (cw + pad), cy = 70 + pad + Math.floor(i / cols) * (ch + pad);
      const k = clamp(spring(t - (o.t0 ?? 0) - i * 0.12, 0, { freq: 2.4 }));
      if (k <= 0) return;
      g.save(); g.globalAlpha = clamp(k); g.translate(cx, cy); g.scale(lerp(0.92, 1, k), lerp(0.92, 1, k));
      g.beginPath(); rr(g, 0, 0, cw, ch, 14); g.save(); g.clip();
      g.fillStyle = alpha(cell.bg || '#12182a', 0.95); g.fillRect(0, 0, cw, ch);
      g.translate(cw / 2, ch * (cell.fy ?? 0.92)); cell.draw(g, t, cw, ch, cell);
      g.restore();
      g.strokeStyle = alpha(cell.edge || CYAN, 0.22); g.lineWidth = 2; rr(g, 0, 0, cw, ch, 14); g.stroke();
      if (cell.label) text(g, cell.label, cw / 2, ch + 18, { size: V(22, 19), color: alpha('#c8d4ea', 0.8), font: FONTS.ui, weight: 800, spacing: 2 });
      g.restore();
    });
    if (o.overlay) o.overlay(g, t, info);
  } };
}

// name-card style lower third
export function nameCard(g, t, t0, name, sub, o = {}) {
  const k = clamp(spring(t - t0, 0, { freq: 2.2 }));
  if (k <= 0) return;
  const x = E.W * (o.x ?? 0.08), y = E.H * (o.y ?? 0.82);
  g.save(); g.globalAlpha = clamp(k); g.translate((1 - k) * -50, 0);
  g.fillStyle = alpha(o.accent || LIE, 0.85); g.fillRect(x, y - 22, 5, 66);
  text(g, name, x + 22, y - 2, { size: V(38, 32), color: alpha('#ffffff', 0.94), font: FONTS.title, weight: 700, align: 'left', spacing: 2 });
  if (sub) text(g, sub, x + 22, y + 34, { size: V(24, 21), color: alpha(o.accent || GOLD, 0.85), font: FONTS.ui, weight: 800, align: 'left', spacing: 3 });
  g.restore();
}
