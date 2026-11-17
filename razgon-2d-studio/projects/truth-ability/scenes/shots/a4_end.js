// a4_end.js — s159–s195: home, the hug, the "what if" montage, the science, and the comment CTA.
import { E, V, mood, clamp, lerp, ease, prog, rng, alpha, shade, mix, seg, circle, ring, poly, rr, linGrad, radGrad, glow, text, layer, backdrop, FONTS, registerShot, talkAmount } from '/engine/core.js';
import { POSES, posesAt, breathe, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as SET from '../sets/room.js';
import { YOU, MOM, LEO, MIA, BRO, BLACK, SELL, CROWD } from '../cast.js';
import { glyph, talkGlyph, goldThread, sparkBurst, cracks, frozenAir, wordPop, fig, blink, GOLD, GOLD_HI, LIE, LIE_HI, CYAN } from '../fx_truth.js';
import { camAdd, camPath, drift, spring } from '/engine/motion.js';
import { faceShot, insertShot, wideShot, fgProp } from '../lib.js';
import { pair, solo, panel, statement, grid, nameCard } from '../beat.js';

const nightIn = (g, t, cam) => SET.bedroom(g, t, cam, { mood: 'interiorCool' });
const kitchen = (g, t, cam) => SET.kitchenRoom(g, t, cam, { mood: 'interiorWarm' });
const hall = (g, t, cam) => SET.hangout(g, t, cam, { mood: 'dusk' });

// s159 — evening, you come home, mom is still awake
registerShot('s159', solo({ set: nightIn, mood: 'interiorCool', z0: 1.04, z1: 1.12, x0: 0, x1: -18, s: V(1.5, 1.55), dustColor: '#cfe6ff', dustCount: 30,
  f: { x: 0.5, who: YOU, pose: (t) => posesAt(t, [[0, POSES.relaxed], [1.2, POSES.stand]], 0.6), expr: 'sad' },
  overlay: (g, t) => { wordPop(g, t, 'ՈՒՇ', E.W / 2, E.H * 0.13, { t0: 0.4, size: V(40, 35), color: alpha('#cfe0ff', 0.85), spacing: 8 }); } }));

// s160 — she knocks: one, two, three
registerShot('s160', { draw(g, t, info) {
  const M = mood('interiorWarm'); backdrop(g, [shade(M.wall, -0.55), shade(M.dark, -0.3)]);
  const cx = E.W * 0.48, cy = E.H * 0.5, dw = V(520, 450), dh = V(860, 760);
  // a door from the inside, warm light at the seams
  g.fillStyle = shade(M.wall, -0.18); g.fillRect(cx - dw / 2, cy - dh / 2, dw, dh);
  g.strokeStyle = alpha(M.practical, 0.5); g.lineWidth = 7; g.strokeRect(cx - dw / 2, cy - dh / 2, dw, dh);
  g.fillStyle = alpha(GOLD, 0.65); g.fillRect(cx - dw / 2, cy + dh / 2 - 5, dw, 7);
  g.fillRect(cx - dw / 2, cy - dh / 2, 5, dh);
  glow(g, cx, cy + dh / 2, V(560, 480), GOLD, 0.24);
  circle(g, cx + dw * 0.36, cy, 18, alpha('#c8b49a', 0.9));
  // three knocks, three pulses
  for (let i = 0; i < 3; i++) {
    const ph = clamp((t - 0.35 - i * 0.5) / 1.1); if (ph <= 0 || ph >= 1) continue;
    ring(g, cx + dw * 0.1, cy - dh * 0.04, V(40, 36) + ph * V(220, 190), 5 * (1 - ph), alpha(GOLD, 0.55 * (1 - ph)));
  }
  // a small hand knocking
  const k = clamp(spring(t - 0.25, 0, { freq: 2.4 }));
  if (k > 0) { g.save(); g.globalAlpha = 0.9 * k; g.translate(cx + dw * 0.1, cy - dh * 0.04); g.translate((1 - k) * V(50, 44), 0); circle(g, 0, 0, V(34, 30), alpha('#2a1a20', 0.9)); g.restore(); }
  text(g, 'ՄԵԿ • ԵՐԿՈՒ • ԵՐԵՔ', cx, E.H * 0.868, { size: V(38, 33), color: alpha('#ffe9c8', 0.92), font: FONTS.ui, weight: 900, spacing: 8, alpha: clamp((t - 1.3) / 0.5) });
} });

// s161 — you open it
registerShot('s161', { draw(g, t, info) {
  const M = mood('interiorWarm'); backdrop(g, [shade(M.wall, -0.5), shade(M.dark, -0.26)]);
  const cx = E.W * 0.5, cy = E.H * 0.5, dw = V(560, 490), dh = V(880, 780);
  // door swings open: light floods out
  const p = ease.inOut(prog(t, 0.15, 1.3));
  g.fillStyle = alpha(GOLD, 0.10 + 0.3 * p); g.fillRect(cx - dw / 2, cy - dh / 2, dw, dh);
  g.save(); g.translate(cx - dw / 2, cy);
  g.transform(1, 0, -0.55 * (1 - p), 1, 0, 0);
  g.fillStyle = shade(M.wall, -0.3); g.fillRect(0, -dh / 2, dw, dh);
  g.strokeStyle = alpha(M.practical, 0.45); g.lineWidth = 6; g.strokeRect(0, -dh / 2, dw, dh);
  g.restore();
  glow(g, cx, cy, V(780, 660), GOLD, 0.18 + 0.22 * p);
  // mom's silhouette in the doorway
  const k = clamp(spring(t - 0.5, 0, { freq: 2 }));
  if (k > 0) { g.save(); g.globalAlpha = 0.9 * k; fig(g, { x: cx + V(30, 26), y: cy + dh / 2 - 10, s: V(1.5, 1.45) * lerp(0.94, 1, k), facing: -1, outfit: MOM, pose: POSES.stand, expr: 'smile', rim: { color: GOLD, dir: [0, -1], w: 5 }, shadow: false }); g.restore(); }
  FX.dust(g, t, { count: 34, color: '#ffe2bd', a: 0.28 });
} });

// s162 — "is everything okay?"
registerShot('s162', { draw(g, t, info) {
  const cam = camAdd(camPath(t, [[0, { z: 1.3, x: 20 }], [info.dur, { z: 1.4, x: -10 }]], { endEase: 0.3 }), drift(t, 2.2, 21));
  SET.kitchenRoom(g, t, { z: 1, x: 0 }, { mood: 'interiorWarm' });
  const M = mood('interiorWarm'), gy = SET.GY(), s = V(1.55, 1.6);
  layer(g, cam, 1, (g) => {
    fig(g, { x: E.W * 0.38, y: gy, s: s * 0.95, facing: 1, outfit: MOM, pose: breathe(posesAt(t, [[0, POSES.stand], [0.9, POSES.reach]], 0.6), t, 1, 2), expr: (tt) => tt > 0.8 ? 'worried' : 'smile', talk: talkAmount(info.globalT), rim: { color: M.rim, dir: [0.4, -1], w: 4.8 }, blink: blink(t, 2) });
    fig(g, { x: E.W * 0.66, y: gy, s: s, facing: -1, outfit: YOU, pose: breathe(POSES.stand, t, 0.7, 1), expr: 'sad', rim: { color: M.rim, dir: [-0.4, -1], w: 4.6 } });
    const hp = headPos({ x: E.W * 0.38, y: gy, s: s * 0.95, facing: 1, pose: POSES.stand });
    talkGlyph(g, t, hp[0] + 8, hp[1] - hp[2] * 2.1, { t0: 0.4, s: V(36, 33), seed: 162 });
  });
} });

// s163 — "not really"
registerShot('s163', { draw(g, t, info) {
  const cam = camAdd(camPath(t, [[0, { z: 1.36, x: -10 }], [info.dur, { z: 1.46, x: 12 }]], { endEase: 0.3 }), drift(t, 2, 22));
  SET.kitchenRoom(g, t, { z: 1, x: 0 }, { mood: 'interiorWarm' });
  const M = mood('interiorWarm'), gy = SET.GY(), s = V(1.55, 1.6);
  layer(g, cam, 1, (g) => {
    fig(g, { x: E.W * 0.34, y: gy, s: s * 0.95, facing: 1, outfit: MOM, pose: POSES.stand, expr: 'worried', rim: { color: M.rim, dir: [0.4, -1], w: 4.6 } });
    fig(g, { x: E.W * 0.62, y: gy, s: s, facing: -1, outfit: YOU, pose: breathe(posesAt(t, [[0, POSES.stand], [0.6, POSES.sad]], 0.7), t, 0.8, 1), expr: 'sad', talk: talkAmount(info.globalT), rim: { color: M.rim, dir: [-0.4, -1], w: 4.8 }, blink: blink(t, 1) });
    const hp = headPos({ x: E.W * 0.62, y: gy, s, facing: -1, pose: POSES.sad });
    talkGlyph(g, t, hp[0] - 8, hp[1] - hp[2] * 2.1, { t0: 0.35, state: 'truth', s: V(42, 38), seed: 163 });
  });
} });

// s164 — she hugs you
registerShot('s164', { draw(g, t, info) {
  const cam = camAdd(camPath(t, [[0, { z: 1.3, x: 0, y: 20 }], [info.dur, { z: 1.42, x: 0, y: 40 }]], { endEase: 0.35 }), drift(t, 1.6, 23));
  SET.hangout(g, t, { z: 1, x: 0 }, { mood: 'dusk' });
  const gy = SET.GY(), M = mood('dusk'), s = V(1.5, 1.55);
  const p = ease.inOut(prog(t, 0.25, 1.4));
  layer(g, cam, 1, (g) => {
    const mx = lerp(E.W * 0.36, E.W * 0.45, p), yx = lerp(E.W * 0.66, E.W * 0.55, p);
    fig(g, { x: mx, y: gy, s: s * 0.95, facing: 1, outfit: MOM, pose: { ...POSES.stand, eF: [lerp(20, 40, p), lerp(-140, -160, p)], hF: [lerp(40, 96, p), lerp(-150, -196, p)], eB: [-10, -138], hB: [lerp(-6, 30, p), lerp(-140, -186, p)] }, expr: 'sad', rim: { color: M.rim, dir: [0.4, -1], w: 5 } });
    fig(g, { x: yx, y: gy, s, facing: -1, outfit: YOU, pose: { ...POSES.stand, eF: [lerp(20, 36, p), lerp(-140, -158, p)], hF: [lerp(46, 92, p), lerp(-152, -190, p)], eB: [lerp(-8, 24, p), lerp(-140, -182, p)], hB: [lerp(-12, 34, p), lerp(-144, -178, p)] }, expr: (tt) => tt > 1.2 ? 'sad' : 'neutral', rim: { color: M.rim, dir: [-0.4, -1], w: 5 } });
    // warm light around the two
    g.save(); g.globalCompositeOperation = 'lighter'; glow(g, E.W * 0.5, gy - V(300, 270), V(760, 640), '#ffb070', 0.10 + 0.12 * p); g.restore();
    // a gold thread loops around them
    goldThread(g, t, [[mx, gy - V(420, 380)], [E.W * 0.5, gy - V(500, 450)], [yx, gy - V(420, 380)]], { p: ease.inOut(prog(t, 0.9, 2.0)), w: 3.2, a: 0.85 });
  });
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.3 });
} });

