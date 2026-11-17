// a3_gala.js — s127–s158: the charity gala, the real documents, the choice, and the ambiguous win.
import { E, V, mood, clamp, lerp, ease, prog, rng, alpha, shade, mix, seg, circle, ring, poly, rr, linGrad, glow, text, layer, backdrop, FONTS, registerShot, talkAmount } from '/engine/core.js';
import { POSES, posesAt, breathe, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as SET from '../sets/room.js';
import { YOU, MOM, LEO, MIA, BRO, BLACK, SELL, CROWD } from '../cast.js';
import { glyph, talkGlyph, goldThread, sparkBurst, cracks, frozenAir, wordPop, fig, blink, GOLD, GOLD_HI, LIE, LIE_HI, CYAN } from '../fx_truth.js';
import { camAdd, camPath, drift, spring } from '/engine/motion.js';
import { faceShot, insertShot, wideShot, uiShot } from '../lib.js';
import { pair, solo, panel, statement, grid, nameCard } from '../beat.js';
import { backs } from '../lib.js';

const gala = (g, t, cam) => SET.gala(g, t, cam, { mood: 'night' });
const G = () => SET.GY();

// s127 — next morning everything changes
registerShot('s127', { draw(g, t, info) {
  const M = mood('dusk'); backdrop(g, M.sky);
  // a hard sunrise wiping the dark away
  const p = ease.inOut(prog(t, 0.15, 1.9));
  g.save(); g.globalCompositeOperation = 'lighter';
  g.fillStyle = linGrad(g, 0, E.H, 0, 0, [alpha('#ffb070', 0.55 * p), alpha('#ff7a5a', 0.22 * p), alpha('#000000', 0)]);
  g.fillRect(0, 0, E.W, E.H); g.restore();
  FX.sun(g, E.W * 0.5, E.H * (1.02 - p * 0.42), V(150, 130) * p, '#fff3d8', '#ffb070', 5);
  layer(g, { z: 1, x: 0, y: 0 }, 0.9, (g) => { FX.skyline(g, { x: -E.W * 0.1, y: E.H * 0.86, w: E.W * 1.2, minH: 80, maxH: 240, color: alpha('#2a2030', 0.9), windowColor: alpha('#ffd59a', 0.5), lit: 0.3, seed: 12 }); });
  text(g, 'ՀԱՋՈՐԴ ԱՌԱՎՈՏԸ', E.W / 2, E.H * 0.16, { size: V(52, 45), color: alpha('#2a1a20', 0.85), font: FONTS.title, weight: 700, spacing: 6, alpha: clamp((t - 1.2) / 0.6) });
  FX.dust(g, t, { count: 40, color: '#ffd8b4', a: 0.3 });
} });

// s128 — the big charity event, the town
registerShot('s128', { draw(g, t, info) {
  const cam = camAdd(camPath(t, [[0, { z: 1.0, x: 0, y: 0 }], [info.dur, { z: 1.1, x: -40, y: -20 }]], { endEase: 0.28 }), drift(t, 3, 14));
  SET.gala(g, t, cam, { mood: 'night' });
  backs(g, cam, t, { M: mood('night'), n: 11, y: G() + 40, s: V(1.5, 1.55), dim: true, seed: 7 });
  wordPop(g, t, 'ԲԱՐԵԳՈՐԾԱԿԱՆ ՄԻՋՈՑԱՌՈՒՄ', E.W / 2, E.H * 0.13, { t0: 0.4, size: V(42, 37), color: alpha(GOLD, 0.92), spacing: 6 });
} });

// s129 — thousands gathered
registerShot('s129', { draw(g, t, info) {
  SET.gala(g, t, { z: 1.02, x: 0 }, { mood: 'night' });
  const r = rng(129);
  for (let row = 0; row < 5; row++) {
    const n = 16 + row * 3, sc = V(0.5, 0.48) + row * V(0.16, 0.15);
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * E.W * 1.1 - E.W * 0.05 + (r() - 0.5) * 40, y = E.H * (0.98 - row * 0.055) + (r() - 0.5) * 16;
      fig(g, { x, y, s: sc, facing: r() > 0.5 ? 1 : -1, outfit: { top: 'none' }, pose: POSES.stand, expr: 'neutral', rim: false, shadow: false, blink: 0, alpha: 0.35 + row * 0.13, dim: true });
    }
  }
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.24 });
  text(g, 'ՀԱԶԱՐՈՎՈՐ ՄԱՐԴԻԿ', E.W / 2, E.H * 0.12, { size: V(46, 40), color: alpha('#f2ecff', 0.92), font: FONTS.title, weight: 700, spacing: 7, alpha: clamp((t - 0.5) / 0.5) });
} });

// s130 — Black announces the money goes to sick children
registerShot('s130', { draw(g, t, info) {
  const cam = camAdd(camPath(t, [[0, { z: 1.16, x: 30 }], [info.dur, { z: 1.26, x: -10 }]], { endEase: 0.3 }), drift(t, 2.4, 15));
  SET.gala(g, t, cam, { mood: 'night' });
  const gy = G(), s = V(1.6, 1.64), M = mood('night');
  layer(g, cam, 1, (g) => {
    fig(g, { x: E.W * 0.56, y: gy, s, facing: -1, outfit: BLACK, pose: breathe(posesAt(t, [[0, POSES.explain], [1.4, POSES.pointUp]], 0.5), t, 1, 2), expr: 'smile', talk: talkAmount(info.globalT), rim: { color: '#9fd8ff', dir: [-0.4, -1], w: 5 }, blink: blink(t, 2) });
    talkGlyph(g, t, E.W * 0.56 - 20, gy - 500, { t0: 0.4, lieAt: 1.7, s: V(44, 40), seed: 130 });
    // podium
    g.fillStyle = shade(M.dark, 0.16); g.fillRect(E.W * 0.4, gy - V(150, 138), V(320, 290), V(150, 138));
    g.fillStyle = alpha(GOLD, 0.4); g.fillRect(E.W * 0.4, gy - V(150, 138), V(320, 290), 5);
  });
  nameCard(g, t, 0.6, 'ՊԱՐՈՆ ԲԼԵՔ', 'ԿԱԶՄԱԿԵՐՊԻՉ', { accent: '#8fb8e8' });
} });

