// a1_rules.js — the rules act: blueprint explainers, the one rule, and what the power cannot do.
import { E, V, S, mood, clamp, lerp, ease, prog, rng, alpha, shade, mix, seg, circle, ring, poly, rr, linGrad, radGrad, glow, text, measure, layer, blurLayer, veil, backdrop, FONTS, registerShot, talkAmount } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { camPath, drift, camAdd, spring, impact, fg } from '/engine/motion.js';
import * as SET from '../sets/room.js';
import { YOU, MOM, LEO, MIA, BRO, BLACK, SELL } from '../cast.js';
import { glyph, talkGlyph, goldThread, sparkBurst, cracks, card, screenGlow, frozenAir, lensFlare, wordPop, fig, blink, GOLD, GOLD_HI, LIE, CYAN } from '../fx_truth.js';
import { bpShot, faceShot, insertShot, wideShot, camPush, camPull, camDrift, headGrid, T } from '../lib.js';

const UIc = () => S().ui;
const lab = (g, x, y, str, o = {}) => text(g, str, x, y, { size: o.size || V(30, 28), color: o.color || alpha(UIc().cream, 0.86), font: FONTS.ui, weight: 800, align: o.align || 'center', spacing: o.spacing ?? 1.5, alpha: o.a ?? 1 });
// dashed line reveal
function dashLine(g, pts, p, color, w = 2.5, dash = [10, 9], t = 0) {
  g.save(); g.setLineDash(dash); g.lineDashOffset = -t * 26; g.strokeStyle = color; g.lineWidth = w; g.lineCap = 'round';
  const n = pts.length - 1, upto = Math.max(1, Math.floor(n * clamp(p) * 8) / 8);
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i <= n; i++) { const k = clamp(p * n - (i - 1)); if (k <= 0) break; g.lineTo(lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)); }
  g.stroke(); g.restore();
}
// a line-art head profile (blueprint)
// clean line-art side profile facing +x (forehead → nose → lips → chin → jaw → neck → skull)
function headProfile(g, x, y, r, color, p = 1) {
  const P = (u, v) => [x + r * u, y + r * v];
  const pts = [P(-0.28, -0.96), P(0.28, -0.84), P(0.62, -0.5), P(0.72, -0.14), P(0.60, 0.02), P(0.74, 0.10), P(0.80, 0.22), P(0.70, 0.30), P(0.74, 0.36), P(0.62, 0.44), P(0.66, 0.52), P(0.50, 0.62), P(0.24, 0.66), P(0.12, 0.86), P(0.10, 1.12), P(-0.42, 1.12), P(-0.44, 0.74), P(-0.72, 0.46), P(-0.86, 0.06), P(-0.80, -0.34), P(-0.60, -0.72), P(-0.28, -0.96)];
  g.save(); g.strokeStyle = color; g.lineWidth = Math.max(3, r * 0.028); g.lineCap = 'round'; g.lineJoin = 'round';
  const n = pts.length - 1, upto = Math.max(1, Math.floor(n * clamp(p)));
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i <= upto; i++) g.lineTo(pts[i][0], pts[i][1]); g.stroke();
  // eye + ear details
  if (p > 0.85) { circle(g, x + r * 0.34, y - r * 0.22, r * 0.075, color); g.strokeStyle = color; g.lineWidth = Math.max(3, r * 0.024); g.beginPath(); g.arc(x - r * 0.18, y + r * 0.06, r * 0.17, -1.1, 1.5); g.stroke(); }
  g.restore();
}