// s165 — and you understand something important
registerShot('s165', statement({ lines: ['ԵՎ ԴՈՒ ՀԱՍԿԱՆՈՒՄ ԵՍ', 'ՄԻ ԿԱՐԵՎՈՐ ԲԱՆ'], hi: 1, size: V(58, 50), y: 0.5, color: GOLD_HI,
  behind: (g, t) => { const k = clamp(spring(t - 0.3, 0, { freq: 1.8 })); g.save(); g.globalAlpha = 0.5 * k; glow(g, E.W / 2, E.H * 0.52, V(620, 520), GOLD, 0.14); g.restore(); } }));

// s166 — you don't need the whole world to be honest
registerShot('s166', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.42), shade(M.sky[1], -0.52)]);
  const cx = E.W / 2, cy = E.H * 0.5;
  // a globe of tiny voices, all muted
  const r = rng(166);
  // a faint globe of the world, holding all those voices
  ring(g, cx, cy, V(330, 288), 2, alpha('#7f9dd0', 0.16));
  ring(g, cx, cy, V(330, 288), 2, alpha('#7f9dd0', 0.12));
  g.save(); g.globalAlpha = 0.18; g.strokeStyle = alpha('#8fb8e8', 0.5); g.lineWidth = 2;
  for (let k2 = -1; k2 <= 1; k2++) { g.beginPath(); g.ellipse(cx, cy, V(330, 288) * Math.sqrt(1 - k2 * k2 * 0.5), V(330, 288) * 0.22, 0, 0, Math.PI * 2); g.stroke(); }
  g.restore();
  for (let i = 0; i < 26; i++) {
    const a = i * 2.39, rad = V(180, 156) + (i % 4) * V(90, 78);
    const x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad * 0.66;
    const k = clamp(spring(t - 0.1 - i * 0.03, 0, { freq: 2.2 }));
    if (k <= 0.01) continue;
    g.save(); g.globalAlpha = 0.78 * k;
    glyph(g, x, y, { state: i % 5 === 0 ? 'truth' : 'hidden', s: V(24, 21), k, a: 1, seed: 166 + i });
    g.restore();
  }
  text(g, 'ՊԵՏՔ ՉԷ, ՈՐ ԱՄԲՈՂՋ ԱՇԽԱՐՀԸ', cx, E.H * 0.2, { size: V(46, 40), color: alpha('#dfe8ff', 0.94), font: FONTS.title, weight: 700, spacing: 3, alpha: clamp((t - 0.7) / 0.5) });
  text(g, 'ՄԻՇՏ ՃՇՄԱՐՏՈՒԹՅՈՒՆ ԱՍԻ', cx, E.H * 0.28, { size: V(46, 40), color: alpha(GOLD_HI, 0.94), font: FONTS.title, weight: 700, spacing: 3, alpha: clamp((t - 1.0) / 0.5) });
} });

// s167 — you need people you can be honest with
registerShot('s167', { draw(g, t, info) {
  const cam = camAdd(camPath(t, [[0, { z: 1.16, x: 0 }], [info.dur, { z: 1.26, x: -14 }]], { endEase: 0.3 }), drift(t, 2.4, 24));
  const S2 = SET.hangout(g, t, cam, { mood: 'dusk' }); const se = S2.seats, M = S2.M, gy = SET.GY(), sc = V(1.56, 1.6);
  layer(g, cam, 1, (g) => {
    // you in the middle, friends either side, one empty seat kept free
    fig(g, { x: se.x[1], y: gy, s: sc, facing: -1, outfit: LEO, pose: breathe(POSES.sitBack, t, 1, 2), expr: 'smile', rim: { color: M.rim, dir: [-0.4, -1], w: 4.4 }, shadow: false });
    fig(g, { x: se.x[2], y: gy, s: sc, facing: 1, outfit: MIA, pose: breathe(POSES.sit, t, 1, 3), expr: 'smile', rim: { color: M.rim, dir: [0.4, -1], w: 4.4 }, shadow: false });
    fig(g, { x: E.W * 0.5, y: gy + V(90, 80), s: sc * 1.06, facing: 1, outfit: YOU, pose: breathe(POSES.sit, t, 0.8, 1), expr: 'smile', rim: { color: M.rim, dir: [0.4, -1], w: 4.8 }, shadow: false });
    goldThread(g, t, [[se.x[1], gy - V(300, 270)], [E.W * 0.5, gy - V(360, 324)], [se.x[2], gy - V(300, 270)]], { p: ease.inOut(prog(t, 0.7, 1.9)), w: 3, a: 0.8 });
  });
  fgProp(g, cam, { kind: 'cup', x: 0.9, y: 1.06, s: 1.2 });
} });

// s168 — you could have used it to get rich
registerShot('s168', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade('#2a1a12', -0.2), shade('#140c08', -0.1)]);
  const cx = E.W / 2, cy = E.H * 0.5;
  const p = ease.out(prog(t, 0.2, 1.8));
  // a pyramid of gold bars
  for (let row = 0; row < 4; row++) {
    const n = 4 - row;
    for (let i = 0; i < n; i++) {
      const k = clamp(spring(t - 0.1 - (row * 4 + i) * 0.06, 0, { freq: 2.4 })); if (k <= 0.01) continue;
      const bw = V(190, 165), bh = V(64, 56);
      const x = cx + (i - (n - 1) / 2) * (bw + 10), y = cy + (3 - row) * bh * 0.86 - bh;
      g.save(); g.globalAlpha = k;
      poly(g, [[x - bw / 2, y], [x + bw / 2, y], [x + bw / 2 - 14, y + bh], [x - bw / 2 + 14, y + bh]], linGrad(g, 0, y, 0, y + bh, [alpha('#ffe9a8', 0.95), alpha('#c99a2a', 0.95)]));
      g.restore();
    }
  }
  glow(g, cx, cy + V(120, 104), V(560, 480), GOLD, 0.22 * p);
  text(g, 'ԿԱՐՈՂ ԷԻՐ ՀԱՐՍՏԱՆԱԼ', E.W / 2, E.H * 0.15, { size: V(48, 42), color: alpha('#ffe9c8', 0.9), font: FONTS.title, weight: 700, spacing: 5, alpha: clamp((t - 0.8) / 0.5) });
} });

