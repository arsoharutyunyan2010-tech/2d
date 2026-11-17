// a2_mia.js — s092–s111: the first big mistake (Mia), and the price of always knowing.
import { E, V, mood, clamp, lerp, ease, prog, rng, alpha, shade, mix, seg, circle, ring, poly, rr, linGrad, glow, text, layer, backdrop, FONTS, registerShot, talkAmount } from '/engine/core.js';
import { POSES, posesAt, breathe, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as SET from '../sets/room.js';
import { YOU, MOM, LEO, MIA, BRO, BLACK, SELL, CROWD } from '../cast.js';
import { glyph, talkGlyph, goldThread, sparkBurst, cracks, frozenAir, wordPop, fig, blink, GOLD, GOLD_HI, LIE, LIE_HI, CYAN } from '../fx_truth.js';
import { camAdd, camPath, drift, spring } from '/engine/motion.js';
import { faceShot, insertShot } from '../lib.js';
import { pair, solo, panel, statement, grid, nameCard } from '../beat.js';

const room = (g, t, cam) => SET.hangout(g, t, cam, { mood: 'dusk' });
const night = (g, t, cam) => SET.street(g, t, cam, { mood: 'night' });
const bed = (g, t, cam) => SET.bedroom(g, t, cam, { mood: 'interiorCool' });

// s092 — the first big mistake
registerShot('s092', statement({ lines: ['ԵՎ ԱՀԱ', 'ՔՈ ԱՌԱՋԻՆ ՄԵԾ ՍԽԱԼԸ'], hi: 1, size: V(68, 58), color: LIE_HI, y: 0.5,
}));

// s093 — Mia says she loves you
registerShot('s093', { draw(g, t, info) {
  const cam = camAdd(camPath(t, [[0, { z: 1.22, x: 20 }], [info.dur, { z: 1.34, x: -10 }]], { endEase: 0.3 }), drift(t, 2.6, 8));
  const M = SET.hangout(g, t, cam, { mood: 'dusk', seatScale: V(1.66, 1.7) }); const se = M.seats, gy = SET.GY(), sc = V(1.66, 1.7);
  layer(g, cam, 1, (g) => {
    fig(g, { x: se.x[1], y: gy, s: sc, facing: 1, outfit: YOU, pose: breathe(POSES.sitBack, t, 0.7, 1), expr: 'neutral', rim: { color: M.M.rim, dir: [0.4, -1], w: 4.6 }, shadow: false });
    fig(g, { x: se.x[2], y: gy, s: sc * 0.96, facing: -1, outfit: MIA, pose: breathe(POSES.sit, t, 1, 2), expr: 'smile', talk: talkAmount(info.globalT), rim: { color: M.M.rim, dir: [-0.4, -1], w: 4.8 }, shadow: false, blink: blink(t, 2) });
    const hp = headPos({ x: se.x[2], y: gy, s: sc * 0.96, facing: -1, pose: POSES.sit });
    talkGlyph(g, t, hp[0] - 6, hp[1] - hp[2] * 2.1, { t0: 0.45, lieAt: 1.5, s: V(44, 40), seed: 93 });
  });
}});

// s094 — you feel she isn't honest
registerShot('s094', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.42), shade(M.sky[1], -0.52)]);
  const cx = E.W / 2, cy = E.H * 0.46;
  // a heart drawn in one stroke, then a crack through it
  const p = ease.inOut(prog(t, 0.2, 1.3));
  const heart = (k) => { const pts = []; for (let i = 0; i <= 60 * k; i++) { const a = (i / 60) * Math.PI * 2; const x = 16 * Math.pow(Math.sin(a), 3), y = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)); pts.push([cx + x * V(13, 11), cy + y * V(13, 11)]); } return pts; };
  const hp = heart(p);
  g.strokeStyle = alpha(MIA.color, 0.95); g.lineWidth = 9; g.lineJoin = 'round'; g.lineCap = 'round'; g.beginPath();
  hp.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke();
  glow(g, cx, cy, V(340, 300), MIA.color, 0.12);
  const k = clamp(spring(t - 1.1, 0, { freq: 2.4 }));
  if (k > 0) { cracks(g, cx, cy, { p: clamp((t - 1.1) / 1.2), n: 10, len: V(260, 230), color: LIE_HI, a: 0.6 * k, seed: 94 }); glyph(g, cx + V(230, 200), cy - V(150, 130), { state: 'lie', s: V(50, 44), k, ring: clamp((t - 1.1) / 1.0) }); }
  text(g, '«ՍԻՐՈՒՄ ԵՄ ՔԵԶ»', cx, cy + V(250, 216), { size: V(44, 38), color: alpha('#e8d8f0', 0.9 * p), font: FONTS.title, weight: 700, spacing: 4 });
}});