// s018 — the ordinary human can't tell
registerShot('s018', bpShot({
  draw(g, t, info, ui) {
    const cx = E.W * 0.42, cy = E.H * 0.47, r = V(240, 210), p = ease.inOut(prog(t, 0.2, 1.6));
    headProfile(g, cx, cy, r, alpha(ui.blueprint, 0.95 * p), p);
    // three sensors
    const nodes = [[cx + r * 1.45, cy - r * 0.62, 'ԱՉՔԵՐ'], [cx + r * 1.95, cy + r * 0.05, 'ՁԱՅՆ'], [cx + r * 2.35, cy + r * 0.78, 'ԴԵՄՔ']];
    nodes.forEach(([nx, ny, lb], i) => {
      const k = clamp(spring(t - 0.9 - i * 0.35, 0, { freq: 2.2 }));
      if (k <= 0) return;
      dashLine(g, [[cx + r * 1.4, cy + r * 0.05], [nx, ny]], k, alpha(ui.blueprint, 0.5));
      circle(g, nx, ny, 46 * k, alpha(ui.bpBg, 0.92)); ring(g, nx, ny, 46 * k, 3, alpha(ui.blueprint, 0.85));
      lab(g, nx, ny + 1, lb, { size: V(22, 20), color: alpha(ui.cream, 0.92 * k) });
      // red NO stamp under each
      const k2 = clamp(spring(t - 1.9 - i * 0.3, 0, { freq: 2.6 }));
      if (k2 > 0) { g.save(); g.globalAlpha = k2; g.strokeStyle = LIE; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(nx - 58, ny - 20); g.lineTo(nx + 58, ny + 26); g.moveTo(nx + 58, ny - 20); g.lineTo(nx - 58, ny + 26); g.stroke(); g.restore(); }
    });
    lab(g, cx + r * 0.5, cy - r * 1.28, 'ՍՏԻ ՀՈՒՍԱԼԻ ԱՊԱՑՈՒՅՑ ՉԿԱ', { size: V(38, 32), color: alpha(LIE, 0.92 * clamp((t - 2.4) / 0.5)), spacing: 5 });
    // scanner sweep
    const sy = cy - r * 1.2 + ((t * 0.9) % 1) * r * 2.6;
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = linGrad(g, 0, sy - 40, 0, sy + 40, [alpha(ui.blueprint, 0), alpha(ui.blueprint, 0.18), alpha(ui.blueprint, 0)]); g.fillRect(cx - r * 2, sy - 40, r * 4, 80); g.restore();
}}));

// s019 — face, voice, eyes are not proof
registerShot('s019', { draw(g, t, info) {
  const M = mood('void');
  backdrop(g, [shade(M.sky[0], -0.3), shade(M.sky[1], -0.35)]);
  const items = [
    (g, x, y, s) => { g.fillStyle = '#e8f0ff'; g.beginPath(); g.ellipse(x, y, 78 * s, 46 * s, 0, 0, 7); g.fill(); circle(g, x, y, 40 * s, '#1a2238'); circle(g, x, y, 20 * s, '#8fe0ff'); circle(g, x - 8 * s, y - 8 * s, 6 * s, '#ffffff'); },
    (g, x, y, s) => { g.fillStyle = '#f2c9b0'; g.beginPath(); g.ellipse(x, y, 66 * s, 40 * s, 0, 0, 7); g.fill(); g.fillStyle = '#4a1a20'; g.beginPath(); g.ellipse(x, y, 40 * s, 18 * s, 0, 0, 7); g.fill(); g.fillStyle = '#ffffff'; for (let i = 0; i < 6; i++) g.fillRect(x - 34 * s + i * 12 * s, y - 15 * s, 8 * s, 10 * s); },
    (g, x, y, s) => {
      g.fillStyle = '#f2c9b0';
      for (let i = 0; i < 4; i++) { rr(g, x - 46 * s + i * 24 * s, y - 74 * s + (i === 0 || i === 3 ? 10 * s : 0), 20 * s, 62 * s, 10 * s); g.fill(); }   // fingers
      rr(g, x - 48 * s, y - 16 * s, 96 * s, 74 * s, 20 * s); g.fill();                                                                                        // palm
      g.save(); g.translate(x - 52 * s, y + 6 * s); g.rotate(-0.5); rr(g, 0, 0, 56 * s, 20 * s, 10 * s); g.fill(); g.restore();                                // thumb
      g.fillStyle = '#d8a888'; for (let i = 0; i < 4; i++) circle(g, x - 36 * s + i * 24 * s, y + 6 * s, 3.4 * s, alpha('#c08a6a', 0.7));
    }];
  items.forEach((fn, i) => {
    const x = E.W * (0.22 + i * 0.28), y = E.H * 0.46, k = clamp(spring(t - 0.15 - i * 0.22, 0, { freq: 2.2 }));
    if (k <= 0) return;
    g.save(); g.globalAlpha = k; g.translate(x, y); const s2 = V(2.1, 1.9) * lerp(0.7, 1, k); g.scale(s2, s2); fn(g, 0, 0, 1); g.restore();
    const k2 = clamp(spring(t - 1.1 - i * 0.25, 0, { freq: 2.6 }));
    if (k2 > 0) { g.save(); g.globalAlpha = k2 * 0.95; g.strokeStyle = LIE; g.lineWidth = 11; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - 96, y - 96); g.lineTo(x + 96, y + 96); g.moveTo(x + 96, y - 96); g.lineTo(x - 96, y + 96); g.stroke(); g.restore(); }
  });
  lab(g, E.W / 2, E.H * 0.84, 'ԴԵՄՔ • ՁԱՅՆ • ԱՉՔԵՐ', { size: V(34, 30), color: alpha('#8fb8e8', 0.85), spacing: 8 });
  lab(g, E.W / 2, E.H * 0.90, 'ՈՉ ՄԻ ԱՊԱՑՈՒՅՑ', { size: V(40, 34), color: alpha(LIE, 0.9 * clamp((t - 1.6) / 0.5)), spacing: 6 });
  FX.dust(g, t, { count: 26, color: '#bfe0ff', a: 0.16 });
}});