// s169 — reveal everyone's secrets
registerShot('s169', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.46), shade(M.sky[1], -0.56)]);
  const cx = E.W / 2, cy = E.H * 0.5;
  // envelopes opening, one after another, spilling out into the dark
  const r = rng(169);
  for (let i = 0; i < 12; i++) {
    const k = clamp(spring(t - 0.08 - i * 0.1, 0, { freq: 2.3 })); if (k <= 0.01) continue;
    const x = E.W * (0.1 + (i % 6) * 0.16) + (r() - 0.5) * 40, y = E.H * (0.32 + Math.floor(i / 6) * 0.34);
    g.save(); g.globalAlpha = 0.9 * k; g.translate(x, y); g.rotate((r() - 0.5) * 0.3); g.scale(lerp(0.8, 1, k), lerp(0.8, 1, k));
    g.fillStyle = '#e8e4dc'; g.fillRect(-V(96, 84), -V(64, 56), V(192, 168), V(128, 112));
    poly(g, [[-V(96, 84), -V(64, 56)], [0, V(10, 8)], [V(96, 84), -V(64, 56)]], alpha('#c8c2b8', 0.9));
    // a red seal, "opened"
    circle(g, 0, V(10, 8), V(22, 19), alpha(LIE, 0.75));
    g.restore();
  }
  text(g, 'ԲԱՑԱՀԱՅՏԵԼ ԲՈԼՈՐԻ ԳԱՂՏՆԻՔՆԵՐԸ', E.W / 2, E.H * 0.86, { size: V(44, 38), color: alpha(LIE_HI, 0.92), font: FONTS.title, weight: 700, spacing: 3, alpha: clamp((t - 1.0) / 0.5) });
} });

// s170 — make the world listen
registerShot('s170', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.42), shade(M.sky[1], -0.52)]);
  const cx = E.W / 2, cy = E.H * 0.52;
  // a crowd, all heads turned to one point of light
  const r = rng(170);
  for (let i = 0; i < 24; i++) {
    const row = Math.floor(i / 8), x = E.W * (0.14 + (i % 8) * 0.1) + (r() - 0.5) * 30, y = E.H * (0.9 - row * 0.06);
    fig(g, { x, y, s: V(0.62, 0.6) + row * V(0.1, 0.1), facing: x < cx ? 1 : -1, outfit: { top: 'none' }, pose: POSES.stand, expr: 'neutral', rim: false, shadow: false, blink: 0, alpha: 0.6 - row * 0.12, dim: true });
  }
  const k = clamp(spring(t - 0.3, 0, { freq: 2 }));
  glow(g, cx, cy - V(60, 52), V(480, 420), GOLD, 0.30 * k);
  fig(g, { x: cx, y: cy + V(40, 34), s: V(1.2, 1.16) * k, facing: 1, outfit: YOU, pose: POSES.pointUp, expr: 'neutral', rim: { color: GOLD, dir: [0, -1], w: 5 }, shadow: false });
  text(g, 'ՍՏԻՊԵԼ ԱՇԽԱՐՀԻՆ ԼՍԵԼ ՔԵԶ', E.W / 2, E.H * 0.13, { size: V(46, 40), color: alpha('#ffe9c8', 0.94), font: FONTS.title, weight: 700, spacing: 4, alpha: clamp((t - 0.7) / 0.5) });
} });

// s171 — but that wouldn't make you better
registerShot('s171', statement({ lines: ['ԲԱՅՑ ԴԱ ՔԵԶ', 'ԱՎԵԼԻ ԼԱՎ ՄԱՐԴ ՉԷՐ ԴԱՐՁՆԻ'], hi: 1, size: V(56, 48), y: 0.48, color: '#cfe0ff',
  behind: (g, t) => { const k = clamp((t - 0.4) / 1.2); if (k > 0) { g.save(); g.globalAlpha = 0.4 * (1 - k * 0.5); cracks(g, E.W / 2, E.H * 0.5, { p: k, n: 9, len: E.W * 0.3, color: '#8fb8e8', a: 0.5, seed: 171 }); g.restore(); } } }));

// s172/173 — your power isn't for control. it's to protect.
registerShot('s172', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.44), shade(M.sky[1], -0.54)]);
  const cx = E.W / 2, cy = E.H * 0.5;
  // a hand pulling strings above small figures
  const k = clamp(spring(t - 0.2, 0, { freq: 2 }));
  for (let i = 0; i < 5; i++) {
    const x = cx + (i - 2) * V(170, 148);
    fig(g, { x, y: cy + V(280, 244), s: V(0.9, 0.86), facing: 1, outfit: { top: 'none' }, pose: POSES.stand, expr: 'neutral', rim: false, shadow: false, blink: 0, alpha: 0.55 });
    g.save(); g.globalAlpha = 0.45 * k; g.strokeStyle = alpha('#8fb8e8', 0.6); g.setLineDash([6, 8]); g.lineWidth = 2; g.beginPath(); g.moveTo(x, cy - V(120, 104)); g.lineTo(x, cy + V(180, 156)); g.stroke(); g.restore();
  }
  // the hand
  g.save(); g.globalAlpha = k; g.translate(cx, cy - V(220, 190));
  circle(g, 0, 0, V(64, 56), alpha('#1a1420', 0.95));
  for (let i = 0; i < 4; i++) { const a = -1.2 + i * 0.42; seg(g, [[0, 0], [Math.cos(a) * V(90, 78), Math.sin(a) * V(90, 78)]], 12, alpha('#1a1420', 0.95)); }
  g.restore();
  // crossed out
  const kk = clamp(spring(t - 1.0, 0, { freq: 2.4 }));
  g.save(); g.globalAlpha = kk; seg(g, [[cx - V(300, 260), cy - V(300, 260)], [cx + V(300, 260), cy + V(300, 260)]], 12, alpha(LIE, 0.85)); seg(g, [[cx + V(300, 260), cy - V(300, 260)], [cx - V(300, 260), cy + V(300, 260)]], 12, alpha(LIE, 0.85)); g.restore();
  text(g, 'ՈՒԺԸ ԿԱՌԱՎԱՐԵԼՈՒ ՀԱՄԱՐ ՉԷ', E.W / 2, E.H * 0.88, { size: V(44, 38), color: alpha('#e8f0ff', 0.94), font: FONTS.title, weight: 700, spacing: 3, alpha: kk });
} });

registerShot('s173', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.42), shade(M.sky[1], -0.5)]);
  const cx = E.W / 2, cy = E.H * 0.5;
  const k = clamp(spring(t - 0.2, 0, { freq: 1.9 }));
  // a shield of gold threads around a small figure
  g.save(); g.globalAlpha = k;
  for (let i = 0; i < 3; i++) {
    const p = clamp((t - 0.35 - i * 0.2) / 1.4);
    g.beginPath();
    for (let j = 0; j <= 60 * p; j++) { const a = -Math.PI * 0.75 + (j / 60) * Math.PI * 1.5; const rad = V(300, 260) - i * V(40, 34); const x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad * 0.9; j ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.strokeStyle = alpha(GOLD, 0.5 - i * 0.1); g.lineWidth = 4 - i; g.stroke();
  }
  g.restore();
  glow(g, cx, cy, V(560, 480), GOLD, 0.16 * k);
  fig(g, { x: cx, y: cy + V(230, 200), s: V(1.5, 1.44) * lerp(0.94, 1, k), facing: 1, outfit: YOU, pose: POSES.stand, expr: 'smile', rim: { color: GOLD, dir: [0, -1], w: 5 }, shadow: false });
  text(g, 'ԱՅՆ ՆՐԱՆՑ ՊԱՇՏՊԱՆԵԼՈՒ ՀԱՄԱՐ Է', E.W / 2, E.H * 0.13, { size: V(48, 42), color: alpha(GOLD_HI, 0.96), font: FONTS.title, weight: 700, spacing: 3, alpha: clamp((t - 0.8) / 0.5) });
} });