// s095 — you leave
registerShot('s095', solo({ set: night, mood: 'night', z0: 1.1, z1: 1.0, x0: -30, x1: 30, s: V(1.35, 1.4), dustColor: '#9fb6d8', dustCount: 24,
  f: { x: 0.62, who: YOU, facing: 1, pose: (t) => posesAt(t, [[0, POSES.stand], [0.3, POSES.relaxed]], 0.4), expr: (t) => t > 0.6 ? 'sad' : 'neutral' },
  after: (g, t, info) => {
    // her silhouette left behind, small and still
    fig(g, { x: E.W * 0.26, y: SET.GY(), s: V(0.9, 0.94), facing: 1, outfit: MIA, pose: POSES.stand, expr: 'sad', rim: { color: '#6a7a9a', dir: [0.4, -1], w: 3 }, dim: true, alpha: 0.55 * clamp(1.4 - t * 0.4), shadow: false });
}}));

// s096 — days later you learn she was scared
registerShot('s096', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.44), shade(M.sky[1], -0.54)]);
  const cx = E.W / 2, cy = E.H * 0.46;
  text(g, 'ՄԻ ՔԱՆԻ ՕՐ ԱՆՑ', E.W / 2, E.H * 0.14, { size: V(34, 30), color: alpha('#9fb6d8', 0.85), font: FONTS.ui, weight: 900, spacing: 7 });
  // one calendar page, days crossed off one by one
  const cw = V(430, 372), chh = V(470, 408), cxl = E.W * 0.26;
  const k0 = clamp(spring(t - 0.12, 0, { freq: 2 }));
  g.save(); g.globalAlpha = k0; g.translate(cxl, cy);
  rr(g, -cw / 2 + 14, -chh / 2 + 14, cw, chh, 18); g.fillStyle = alpha('#0a0f1a', 0.9); g.fill();
  rr(g, -cw / 2, -chh / 2, cw, chh, 18); g.fillStyle = '#f2eef8'; g.fill();
  g.fillStyle = alpha('#8a4a6a', 0.75); g.fillRect(-cw / 2, -chh / 2, cw, V(84, 73));
  text(g, 'ՕՐԵՐ', 0, -chh / 2 + V(42, 36), { size: V(34, 30), color: alpha('#ffffff', 0.95), font: FONTS.ui, weight: 900, spacing: 8 });
  for (let r2 = 0; r2 < 3; r2++) for (let c2 = 0; c2 < 4; c2++) {
    const i = r2 * 4 + c2, x = -cw / 2 + V(66, 57) + c2 * V(98, 85), y = -chh / 2 + V(150, 130) + r2 * V(96, 83);
    const on = clamp(spring(t - 0.5 - i * 0.1, 0, { freq: 2.4 }));
    g.save(); g.globalAlpha = 0.85;
    seg(g, [[x - V(30, 26), y], [x + V(30, 26), y]], 4, alpha('#3a2a44', 0.18));
    if (on > 0) seg(g, [[x - V(34, 30), y + V(4, 3)], [x + V(34, 30), y - V(4, 3)]], 7, alpha(LIE, 0.85 * on));
    g.restore();
  }
  g.restore();
  const k2 = clamp(spring(t - 0.9, 0, { freq: 2 }));
  g.save(); g.globalAlpha = k2;
  text(g, 'ՎԱԽԵՑԵԼ', E.W * 0.7, cy - V(50, 44), { size: V(104, 90), color: alpha('#f2e6fa', 0.96), font: FONTS.title, weight: 700, spacing: 3, glow: 30, glowColor: alpha(MIA.color, 0.5) });
  text(g, 'ԷՐ', E.W * 0.7, cy + V(80, 70), { size: V(104, 90), color: alpha(MIA.color, 0.95), font: FONTS.title, weight: 700, spacing: 6 });
  g.restore();
}});