// s020 — you know instantly (smash in)
registerShot('s020', faceShot({ expr: (t) => (t < 0.35 ? 'neutral' : 'determined'), look: [0, 0], r: V(320, 340), veilA: 0.5, mood: 'void',
  set: (g, t, cam) => { const M = mood('void'); backdrop(g, M.sky); headGrid(g, t, { M, cols: 7, rows: 4, a: 0.25 }); },
  after: (g, t, info, { cx, cy, r }) => {
    const k = clamp(spring(t - 0.45, 0, { freq: 2.6, damp: 0.5 }));
    ring(g, cx, cy, r * (1.05 + 0.55 * k), 5 * (1 - k * 0.4), alpha(GOLD, 0.75 * k));
    for (let i = 0; i < 10; i++) { const a = t * 0.9 + i * 0.63, d = r * (1.5 + 0.25 * Math.sin(t * 2 + i)); glyph(g, cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.8, { state: i % 3 === 0 ? 'lie' : 'truth', s: r * 0.075, a: 0.6 * k, k: clamp(spring(t - 0.5 - i * 0.05, 0, { freq: 2 })), seed: 300 + i }); }
}}));

// s021 — there is one rule
registerShot('s021', bpShot({
  draw(g, t, info, ui) {
    const cx = E.W / 2, cy = E.H * 0.46, R = V(210, 190), p = ease.inOut(prog(t, 0.1, 1.2));
    g.save(); g.translate(cx, cy); g.rotate(-Math.PI / 2);
    g.strokeStyle = alpha(GOLD, 0.9 * p); g.lineWidth = 7; g.lineCap = 'round';
    g.beginPath(); g.arc(0, 0, R, 0, Math.PI * 2 * p); g.stroke(); g.restore();
    const k = clamp(spring(t - 0.9, 0, { freq: 2.2 }));
    const sc = lerp(0.8, 1, k); g.save(); g.translate(cx, cy); g.scale(sc, sc);
    text(g, 'ՄԵԿ', 0, -V(56, 50), { size: V(96, 84), color: GOLD_HI, font: FONTS.title, weight: 700, glow: 26, glowColor: alpha(GOLD, 0.6), alpha: k, spacing: 2 });
    text(g, 'ԿԱՆՈՆ', 0, V(52, 46), { size: V(96, 84), color: '#ffffff', font: FONTS.title, weight: 700, glow: 26, glowColor: alpha(GOLD, 0.5), alpha: k, spacing: 6 });
    g.restore();
    // rotating tick marks
    for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283 + t * 0.15, r0 = R + 24, r1 = R + (i % 6 === 0 ? 46 : 32); seg(g, [[cx + Math.cos(a) * r0, cy + Math.sin(a) * r0], [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1]], i % 6 === 0 ? 4 : 2, alpha(ui.blueprint, 0.35)); }
}}));