// s131 — but you know part of it is a lie
registerShot('s131', { draw(g, t, info) {
  const M = mood('night'); backdrop(g, [shade(M.sky[0], -0.2), shade(M.sky[1], -0.3)]);
  const cx = E.W / 2, cy = E.H * 0.46;
  // a speech bubble with one sentence infected
  const k = clamp(spring(t - 0.15, 0, { freq: 2.1 }));
  g.save(); g.globalAlpha = k;
  rr(g, cx - V(440, 380), cy - V(180, 156), V(880, 760), V(300, 260), 34); g.fillStyle = 'rgba(14,20,34,0.94)'; g.fill();
  g.strokeStyle = alpha(CYAN, 0.3); g.lineWidth = 3; g.stroke();
  poly(g, [[cx - V(120, 104), cy + V(120, 104)], [cx - V(30, 26), cy + V(240, 208)], [cx + V(40, 35), cy + V(120, 104)]], 'rgba(14,20,34,0.94)');
  text(g, '«ԳՈՒՄԱՐԸ ԿԳՆԱ', cx, cy - V(60, 52), { size: V(46, 40), color: alpha('#eef4ff', 0.94), font: FONTS.ui, weight: 900 });
  text(g, 'ՀԻՎԱՆԴ ԵՐԵԽԱՆԵՐԻՆ»', cx, cy + V(20, 17), { size: V(46, 40), color: alpha('#eef4ff', 0.94), font: FONTS.ui, weight: 900 });
  g.restore();
  const ki = clamp(spring(t - 0.8, 0, { freq: 2.3 }));
  if (ki > 0) { cracks(g, cx, cy - V(20, 17), { p: clamp((t - 0.8) / 1.2), n: 8, len: V(320, 280), color: LIE, a: 0.55 * ki, seed: 131 }); glyph(g, cx + V(440, 380), cy - V(180, 156), { state: 'lie', s: V(56, 50), k: ki, ring: clamp((t - 0.8) / 1) }); }
} });

// s132 — part of the money goes elsewhere
registerShot('s132', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.44), shade(M.sky[1], -0.54)]);
  const cx = E.W / 2, cy = E.H * 0.52;
  // a pie chart split: one honest slice, one hidden
  const R = V(230, 200), k = ease.inOut(prog(t, 0.15, 1.4));
  const hidden = 0.38;
  g.save(); g.translate(cx, cy);
  // honest slice
  g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, R, -Math.PI / 2 + hidden * Math.PI * 2 * k, Math.PI * 1.5); g.closePath();
  g.fillStyle = alpha(GOLD, 0.55 * k); g.fill(); g.strokeStyle = alpha(GOLD, 0.9); g.lineWidth = 4; g.stroke();
  // hidden slice
  g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, R, -Math.PI / 2, -Math.PI / 2 + hidden * Math.PI * 2 * k); g.closePath();
  g.fillStyle = alpha(LIE, 0.5 * k); g.fill(); g.strokeStyle = alpha(LIE, 0.9); g.lineWidth = 4; g.stroke();
  g.restore();
  glow(g, cx, cy, V(520, 440), LIE, 0.10 * k);
  text(g, 'ԵՐԵԽԱՆԵՐԻՆ', cx - V(240, 208), cy + V(280, 250), { size: V(36, 32), color: alpha(GOLD, 0.95), font: FONTS.ui, weight: 900, spacing: 4, alpha: clamp((t - 0.9) / 0.5) });
  text(g, 'ՈՒՐԻՇ ՆՊԱՏԱԿՆԵՐԻ', cx + V(280, 244), cy - V(60, 52), { size: V(36, 32), color: alpha(LIE_HI, 0.95), font: FONTS.ui, weight: 900, spacing: 3, alpha: clamp((t - 1.0) / 0.5) });
} });

// s133 — you try to warn people, nobody believes you
registerShot('s133', { draw(g, t, info) {
  const cam = camAdd(camPath(t, [[0, { z: 1.14, x: -10 }], [info.dur, { z: 1.22, x: 10 }]], { endEase: 0.3 }), drift(t, 2.4, 16));
  SET.gala(g, t, cam, { mood: 'night' });
  const gy = G(), M = mood('night');
  layer(g, cam, 1, (g) => {
    fig(g, { x: E.W * 0.34, y: gy, s: V(1.5, 1.54), facing: 1, outfit: YOU, pose: breathe(posesAt(t, [[0, POSES.explain], [1.0, POSES.reach]], 0.5), t, 1, 1), expr: 'worried', talk: talkAmount(info.globalT), rim: { color: M.practical, dir: [0.4, -1], w: 4.8 } });
    // three listeners turning away
    for (let i = 0; i < 3; i++) {
      fig(g, { x: E.W * (0.62 + i * 0.13), y: gy - i * 6, s: V(1.4, 1.44), facing: -1, outfit: { top: i % 2 ? 'dress' : 'suit', color: ['#4a4258', '#3a4460', '#4a3a4a'][i] }, pose: posesAt(t, [[0, POSES.stand], [0.8, POSES.crossArms]], 0.6), expr: 'smirk', rim: { color: M.practical, dir: [-0.4, -1], w: 3.2 }, dim: true, alpha: 0.9 });
    }
  });
  wordPop(g, t, 'ՈՉ ՈՔ ՉԻ ՀԱՎԱՏՈՒՄ', E.W / 2, E.H * 0.13, { t0: 0.6, size: V(44, 38), color: alpha('#cfe0ff', 0.9), spacing: 6 });
} });

// s134 — Black smiles: "you're just jealous"
registerShot('s134', faceShot({ who: BLACK, expr: 'smirk', mood: 'night', set: gala, r: V(310, 330), cy: 0.5, veilA: 0.5, bgX: 40,
  after: (g, t, info, { cx, cy, r }) => { talkGlyph(g, t, cx + r * 1.0, cy - r * 0.95, { t0: 0.4, lieAt: 1.5, s: r * 0.13, seed: 134 }); },
  overlay: (g, t) => { nameCard(g, t, 0.7, '«ՆԱԽԱՆՁՈՒՄ ԵՍ»', 'ՊԱՐՈՆ ԲԼԵՔ', { accent: LIE }); } }));