// s097 — she didn't understand her own feelings
registerShot('s097', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.42), shade(M.sky[1], -0.52)]);
  const cx = E.W / 2, cy = E.H * 0.5;
  // a tangle of thread: nobody can read it, not even her
  const r = rng(97); g.strokeStyle = alpha(MIA.color, 0.6); g.lineWidth = 5; g.lineCap = 'round';
  for (let pass2 = 0; pass2 < 3; pass2++) {
    g.beginPath();
    for (let i = 0; i <= 160; i++) { const u = i / 160, a = u * Math.PI * (5.4 + pass2 * 1.6) + pass2; const rad = V(210, 180) + Math.sin(u * 9 + pass2) * V(120, 100); const x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad * 0.8; i ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.strokeStyle = alpha(MIA.color, 0.34 - pass2 * 0.08); g.lineWidth = 5 - pass2; g.stroke();
  }
  glow(g, cx, cy, V(520, 440), MIA.color, 0.12);
  fig(g, { x: cx, y: cy + V(150, 130), s: V(1.15, 1.1), facing: 1, outfit: MIA, pose: POSES.sad, expr: 'sad', rim: { color: '#a890b8', dir: [0, -1], w: 3.6 }, shadow: false });
  const k = clamp(spring(t - 0.8, 0, { freq: 2 }));
  glyph(g, cx + V(400, 346), cy - V(110, 96), { state: 'question', s: V(76, 66), k, a: 0.95 });
  text(g, 'ԻՆՔԸ ՉԷՐ ՀԱՍԿԱՆՈՒՄ', E.W / 2, E.H * 0.85, { size: V(42, 36), color: alpha('#e8d8f0', 0.9), font: FONTS.title, weight: 700, spacing: 4, alpha: clamp((t - 1.1) / 0.5) });
}});

// s099 — she didn't know what she was feeling: two of her, back to back
registerShot('s099', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.38), shade(M.sky[1], -0.48)]);
  const cx = E.W / 2, cy = E.H * 0.6, s = V(2.15, 2.05);
  const k1 = clamp(spring(t - 0.05, 0, { freq: 2.4, damp: 0.62 }));
  const k2 = clamp(spring(t - 0.3, 0, { freq: 2.4, damp: 0.62 }));
  // pool of light so they don't sink into the dark
  glow(g, cx, cy - V(90, 78), V(520, 450), '#b98fd0', 0.14);
  glow(g, cx, cy - V(90, 78), V(300, 260), '#e8d8f0', 0.10);
  g.save(); g.globalAlpha = k1; g.translate(cx - V(150, 130), cy + V(60, 52)); g.scale(k1, k1); g.translate(-(cx - V(150, 130)), -(cy + V(60, 52)));
  fig(g, { x: cx - V(150, 130), y: cy + V(60, 52), s, facing: 1, outfit: MIA, pose: POSES.sad, expr: 'sad', rim: { color: '#b594cc', dir: [0.5, -1], w: 6 }, shadow: true }); g.restore();
  g.save(); g.globalAlpha = k2; g.translate(cx + V(150, 130), cy + V(60, 52)); g.scale(k2, k2); g.translate(-(cx + V(150, 130)), -(cy + V(60, 52)));
  fig(g, { x: cx + V(150, 130), y: cy + V(60, 52), s, facing: -1, outfit: MIA, pose: POSES.relaxed, expr: 'hopeful', rim: { color: MIA.color, dir: [-0.5, -1], w: 6 }, shadow: true }); g.restore();
  // a seam of light between them
  g.save(); g.globalAlpha = clamp((t - 0.7) / 0.6);
  g.fillStyle = linGrad(g, cx, 0, cx, E.H, [alpha('#f2e6fa', 0), alpha('#e8d8f0', 0.6), alpha('#f2e6fa', 0)]);
  g.fillRect(cx - V(3, 2.6), E.H * 0.14, V(6, 5), E.H * 0.66);
  g.restore();
  text(g, 'ՉԻ ՀԱՍԿԱՆՈՒՄ ԻՐ ԶԳԱՑՄՈՒՆՔՆԵՐԸ', cx, E.H * 0.885, { size: V(42, 37), color: alpha('#f2e6fa', 0.95), font: FONTS.title, weight: 700, spacing: 3, glow: 18, glowColor: alpha('#b98fd0', 0.5), alpha: clamp((t - 0.9) / 0.5) });
}});

// s098 — she wasn't lying on purpose
registerShot('s098', statement({ lines: ['ՆԱ ՔԵԶ ՉԷՐ ԽԱԲՈՒՄ', 'ԴԻՏԱՎՈՐՅԱԼ'], hi: 1, size: V(66, 56), y: 0.5, color: '#e8d8f0',
}));