// s022 — you can only reveal what they believe or hide
registerShot('s022', bpShot({
  draw(g, t, info, ui) {
    const cx = E.W * 0.5, cy = E.H * 0.52, dw = V(280, 240), dh = V(430, 380), gap = V(90, 60);
    const doors = [[cx - dw - gap / 2, 'ՀԱՎԱՏՈՒՄ Է', GOLD, 0.4], [cx + gap / 2, 'ԹԱՔՑՆՈՒՄ Է', GOLD, 1.0], [cx + dw + gap * 1.5, 'ԱՊԱԳԱՆ', '#5a6a8a', 99]];
    doors.forEach(([x, lb, col, t0], i) => {
      const open = i === 2 ? 0 : ease.out(prog(t, 1.0 + i * 0.35, 1.8 + i * 0.35));
      const y = cy - dh / 2;
      g.fillStyle = alpha(ui.bpBg, 0.9); g.fillRect(x, y, dw, dh);
      g.strokeStyle = alpha(ui.blueprint, 0.65); g.lineWidth = 4; g.strokeRect(x, y, dw, dh);
      if (open > 0) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, x + dw / 2, cy, dw * 0.9, col, 0.34 * open); g.fillStyle = alpha(col, 0.12 * open); g.fillRect(x, y, dw, dh); g.restore(); }
      // door leaf
      g.save(); g.translate(x, y); g.scale(1 - open * 0.8, 1); g.fillStyle = alpha(ui.blueprint, 0.14); g.fillRect(6, 6, dw - 12, dh - 12); g.strokeStyle = alpha(ui.blueprint, 0.8); g.lineWidth = 3; g.strokeRect(6, 6, dw - 12, dh - 12); circle(g, dw - 34, dh / 2, 9, alpha(ui.cream, 0.8)); g.restore();
      if (i === 2) { // locked: chain + padlock
        const k = clamp(spring(t - 2.2, 0, { freq: 2.4 }));
        g.save(); g.globalAlpha = k; g.strokeStyle = LIE; g.lineWidth = 5;
        for (let c = 0; c < 3; c++) { g.beginPath(); g.ellipse(x + dw / 2, cy - 60 + c * 60, dw * 0.34, 22, 0.12, 0, 7); g.stroke(); }
        rr(g, x + dw / 2 - 34, cy + dh * 0.22, 68, 54, 8); g.fillStyle = LIE; g.fill();
        g.beginPath(); g.arc(x + dw / 2, cy + dh * 0.22, 26, Math.PI, 0); g.lineWidth = 8; g.strokeStyle = LIE; g.stroke(); g.restore();
      }
      lab(g, x + dw / 2, y + dh + V(52, 44), lb, { size: V(30, 26), color: alpha(i === 2 ? '#8a93b0' : ui.cream, 0.95), a: clamp((t - 0.4 - i * 0.2) / 0.4), spacing: 2 });
    });
    lab(g, cx + dw / 2 + gap / 2, cy - dh / 2 - V(54, 46), 'ՄԻԱՅՆ ԱՅՍ ԵՐԿՈՒՍԸ', { size: V(32, 28), color: alpha(GOLD, 0.85), a: clamp((t - 2.4) / 0.5), spacing: 3 });
}}));

// s023 — you cannot know the future
registerShot('s023', bpShot({
  draw(g, t, info, ui) {
    const cx = E.W / 2, cy = E.H * 0.5;
    // calendar pages flying past, all blank
    for (let i = 0; i < 9; i++) {
      const ph = ((t * 0.55 + i / 9) % 1), a = Math.sin(ph * Math.PI);
      const x = cx + Math.cos(ph * 6.283 + i) * (E.W * 0.18 + ph * E.W * 0.3), y = cy - 260 + ph * 520;
      g.save(); g.globalAlpha = a * 0.55; g.translate(x, y); g.rotate(ph * 2 + i);
      g.fillStyle = alpha(ui.blueprint, 0.10); g.fillRect(-70, -92, 140, 184); g.strokeStyle = alpha(ui.blueprint, 0.6); g.lineWidth = 2; g.strokeRect(-70, -92, 140, 184);
      g.fillStyle = alpha(ui.blueprint, 0.4); g.fillRect(-70, -92, 140, 34);
      for (let r2 = 0; r2 < 4; r2++) for (let c = 0; c < 4; c++) g.strokeRect(-56 + c * 30, -44 + r2 * 32, 22, 22);
      g.restore();
    }
    const k = clamp(spring(t - 0.5, 0, { freq: 2.2 }));
    text(g, '?', cx, cy + 10, { size: V(220, 180), color: alpha(ui.blueprint, 0.5 * k), font: FONTS.title, weight: 700 });
    lab(g, cx, E.H * 0.86, 'ԱՊԱԳԱՆ — ՓԱԿ Է', { size: V(30, 28), color: alpha(LIE, 0.85 * clamp((t - 1.2) / 0.5)), spacing: 4 });
}}));