// s174 — the first time in ages you smile without scanning
registerShot('s174', faceShot({ who: YOU, expr: (t) => (t > 0.7 ? 'happy' : 'neutral'), mood: 'dusk', set: hall, r: V(330, 350), cy: 0.55, veilA: 0.44, bgX: -60,
  after: (g, t, info, { cx, cy, r }) => {
    // the glyph drifts away instead of being read
    const k = clamp((t - 0.8) / 1.6);
    if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = 0.7 * (1 - k); glyph(g, cx + r * 1.1 + k * r * 0.5, cy - r * 0.9 - k * r * 0.3, { state: 'hidden', s: r * 0.13, k: 1 - k, a: 1 }); g.restore();
    for (let i = 0; i < 5; i++) { const ph = (t * 0.5 + i / 5) % 1; FX.sparkle(g, cx + Math.cos(i * 1.9) * r * 1.2, cy + Math.sin(i * 1.9) * r * 1.0 - ph * 40, 14 * (1 - ph), GOLD, 0.5 * (1 - ph)); }
  } }));

// s175 — trust isn't just "nobody lies to you"
registerShot('s175', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.44), shade(M.sky[1], -0.54)]);
  const cx = E.W / 2, cy = E.H * 0.5;
  // first definition, crossed out
  const k = clamp(spring(t - 0.15, 0, { freq: 2.1 }));
  g.save(); g.globalAlpha = k; g.translate(cx, cy);
  rr(g, -V(420, 364), -V(150, 130), V(840, 728), V(180, 156), 20); g.fillStyle = 'rgba(14,20,34,0.92)'; g.fill(); g.strokeStyle = alpha('#8fb8e8', 0.3); g.lineWidth = 2.5; g.stroke();
  text(g, 'ՎՍՏԱՀՈՒԹՅՈՒՆ = ՈՉ ՈՔ ՉԻ ԽԱԲՈՒՄ', 0, 2, { size: V(40, 35), color: alpha('#dfe8ff', 0.9), font: FONTS.ui, weight: 900 });
  g.restore();
  const kk = clamp(spring(t - 0.9, 0, { freq: 2.4 }));
  g.save(); g.globalAlpha = kk; seg(g, [[cx - V(400, 346), cy + V(60, 52)], [cx + V(400, 346), cy - V(60, 52)]], 9, alpha(LIE, 0.9)); g.restore();
  // second definition
  const k2 = clamp(spring(t - 1.4, 0, { freq: 2.1 }));
  g.save(); g.globalAlpha = k2; rr(g, cx - V(420, 364), cy + V(140, 121), V(840, 728), V(190, 164), 20); g.fillStyle = 'rgba(20,18,12,0.92)'; g.fill(); g.strokeStyle = alpha(GOLD, 0.5); g.lineWidth = 3; g.stroke();
  text(g, 'ՎՍՏԱՀՈՒԹՅՈՒՆ = ԸՆՏՐՈՒԹՅՈՒՆ', cx, cy + V(236, 204), { size: V(44, 38), color: GOLD_HI, font: FONTS.ui, weight: 900, glow: 18, glowColor: alpha(GOLD, 0.4) });
  g.restore();
} });

// s176 — it's choosing who you share the truth with
registerShot('s176', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.44), shade(M.sky[1], -0.54)]);
  const cx = E.W / 2, cy = E.H * 0.52;
  const r = rng(176);
  // many people around you, but one thread is chosen
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i - 4.5) * 0.32;
    const rad = V(400, 346);
    const x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad * 0.8;
    const chosen = i === 6;
    fig(g, { x, y: y + V(60, 52), s: V(0.8, 0.76), facing: Math.cos(a) < 0 ? 1 : -1, outfit: chosen ? MOM : { top: 'none' }, pose: POSES.stand, expr: chosen ? 'smile' : 'neutral', rim: false, shadow: false, blink: 0, alpha: chosen ? 0.95 : 0.4, dim: !chosen });
    if (chosen) { const k = clamp(spring(t - 0.9, 0, { freq: 2.1 })); goldThread(g, t, [[cx, cy + V(140, 121)], [x, y]], { p: k, w: 3.4, a: 0.9 }); }
  }
  fig(g, { x: cx, y: cy + V(260, 226), s: V(1.4, 1.35), facing: 1, outfit: YOU, pose: POSES.stand, expr: 'smile', rim: { color: GOLD, dir: [0, -1], w: 5 }, shadow: false });
  text(g, 'ՈՒՄ ՀԵՏ ԿԻՍՎԵՍ ՃՇՄԱՐՏՈՒԹՅԱՄԲ', E.W / 2, E.H * 0.12, { size: V(42, 37), color: alpha(GOLD_HI, 0.94), font: FONTS.title, weight: 700, spacing: 3, alpha: clamp((t - 1.2) / 0.5) });
} });

// s177 — now, a question
registerShot('s177', statement({ lines: ['ԻՍԿ ՀԻՄԱ', 'ՄԻ ՀԱՐՑ'], hi: 1, size: V(78, 68), y: 0.5, color: GOLD_HI,
  behind: (g, t) => { const k = clamp(spring(t - 0.35, 0, { freq: 1.7 })); g.save(); g.globalAlpha = 0.35 * k; text(g, '?', E.W / 2, E.H * 0.68, { size: V(300, 260), color: alpha(GOLD, 0.35), font: FONTS.title, weight: 700 }); g.restore(); } }));

// s178 — what if nobody could ever lie to you?
registerShot('s178', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.42), shade(M.sky[1], -0.52)]);
  const cx = E.W / 2, cy = E.H * 0.5;
  // a world map of glyphs, all turning gold
  const r = rng(178);
  for (let i = 0; i < 34; i++) {
    const x = E.W * (0.08 + r() * 0.84), y = E.H * (0.22 + r() * 0.56);
    const k = clamp(spring(t - 0.1 - i * 0.02, 0, { freq: 2.2 }));
    if (k <= 0.01) continue;
    g.save(); g.globalAlpha = 0.5 * k; glyph(g, x, y, { state: i % 4 === 0 ? 'lie' : 'truth', s: V(14, 12), k, a: 1, seed: 178 + i }); g.restore();
  }
  text(g, 'ԵԹԵ ՈՉ ՈՔ ՉԿԱՐՈՂԱՆԱՐ ԽԱԲԵԼ ՔԵԶ՝', cx, E.H * 0.14, { size: V(40, 35), color: alpha('#dfe8ff', 0.92), font: FONTS.title, weight: 700, spacing: 2, alpha: clamp((t - 0.6) / 0.5) });
  text(g, 'ԱՇԽԱՐՀԸ ԿԴԱՌՆԱ՞Ր ԱՎԵԼԻ ԼԱՎԸ', cx, E.H * 0.86, { size: V(46, 40), color: alpha(GOLD_HI, 0.95), font: FONTS.title, weight: 700, spacing: 2, alpha: clamp((t - 1.1) / 0.5) });
} });