// s100 — the power works on lies, not on people
registerShot('s100', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.44), shade(M.sky[1], -0.54)]);
  const cx = E.W / 2, cy = E.H * 0.48;
  // left: clean binary glyphs; right: a soft, unresolved human shape
  for (let i = 0; i < 6; i++) { const k = clamp(spring(t - 0.1 - i * 0.09, 0, { freq: 2.4 })); glyph(g, cx - V(600, 520) + (i % 3) * V(120, 104), cy - V(100, 88) + Math.floor(i / 3) * V(150, 130), { state: i % 2 ? 'truth' : 'lie', s: V(34, 30), k, a: 0.8, seed: 100 + i }); }
  seg(g, [[cx - V(380, 326), cy - V(260, 222)], [cx - V(380, 326), cy + V(260, 222)]], 2.5, alpha('#5a6a8a', 0.4));
  // human blob made of overlapping soft circles
  const kk = clamp(spring(t - 0.6, 0, { freq: 2 }));
  g.save(); g.globalAlpha = kk * 0.85;
  for (let i = 0; i < 16; i++) { const a = i * 2.3, rad = V(190, 164) + Math.sin(i * 1.7) * V(110, 94); circle(g, cx + V(300, 260) + Math.cos(a) * rad, cy + Math.sin(a) * rad * 0.8, V(86, 74), alpha(mix(MIA.color, '#ffffff', 0.1), 0.09)); }
  fig(g, { x: cx + V(300, 260), y: cy + V(210, 182), s: V(1.45, 1.4), facing: 1, outfit: MIA, pose: POSES.sad, expr: 'sad', rim: { color: '#8a7aa0', dir: [0, -1], w: 3.6 }, shadow: false });
  g.restore();
  text(g, 'ՍՏԵՐ', cx - V(460, 396), cy + V(230, 200), { size: V(34, 30), color: alpha('#9fb6d8', 0.8), font: FONTS.ui, weight: 900, spacing: 6 });
  text(g, 'ՄԱՐԴԻԿ', cx + V(300, 260), cy + V(290, 250), { size: V(34, 30), color: alpha('#e8d8f0', 0.85), font: FONTS.ui, weight: 900, spacing: 6 });
}});

// s101 — and the price?
registerShot('s101', statement({ lines: ['ԻՍԿ ԳԻՆԸ՞'], hi: 0, size: V(96, 82), y: 0.5, color: GOLD_HI, behind: (g, t) => {
  const k = clamp(spring(t - 0.35, 0, { freq: 1.9 }));
  g.save(); g.globalAlpha = 0.9 * k; g.translate(E.W / 2, E.H * 0.76);
  // a price tag hanging on a string
  seg(g, [[0, -V(150, 130)], [-V(40, 35), -V(50, 44)]], 4, alpha('#9fb6d8', 0.55));
  g.translate(-V(150, 130), V(10, 8)); g.rotate(-0.14);
  rr(g, -V(130, 113), -V(66, 57), V(260, 226), V(132, 115), 18); g.fillStyle = alpha('#1a2234', 0.96); g.fill(); g.strokeStyle = alpha(GOLD, 0.6); g.lineWidth = 3; g.stroke();
  circle(g, -V(104, 90), 0, V(9, 8), alpha('#0a0f1a', 1)); ring(g, -V(104, 90), 0, V(9, 8), 3, alpha(GOLD, 0.7));
  seg(g, [[-V(76, 66), 0], [V(104, 90), 0]], 4, alpha('#9fb6d8', 0.45));
  g.restore();
} }));

// s102 — you can't hear a compliment
registerShot('s102', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.44), shade(M.sky[1], -0.54)]);
  const cx = E.W / 2, cy = E.H * 0.44;
  // a compliment bubble arriving, then converting into a percentage
  const k = clamp(spring(t - 0.15, 0, { freq: 2.2 }));
  g.save(); g.globalAlpha = k; g.translate(cx - V(60, 52), cy - V(70, 60)); g.scale(k, k);
  rr(g, -V(420, 364), -V(90, 78), V(840, 728), V(180, 156), 30); g.fillStyle = 'rgba(14,20,34,0.92)'; g.fill(); g.strokeStyle = alpha(CYAN, 0.3); g.lineWidth = 2.5; g.stroke();
  text(g, '«ԴՈՒ ՀԻԱՆԱԼԻ ԵՍ»', 0, 4, { size: V(62, 54), color: alpha('#e8eefc', 0.94), font: FONTS.ui, weight: 900 });
  g.restore();
  // the meter that measures sincerity
  const p = ease.inOut(prog(t, 0.7, 2.0));
  const mx = cx - V(380, 330), my = cy + V(150, 130), mw = V(760, 660);
  rr(g, mx, my, mw, 38, 19); g.fillStyle = alpha('#2a3244', 0.95); g.fill();
  rr(g, mx, my, mw * p, 38, 19); g.fillStyle = alpha(GOLD, 0.9); g.fill();
  const kk = clamp(spring(t - 1.4, 0, { freq: 2.2 }));
  g.save(); g.globalAlpha = kk; text(g, '88%', mx + mw + V(74, 64), my + 20, { size: V(56, 48), color: GOLD_HI, font: FONTS.ui, weight: 900, glow: 18, glowColor: alpha(GOLD, 0.5) }); g.restore();
  text(g, 'ՈՐՔԱՆՈՎ Է ԱՆԿԵՂԾ', E.W / 2, my + V(90, 78), { size: V(34, 30), color: alpha('#9fb6d8', 0.85), font: FONTS.ui, weight: 900, spacing: 5, alpha: clamp((t - 1.5) / 0.5) });
}});