// s024 — you cannot read minds
registerShot('s024', bpShot({
  draw(g, t, info, ui) {
    const cx = E.W / 2, cy = E.H * 0.46, r = V(170, 150);
    headProfile(g, cx, cy, r, alpha(ui.blueprint, 0.9));
    const k = clamp(spring(t - 0.7, 0, { freq: 2.2 }));
    for (let i = 0; i < 5; i++) {
      const x = cx + r * (1.5 + (i % 2) * 0.5), y = cy - r * 0.8 + i * r * 0.42;
      g.save(); g.globalAlpha = k; g.translate(x, y); g.rotate((i - 2) * 0.05);
      rr(g, -34, -26, 68, 52, 6); g.fillStyle = alpha(ui.bpBg, 0.95); g.fill(); g.strokeStyle = alpha(ui.blueprint, 0.75); g.lineWidth = 3; g.stroke();
      text(g, i === 2 ? '?' : '…', 0, 2, { size: 30, color: alpha(ui.cream, 0.7), font: FONTS.ui, weight: 900 });
      g.restore();
      dashLine(g, [[cx + r * 1.35, cy - r * 0.1], [x - 40, y]], k, alpha(ui.blueprint, 0.35));
    }
    // seal over the head
    const k2 = clamp(spring(t - 1.6, 0, { freq: 2.6 }));
    g.save(); g.globalAlpha = k2; g.strokeStyle = LIE; g.lineWidth = 6;
    g.beginPath(); g.arc(cx + r * 0.3, cy, r * 1.35, 0, 7); g.stroke();
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; seg(g, [[cx + r * 0.3 + Math.cos(a) * r * 1.2, cy + Math.sin(a) * r * 1.2], [cx + r * 0.3 + Math.cos(a) * r * 1.5, cy + Math.sin(a) * r * 1.5]], 5, LIE); }
    g.restore();
    lab(g, cx, E.H * 0.86, 'ՄՏՔԵՐԸ ՓԱԿ ԵՆ', { size: V(30, 28), color: alpha(LIE, 0.85 * clamp((t - 1.9) / 0.5)), spacing: 4 });
}}));

// s025 — you cannot force the truth
registerShot('s025', bpShot({
  draw(g, t, info, ui) {
    const cx = E.W / 2, cy = E.H * 0.46;
    // mouth, zipped
    g.save(); g.strokeStyle = alpha(ui.cream, 0.85); g.lineWidth = 5;
    g.beginPath(); g.moveTo(cx - 210, cy); g.quadraticCurveTo(cx, cy + 110, cx + 210, cy); g.stroke();
    g.beginPath(); g.moveTo(cx - 210, cy); g.quadraticCurveTo(cx, cy - 70, cx + 210, cy); g.stroke();
    const n = 11, p = ease.inOut(prog(t, 0.3, 1.6));
    for (let i = 0; i < n * p; i++) { const u = i / (n - 1), x = lerp(cx - 196, cx + 196, u), y = cy + 20 * Math.sin(u * Math.PI); seg(g, [[x, y - 16], [x, y + 16]], 4, alpha(ui.cream, 0.75)); }
    g.restore();
    // grey glyph stays hidden
    const k = clamp(spring(t - 1.4, 0, { freq: 2.2 }));
    glyph(g, cx, cy - V(230, 200), { state: 'hidden', s: V(52, 46), k, a: 0.5 });
    lab(g, cx, E.H * 0.86, 'ԲԱՌԵՐԸ ՉԵՍ ԿԱՐՈՂ ՍՏԻՊԵԼ', { size: V(26, 24), color: alpha(ui.cream, 0.7 * clamp((t - 1.8) / 0.5)), spacing: 3 });
}}));

// s026 — you simply never get lied to
registerShot('s026', wideShot({ set: (g, t, cam) => { const M = mood('void'); backdrop(g, M.sky); return { M }; },
  cam: (t, info) => camPush(t, info, 1.06, 1.02, 10, -6, 4),
  figures: [{ x: E.W * 0.5, y: E.H * 0.9, s: V(1.9, 1.8), facing: 1, outfit: YOU, pose: POSES.stand, expr: 'determined' }],
  after: (g, t, info, S2, M) => {
    const cx = E.W * 0.5, fy = E.H * 0.9;
    const k = clamp(spring(t - 0.3, 0, { freq: 1.8 }));
    g.save(); g.globalCompositeOperation = 'lighter';
    g.strokeStyle = alpha(GOLD, 0.55 * k); g.lineWidth = 4; g.beginPath(); g.ellipse(cx, fy + 4, 300 * k, 62 * k, 0, 0, 7); g.stroke();
    g.restore();
    for (let i = 0; i < 14; i++) { const a = t * 0.7 + i * 0.45, d = 300 + 40 * Math.sin(t + i); glyph(g, cx + Math.cos(a) * d, fy - 300 + Math.sin(a) * d * 0.55, { state: i % 4 === 0 ? 'lie' : 'truth', s: 20, a: 0.55 * k, k, seed: 400 + i }); }
    wordPop(g, t, 'ԵՐԲԵՔ ՉԵՍ ԽԱԲՎՈՒՄ', cx, E.H * 0.16, { t0: 1.2, size: V(58, 52), color: GOLD_HI, glowA: 22, spacing: 6 });
}}));