// s179 — science: no proven mechanism
registerShot('s179', { draw(g, t, info) {
  const M = mood('interiorCool'); backdrop(g, [shade(M.sky[0], -0.46), shade(M.sky[1], -0.56)]);
  const cx = E.W / 2, cy = E.H * 0.5;
  // a lab microscope icon big, crossed out with a "no evidence" stamp
  const k = clamp(spring(t - 0.15, 0, { freq: 2 }));
  g.save(); g.globalAlpha = k * 0.95; g.translate(cx - V(230, 200), cy + V(40, 34)); g.scale(V(1.5, 1.42), V(1.5, 1.42));
  const COL2 = alpha('#8fe0ff', 0.92);
  rr(g, -150, 120, 300, 22, 10); g.fillStyle = alpha('#8fe0ff', 0.16); g.fill(); g.strokeStyle = COL2; g.lineWidth = 9; g.stroke();  // base
  seg(g, [[-20, 120], [-20, -20]], 14, COL2);          // arm
  seg(g, [[-20, -20], [-110, -20]], 12, COL2);         // arm top
  seg(g, [[-150, -20], [-150, 40]], 12, COL2);         // tube
  circle(g, -150, 60, 22, alpha('#8fe0ff', 0.10)); ring(g, -150, 60, 22, 7, COL2);
  rr(g, -70, -70, 100, 26, 8); g.fillStyle = alpha('#8fe0ff', 0.2); g.fill(); g.strokeStyle = COL2; g.lineWidth = 8; g.stroke(); // objective
  seg(g, [[-20, 0], [-20, -20]], 12, COL2);
  g.restore();
  glyph(g, cx - V(230, 200), cy - V(250, 216), { state: 'question', s: V(74, 66), k, a: 0.9 });
  // the claim
  rr(g, cx + V(40, 34), cy - V(120, 104), V(500, 440), V(240, 210), 16); g.fillStyle = 'rgba(12,18,30,0.9)'; g.fill(); g.strokeStyle = alpha(CYAN, 0.3); g.lineWidth = 2.5; g.stroke();
  text(g, 'ՈՉ ՄԻ', cx + V(290, 254), cy - V(60, 52), { size: V(40, 35), color: alpha('#8fb8e8', 0.9), font: FONTS.ui, weight: 900, spacing: 4 });
  text(g, 'ԱՊԱՑՈՒՑՎԱԾ ՄԵԽԱՆԻԶՄ', cx + V(290, 254), cy + V(0, 0), { size: V(38, 33), color: alpha('#e8f0ff', 0.94), font: FONTS.ui, weight: 900 });
  text(g, 'ԳԻՏՈՒԹՅՈՒՆԸ ՉԳԻՏԻ', E.W / 2, E.H * 0.88, { size: V(42, 37), color: alpha('#cfe0ff', 0.9), font: FONTS.title, weight: 700, spacing: 4, alpha: clamp((t - 0.9) / 0.5) });
} });

// s180 — people are barely better than chance
registerShot('s180', { draw(g, t, info) {
  const M = mood('interiorCool'); backdrop(g, [shade(M.sky[0], -0.44), shade(M.sky[1], -0.54)]);
  const cx = E.W / 2, cy = E.H * 0.52;
  // a 50% coin line vs a 54% bar
  const baseY = cy + V(150, 130);
  seg(g, [[cx - V(560, 480), baseY], [cx + V(560, 480), baseY]], 3, alpha('#8fb8e8', 0.35));
  // chance
  const k1 = clamp((t - 0.2) / 0.7);
  rr(g, cx - V(380, 330), baseY - V(150, 130) * k1, V(220, 190), V(150, 130) * k1, 8); g.fillStyle = alpha('#5a6a8a', 0.55); g.fill();
  text(g, '50%', cx - V(270, 234), baseY + V(60, 52), { size: V(44, 38), color: alpha('#9fb6d8', 0.9), font: FONTS.ui, weight: 900 });
  text(g, 'ՊԱՏԱՀԱԿԱՆ', cx - V(270, 234), baseY + V(110, 96), { size: V(26, 23), color: alpha('#9fb6d8', 0.7), font: FONTS.ui, weight: 900, spacing: 3 });
  // measured
  const k2 = ease.out(prog(t, 0.9, 1.9));
  const h2 = V(150, 130) * (54 / 50) * k2;
  rr(g, cx + V(160, 140), baseY - h2, V(220, 190), h2, 8); g.fillStyle = alpha(GOLD, 0.85); g.fill();
  glow(g, cx + V(270, 234), baseY - h2, V(220, 190), GOLD, 0.25);
  text(g, '54%', cx + V(270, 234), baseY + V(60, 52), { size: V(44, 38), color: GOLD_HI, font: FONTS.ui, weight: 900, glow: 16, glowColor: alpha(GOLD, 0.4) });
  text(g, 'ՓԱՍՏԱՑԻ ՄԱՐԴԻԿ', cx + V(270, 234), baseY + V(110, 96), { size: V(26, 23), color: alpha(GOLD, 0.8), font: FONTS.ui, weight: 900, spacing: 2 });
  text(g, 'ՍՏԻ ՀԱՅՏՆԱԲԵՐՈՒՄԸ', cx, E.H * 0.13, { size: V(44, 38), color: alpha('#e8f0ff', 0.94), font: FONTS.title, weight: 700, spacing: 5, alpha: clamp((t - 0.4) / 0.5) });
} });

// s181 — the polygraph doesn't detect lies
registerShot('s181', { draw(g, t, info) {
  const M = mood('interiorCool'); backdrop(g, [shade(M.sky[0], -0.46), shade(M.sky[1], -0.56)]);
  const cx = E.W / 2, cy = E.H * 0.5;
  // a polygraph trace running across
  const p = ease.out(prog(t, 0.1, 2.0));
  const y0 = cy;
  g.strokeStyle = alpha('#8fe0ff', 0.9); g.lineWidth = 5; g.lineJoin = 'round'; g.beginPath();
  const W2 = E.W * 0.9, x0 = cx - W2 / 2;
  for (let i = 0; i <= 300 * p; i++) {
    const u = i / 300, x = x0 + u * W2;
    const spike = (u > 0.3 && u < 0.33) || (u > 0.55 && u < 0.575) || (u > 0.78 && u < 0.8);
    const y = y0 - (spike ? Math.sin((u % 0.03) / 0.03 * Math.PI) * V(90, 78) : Math.sin(u * 40) * V(6, 5));
    i ? g.lineTo(x, y) : g.moveTo(x, y);
  }
  g.stroke();
  glow(g, cx, cy, V(620, 520), CYAN, 0.10 * p);
  // crossed out badge
  const k = clamp(spring(t - 1.3, 0, { freq: 2.3 }));
  g.save(); g.globalAlpha = k; rr(g, cx - V(300, 260), cy + V(200, 173), V(600, 520), V(120, 104), 14); g.fillStyle = alpha(LIE, 0.16); g.fill(); g.strokeStyle = alpha(LIE, 0.7); g.lineWidth = 3; g.stroke();
  text(g, 'ՉԻ ՀԱՅՏՆԱԲԵՐՈՒՄ ՍՈՒՏԸ', cx, cy + V(262, 226), { size: V(40, 35), color: alpha(LIE_HI, 0.95), font: FONTS.ui, weight: 900, spacing: 2 });
  g.restore();
  text(g, 'ՊՈԼԻԳՐԱՖ', E.W / 2, E.H * 0.13, { size: V(48, 42), color: alpha('#e8f4ff', 0.94), font: FONTS.title, weight: 700, spacing: 8, alpha: clamp((t - 0.3) / 0.5) });
} });

// s182 — it measures the body
registerShot('s182', { draw(g, t, info) {
  const M = mood('interiorCool'); backdrop(g, [shade(M.sky[0], -0.44), shade(M.sky[1], -0.54)]);
  const cx = E.W / 2, cy = E.H * 0.5;
  const items = [['ՍՐՏԻ ԶԱՐԿ', '♥', 0.2], ['ՇՆՉԱՌՈՒԹՅՈՒՆ', '≈', 0.55], ['ՔՐՏՆԱՐՏԱԴՐՈՒԹՅՈՒՆ', '◉', 0.9]];
  items.forEach(([label, ico, at], i) => {
    const k = clamp(spring(t - at, 0, { freq: 2.2 })); if (k <= 0.01) return;
    const x = cx + (i - 1) * V(400, 346), y = cy - V(40, 34), R = V(90, 78);
    g.save(); g.globalAlpha = k;
    circle(g, x, y, R, alpha(CYAN, 0.14)); ring(g, x, y, R, 3, alpha(CYAN, 0.4));
    const pulse = 1 + 0.08 * Math.sin((t - at) * 6 + i);
    if (i === 0) {           // heart
      const hs = R * 0.52 * pulse;
      g.fillStyle = alpha('#ff7a8a', 0.9); g.beginPath();
      g.moveTo(x, y + hs * 0.85);
      g.bezierCurveTo(x - hs * 1.5, y - hs * 0.25, x - hs * 0.55, y - hs * 1.15, x, y - hs * 0.35);
      g.bezierCurveTo(x + hs * 0.55, y - hs * 1.15, x + hs * 1.5, y - hs * 0.25, x, y + hs * 0.85);
      g.fill();
    } else if (i === 1) {    // breath wave
      g.strokeStyle = alpha('#8fe0ff', 0.95); g.lineWidth = 7; g.lineCap = 'round'; g.beginPath();
      for (let j = 0; j <= 40; j++) { const u = j / 40, xx = x - R * 0.62 + u * R * 1.24, yy = y + Math.sin(u * Math.PI * 3 + t * 2.2) * R * 0.26 * (1 - Math.abs(u - 0.5)); j ? g.lineTo(xx, yy) : g.moveTo(xx, yy); }
      g.stroke();
    } else {                 // pressure gauge needle
      ring(g, x, y, R * 0.58, 6, alpha('#8fe0ff', 0.45));
      const a2 = -Math.PI * 0.75 + (0.55 + 0.35 * Math.sin((t - at) * 3)) * Math.PI * 1.5;
      seg(g, [[x, y], [x + Math.cos(a2) * R * 0.5, y + Math.sin(a2) * R * 0.5]], 7, alpha('#8fe0ff', 0.95));
      circle(g, x, y, 7, alpha('#8fe0ff', 0.95));
    }
    text(g, label, x, cy + V(100, 88), { size: V(30, 26), color: alpha('#cfe0ff', 0.9), font: FONTS.ui, weight: 900, spacing: 2 });
    g.restore();
  });
  text(g, 'ՉԱՓՈՒՄ Է ՄԱՐՄՆԻՆԸ', E.W / 2, E.H * 0.14, { size: V(48, 42), color: alpha('#e8f4ff', 0.94), font: FONTS.title, weight: 700, spacing: 5, alpha: clamp((t - 0.3) / 0.5) });
} });