// s103 — "everything will be fine" can't be heard calmly
registerShot('s103', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.46), shade(M.sky[1], -0.56)]);
  const cx = E.W / 2, cy = E.H * 0.46;
  const k = clamp(spring(t - 0.1, 0, { freq: 2 }));
  g.save(); g.globalAlpha = k;
  text(g, '«ԱՄԵՆ ԻՆՉ ԼԱՎ ԿԼԻՆԻ»', cx, cy - V(20, 17), { size: V(76, 66), color: alpha('#e8eefc', 0.92), font: FONTS.ui, weight: 900, spacing: 1 });
  g.restore();
  // each word dissected by a scanning line
  const p = ease.inOut(prog(t, 0.5, 1.8));
  const x0 = cx - V(370, 320), x1 = cx + V(370, 320);
  const sy = cy - V(120, 104) - p * V(10, 8);
  seg(g, [[x0, sy], [x0 + (x1 - x0) * p, sy]], 4, alpha(LIE, 0.75));
  const kk = clamp(spring(t - 1.5, 0, { freq: 2.2 }));
  g.save(); g.globalAlpha = kk;
  for (let i = 0; i < 5; i++) { const x = x0 + i * (x1 - x0) / 5; glyph(g, x + V(52, 45), sy - V(58, 50), { state: 'question', s: V(34, 30), k: kk, a: 0.7, seed: 103 + i }); }
  // brackets around each word
  g.restore();
  text(g, 'ՉԵՍ ԿԱՐՈՂ ՊԱՐԶԱՊԵՍ ՀԱՆԳԻՍՏ ԱՆԵԼ', E.W / 2, E.H * 0.86, { size: V(46, 40), color: alpha('#cfe0ff', 0.88), font: FONTS.title, weight: 700, spacing: 3, alpha: kk });
}});

// s104 — you can't just be happy when someone smiles
registerShot('s104', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.44), shade(M.sky[1], -0.54)]);
  const cx = E.W / 2, cy = E.H * 0.5;
  // a row of smiles, each with a truth meter under it
  const vals = [0.94, 0.42, 0.71, 0.18, 0.63];
  vals.forEach((v, i) => {
    const x = cx - V(580, 500) + i * V(290, 250), y = cy - V(40, 34);
    const k = clamp(spring(t - 0.1 - i * 0.1, 0, { freq: 2.2 })); if (k <= 0) return;
    g.save(); g.globalAlpha = k; g.translate(x, y); g.scale(k * V(1, 0.95), k);
    // a minimal smile
    g.strokeStyle = alpha('#e8eefc', 0.9); g.lineWidth = 7; g.lineCap = 'round';
    g.beginPath(); g.arc(0, -10, V(66, 57), 0.35, Math.PI - 0.35); g.stroke();
    circle(g, -V(34, 30), -V(48, 42), 7, alpha('#e8eefc', 0.85)); circle(g, V(34, 30), -V(48, 42), 7, alpha('#e8eefc', 0.85));
    g.restore();
    const kk = clamp(spring(t - 0.5 - i * 0.1, 0, { freq: 2.2 }));
    rr(g, x - V(88, 76), y + V(84, 72), V(176, 152), 14, 7); g.fillStyle = alpha('#2a3244', 0.9); g.fill();
    rr(g, x - V(88, 76), y + V(84, 72), V(176, 152) * v * kk, 14, 7); g.fillStyle = v > 0.7 ? alpha(GOLD, 0.9) : alpha(LIE, 0.85); g.fill();
    g.save(); g.globalAlpha = kk; text(g, Math.round(v * 100) + '%', x, y + V(144, 124), { size: V(30, 26), color: alpha('#cfe0ff', 0.75), font: FONTS.ui, weight: 900 }); g.restore();
  });
  text(g, 'Ո՞Ր ԺՊԻՏՆ Է ԻՐԱԿԱՆ', E.W / 2, E.H * 0.12, { size: V(42, 36), color: alpha('#cfe0ff', 0.9), font: FONTS.title, weight: 700, spacing: 5, alpha: clamp((t - 1.1) / 0.5) });
}});