// s135 — the big screen turns on
registerShot('s135', { draw(g, t, info) {
  const M = mood('night'); backdrop(g, [shade(M.sky[0], -0.3), shade(M.sky[1], -0.4)]);
  const cx = E.W / 2, cy = E.H * 0.46, w = V(1200, 1040), h = V(660, 580);
  // a huge LED wall switching on, row by row
  const p = ease.out(prog(t, 0.1, 1.2));
  rr(g, cx - w / 2, cy - h / 2, w, h, 12); g.fillStyle = '#07090f'; g.fill();
  g.save(); g.beginPath(); rr(g, cx - w / 2, cy - h / 2, w, h, 12); g.clip();
  for (let y = 0; y < h; y += 6) {
    const rowP = clamp(p * 1.6 - (y / h) * 0.7);
    if (rowP <= 0) continue;
    g.fillStyle = alpha(mix('#8fe0ff', '#ffffff', (y / h) * 0.6), 0.10 + rowP * 0.16);
    g.fillRect(cx - w / 2, cy - h / 2 + y, w, 3);
  }
  // scan sweep
  const sy = cy - h / 2 + ((t * 0.7) % 1) * h;
  g.fillStyle = alpha('#ffffff', 0.08); g.fillRect(cx - w / 2, sy, w, 40);
  g.restore();
  glow(g, cx, cy, w * 0.72, CYAN, 0.16 * p);
  g.strokeStyle = alpha(CYAN, 0.35); g.lineWidth = 4; rr(g, cx - w / 2, cy - h / 2, w, h, 12); g.stroke();
  text(g, 'ԷԿՐԱՆԸ ՄԻԱՑԱՎ', E.W / 2, E.H * 0.9, { size: V(42, 37), color: alpha('#cfe0ff', 0.9), font: FONTS.ui, weight: 900, spacing: 6, alpha: clamp((t - 0.9) / 0.5) });
} });

// s136 — he presents documents
registerShot('s136', insertShot({ mood: 'night', scale: 1.0, draw: (g, t) => {
  const cx = E.W / 2, cy = E.H * 0.5;
  // a stack of official sheets fanning out
  for (let i = 2; i >= 0; i--) {
    const k = clamp(spring(t - 0.1 - i * 0.16, 0, { freq: 2.1 }));
    g.save(); g.globalAlpha = k; g.translate(cx + (i - 1) * V(150, 130), cy + i * V(20, 17)); g.rotate((i - 1) * 0.05); g.scale(lerp(0.9, 1, k), lerp(0.9, 1, k));
    g.fillStyle = ['#f2f0ea', '#e8e6df', '#dedbd2'][i]; g.fillRect(-V(220, 190), -V(300, 260), V(440, 380), V(600, 520));
    g.fillStyle = alpha('#2a3244', 0.18); for (let r = 0; r < 12; r++) g.fillRect(-V(180, 156), -V(250, 216) + r * V(38, 33), V(360, 312) * (r === 11 ? 0.45 : 1), V(9, 8));
    // a red seal
    circle(g, V(120, 104), V(200, 173), V(52, 45), alpha('#b03a3a', 0.7));
    g.restore();
  }
  glow(g, cx, cy, V(700, 600), '#ffffff', 0.10);
}, glyph: { state: 'truth', x: 0.5, y: 0.13, t0: 0.9, s: V(48, 44) } }));

// s137 — they're real. that's worse.
registerShot('s137', statement({ lines: ['ԴՐԱՆՔ ԿԵՂԾ ՉԵՆ', 'ԴՐԱՆՔ ԻՐԱԿԱՆ ԵՆ'], hi: 1, size: V(62, 54), y: 0.46, color: GOLD_HI,
  behind: (g, t) => { if (t > 0.4) glyph(g, E.W * 0.16, E.H * 0.2, { state: 'truth', s: V(54, 48), k: clamp(spring(t - 0.4, 0, { freq: 2.3 })), ring: clamp((t - 0.4) / 1.1) }); } }));

// s138 — and that's worse
registerShot('s138', statement({ lines: ['ԵՎ ԴԱ', 'ԱՎԵԼԻ ՎԱՏ Է'], hi: 1, size: V(86, 76), y: 0.5, color: LIE_HI,
  behind: (g, t) => { const k = clamp((t - 0.3) / 1.2); if (k > 0) { g.save(); g.globalAlpha = 0.5 * k; cracks(g, E.W / 2, E.H * 0.5, { p: clamp((t - 0.3) / 1.6), n: 14, len: E.W * 0.5, color: LIE, a: 0.6, seed: 138 }); g.restore(); } } }));

// s139 — legal, careful, technically true
registerShot('s139', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.46), shade(M.sky[1], -0.56)]);
  const cx = E.W / 2, cy = E.H * 0.48;
  // contract lines, with one clause in tiny grey type
  rr(g, cx - V(470, 400), cy - V(300, 260), V(940, 810), V(600, 520), 12); g.fillStyle = 'rgba(240,238,230,0.95)'; g.fill();
  g.fillStyle = alpha('#2a3244', 0.28); for (let r = 0; r < 13; r++) g.fillRect(cx - V(410, 350), cy - V(250, 216) + r * V(40, 35), V(820, 700) * (r % 5 === 4 ? 0.62 : 1), V(10, 9));
  // the tiny clause
  const k = clamp(spring(t - 0.7, 0, { freq: 2.2 }));
  g.save(); g.globalAlpha = k;
  rr(g, cx - V(410, 350), cy + V(140, 122), V(300, 260), V(30, 26), 4); g.fillStyle = alpha(LIE, 0.25); g.fill();
  text(g, '§ 14.3', cx - V(330, 282), cy + V(156, 136), { size: V(20, 18), color: alpha('#7a2a2a', 0.9), font: FONTS.ui, weight: 900, align: 'left' });
  ring(g, cx - V(200, 174), cy + V(156, 136), V(120, 104), 3, alpha(LIE, 0.7));
  g.restore();
  text(g, 'ՕՐԻՆԱԿԱՆ', cx, E.H * 0.12, { size: V(54, 47), color: alpha(GOLD, 0.9), font: FONTS.title, weight: 700, spacing: 8, alpha: clamp((t - 0.3) / 0.5) });
} });