// s183 — an innocent scared person reacts the same
registerShot('s183', { draw(g, t, info) {
  const M = mood('interiorCool'); backdrop(g, [shade(M.sky[0], -0.46), shade(M.sky[1], -0.56)]);
  const cx = E.W / 2, cy = E.H * 0.52;
  // two identical traces
  const draw = (y0, col, a) => { g.strokeStyle = alpha(col, a); g.lineWidth = 5; g.beginPath(); for (let i = 0; i <= 200; i++) { const u = i / 200, x = cx - V(560, 480) + u * V(1120, 960); const sp = (u > 0.42 && u < 0.47) ? Math.sin((u - 0.42) / 0.05 * Math.PI) * V(80, 70) : Math.sin(u * 34) * V(7, 6); i ? g.lineTo(x, y0 - sp) : g.moveTo(x, y0 - sp); } g.stroke(); };
  draw(cy - V(90, 78), LIE, 0.85);
  draw(cy + V(90, 78), GOLD, 0.85);
  text(g, 'ՄԵՂԱՎՈՐԸ', cx - V(660, 566), cy - V(90, 78), { size: V(30, 26), color: alpha(LIE_HI, 0.9), font: FONTS.ui, weight: 900, align: 'left', spacing: 2 });
  text(g, 'ԱՆՄԵՂԸ', cx - V(660, 566), cy + V(90, 78), { size: V(30, 26), color: alpha(GOLD, 0.9), font: FONTS.ui, weight: 900, align: 'left', spacing: 2 });
  const k = clamp(spring(t - 1.0, 0, { freq: 2.2 }));
  g.save(); g.globalAlpha = k; text(g, 'ՆՈՒՅՆ ԱՐՁԱԳԱՆՔԸ', cx, cy + V(250, 216), { size: V(46, 40), color: alpha('#ffffff', 0.95), font: FONTS.title, weight: 700, spacing: 5 }); g.restore();
} });

// s184 — memory errors can make an honest person say the wrong thing
registerShot('s184', { draw(g, t, info) {
  const M = mood('interiorCool'); backdrop(g, [shade(M.sky[0], -0.44), shade(M.sky[1], -0.54)]);
  const cx = E.W / 2, cy = E.H * 0.5;
  // a memory path shifting as it's replayed
  const p = ease.inOut(prog(t, 0.15, 2.0));
  for (let i = 0; i < 3; i++) {
    g.strokeStyle = alpha(i === 0 ? '#8fe0ff' : i === 1 ? '#8fb8e8' : GOLD, 0.6 - i * 0.12);
    g.lineWidth = 5 - i; g.setLineDash(i ? [12, 12] : []);
    g.beginPath();
    for (let j = 0; j <= 40; j++) { const u = j / 40, x = cx - V(600, 520) + u * V(1200, 1030); const y = cy + Math.sin(u * 5 + i * 0.6) * V(80, 70) * (1 - u * 0.4) + (i === 2 ? u * V(80, 70) : 0); j ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.globalAlpha = clamp(p * 1.5 - i * 0.3); g.stroke();
  }
  g.setLineDash([]); g.globalAlpha = 1;
  fig(g, { x: cx + V(360, 310), y: cy + V(250, 214), s: V(0.92, 0.88), facing: -1, outfit: YOU, pose: POSES.stand, expr: 'neutral', rim: { color: GOLD, dir: [-0.4, -1], w: 4 }, shadow: false, blink: blink(t, 3) });
  text(g, 'ՆՈՒՅՆ ԻՐԱԴԱՐՁԸ', cx - V(600, 520), cy - V(230, 200), { size: V(26, 23), color: alpha('#8fb8e8', 0.7), font: FONTS.ui, weight: 900, align: 'left', spacing: 2 });
  text(g, 'ՆՈՐ ԻՐԱԴԱՐՁԸ', cx - V(600, 520), cy + V(220, 190), { size: V(26, 23), color: alpha(GOLD, 0.8), font: FONTS.ui, weight: 900, align: 'left', spacing: 2 });
  text(g, 'ԱՆԿԵՂԾ ՄԱՐԴԸ ԿԱՐՈՂ Է', cx, E.H * 0.16, { size: V(40, 35), color: alpha('#cfe0ff', 0.9), font: FONTS.title, weight: 700, spacing: 3, alpha: clamp((t - 0.5) / 0.5) });
  text(g, 'ՍԽԱԼ ԲԱՆ ԱՍԵԼ', cx, E.H * 0.84, { size: V(48, 42), color: alpha(GOLD_HI, 0.95), font: FONTS.title, weight: 700, spacing: 4, alpha: clamp((t - 1.0) / 0.5) });
} });

// s185 — the supernatural ability is fiction
registerShot('s185', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.44), shade(M.sky[1], -0.54)]);
  const cx = E.W / 2, cy = E.H * 0.5;
  const k = clamp(spring(t - 0.2, 0, { freq: 2 }));
  g.save(); g.globalAlpha = k;
  // a big "FICTION" stamp across a frame of the film
  rr(g, cx - V(480, 410), cy - V(280, 242), V(960, 830), V(560, 480), 18); g.fillStyle = 'rgba(14,18,30,0.9)'; g.fill(); g.strokeStyle = alpha('#cfe0ff', 0.25); g.lineWidth = 3; g.stroke();
  fig(g, { x: cx, y: cy + V(230, 200), s: V(1.7, 1.62), facing: 1, outfit: YOU, pose: POSES.stand, expr: 'neutral', rim: { color: GOLD, dir: [0, -1], w: 5 }, shadow: false });
  glyph(g, cx, cy - V(240, 208), { state: 'truth', s: V(54, 48), k, ring: clamp((t - 0.2) / 1.2) });
  g.restore();
  const kk = clamp(spring(t - 0.9, 0, { freq: 2.4 }));
  g.save(); g.globalAlpha = kk; g.translate(cx, cy + V(60, 52)); g.rotate(-0.12);
  g.strokeStyle = alpha(LIE, 0.92); g.lineWidth = 8; rr(g, -V(300, 260), -V(70, 61), V(600, 520), V(140, 122), 12); g.stroke();
  text(g, 'ՀՈՐԻՆՎԱԾՔ', 0, 2, { size: V(64, 56), color: alpha(LIE, 0.95), font: FONTS.title, weight: 700, spacing: 5 });
  g.restore();
} });

// s186 — but the problems are real
registerShot('s186', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.42), shade(M.sky[1], -0.52)]);
  const cx = E.W / 2, cy = E.H * 0.5;
  const words = [['ՎՍՏԱՀՈՒԹՅՈՒՆ', 0.2, '#8fe0ff'], ['ԳԱՂՏՆԻՔ', 0.5, '#c9a6d6'], ['ՃՇՄԱՐՏՈՒԹՅԱՆ ԳԻՆԸ', 0.8, GOLD]];
  words.forEach(([w2, at, col]) => {
    const k = clamp(spring(t - at, 0, { freq: 2.1 })); if (k <= 0.01) return;
    const y = cy + (words.findIndex(x => x[1] === at) - 1) * V(150, 130);
    g.save(); g.globalAlpha = k; g.translate(cx, y); g.scale(lerp(0.92, 1, k), lerp(0.92, 1, k));
    text(g, w2, 0, 0, { size: V(52, 45), color: alpha(col, 0.95), font: FONTS.title, weight: 700, spacing: 5, glow: 20, glowColor: alpha(col, 0.35) });
    g.restore();
  });
  text(g, 'ԻՐԱԿԱՆ ԵՆ', cx, E.H * 0.86, { size: V(50, 44), color: alpha('#f2ecff', 0.94), font: FONTS.title, weight: 700, spacing: 8, alpha: clamp((t - 1.2) / 0.5) });
} });