// s105 — the brain scans every sentence
registerShot('s105', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.46), shade(M.sky[1], -0.56)]);
  const cx = E.W / 2, cy = E.H * 0.5;
  // a brain outline with lines of speech passing through it
  g.save(); g.translate(cx - V(340, 290), cy); g.scale(V(1, 0.96), V(1, 0.96));
  g.strokeStyle = alpha('#8fb8e8', 0.55); g.lineWidth = 5; g.lineCap = 'round';
  g.beginPath();
  for (let i = 0; i <= 100; i++) { const a = (i / 100) * Math.PI * 2; const r = V(150, 130) * (1 + Math.sin(a * 6) * 0.07); const x = Math.cos(a) * r, y = Math.sin(a) * r * 0.86; i ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.stroke();
  for (let i = 0; i < 7; i++) { const a = i * 1.2; const x = Math.cos(a) * V(90, 78), y = Math.sin(a) * V(80, 70); g.beginPath(); g.arc(x * 0.6, y * 0.6, V(38, 33), a, a + 2.1); g.stroke(); }
  g.restore();
  glow(g, cx - V(340, 290), cy, V(360, 310), '#8fb8e8', 0.12);
  // speech lines flowing in, with one flagged word
  for (let i = 0; i < 5; i++) {
    const y = cy - V(160, 138) + i * V(80, 69);
    const p = ease.out(prog(t, 0.2 + i * 0.12, 1.0 + i * 0.12));
    const x0 = cx - V(120, 104), x1 = cx + V(620, 540);
    rr(g, x0, y, (x1 - x0) * p, 16, 8); g.fillStyle = alpha('#3a4460', 0.8); g.fill();
    if (p > 0.5) { const kk = clamp(spring(t - 0.8 - i * 0.12, 0, { freq: 2.4 })); glyph(g, x0 + (x1 - x0) * 0.62, y - V(30, 26), { state: i % 2 ? 'question' : 'lie', s: V(18, 16), k: kk, a: 0.85, seed: 105 + i }); }
  }
  text(g, 'ՅՈՒՐԱՔԱՆՉՅՈՒՐ ՆԱԽԱԴԱՍՈՒԹՅՈՒՆ', E.W / 2, E.H * 0.88, { size: V(34, 30), color: alpha('#cfe0ff', 0.9), font: FONTS.ui, weight: 900, spacing: 4 });
}});

// s106 — but science reminds us of something else
registerShot('s106', { draw(g, t, info) {
  const M = mood('interiorCool'); backdrop(g, [shade(M.sky[0], -0.44), shade(M.sky[1], -0.54)]);
  const cx = E.W / 2, cy = E.H * 0.44;
  const k = clamp(spring(t - 0.15, 0, { freq: 2 }));
  g.save(); g.globalAlpha = k; g.translate(cx, cy + V(40, 34)); g.scale(V(1.5, 1.4), V(1.5, 1.4));
  g.strokeStyle = alpha('#8fe0ff', 0.95); g.lineWidth = 10; g.lineCap = 'round'; g.lineJoin = 'round'; g.fillStyle = alpha('#8fe0ff', 0.16);
  // stage
  rr(g, -170, 96, 340, 22, 8); g.fillStyle = alpha('#8fe0ff', 0.2); g.fill();
  // base foot
  seg(g, [[-96, 150], [96, 150]], 12, alpha('#8fe0ff', 0.95));
  seg(g, [[0, 96], [0, 150]], 12, alpha('#8fe0ff', 0.95));
  // arm
  seg(g, [[0, 60], [0, -52]], 12, alpha('#8fe0ff', 0.95));
  seg(g, [[0, -52], [-96, -52]], 12, alpha('#8fe0ff', 0.95));
  seg(g, [[-96, -52], [-96, 24]], 12, alpha('#8fe0ff', 0.95));
  // objective lens
  poly(g, [[-118, 24], [-74, 24], [-84, 66], [-108, 66]], alpha('#8fe0ff', 0.3));
  g.strokeStyle = alpha('#8fe0ff', 0.95); g.lineWidth = 6; g.stroke();
  // eyepiece
  g.save(); g.translate(0, -118); rr(g, -26, -62, 52, 74, 10); g.strokeStyle = alpha('#8fe0ff', 0.95); g.lineWidth = 8; g.stroke(); g.restore();
  // specimen glow on the stage
  glow(g, -96, 92, 120, CYAN, 0.4);
  g.restore();
  glow(g, cx, cy + V(40, 34), V(560, 470), CYAN, 0.10);
  text(g, 'ԳԻՏՈՒԹՅՈՒՆԸ ՀԻՇԵՑՆՈՒՄ Է', E.W / 2, E.H * 0.2, { size: V(48, 42), color: alpha('#e8f4ff', 0.95), font: FONTS.title, weight: 700, spacing: 4, alpha: clamp((t - 0.6) / 0.5) });
}});