// s140 — he just doesn't say the whole truth
registerShot('s140', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.46), shade(M.sky[1], -0.56)]);
  const cx = E.W / 2, cy = E.H * 0.5;
  // an iceberg: the tip is visible, the mass is under the line
  const wl = cy + V(30, 26);
  seg(g, [[-E.W, wl], [E.W * 2, wl]], 3, alpha(CYAN, 0.35));
  const p = ease.out(prog(t, 0.2, 1.6));
  // above water
  poly(g, [[cx - V(160, 138), wl], [cx + V(150, 130), wl], [cx + V(70, 60), wl - V(190, 164) * p], [cx - V(60, 52), wl - V(150, 130) * p]], alpha('#dff0ff', 0.85));
  // below water
  g.save(); g.globalAlpha = 0.75;
  poly(g, [[cx - V(160, 138), wl], [cx + V(150, 130), wl], [cx + V(230, 200), wl + V(260, 224)], [cx - V(40, 34), wl + V(400, 346)], [cx - V(280, 240), wl + V(220, 190)]], alpha('#4a7a9a', 0.9));
  g.restore();
  g.fillStyle = alpha('#0a1620', 0.35); g.fillRect(-E.W, wl, E.W * 3, E.H);
  text(g, 'ԻՆՉ ԱՍՎԱԾ Է', cx + V(300, 260), wl - V(120, 104), { size: V(32, 28), color: alpha('#dff0ff', 0.9), font: FONTS.ui, weight: 900, spacing: 4, alpha: clamp((t - 0.8) / 0.5) });
  text(g, 'ԻՆՉ ՉԱՍՎԱԾ Է', cx + V(300, 260), wl + V(280, 242), { size: V(32, 28), color: alpha('#8fc0e0', 0.9), font: FONTS.ui, weight: 900, spacing: 4, alpha: clamp((t - 1.2) / 0.5) });
} });

// s141 — your power can't replace proof
registerShot('s141', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.44), shade(M.sky[1], -0.54)]);
  const cx = E.W / 2, cy = E.H * 0.5;
  // a gold glyph on one side, a heavy document on the other, a broken equals sign
  glyph(g, cx - V(380, 330), cy, { state: 'truth', s: V(80, 70), k: clamp(spring(t - 0.2, 0, { freq: 2.2 })), ring: clamp((t - 0.2) / 1.1) });
  g.save(); g.globalAlpha = 0.95;
  rr(g, cx + V(280, 244), cy - V(120, 104), V(220, 192), V(240, 210), 8); g.fillStyle = 'rgba(236,234,226,0.95)'; g.fill();
  g.fillStyle = alpha('#2a3244', 0.26); for (let r = 0; r < 6; r++) g.fillRect(cx + V(300, 260), cy - V(90, 78) + r * V(34, 30), V(180, 156) * (r === 5 ? 0.5 : 1), V(9, 8));
  g.restore();
  // the ≠ sign
  const k = clamp(spring(t - 0.7, 0, { freq: 2.4 }));
  g.save(); g.globalAlpha = k; g.strokeStyle = alpha(LIE, 0.9); g.lineWidth = 12; g.lineCap = 'round';
  seg(g, [[cx - V(90, 78), cy - V(50, 44)], [cx + V(90, 78), cy - V(50, 44)]], 12, alpha(LIE, 0.9));
  seg(g, [[cx - V(90, 78), cy + V(40, 34)], [cx + V(90, 78), cy + V(40, 34)]], 12, alpha(LIE, 0.9));
  seg(g, [[cx + V(70, 60), cy - V(140, 120)], [cx - V(70, 60), cy + V(140, 120)]], 12, alpha(LIE, 0.9));
  g.restore();
  text(g, 'ՈՒԺԸ ՉԻ ՓՈԽԱՐԻՆԵԼ ԱՊԱՑՈՒՅՑԻՆ', E.W / 2, E.H * 0.9, { size: V(42, 37), color: alpha('#e8f0ff', 0.93), font: FONTS.title, weight: 700, spacing: 3, alpha: clamp((t - 1.1) / 0.5) });
} });

// s142 — you can know something is wrong
registerShot('s142', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.46), shade(M.sky[1], -0.56)]);
  const cx = E.W / 2, cy = E.H * 0.46;
  const k = clamp(spring(t - 0.15, 0, { freq: 2 }));
  // a gut feeling: a dark room, one red pulse
  for (let i = 0; i < 4; i++) { const ph = (t * 0.5 + i / 4) % 1; ring(g, cx, cy, V(90, 78) + ph * V(520, 440), 4 * (1 - ph), alpha(LIE, 0.35 * (1 - ph))); }
  fig(g, { x: cx, y: cy + V(230, 200), s: V(1.8, 1.72) * lerp(0.94, 1, k), facing: 1, outfit: YOU, pose: POSES.stand, expr: 'worried', rim: { color: LIE, dir: [0, -1], w: 4.6 }, shadow: false });
  text(g, 'ԴՈՒ ԳԻՏԵՍ՝ ԻՆՉ-ՈՐ ԲԱՆ ՍԽԱԼ Է', E.W / 2, E.H * 0.17, { size: V(44, 38), color: alpha('#f2ecff', 0.94), font: FONTS.title, weight: 700, spacing: 4, alpha: clamp((t - 0.5) / 0.5) });
} });

// s143 — but people need to see why
registerShot('s143', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.44), shade(M.sky[1], -0.54)]);
  const cx = E.W / 2, cy = E.H * 0.5;
  // a crowd of heads looking at a projected number, not at you
  for (let i = 0; i < 9; i++) { const x = E.W * (0.08 + i * 0.105); fig(g, { x, y: E.H * 0.92, s: V(0.9, 0.86), facing: Math.cos(i) > 0 ? 1 : -1, outfit: { top: 'none' }, pose: POSES.stand, expr: 'neutral', rim: false, shadow: false, blink: 0, dim: true, alpha: 0.55 }); }
  const k = clamp(spring(t - 0.4, 0, { freq: 2.1 }));
  g.save(); g.globalAlpha = k;
  text(g, '−320,000 €', cx, cy - V(40, 34), { size: V(150, 124), color: GOLD_HI, font: FONTS.ui, weight: 900, glow: 34, glowColor: alpha(GOLD, 0.55) });
  g.restore();
  text(g, 'ՄԱՐԴԻԿ ՊԵՏՔ Է ՏԵՍՆԵՆ՝ ԻՆՉՈՒ', E.W / 2, E.H * 0.16, { size: V(40, 35), color: alpha('#cfe0ff', 0.9), font: FONTS.title, weight: 700, spacing: 3, alpha: clamp((t - 0.9) / 0.5) });
} });