// s187 — do we really want to know everything?
registerShot('s187', statement({ lines: ['ԱՐԴՅՈՔ ՄԵՆՔ ԻՍԿԱՊԵՍ', 'ՈՒԶՈՒՄ ԵՆՔ ԻՄԱՆԱԼ ԱՄԵՆ ԻՆՉ'], hi: 1, size: V(56, 48), y: 0.48, color: GOLD_HI,
  behind: (g, t) => { const k = clamp(spring(t - 0.3, 0, { freq: 1.7 })); g.save(); g.globalAlpha = 0.3 * k; text(g, '?', E.W / 2, E.H * 0.72, { size: V(260, 220), color: alpha(GOLD, 0.3), font: FONTS.title, weight: 700 }); g.restore(); } }));

// s188 — that night, a message on your phone
registerShot('s188', solo({ set: nightIn, mood: 'interiorCool', z0: 1.1, z1: 1.2, x0: 10, x1: -14, s: V(1.45, 1.5), dustColor: '#cfe6ff', dustCount: 26,
  f: { x: 0.46, who: YOU, pose: POSES.phone, expr: 'neutral' },
  overlay: (g, t) => {
    const k = clamp(spring(t - 0.7, 0, { freq: 2.1 }));
    if (k <= 0) return;
    g.save(); g.globalAlpha = k; g.translate(E.W * 0.74, E.H * 0.42); g.scale(k, k);
    rr(g, -V(150, 130), -V(240, 208), V(300, 260), V(480, 420), 26); g.fillStyle = 'rgba(8,14,26,0.96)'; g.fill(); g.strokeStyle = alpha(CYAN, 0.45); g.lineWidth = 3; g.stroke();
    rr(g, -V(120, 104), -V(180, 156), V(240, 208), V(90, 78), 14); g.fillStyle = alpha(CYAN, 0.18); g.fill();
    text(g, '1', 0, -V(135, 117), { size: V(28, 25), color: alpha('#cfe6ff', 0.9), font: FONTS.ui, weight: 900 });
    text(g, 'ՆՈՐ', V(60, 52), -V(30, 26), { size: V(22, 19), color: alpha('#cfe0ff', 0.6), font: FONTS.ui, weight: 900 });
    ring(g, 0, -V(136, 118), V(14, 12), 3, alpha(LIE, 0.9));
    g.restore();
    text(g, 'ԱՆՀԱՅՏ ՀԱՄԱՐԻՑ', E.W * 0.74, E.H * 0.72, { size: V(30, 26), color: alpha('#cfe0ff', 0.85), font: FONTS.ui, weight: 900, spacing: 4, alpha: clamp((t - 1.1) / 0.5) });
  } }));

// s189 — the message itself
registerShot('s189', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade('#0a1018', -0.1), shade('#05080e', 0)]);
  const cx = E.W / 2, cy = E.H * 0.5;
  const k = clamp(spring(t - 0.1, 0, { freq: 2 }));
  g.save(); g.globalAlpha = k; g.translate(cx, cy); g.scale(lerp(0.94, 1, k), lerp(0.94, 1, k));
  rr(g, -V(600, 520), -V(260, 224), V(1200, 1030), V(520, 450), 30); g.fillStyle = 'rgba(10,16,28,0.96)'; g.fill();
  g.strokeStyle = alpha(CYAN, 0.4); g.lineWidth = 3; g.stroke();
  circle(g, -V(520, 450), -V(190, 164), V(40, 35), alpha('#2a3448', 0.9)); text(g, '?', -V(520, 450), -V(188, 162), { size: V(38, 33), color: alpha('#cfe0ff', 0.8), font: FONTS.ui, weight: 900 });
  text(g, '«ԵՍ ԳԻՏԵՄ, ՈՐ ԴՈՒ ԿԱՐՈՂԱՆՈՒՄ ԵՍ', -V(440, 380), -V(150, 130), { size: V(42, 37), color: alpha('#e8f4ff', 0.95), font: FONTS.ui, weight: 900, align: 'left' });
  text(g, 'ԲԱՑԱՀԱՅՏԵԼ ՍՏԵՐԸ։', -V(440, 380), -V(70, 60), { size: V(42, 37), color: alpha('#e8f4ff', 0.95), font: FONTS.ui, weight: 900, align: 'left' });
  text(g, 'ԲԱՅՑ ԿԱՐՈՂ ԵՍ ՃԱՆԱՉԵԼ ՄԵԿԻՆ...', -V(440, 380), V(20, 17), { size: V(42, 37), color: alpha(GOLD_HI, 0.96), font: FONTS.ui, weight: 900, align: 'left' });
  text(g, 'ՈՎ ԻՆՔԸ ԻՐԵՆ Է ԽԱԲՈՒՄ»։', -V(440, 380), V(100, 88), { size: V(42, 37), color: alpha(GOLD_HI, 0.96), font: FONTS.ui, weight: 900, align: 'left' });
  g.restore();
  const kk = clamp(spring(t - 1.4, 0, { freq: 2.2 }));
  g.save(); g.globalAlpha = kk; glyph(g, cx + V(440, 380), cy - V(160, 140), { state: 'question', s: V(56, 50), k: kk, a: 0.95 }); g.restore();
} });

// s190 — you read it
registerShot('s190', faceShot({ who: YOU, expr: (t) => (t > 0.5 ? 'worried' : 'neutral'), mood: 'interiorCool', set: nightIn, r: V(330, 350), cy: 0.55, veilA: 0.5, bgX: 70,
  after: (g, t, info, { cx, cy, r }) => {
    // phone light from below
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = linGrad(g, 0, cy + r, 0, cy - r * 0.4, [alpha(CYAN, 0.16), alpha(CYAN, 0)]); g.fillRect(cx - r * 1.3, cy - r * 0.4, r * 2.6, r * 1.4); g.restore();
  } }));

// s191 — for the first time, you don't know who sent it
registerShot('s191', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.44), shade(M.sky[1], -0.54)]);
  const cx = E.W / 2, cy = E.H * 0.5;
  // a wall of faces, all turned away / blurred, one missing
  const r = rng(191);
  for (let i = 0; i < 14; i++) {
    const x = E.W * (0.1 + (i % 7) * 0.14), y = E.H * (0.34 + Math.floor(i / 7) * 0.26);
    const k = clamp(spring(t - 0.1 - i * 0.05, 0, { freq: 2.2 })); if (k <= 0.01) continue;
    g.save(); g.globalAlpha = 0.72 * k;
    circle(g, x, y, V(46, 40), alpha('#1a2334', 0.95)); ring(g, x, y, V(46, 40), 2.5, alpha('#5f7aa8', 0.55));
    // a scribble instead of a face
    g.strokeStyle = alpha('#a8c8f0', 0.8); g.lineWidth = 3.4; g.lineCap = 'round'; g.beginPath();
    for (let j = 0; j <= 16; j++) { const a = j * 0.9 + i; g.lineTo(x + Math.cos(a) * V(19, 17), y + Math.sin(a) * V(17, 15)); }
    g.stroke();
    g.restore();
  }
  text(g, 'Ո՞Վ Է ՈՒՂԱՐԿԵԼ', cx, E.H * 0.14, { size: V(72, 62), color: alpha('#f2ecff', 0.96), font: FONTS.title, weight: 700, spacing: 6, alpha: clamp((t - 0.8) / 0.5) });
  text(g, 'ԱՌԱՋԻՆ ԱՆԳԱՄ ՉԳԻՏԵՍ', cx, E.H * 0.86, { size: V(40, 35), color: alpha('#cfe0ff', 0.9), font: FONTS.ui, weight: 900, spacing: 5, alpha: clamp((t - 1.3) / 0.5) });
} });

// s192 — what would you do if nobody could lie to you?
registerShot('s192', statement({ lines: ['ԻՍԿ ԴՈՒ Ի՞ՆՉ ԿԱՆԵԻՐ,', 'ԵԹԵ ՈՉ ՈՔ ՉԿԱՐՈՂԱՆԱՐ', 'ԽԱԲԵԼ ՔԵԶ'], hi: 0, size: V(56, 48), y: 0.48, color: GOLD_HI }));