// s107 — human memory isn't a recording
registerShot('s107', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.44), shade(M.sky[1], -0.54)]);
  const cx = E.W / 2, cy = E.H * 0.48;
  // a camcorder icon crossed out, replaced by a rebuilding grid
  const k = clamp(spring(t - 0.1, 0, { freq: 2 }));
  g.save(); g.globalAlpha = k; g.translate(cx - V(380, 330), cy);
  rr(g, -V(120, 104), -V(70, 61), V(210, 182), V(140, 122), 14); g.strokeStyle = alpha('#8fb8e8', 0.8); g.lineWidth = 6; g.stroke();
  circle(g, -V(60, 52), 0, V(36, 31), null); ring(g, -V(60, 52), 0, V(36, 31), 6, alpha('#8fb8e8', 0.8));
  poly(g, [[V(90, 78), -V(20, 17)], [V(160, 140), -V(56, 48)], [V(160, 140), V(56, 48)], [V(90, 78), V(20, 17)]], alpha('#8fb8e8', 0.7));
  // X over it
  const kx = clamp(spring(t - 0.6, 0, { freq: 2.4 }));
  g.save(); g.globalAlpha = kx; g.strokeStyle = LIE; g.lineWidth = 10; g.lineCap = 'round'; seg(g, [[-V(140, 122), -V(90, 78)], [V(180, 156), V(90, 78)]], 10, alpha(LIE, 0.9)); seg(g, [[V(180, 156), -V(90, 78)], [-V(140, 122), V(90, 78)]], 10, alpha(LIE, 0.9)); g.restore();
  g.restore();
  // mosaic rebuild
  const kk = clamp(spring(t - 1.0, 0, { freq: 2 }));
  const r = rng(107);
  for (let i = 0; i < 16; i++) {
    const gx = cx + V(200, 172) + (i % 4) * V(118, 102), gy2 = cy - V(180, 156) + Math.floor(i / 4) * V(118, 102);
    const k3 = clamp(spring(t - 1.0 - i * 0.06, 0, { freq: 2.4 }));
    g.save(); g.globalAlpha = k3 * 0.9; g.translate(gx, gy2); g.rotate((r() - 0.5) * 0.4); rr(g, -V(46, 40), -V(46, 40), V(92, 80), V(92, 80), 8); g.fillStyle = alpha(mix('#8fb8e8', '#ffffff', r() * 0.4), 0.16 + r() * 0.3); g.fill(); g.strokeStyle = alpha('#8fb8e8', 0.4); g.lineWidth = 2; g.stroke(); g.restore();
  }
  text(g, 'ՀԻՇՈՂՈՒԹՅՈՒՆԸ ՏԵՍԱԳՐՈՒԹՅՈՒՆ ՉԷ', E.W / 2, E.H * 0.9, { size: V(42, 36), color: alpha('#cfe0ff', 0.92), font: FONTS.title, weight: 700, spacing: 4, alpha: clamp((t - 1.2) / 0.5) });
}});