// s027 — so what if nobody can lie to you?
registerShot('s027', { draw(g, t, info) {
  const M = mood('void');
  backdrop(g, M.sky);
  const cols = 7, rows = 5;
  const R = E.W * 0.040, gapX = E.W * 0.135, gapY = E.H * 0.175;
  const x0 = E.W / 2 - gapX * (cols - 1) / 2, y0 = E.H * 0.16;
  for (let r2 = 0; r2 < rows; r2++) for (let c = 0; c < cols; c++) {
    const x = x0 + c * gapX, y = y0 + r2 * gapY;
    const k = clamp(spring(t - (r2 * 0.5 + c) * 0.03, 0, { freq: 2 })); if (k <= 0) continue;
    const turn = clamp(spring(t - 1.15 - c * 0.07 + r2 * 0.05, 0, { freq: 2.2 }));
    const col = alpha(mix('#3f4a6a', '#e8d9a8', turn), 0.55 + 0.42 * turn);
    g.save(); g.globalAlpha = clamp(0.55 + 0.45 * turn) * clamp(k);
    // shoulders
    g.strokeStyle = col; g.lineWidth = Math.max(3, R * 0.11); g.lineCap = 'round';
    g.beginPath(); g.arc(x, y + R * 2.35, R * 1.25, -Math.PI * 0.78, -Math.PI * 0.22); g.stroke();
    if (turn < 0.55) headProfile(g, x + R * 0.12, y, R, col, 1);
    else {
      // a face: two eyes, a nose, a mouth line (no smiley)
      g.strokeStyle = col; g.lineWidth = Math.max(3, R * 0.14); g.lineCap = 'round';
      seg(g, [[x - R * 0.42, y - R * 0.2], [x - R * 0.18, y - R * 0.2]], Math.max(3, R * 0.16), col);
      seg(g, [[x + R * 0.18, y - R * 0.2], [x + R * 0.42, y - R * 0.2]], Math.max(3, R * 0.16), col);
      seg(g, [[x, y - R * 0.1], [x, y + R * 0.22]], Math.max(3, R * 0.11), col);
      seg(g, [[x - R * 0.3, y + R * 0.5], [x + R * 0.3, y + R * 0.5]], Math.max(3, R * 0.13), col);
    }
    g.restore();
  }
  veil(g, '#000814', 0.28);
  const k = clamp(spring(t - 1.9, 0, { freq: 2 }));
  // a dark plate so the type reads over the crowd
  g.save(); g.globalAlpha = k;
  const pg = linGrad(g, 0, E.H * 0.36, 0, E.H * 0.66, [alpha('#050a16', 0), alpha('#050a16', 0.92), alpha('#050a16', 0.92), alpha('#050a16', 0)]);
  g.fillStyle = pg; g.fillRect(0, E.H * 0.36, E.W, E.H * 0.3);
  g.restore();
  g.save(); g.globalAlpha = k;
  text(g, 'ԻՍԿ Ի՞ՆՉ ԿԼԻՆԻ', E.W / 2, E.H * 0.47, { size: V(86, 74), color: '#ffffff', font: FONTS.title, weight: 700, glow: 30, glowColor: alpha(GOLD, 0.55), spacing: 3 });
  text(g, 'ԵԹԵ ՈՉ ՈՔ ՉԽԱԲԻ', E.W / 2, E.H * 0.585, { size: V(60, 52), color: GOLD, font: FONTS.title, weight: 700, glow: 24, glowColor: alpha(GOLD, 0.5), spacing: 8 });
  g.restore();
  FX.dust(g, t, { count: 60, color: '#cfe0ff', a: 0.22 });
}});