// s144 — you have two options
registerShot('s144', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.44), shade(M.sky[1], -0.54)]);
  const cx = E.W / 2, cy = E.H * 0.5;
  text(g, 'ԵՐԿՈՒ ՃԱՆԱՊԱՐՀ', cx, E.H * 0.18, { size: V(56, 48), color: alpha('#f2ecff', 0.95), font: FONTS.title, weight: 700, spacing: 7, alpha: clamp((t - 0.2) / 0.5) });
  // two doors of light left and right
  for (const [dx, col, label, t0] of [[-1, '#5a6a8a', 'ԼՌԵԼ', 0.5], [1, GOLD, 'ԽՈՍԵԼ', 0.9]]) {
    const k = clamp(spring(t - t0, 0, { freq: 2.1 }));
    if (k <= 0.01) continue;
    const x = cx + dx * V(360, 312);
    g.save(); g.globalAlpha = k;
    rr(g, x - V(150, 130), cy - V(260, 224), V(300, 260), V(460, 400), 10); g.fillStyle = alpha(col, 0.10); g.fill();
    g.strokeStyle = alpha(col, 0.55); g.lineWidth = 4; g.stroke();
    glow(g, x, cy, V(400, 350), col, 0.12);
    text(g, label, x, cy + V(300, 260), { size: V(44, 38), color: alpha(col, 0.95), font: FONTS.title, weight: 700, spacing: 6 });
    g.restore();
  }
} });

// s145 — stay silent
registerShot('s145', statement({ lines: ['ԼՌԵԼ...', 'ԵՎ ԹՈՒՅԼ ՏԱԼ, ՈՐ ՄԱՐԴԻԿ', 'ՀԱՎԱՏԱՆ ՆՐԱ ԽՈՍՔԵՐԻՆ'], hi: 2, size: V(50, 44), y: 0.48, color: '#9fb6d8',
  behind: (g, t) => { const k = clamp(spring(t - 0.3, 0, { freq: 1.8 })); g.save(); g.globalAlpha = 0.4 * k; fig(g, { x: E.W * 0.5, y: E.H * 0.78, s: V(0.9, 0.86), facing: 1, outfit: YOU, pose: POSES.sad, expr: 'sad', rim: false, shadow: false }); g.restore(); } }));

// s146 — or risk your reputation
registerShot('s146', statement({ lines: ['ԿԱՄ ՎՏԱՆԳԵԼ', 'ՔՈ ՀԵՂԻՆԱԿՈՒԹՅՈՒՆԸ...'], hi: 1, size: V(58, 50), y: 0.46, color: GOLD_HI,
  behind: (g, t) => { const k = clamp(spring(t - 0.4, 0, { freq: 1.9 })); if (k <= 0) return; g.save(); g.globalAlpha = 0.45 * k; cracks(g, E.W * 0.5, E.H * 0.52, { p: clamp((t - 0.4) / 1.4), n: 11, len: E.W * 0.34, color: GOLD, a: 0.5, seed: 146 }); g.restore(); } }));

// s147 — you choose the second one
registerShot('s147', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.42), shade(M.sky[1], -0.52)]);
  const cx = E.W / 2, cy = E.H * 0.52;
  const k = clamp(spring(t - 0.25, 0, { freq: 2 }));
  // your hand closing on the choice: the gold door lights, the grey one dies
  // the two doors, named
  const dx = V(300, 260), dw = V(300, 260), dh2 = V(470, 408);
  g.save(); g.globalAlpha = 0.5;
  rr(g, cx - dx - dw / 2, cy - dh2 / 2, dw, dh2, 10); g.fillStyle = 'rgba(12,16,26,0.9)'; g.fill();
  g.strokeStyle = alpha('#5a6a8a', 0.55); g.lineWidth = 4; g.stroke(); g.restore();
  text(g, 'ԼՌԵԼ', cx - dx, cy - dh2 / 2 - V(46, 40), { size: V(44, 38), color: alpha('#7f8fb0', 0.8), font: FONTS.title, weight: 700, spacing: 6 });
  const kk = clamp(spring(t - 0.35, 0, { freq: 2 }));
  g.save(); g.globalAlpha = 0.25 + 0.75 * kk;
  rr(g, cx + dx - dw / 2, cy - dh2 / 2, dw, dh2, 10); g.fillStyle = alpha(GOLD, 0.14); g.fill();
  g.strokeStyle = alpha(GOLD, 0.8); g.lineWidth = 5; g.stroke();
  text(g, 'ԽՈՍԵԼ', cx + dx, cy - dh2 / 2 - V(46, 40), { size: V(46, 40), color: alpha(GOLD_HI, 0.98), font: FONTS.title, weight: 700, spacing: 5, glow: 22, glowColor: alpha(GOLD, 0.45) });
  g.restore();
  glow(g, cx + dx, cy, V(520, 450), GOLD, 0.20 * k);
  const walk = ease.inOut(prog(t, 0.4, 1.7));
  fig(g, { x: lerp(cx - V(80, 70), cx + V(250, 216), walk), y: cy + V(360, 312), s: V(1.22, 1.18), facing: 1, outfit: YOU, pose: posesAt(t, [[0, POSES.stand], [0.5, POSES.point]], 0.5), expr: 'smirk', rim: { color: GOLD, dir: [0, -1], w: 4.6 }, shadow: false });
  text(g, 'ԴՈՒ ԸՆՏՐՈՒՄ ԵՍ', E.W / 2, E.H * 0.14, { size: V(52, 45), color: alpha(GOLD_HI, 0.95), font: FONTS.title, weight: 700, spacing: 6, alpha: clamp((t - 0.6) / 0.5) });
} });

// s148 — but no fake recordings, no threats
registerShot('s148', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.44), shade(M.sky[1], -0.54)]);
  const cx = E.W / 2, cy = E.H * 0.5;
  const items = [['ՁԱՅՆԱԳՐՈՒԹՅՈՒՆ', 0.34, '#8fb8e8'], ['ՍՊԱՌՆԱԼԻՔ', 0.66, '#c9a6d6'], ['ԿՈՂԱՌՈՒՄ', 0.9, '#e0b23c']];
  items.forEach(([label, at, col], i) => {
    const k = clamp(spring(t - at, 0, { freq: 2.3 })); if (k <= 0.01) return;
    const x = cx + (i - 1) * V(400, 346);
    g.save(); g.globalAlpha = k * 0.9;
    g.strokeStyle = alpha(col, 0.55); g.lineWidth = 4; rr(g, x - V(150, 130), cy - V(110, 96), V(300, 260), V(220, 192), 16); g.stroke();
    text(g, label, x, cy + 2, { size: V(32, 28), color: alpha(col, 0.9), font: FONTS.ui, weight: 900, spacing: 2 });
    // the "no" slash
    seg(g, [[x - V(160, 139), cy + V(120, 104)], [x + V(160, 139), cy - V(120, 104)]], 11, alpha(LIE, 0.9));
    g.restore();
  });
  text(g, 'ՈՉ ՄԻ ԿԵՂԾ ԲԱՆ', E.W / 2, E.H * 0.86, { size: V(48, 42), color: alpha('#f2ecff', 0.95), font: FONTS.title, weight: 700, spacing: 6, alpha: clamp((t - 1.1) / 0.5) });
} });