// s193 — the two options
registerShot('s193', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.44), shade(M.sky[1], -0.54)]);
  const cx = E.W / 2, cy = E.H * 0.52;
  // two cards
  const cards = [['ԲԱՑԱՀԱՅՏԵԼ', 'ԲՈԼՈՐԻ ԳԱՂՏՆԻՔՆԵՐԸ', LIE, 0.3], ['ՊԱՀՊԱՆԵԼ', 'ՆՐԱՆՑ ԳԱՂՏՆԻՔՆԵՐԸ', GOLD, 0.9]];
  cards.forEach(([a, b, col, at], i) => {
    const k = clamp(spring(t - at, 0, { freq: 2.1 })); if (k <= 0.01) return;
    const x = cx + (i ? V(280, 244) : -V(280, 244));
    g.save(); g.globalAlpha = k; g.translate(x, cy); g.scale(lerp(0.92, 1, k), lerp(0.92, 1, k));
    rr(g, -V(250, 218), -V(200, 173), V(500, 434), V(400, 346), 22); g.fillStyle = alpha(col, 0.10); g.fill(); g.strokeStyle = alpha(col, 0.6); g.lineWidth = 3.5; g.stroke();
    text(g, a, 0, -V(70, 60), { size: V(42, 37), color: alpha(col, 0.95), font: FONTS.title, weight: 700, spacing: 3 });
    text(g, b, 0, V(10, 8), { size: V(34, 30), color: alpha('#e8f0ff', 0.9), font: FONTS.ui, weight: 900, spacing: 1 });
    // icon
    glyph(g, 0, -V(140, 120), { state: i ? 'truth' : 'hidden', s: V(34, 30), k, a: 0.9, seed: 193 });
    g.restore();
  });
  text(g, 'Ի՞ՆՉ ԿԸՆՏՐԵՍ', cx, E.H * 0.12, { size: V(44, 38), color: alpha('#dfe8ff', 0.92), font: FONTS.title, weight: 700, spacing: 4, alpha: clamp((t - 0.5) / 0.5) });
} });

// s194 — write your answer in the comments
registerShot('s194', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.4), shade(M.sky[1], -0.5)]);
  const cx = E.W / 2, cy = E.H * 0.5;
  const k = clamp(spring(t - 0.1, 0, { freq: 2 }));
  g.save(); g.globalAlpha = k;
  // a comment box with a cursor blinking
  rr(g, cx - V(560, 480), cy - V(120, 104), V(1120, 960), V(240, 208), 24); g.fillStyle = 'rgba(14,20,34,0.94)'; g.fill(); g.strokeStyle = alpha(CYAN, 0.4); g.lineWidth = 3; g.stroke();
  circle(g, cx - V(470, 402), cy - V(4, 3), V(58, 50), alpha('#3a4460', 0.95));
  fig(g, { x: cx - V(470, 402), y: cy + V(58, 50), s: V(0.42, 0.39), facing: 1, outfit: { top: 'none' }, pose: POSES.stand, expr: 'smile', rim: false, shadow: false, blink: 0 });
  const blink = (Math.sin(t * 4) > 0) ? 1 : 0;
  seg(g, [[cx - V(390, 334), cy - V(46, 40)], [cx - V(390, 334), cy + V(46, 40)]], 5, alpha('#cfe0ff', 0.85 * blink));
  text(g, 'ԳՐԻՐ ՔՈ ՊԱՏԱՍԽԱՆԸ', cx - V(360, 310), cy, { size: V(36, 31), color: alpha('#9fb6d8', 0.7), font: FONTS.ui, weight: 900, align: 'left' });
  g.restore();
  const kk = clamp(spring(t - 0.6, 0, { freq: 2.2 }));
  g.save(); g.globalAlpha = kk;
  rr(g, cx + V(410, 352), cy - V(44, 38), V(190, 163), V(88, 76), 44); g.fillStyle = alpha(GOLD, 0.92); g.fill();
  const AX = cx + V(410, 352), D = alpha('#20180a', 0.95);
  rr(g, AX - V(52, 45), cy - V(6, 5), V(62, 53), V(12, 10), 6); g.fillStyle = D; g.fill();
  poly(g, [[AX + V(4, 3), cy - V(26, 22)], [AX + V(44, 38), cy], [AX + V(4, 3), cy + V(26, 22)]], D);
  g.restore();
  text(g, 'ՄԵԿՆԱԲԱՆՈՒԹՅՈՒՆՆԵՐՈՒՄ', E.W / 2, E.H * 0.14, { size: V(52, 45), color: alpha('#f2ecff', 0.96), font: FONTS.title, weight: 700, spacing: 7, alpha: clamp((t - 0.3) / 0.5) });
} });

// s195 — like + subscribe
registerShot('s195', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.42), shade(M.sky[1], -0.52)]);
  const cx = E.W / 2, cy = E.H * 0.5;
  // the glyph as a logo, then a like and a subscribe
  const k = clamp(spring(t - 0.1, 0, { freq: 1.9 }));
  glyph(g, cx, cy - V(180, 156), { state: 'truth', s: V(90, 80) * k, k, ring: clamp((t - 0.1) / 1.4) });
  glow(g, cx, cy - V(180, 156), V(400, 350), GOLD, 0.22 * k);
  // like pill
  const k1 = clamp(spring(t - 0.6, 0, { freq: 2.2 }));
  g.save(); g.globalAlpha = k1; g.translate(cx - V(220, 192), cy + V(80, 70)); g.scale(k1, k1);
  rr(g, -V(160, 138), -V(50, 44), V(320, 276), V(100, 88), 44); g.fillStyle = alpha('#ffffff', 0.10); g.fill(); g.strokeStyle = alpha('#ffffff', 0.3); g.lineWidth = 2.5; g.stroke();
  // a thumb, drawn
  g.save(); g.translate(-V(112, 97), -V(6, 5)); g.fillStyle = alpha('#ffffff', 0.92);
  rr(g, -V(22, 19), -V(6, 5), V(20, 17), V(40, 35), 5); g.fill();
  g.beginPath(); g.moveTo(-V(2, 2), V(16, 14));
  g.lineTo(-V(2, 2), -V(18, 16)); g.quadraticCurveTo(V(4, 3), -V(30, 26), V(24, 17), -V(30, 26));
  g.quadraticCurveTo(V(30, 26), -V(26, 22), V(30, 17), -V(20, 17));
  g.lineTo(V(30, 17), V(14, 12)); g.quadraticCurveTo(V(30, 26), V(20, 17), V(24, 17), V(18, 15));
  g.lineTo(V(2, 2), V(18, 15)); g.closePath(); g.fill();
  g.restore();
  text(g, 'ՀԱՎԱՆԵԼ', V(28, 24), 1, { size: V(30, 26), color: alpha('#ffffff', 0.92), font: FONTS.ui, weight: 900, spacing: 2 });
  g.restore();
  // subscribe pill
  const k2 = clamp(spring(t - 1.0, 0, { freq: 2.2 }));
  g.save(); g.globalAlpha = k2; g.translate(cx + V(240, 210), cy + V(80, 70)); g.scale(k2, k2);
  rr(g, -V(170, 148), -V(50, 44), V(340, 296), V(100, 88), 44); g.fillStyle = alpha(LIE, 0.92); g.fill();
  text(g, 'ԲԱԺԱՆՈՐԴԱԳՐՎԵԼ', 0, 1, { size: V(30, 26), color: '#ffffff', font: FONTS.ui, weight: 900 });
  g.restore();
  text(g, 'ԱՎԵԼԻ ՇԱՏ WHAT IF ՊԱՏՄՈՒԹՅՈՒՆՆԵՐԻ', cx, E.H * 0.905, { size: V(38, 33), color: alpha('#cfe0ff', 0.9), font: FONTS.ui, weight: 900, spacing: 4, alpha: clamp((t - 1.4) / 0.5) });
  // sparks
  const r = rng(195);
  for (let i = 0; i < 22; i++) { const ph = (t * 0.4 + r()) % 1; circle(g, cx + (r() - 0.5) * E.W * 0.7, cy - V(180, 156) + (r() - 0.5) * E.H * 0.5 - ph * 60, 2.6 * (1 - ph), alpha(GOLD, 0.55 * (1 - ph))); }
} });