// s108 — it is rebuilt
registerShot('s108', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.46), shade(M.sky[1], -0.56)]);
  const cx = E.W / 2, cy = E.H * 0.5;
  // tiles snap into a portrait of a face, over and over
  const r = rng(108), cols = 11, rows = 7;
  for (let i = 0; i < cols * rows; i++) {
    const u = i % cols, v = Math.floor(i / cols);
    const nx = (u + 0.5) / cols - 0.5, ny = (v + 0.5) / rows - 0.5;
    // face mask: round skull + tapered jaw
    const faceW = 0.34 * (1 - Math.max(0, ny + 0.06) * 0.5), faceH = 0.40;
    const inFace = Math.abs(nx) < faceW && Math.abs(ny) < faceH && (ny < 0.18 || Math.abs(nx) < faceW * (1 - (ny - 0.18) * 1.1));
    const eyeL = Math.abs(nx + 0.115) < 0.075 && Math.abs(ny + 0.075) < 0.07;
    const eyeR = Math.abs(nx - 0.115) < 0.075 && Math.abs(ny + 0.075) < 0.07;
    const mouth = Math.abs(nx) < 0.10 && Math.abs(ny - 0.13) < 0.05;
    const k = clamp(spring(t - 0.1 - (i * 0.017), 0, { freq: 2.3 }));
    if (!inFace || k <= 0.01) continue;
    const x = cx + nx * V(960, 830), y = cy + ny * V(620, 540);
    g.save(); g.globalAlpha = k * (inFace ? 0.95 : 0.22);
    g.translate(x, y); g.rotate((r() - 0.5) * 0.5 * (1 - k));
    const sz = V(80, 70) * lerp(1.5, 1, k);
    rr(g, -sz / 2, -sz / 2, sz, sz, 6); g.fillStyle = (eyeL || eyeR || mouth) ? alpha('#0b1220', 0.92) : alpha(mix('#cfe6ff', GOLD, r() * 0.45), 0.85); g.fill();
    g.strokeStyle = alpha(CYAN, 0.3); g.lineWidth = 1.6; g.stroke();
    g.restore();
  }
  text(g, 'ԱՅՆ ՎԵՐԱԿԱՌՈՒՑՎՈՒՄ Է', E.W / 2, E.H * 0.9, { size: V(44, 38), color: alpha(GOLD_HI, 0.95), font: FONTS.title, weight: 700, spacing: 4, alpha: clamp((t - 0.8) / 0.5) });
}});

// s109 — someone honestly tells you something they remember wrong
registerShot('s109', pair({ set: (g, t, cam) => SET.street(g, t, cam, { mood: 'night' }), mood: 'night', z0: 1.2, z1: 1.28, x0: 10, x1: -14, s: V(1.5, 1.54), dustColor: '#9fb6d8', dustCount: 24,
  left: { x: 0.36, who: { top: 'tshirt', color: '#4a4258' }, pose: (t) => posesAt(t, [[0, POSES.explain], [1.2, POSES.reach]], 0.5), expr: 'neutral', talk: true, glyph: { t0: 0.4, state: 'truth', s: V(42, 38), seed: 109 } },
  right: { x: 0.66, who: YOU, pose: POSES.stand, expr: 'thinking' },
}));

// s110 — wrong information without lying
registerShot('s110', panel({ t0: 0.05, title: 'ԵՐԿՈՒ ՏԱՐԲԵՐ ԲԱՆ', accent: CYAN, line: CYAN, cy: 0.5, h: V(500, 440), rows: [
  { tag: 'Ճ', t: 'Մարդը մտադրաբար չի ստում', color: GOLD },
  { tag: 'X', t: 'Տեղեկությունը դեռ սխալ է', color: LIE },
]}));

// s111 — you know the words, not always reality
registerShot('s111', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.46), shade(M.sky[1], -0.56)]);
  const cx = E.W / 2, cy = E.H * 0.5;
  // a gold thread of sincerity that doesn't reach the objetive
  goldThread(g, t, [[cx - V(520, 450), cy - V(120, 104)], [cx - V(200, 170), cy + V(40, 34)], [cx + V(120, 104), cy - V(60, 52)], [cx + V(300, 260), cy + V(20, 17)]], { p: ease.inOut(prog(t, 0.1, 1.3)), w: 6, a: 0.9 });
  text(g, 'ԱՆԿԵՂԾՈՒԹՅՈՒՆ', cx - V(300, 260), cy - V(180, 156), { size: V(40, 34), color: alpha(GOLD, 0.95), font: FONTS.ui, weight: 900, spacing: 4, alpha: clamp((t - 0.5) / 0.5) });
  const k = clamp(spring(t - 1.0, 0, { freq: 2 }));
  g.save(); g.globalAlpha = k; g.strokeStyle = alpha('#5a6a8a', 0.6); g.setLineDash([12, 14]); g.lineWidth = 4; g.beginPath(); g.moveTo(cx + V(300, 260), cy + V(20, 17)); g.lineTo(cx + V(540, 470), cy - V(140, 120)); g.stroke(); g.restore();
  g.save(); g.globalAlpha = k; text(g, 'ԻՐԱԿԱՆՈՒԹՅՈՒՆ', cx + V(430, 372), cy - V(190, 164), { size: V(40, 34), color: alpha('#9fb6d8', 0.85), font: FONTS.ui, weight: 900, spacing: 4 }); g.restore();
  glyph(g, cx + V(300, 260), cy + V(20, 17), { state: 'question', s: V(40, 36), k, a: 0.9 });
}});