// s149 — you find the contract
registerShot('s149', insertShot({ mood: 'night', scale: 1.02, draw: (g, t) => {
  const cx = E.W / 2, cy = E.H * 0.5;
  g.save(); g.translate(cx, cy); g.rotate(-0.025);
  g.fillStyle = '#f0ede4'; g.fillRect(-V(300, 260), -V(400, 346), V(600, 520), V(800, 690));
  g.fillStyle = alpha('#2a3244', 0.18); for (let r = 0; r < 16; r++) g.fillRect(-V(250, 216), -V(340, 294) + r * V(40, 35), V(500, 430) * (r === 15 ? 0.4 : 1), V(10, 9));
  // highlighted clause growing brighter
  const k = clamp((t - 0.3) / 1.0);
  rr(g, -V(260, 224), V(40, 35), V(520, 450), V(74, 64), 6); g.fillStyle = alpha(GOLD, 0.32 + 0.34 * k); g.fill();
  g.strokeStyle = alpha(GOLD, 0.95); g.lineWidth = 3; g.stroke();
  // the clause itself
  g.fillStyle = alpha('#2a3244', 0.55 + 0.35 * k);
  g.fillRect(-V(220, 190), V(58, 50), V(300, 260), V(12, 10));
  text(g, '§ 14.3', -V(250, 216), V(34, 29), { size: V(24, 21), color: alpha(GOLD, 0.9), font: FONTS.ui, weight: 900, align: 'left' });
  g.restore();
  glow(g, cx, cy + V(90, 78), V(520, 440), GOLD, 0.16 * k);
}, glyph: { state: 'truth', x: 0.5, y: 0.12, t0: 0.8, s: V(46, 42) } }));

// s150 — an independent accountant
registerShot('s150', { draw(g, t, info) {
  const M = mood('night'); backdrop(g, [shade(M.sky[0], -0.34), shade(M.sky[1], -0.44)]);
  const cx = E.W / 2, cy = E.H * 0.5;
  const k = clamp(spring(t - 0.2, 0, { freq: 2 }));
  // a figure in a lab coat with a ledger and a stamp
  g.save(); g.globalAlpha = k;
  fig(g, { x: cx - V(40, 34), y: cy + V(250, 216), s: V(1.6, 1.54), facing: 1, outfit: { top: 'labcoat', color: '#ebe7f0' }, pose: posesAt(t, [[0, POSES.holdFront], [0.8, POSES.explain]], 0.5), expr: 'neutral', rim: { color: '#cfe6ff', dir: [0.4, -1], w: 4.6 }, shadow: false });
  // ledger book
  g.save(); g.translate(cx + V(200, 172), cy + V(60, 52)); g.rotate(-0.12);
  g.fillStyle = '#3a4a6a'; g.fillRect(-V(110, 96), -V(140, 121), V(220, 192), V(280, 242));
  g.fillStyle = '#f2f0e8'; g.fillRect(-V(96, 84), -V(126, 109), V(192, 168), V(252, 218));
  g.fillStyle = alpha('#2a3244', 0.2); for (let r = 0; r < 8; r++) g.fillRect(-V(76, 66), -V(104, 90) + r * V(30, 26), V(152, 132), V(8, 7));
  g.restore();
  g.restore();
  nameCard(g, t, 0.6, 'ԱՆԿԱԽ ՀԱՇՎԱՊԱՀ', 'ԱՆԿԱԽ ՍՏՈՒԳՈՒՄ', { accent: CYAN });
} });

// s151 — publish the real payment report
registerShot('s151', { draw(g, t, info) {
  const M = mood('night'); backdrop(g, [shade(M.sky[0], -0.34), shade(M.sky[1], -0.44)]);
  const cx = E.W / 2, cy = E.H * 0.5;
  // a spreadsheet of rows filling in
  const rows = [['ՄԻՋՈՑԱՌՈՒՄ', '120,000 €'], ['ԳՈՎԱԶԱԴ', '−48,000 €'], ['ՎԱՐՁԱՏՐՈՒՄ', '−96,000 €'], ['ԵՐԵԽԱՆԵՐԻՆ', '−156,000 €']];
  const w = V(900, 780), h = V(500, 430), x0 = cx - w / 2, y0 = cy - h / 2;
  rr(g, x0, y0, w, h, 14); g.fillStyle = 'rgba(12,18,30,0.94)'; g.fill(); g.strokeStyle = alpha(CYAN, 0.3); g.lineWidth = 2.5; g.stroke();
  rows.forEach(([a, b], i) => {
    const k = clamp(spring(t - 0.15 - i * 0.22, 0, { freq: 2.3 })); if (k <= 0.01) return;
    const y = y0 + V(96, 83) + i * V(96, 83);
    g.save(); g.globalAlpha = k; g.translate((1 - k) * 40, 0);
    g.fillStyle = alpha('#ffffff', 0.06); g.fillRect(x0 + 24, y - V(34, 30), w - 48, V(68, 60));
    text(g, a, x0 + 60, y + 1, { size: V(32, 28), color: alpha('#cfe0ff', 0.9), font: FONTS.ui, weight: 900, align: 'left', spacing: 1 });
    text(g, b, x0 + w - 60, y + 1, { size: V(34, 30), color: alpha(b.startsWith('−') ? GOLD : '#e8eefc', 0.95), font: FONTS.ui, weight: 900, align: 'right' });
    g.restore();
  });
  text(g, 'ՎՃԱՐՈՒՄՆԵՐԻ ՀԱՇՎԵՏՎՈՒԹՅՈՒՆ', cx, y0 - V(50, 44), { size: V(38, 33), color: alpha('#e8f4ff', 0.9), font: FONTS.title, weight: 700, spacing: 5, alpha: clamp((t - 0.3) / 0.5) });
} });

// s152 — the numbers speak
registerShot('s152', { draw(g, t, info) {
  const M = mood('night'); backdrop(g, [shade(M.sky[0], -0.34), shade(M.sky[1], -0.44)]);
  const cx = E.W / 2, cy = E.H * 0.54;
  // money flowing to the wrong place, visualised as a river splitting
  const p = ease.inOut(prog(t, 0.2, 1.8));
  const x0 = -E.W * 0.05, x1 = E.W * 1.05, y = cy;
  // main flow
  g.save(); g.strokeStyle = alpha(GOLD, 0.75); g.lineWidth = 26; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x0, y); g.lineTo(lerp(x0, x1 * 0.55, p), y); g.stroke(); g.restore();
  // branch up to children (small)
  g.save(); g.strokeStyle = alpha(GOLD, 0.55); g.lineWidth = 12; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x1 * 0.55, y); g.lineTo(lerp(x1 * 0.55, x1 * 0.82, p), y - V(240, 208)); g.stroke(); g.restore();
  // branch down to private accounts (fat)
  g.save(); g.strokeStyle = alpha(LIE, 0.75); g.lineWidth = 44; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x1 * 0.55, y); g.lineTo(lerp(x1 * 0.55, x1 * 0.86, p), y + V(200, 172)); g.stroke(); g.restore();
  // labels
  text(g, 'ԵՐԵԽԱՆԵՐ', x1 * 0.82, y - V(300, 260), { size: V(38, 33), color: alpha(GOLD, 0.95), font: FONTS.ui, weight: 900, spacing: 4, alpha: clamp((t - 1.0) / 0.5) });
  text(g, 'ԱՆՀԱՅՏ ՀԱՇԻՎ', x1 * 0.86, y + V(260, 224), { size: V(38, 33), color: alpha(LIE_HI, 0.95), font: FONTS.ui, weight: 900, spacing: 3, alpha: clamp((t - 1.2) / 0.5) });
  text(g, 'ԹՎԵՐԸ ԽՈՍՈՒՄ ԵՆ', E.W / 2, E.H * 0.14, { size: V(52, 45), color: alpha('#f2ecff', 0.95), font: FONTS.title, weight: 700, spacing: 7, alpha: clamp((t - 0.5) / 0.5) });
} });

// s153 — Black tries to explain it away
registerShot('s153', { draw(g, t, info) {
  const cam = camAdd(camPath(t, [[0, { z: 1.22, x: 30 }], [info.dur, { z: 1.3, x: 6 }]], { endEase: 0.3 }), drift(t, 2.2, 17));
  SET.gala(g, t, cam, { mood: 'night' });
  const gy = G(), M = mood('night');
  layer(g, cam, 1, (g) => {
    fig(g, { x: E.W * 0.5, y: gy, s: V(1.7, 1.74), facing: 1, outfit: BLACK, pose: breathe(posesAt(t, [[0, POSES.explain], [1.0, POSES.shrug], [2.0, POSES.facepalm]], 0.55), t, 1, 2), expr: (tt) => tt > 1.6 ? 'worried' : 'smile', talk: talkAmount(info.globalT), rim: { color: '#9fd8ff', dir: [0.4, -1], w: 5 }, blink: blink(t, 2) });
    talkGlyph(g, t, E.W * 0.5, gy - 500, { t0: 0.3, lieAt: 1.2, s: V(46, 42), seed: 153 });
  });
  FX.dust(g, t, { count: 26, color: '#9fb6d8', a: 0.18 });
} });

// s154 — this time he's only saving himself
registerShot('s154', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.42), shade(M.sky[1], -0.52)]);
  const cx = E.W / 2, cy = E.H * 0.59;
  const k = clamp(spring(t - 0.1, 0, { freq: 2.2, damp: 0.62 }));
  glow(g, cx, cy + V(20, 17), V(760, 660), '#c8b06a', 0.16);
  // a crowd below, looking up
  for (let i = 0; i < 22; i++) {
    const x = E.W * (0.05 + (i % 11) * 0.09) + (i > 10 ? V(46, 40) : 0), y = E.H * (i > 10 ? 0.95 : 0.99);
    g.save(); g.globalAlpha = 0.5 + (i % 3) * 0.08;
    fig(g, { x, y, s: V(0.62, 0.58), facing: 1, outfit: { top: 'coat', color: i % 2 ? '#2a3244' : '#343c50' }, pose: POSES.stand, expr: 'neutral', rim: false, shadow: false, blink: 0, dim: true });
    g.restore();
  }
  g.save(); g.globalAlpha = k;
  // the melting platform
  poly(g, [[cx - V(300, 258), cy + V(36, 31)], [cx + V(300, 258), cy + V(36, 31)], [cx + V(226, 194), cy + V(186, 160)], [cx - V(226, 194), cy + V(186, 160)]], alpha('#3a4460', 0.96));
  g.strokeStyle = alpha(GOLD, 0.3); g.lineWidth = 3; poly(g, [[cx - V(300, 258), cy + V(36, 31)], [cx + V(300, 258), cy + V(36, 31)]], alpha(GOLD, 0.45));
  // drips
  for (let i = 0; i < 7; i++) {
    const dx = cx - V(240, 206) + i * V(80, 68), dl = ((t * 0.6 + i * 0.13) % 1);
    rr(g, dx, cy + V(180, 154) + dl * V(90, 78), V(12, 10), V(40, 34), V(6, 5)); g.fillStyle = alpha('#4a5470', 0.6 * (1 - dl)); g.fill();
  }
  fig(g, { x: cx, y: cy + V(36, 31), s: V(1.78, 1.7), facing: 1, outfit: BLACK, pose: posesAt(t, [[0, POSES.explain], [1.4, POSES.reach]], 0.6), expr: 'worried', rim: { color: LIE, dir: [0, -1], w: 6 } });
  g.restore();
  // the glyph under him, cracking
  const kk = clamp(spring(t - 0.7, 0, { freq: 2.3 }));
  glyph(g, cx, cy + V(296, 257), { state: 'lie', s: V(58, 51), k: kk, a: 0.95, ring: clamp((t - 0.7) / 1.0) });
  text(g, 'ԱՅՍ ԱՆԳԱՄ ՆԱ ՓՐԿՈՒՄ Է ԻՐԵՆ', E.W / 2, E.H * 0.085, { size: V(44, 38), color: alpha(LIE_HI, 0.96), font: FONTS.title, weight: 700, spacing: 3, glow: 18, glowColor: alpha(LIE, 0.45), alpha: clamp((t - 0.9) / 0.45) });
} });

// s155 — people leave, some angry
registerShot('s155', { draw(g, t, info) {
  const cam = camAdd(camPath(t, [[0, { z: 1.08, x: 0 }], [info.dur, { z: 1.16, x: 0 }]], { endEase: 0.3 }), drift(t, 2.4, 18));
  SET.gala(g, t, cam, { mood: 'night' });
  const r = rng(155), gy = G();
  const p = ease.inOut(prog(t, 0.1, 2.2));
  layer(g, cam, 1, (g) => {
    // nearest figures first so the crowd reads as a mass leaving
    for (let i = 11; i >= 0; i--) {
      const dir = i % 2 ? 1 : -1, depth = (i % 3);
      const x0 = E.W * (0.5 + (i - 5.5) * 0.085);
      const x = x0 + dir * p * E.W * 0.42;
      const sc2 = V(1.5, 1.55) - depth * V(0.16, 0.14);
      const yb = gy + depth * V(26, 22) - V(10, 0);
      g.save(); g.globalAlpha = 1 - depth * 0.22;
      fig(g, { x, y: yb, s: sc2, facing: dir, outfit: { top: i % 2 ? 'tshirt' : 'dress', color: ['#3a4460', '#4a3a4a', '#2f4a44', '#4a4258'][i % 4] }, pose: POSES.stand, expr: i % 3 === 0 ? 'angry' : 'sad', rim: { color: '#9fb6d8', dir: [-dir * 0.4, -1], w: 3.4 }, dim: depth > 0, shadow: false });
      g.restore();
    }
  });
  text(g, 'ՈՄԱՆՔ ԶԱՅՐԱՑԱԾ ԵՆ', E.W * 0.27, E.H * 0.075, { size: V(38, 33), color: alpha(LIE_HI, 0.9), font: FONTS.ui, weight: 900, spacing: 4, alpha: clamp((t - 1.0) / 0.5) });
  text(g, 'ՈՄԱՆՔ՝ ՀԻԱՍԹԱՓՎԱԾ', E.W * 0.73, E.H * 0.075, { size: V(38, 33), color: alpha('#9fb6d8', 0.9), font: FONTS.ui, weight: 900, spacing: 4, alpha: clamp((t - 1.4) / 0.5) });
} });

// s156 — a small group thanks you
registerShot('s156', { draw(g, t, info) {
  const cam = camAdd(camPath(t, [[0, { z: 1.2, x: 0 }], [info.dur, { z: 1.3, x: 0 }]], { endEase: 0.3 }), drift(t, 2.2, 19));
  SET.gala(g, t, cam, { mood: 'night' });
  const gy = G(), M = mood('night');
  layer(g, cam, 1, (g) => {
    fig(g, { x: E.W * 0.5, y: gy, s: V(1.6, 1.64), facing: 1, outfit: YOU, pose: breathe(POSES.stand, t, 0.8, 1), expr: 'sad', rim: { color: M.practical, dir: [0.4, -1], w: 5 } });
    for (let i = 0; i < 4; i++) {
      fig(g, { x: E.W * (0.2 + i * 0.1), y: gy + V(34, 30) - i * 4, s: V(1.42, 1.46) - i * 0.05, facing: 1, outfit: { top: i % 2 ? 'dress' : 'tshirt', color: ['#4a4258', '#3a4460', '#4a3a4a', '#2f4a44'][i] }, pose: posesAt(t, [[0, POSES.relaxed], [1.0, POSES.cheer]], 0.6), expr: 'happy', rim: { color: M.practical, dir: [0.4, -1], w: 3.4 }, shadow: false });
    }
  });
  goldThread(g, t, [[E.W * 0.2, gy - V(470, 432)], [E.W * 0.3, gy - V(452, 416)], [E.W * 0.4, gy - V(470, 432)]], { p: ease.inOut(prog(t, 0.8, 1.8)), w: 2.6, a: 0.6 });
  text(g, 'ՇՆՈՐՀԱԿԱԼՈՒԹՅՈՒՆ', E.W / 2, E.H * 0.1, { size: V(40, 35), color: alpha(GOLD, 0.9), font: FONTS.ui, weight: 900, spacing: 6, alpha: clamp((t - 0.9) / 0.5) });
} });

// s157 — but you don't taste victory
registerShot('s157', faceShot({ who: YOU, expr: 'sad', mood: 'night', set: gala, r: V(330, 350), cy: 0.55, veilA: 0.5, bgX: 80,
  after: (g, t, info, { cx, cy, r }) => {
    const k = clamp(spring(t - 0.6, 0, { freq: 1.9 }));
    if (k <= 0) return;
    for (let i = 0; i < 3; i++) { const ph = (t * 0.35 + i / 3) % 1; ring(g, cx, cy, r * (1.1 + ph * 1.4), 3 * (1 - ph), alpha('#9fb6d8', 0.3 * (1 - ph))); }
    text(g, 'ՈՉ ՄԻ ՀԱՂԹԱՆԱԿԻ ՀԱՄ', cx, E.H * 0.13, { size: V(40, 35), color: alpha('#e8f0ff', 0.9), font: FONTS.title, weight: 700, spacing: 5, alpha: clamp((t - 1.0) / 0.5) });
  } }));

// s158 — truth just gives people a choice
registerShot('s158', statement({ lines: ['ՃՇՄԱՐՏՈՒԹՅՈՒՆԸ', 'ԸՆՏՐՈՒԹՅԱՆ ՀՆԱՐԱՎՈՐՈՒԹՅՈՒՆ Է ՏԱԼԻՍ'], hi: 1, size: V(56, 48), y: 0.48, color: GOLD_HI,
  behind: (g, t) => {
    const k = clamp(spring(t - 0.4, 0, { freq: 1.8 }));
    if (k <= 0) return;
    g.save(); g.globalAlpha = 0.45 * k;
    // many small doors along a line
    for (let i = 0; i < 7; i++) {
      const x = E.W * (0.1 + i * 0.133), dw2 = V(96, 84), dh3 = V(190, 166), y2 = E.H * 0.66;
      rr(g, x - dw2 / 2, y2, dw2, dh3, 8);
      g.fillStyle = alpha(i === 3 ? GOLD : '#0d1320', i === 3 ? 0.16 : 0.55); g.fill();
      g.strokeStyle = alpha(i === 3 ? GOLD : '#5a6a8a', i === 3 ? 0.95 : 0.5); g.lineWidth = i === 3 ? 4 : 3; g.stroke();
      if (i === 3) glow(g, x, y2 + dh3 / 2, V(260, 220), GOLD, 0.16);
    }
    g.restore();
  } }));
