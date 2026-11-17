// a2_mid.js — s053–s091: the street, the interview with Mr. Black, the bank scam, and the world that starts listening.
import { E, V, mood, clamp, lerp, ease, prog, rng, alpha, shade, mix, seg, circle, ring, poly, rr, linGrad, glow, text, layer, backdrop, FONTS, registerShot, talkAmount } from '/engine/core.js';
import { POSES, posesAt, breathe, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as SET from '../sets/room.js';
import { YOU, MOM, LEO, MIA, BRO, BLACK, SELL, CROWD } from '../cast.js';
import { glyph, talkGlyph, goldThread, sparkBurst, cracks, frozenAir, wordPop, fig, blink, GOLD, GOLD_HI, LIE, LIE_HI, CYAN } from '../fx_truth.js';
import { camAdd, spring } from '/engine/motion.js';
import { faceShot, insertShot, wideShot, ots, fgProp } from '../lib.js';
import { pair, solo, panel, statement, grid, nameCard } from '../beat.js';

const night = (g, t, cam) => SET.street(g, t, cam, { mood: 'night' });
const cool = (g, t, cam) => SET.office(g, t, cam, { mood: 'interiorCool' });
const bankSet = (g, t, cam) => SET.bank(g, t, cam, { mood: 'interiorCool' });

// s053 — the city starts speaking in glyphs
registerShot('s053', solo({ set: night, mood: 'night', z0: 1.05, z1: 1.14, x0: 0, x1: -24, s: V(1.05, 1.1), dustColor: '#9fb6d8', dustCount: 40,
  f: { x: 0.5, who: YOU, pose: POSES.relaxed, expr: 'neutral' },
  after: (g, t, info, { gy }) => {
    const r = rng(77);
    for (let i = 0; i < 10; i++) { const k = clamp(spring(t - 0.25 - i * 0.16, 0, { freq: 2.3 })); glyph(g, E.W * (0.06 + r() * 0.9), E.H * (0.14 + r() * 0.42), { state: i % 3 === 2 ? 'truth' : 'lie', s: V(24, 22), k, a: 0.6, seed: 60 + i }); }
}}));

// s054 — "I'm fine"
registerShot('s054', solo({ set: night, mood: 'night', z0: 1.24, z1: 1.34, x0: -20, x1: 20, s: V(1.5, 1.55), dustColor: '#9fb6d8', dustCount: 26,
  f: { x: 0.44, who: { top: 'tshirt', color: '#4a4258' }, pose: POSES.relaxed, expr: 'smile', talk: true, glyph: { t0: 0.3, lieAt: 0.85, s: V(46, 42), seed: 52 } },
  after: (g, t, info, { gy, sc }) => {
    const k = clamp(spring(t - 1.1, 0, { freq: 1.6 }));
    if (k > 0) fig(g, { x: E.W * 0.44, y: gy, s: sc, facing: 1, outfit: { top: 'tshirt', color: '#2a2a3a' }, pose: POSES.sad, expr: 'sad', rim: { color: '#5a6a9a', dir: [0.4, -1], w: 3.4 }, alpha: 0.44 * k, dim: true, shadow: false });
    const kk = clamp(spring(t - 0.4, 0, { freq: 2.2 }));
    g.save(); g.globalAlpha = kk; g.translate(E.W * 0.8, E.H * 0.34); g.scale(kk, kk);
    rr(g, -160, -58, 320, 116, 26); g.fillStyle = 'rgba(10,16,28,0.9)'; g.fill(); g.strokeStyle = alpha(LIE, 0.45); g.lineWidth = 2.5; g.stroke();
    text(g, '«լավ եմ»', 0, 4, { size: V(46, 40), color: alpha('#ffffff', 0.94), font: FONTS.ui, weight: 900 });
    g.restore();
}}));

// s055 — "I don't care" — and it's the opposite
registerShot('s055', solo({ set: night, mood: 'night', z0: 1.24, z1: 1.34, x0: 20, x1: -16, s: V(1.5, 1.55), dustColor: '#9fb6d8', dustCount: 26,
  f: { x: 0.56, who: { top: 'dress', color: '#5a4a6a' }, pose: (t) => posesAt(t, [[0, POSES.relaxed], [0.9, POSES.crossArms]], 0.45), expr: (t) => t > 0.95 ? 'angry' : 'smile', talk: true, facing: -1, glyph: { t0: 0.3, lieAt: 0.95, s: V(46, 42), seed: 54 } },
  after: (g, t, info, { gy }) => {
    const k = clamp(spring(t - 1.4, 0, { freq: 2.4 }));
    if (k > 0) cracks(g, E.W * 0.56, gy - 470, { p: clamp((t - 1.4) / 1.0), n: 7, len: 240, color: LIE_HI, a: 0.34 * k, seed: 3 });
    const kk = clamp(spring(t - 0.5, 0, { freq: 2.2 }));
    g.save(); g.globalAlpha = kk; g.translate(E.W * 0.2, E.H * 0.35); g.scale(kk, kk);
    rr(g, -200, -58, 400, 116, 26); g.fillStyle = 'rgba(10,16,28,0.9)'; g.fill(); g.strokeStyle = alpha(LIE, 0.45); g.lineWidth = 2.5; g.stroke();
    text(g, '«ինձ միևնույն է»', 0, 4, { size: V(36, 31), color: alpha('#ffffff', 0.94), font: FONTS.ui, weight: 900 });
    g.restore();
}}));

// s056 — words vs feelings
registerShot('s056', solo({ set: night, mood: 'night', z0: 1.18, z1: 1.26, x0: 0, x1: -14, s: V(1.62, 1.68), dustColor: '#9fb6d8', dustCount: 30,
  f: { x: 0.5, who: YOU, pose: (t) => posesAt(t, [[0, POSES.stand], [1.2, POSES.sad]], 0.6), expr: 'sad' },
  after: (g, t, info, { gy, sc }) => {
    const hp = headPos({ x: E.W * 0.5, y: gy, s: sc, facing: 1, pose: POSES.stand });
    glyph(g, hp[0] - 18, hp[1] - hp[2] * 1.2, { state: 'lie', s: hp[2] * 0.46, k: clamp(spring(t - 0.5, 0, { freq: 2.2 })), a: 0.92, seed: 56 });
    glyph(g, hp[0] + 22, hp[1] - hp[2] * 1.2, { state: 'truth', s: hp[2] * 0.42, k: clamp(spring(t - 0.8, 0, { freq: 2.2 })), a: 0.88, seed: 57 });
    wordPop(g, t, 'ԲԱՌԵՐ • ԶԳԱՑՄՈՒՆՔՆԵՐ', E.W / 2, E.H * 0.15, { t0: 1.0, size: V(48, 42), color: alpha('#cfe0ff', 0.92), spacing: 7 });
}}));

// s057 — the interview
registerShot('s057', { draw(g, t, info) {
  SET.office(g, t, { z: 1.0, x: 0 }, { mood: 'interiorCool' });
  const gy = SET.GY();
  layer(g, { z: 1, x: 0, y: 0 }, 1, (g) => {
    fig(g, { x: E.W * 0.3, y: gy, s: V(1.15, 1.2), facing: 1, outfit: YOU, pose: POSES.stand, expr: 'neutral', rim: { color: '#9fd8ff', dir: [0.4, -1], w: 4 }, dim: true });
    fig(g, { x: E.W * 0.62, y: gy, s: V(1.2, 1.25), facing: -1, outfit: BLACK, pose: POSES.crossArms, expr: 'neutral', rim: { color: '#9fd8ff', dir: [-0.4, -1], w: 4 }, dim: true });
  });
  wordPop(g, t, 'ԱՇԽԱՏԱՆՔԱՅԻՆ ՀԱՐՑԱԶՐՈՒՅՑ', E.W / 2, E.H * 0.12, { t0: 0.3, size: V(42, 38), color: alpha('#cfe0ff', 0.9), spacing: 6 });
}});

// s058 — Mr. Black
registerShot('s058', faceShot({ who: BLACK, expr: 'neutral', mood: 'interiorCool', set: cool, r: V(300, 320), cy: 0.5, veilA: 0.5, bgX: 40,
}));

// s059 — "we value honesty"
registerShot('s059', pair({ set: cool, z0: 1.2, z1: 1.3, x0: 10, x1: -30,
  left: { x: 0.34, who: YOU, pose: POSES.stand, expr: 'neutral', rimW: 4.4 },
  right: { x: 0.66, who: BLACK, pose: (tt) => posesAt(tt, [[0, POSES.crossArms], [1.0, POSES.explain]], 0.5), expr: 'smile', talk: true, glyph: { t0: 0.4, lieAt: 1.35, s: V(42, 38), seed: 71 } },
}));

// s060 — he only wants no questions about salaries
registerShot('s060', panel({ t0: 0.1, title: 'ԻՆՉ Է ԻՐԱԿԱՆՈՒՄ ԱՍՈՒՄ Է', accent: LIE, line: LIE_HI, rows: [
  { tag: 'ԱՍՈՒՄ Է', t: '«Մենք գնահատում ենք ազնվությունը»', color: GOLD },
  { tag: 'ՆՇԱՆԱԿԸ', t: 'Ոչ ոք չհարցնի աշխատավարձի մասին', color: LIE },
  { tag: 'ՃԻՇՏԸ', t: 'Ազնվությունը միակողմանի է', color: LIE_HI }],
}));

// s061 — "equal opportunities"
registerShot('s061', pair({ set: cool, z0: 1.24, z1: 1.32, x0: -10, x1: 20,
  right: { x: 0.64, who: BLACK, pose: (tt) => posesAt(tt, [[0, POSES.explain], [1.3, POSES.shrug]], 0.5), expr: 'smile', talk: true, glyph: { t0: 0.3, lieAt: 1.15, s: V(44, 40), seed: 72 } },
  left: { x: 0.32, who: YOU, pose: POSES.stand, expr: (t) => t > 1.2 ? 'smirk' : 'neutral' },
}));

// s062 — the decision was made before you asked
registerShot('s062', { draw(g, t, info) {
  const M = mood('interiorCool'); backdrop(g, [shade(M.sky[0], -0.38), shade(M.sky[1], -0.48)]);
  const cy = E.H * 0.585, x0 = E.W * 0.08, x1 = E.W * 0.92;
  // the strip
  rr(g, x0, cy - V(38, 33), x1 - x0, V(76, 66), V(38, 33)); g.fillStyle = 'rgba(16,24,40,0.78)'; g.fill();
  g.strokeStyle = alpha('#8fb8e8', 0.26); g.lineWidth = 2.5; g.stroke();
  const k0 = ease.out(prog(t, 0.05, 0.7));
  seg(g, [[x0, cy], [lerp(x0, x1, k0), cy]], V(6, 5), alpha('#8fb8e8', 0.5));
  for (let i = 0; i <= 16; i++) {
    const x = lerp(x0, x1, i / 16), on = i === 2;
    const k = clamp(spring(t - 0.05 - i * 0.03, 0, { freq: 2.7, damp: 0.6 }));
    if (k <= 0) continue;
    seg(g, [[x, cy - (on ? V(58, 50) : V(26, 23)) * k], [x, cy + (on ? V(58, 50) : V(26, 23)) * k]], on ? V(11, 9) : V(5, 4.4), on ? alpha(GOLD, 0.98) : alpha('#8fb8e8', 0.52));
    if (i % 4 === 0 && !on) text(g, String(2022 + i / 4), x, cy + V(92, 80), { size: V(24, 21), color: alpha('#8fb8e8', 0.5), font: FONTS.ui, weight: 800, alpha: k });
  }
  glow(g, lerp(x0, x1, 2 / 16), cy, V(230, 200), GOLD, 0.55);
  // the decision was already taken: a stamp lands
  const k = clamp(spring(t - 0.55, 0, { freq: 2.4, damp: 0.6 }));
  const drop = lerp(1.55, 1, k);
  g.save(); g.globalAlpha = clamp(k * 1.5); g.translate(lerp(x0, x1, 2 / 16), cy - V(168, 146)); g.rotate(-0.15); g.scale(drop, drop);
  rr(g, -V(196, 171), -V(58, 50), V(392, 342), V(116, 100), V(12, 10));
  g.fillStyle = alpha(LIE, 0.14); g.fill(); g.strokeStyle = alpha(LIE, 0.96); g.lineWidth = V(7, 6); g.stroke();
  text(g, 'ՈՐՈՇՎԱԾ', 0, 1, { size: V(54, 47), color: alpha(LIE, 0.98), font: FONTS.title, weight: 700, spacing: 3 });
  g.restore();
  glyph(g, E.W / 2, E.H * 0.19, { state: 'lie', s: V(50, 45), k: clamp(spring(t - 0.9, 0, { freq: 2.4 })), ring: clamp((t - 0.9) / 1.1) });
  text(g, 'ՈՐՈՇՈՒՄԸ ՎԱՂՈՒՑ ԿԱՅԱՑՎԱԾ Է', E.W / 2, E.H * 0.845, { size: V(46, 40), color: alpha('#cfe0ff', 0.94), font: FONTS.title, weight: 700, spacing: 6, glow: 16, glowColor: alpha('#8fb8e8', 0.35), alpha: clamp((t - 0.85) / 0.45) });
}});

// s063 — someone else is already chosen
registerShot('s063', { draw(g, t, info) {
  const M = mood('interiorCool'); backdrop(g, [shade(M.sky[0], -0.36), shade(M.sky[1], -0.46)]);
  const r = rng(88);
  for (let i = 0; i < 14; i++) {
    const cx = E.W * (0.12 + (i % 7) * 0.126), cyy = E.H * (0.36 + Math.floor(i / 7) * 0.28);
    const k = clamp(spring(t - 0.06 - i * 0.04, 0, { freq: 2.4, damp: 0.62 })); if (k <= 0) continue;
    const chosen = i === 4;
    g.save(); g.globalAlpha = chosen ? k : k * 0.72;
    circle(g, cx, cyy, V(62, 54) * k, chosen ? alpha(GOLD, 0.26) : alpha('#7f8fb0', 0.16));
    if (chosen) { glow(g, cx, cyy, V(210, 184), GOLD, 0.4); }
    fig(g, { x: cx, y: cyy + V(40, 35), s: chosen ? V(0.9, 0.84) : V(0.74, 0.7), facing: 1, outfit: chosen ? { top: 'suit', color: '#7a8aa8' } : { top: 'tshirt', color: '#465270' }, pose: POSES.stand, expr: 'neutral', rim: chosen ? { color: GOLD, dir: [0, -1], w: 4 } : false, shadow: false, blink: 0, dim: !chosen });
    g.restore();
    if (chosen) {
      const kk = clamp(spring(t - 0.5, 0, { freq: 2.2 }));
      g.save(); g.globalAlpha = kk; g.strokeStyle = alpha(GOLD, 0.85); g.lineWidth = V(4.5, 4);
      g.beginPath(); g.ellipse(cx, cyy + V(6, 5), V(72, 63) * (1 + kk * 0.14), V(116, 101) * (1 + kk * 0.14), 0, 0, Math.PI * 2); g.stroke();
      text(g, 'ԸՆՏՐՎԱԾ ԹԵԿՆԱԾՈՒ', E.W / 2, E.H * 0.115, { size: V(38, 33), color: GOLD, font: FONTS.title, weight: 700, spacing: 5, glow: 16, glowColor: alpha(GOLD, 0.45) });
      g.restore();
    }
  }
} });

// s064 — you smile: no glyph, nothing to catch
registerShot('s064', faceShot({ who: YOU, expr: (t) => (t > 0.35 ? 'smile' : 'neutral'), mood: 'interiorCool',
  set: cool, r: V(330, 350), cy: 0.54, veilA: 0.46, bgX: -40, seed: 4,
  after: (g, t, info, { cx, cy, r }) => {
    // the glyph tries to appear, can't find a lie, and fades
    const k = clamp((t - 0.6) / 1.1);
    if (k <= 0 || k >= 1) return;
    g.save(); g.globalAlpha = 0.55 * Math.sin(k * Math.PI);
    glyph(g, cx + r * 1.06, cy - r * 0.86, { state: 'hidden', s: r * 0.14, k: 0.5, a: 1 });
    g.restore();
  } }));

// s065 — "why invite me then?"
registerShot('s065', pair({ set: cool, z0: 1.26, z1: 1.36, x0: -16, x1: -40,
  left: { x: 0.32, who: YOU, pose: (tt) => posesAt(tt, [[0, POSES.stand], [0.7, POSES.point]], 0.45), expr: 'smirk', talk: true, glyph: { t0: 0.3, state: 'truth', s: V(38, 35), seed: 75 } },
  right: { x: 0.66, who: BLACK, pose: (tt) => posesAt(tt, [[0, POSES.crossArms], [1.4, POSES.facepalm]], 0.5), expr: (tt) => tt > 1.4 ? 'shocked' : 'neutral' },
}));

// s066 — he freezes
registerShot('s066', faceShot({ who: BLACK, expr: (t) => (t > 0.35 ? 'shocked' : 'neutral'), mood: 'interiorCool', set: cool, r: V(310, 330), cy: 0.5, veilA: 0.52, bgX: 30,
}));

// s067 — you don't get the job
registerShot('s067', { draw(g, t, info) {
  const M = mood('interiorCool'); backdrop(g, [shade(M.sky[0], -0.45), shade(M.sky[1], -0.55)]);
  const k = clamp(spring(t - 0.2, 0, { freq: 2.2 }));
  g.save(); g.globalAlpha = k;
  // rejection letter
  g.translate(E.W / 2, E.H * 0.48); g.rotate(-0.03); g.scale(lerp(0.92, 1, k), lerp(0.92, 1, k));
  g.fillStyle = '#eef0f6'; g.fillRect(-V(300, 260), -V(200, 180), V(600, 520), V(400, 360));
  g.fillStyle = alpha('#3a4460', 0.24); for (let i = 0; i < 7; i++) g.fillRect(-V(250, 214), -V(140, 124) + i * V(46, 40), V(500, 430) * (i === 6 ? 0.5 : 1), V(12, 11));
  g.restore();
  g.save(); g.globalAlpha = clamp(spring(t - 0.7, 0, { freq: 2.4 })); g.translate(E.W * 0.6, E.H * 0.7); g.rotate(-0.14);
  g.strokeStyle = alpha(LIE, 0.92); g.lineWidth = 7; rr(g, -V(190, 166), -V(42, 37), V(380, 332), V(84, 74), 10); g.stroke();
  text(g, 'ՄԵՐԺՎԱԾ', 0, 2, { size: V(34, 30), color: alpha(LIE, 0.95), font: FONTS.title, weight: 700, spacing: 4 });
  g.restore();
}});

// s068 — but for once you don't wait
registerShot('s068', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.38), shade(M.sky[1], -0.48)]);
  const cx = E.W / 2, cy = E.H * 0.5, w = V(1240, 1080);
  // a year of weeks, grey
  const r = rng(68);
  for (let row = 0; row < 3; row++) for (let col = 0; col < 12; col++) {
    const x = cx - w / 2 + col * (w / 11.4), y = cy - V(150, 132) + row * V(96, 84);
    const k = clamp(spring(t - 0.05 - (row * 12 + col) * 0.012, 0, { freq: 2.6 })); if (k <= 0) continue;
    rr(g, x - V(26, 23), y - V(26, 23), V(52, 46), V(52, 46), V(9, 8));
    g.fillStyle = alpha('#5a6a8a', 0.32 * k); g.fill();
    g.strokeStyle = alpha('#8fb8e8', 0.22 * k); g.lineWidth = 2; g.stroke();
  }
  // the two weeks actually spent, gold — and the bar that races past them
  const kk = clamp(spring(t - 0.9, 0, { freq: 2.2 }));
  g.save(); g.globalAlpha = kk;
  for (let row = 0; row < 2; row++) {
    const x = cx - w / 2, y = cy - V(150, 132) + row * V(96, 84);
    rr(g, x - V(26, 23), y - V(26, 23), V(52, 46), V(52, 46), V(9, 8)); g.fillStyle = alpha(GOLD, 0.9); g.fill();
  }
  glow(g, cx - w / 2, cy - V(102, 90), V(190, 166), GOLD, 0.45);
  g.restore();
  text(g, 'ՇԱԲԱԹՆԵՐ ՍՊԱՍԵԼՈՒ ՓՈԽԱՐԵՆ', cx, cy - V(268, 234), { size: V(38, 33), color: alpha('#9fb6d8', 0.9), font: FONTS.ui, weight: 800, spacing: 5 });
  // the fast-forward slash
  const k3 = ease.out(prog(t, 1.0, 1.6));
  seg(g, [[cx - w * 0.52, cy + V(152, 132)], [cx - w * 0.52 + w * 1.04 * k3, cy + V(152, 132)]], V(9, 8), alpha(GOLD_HI, 0.85));
  for (const d of [-1, 1]) { const ax = cx + d * V(70, 60); poly(g, [[ax - V(28, 24), cy + V(124, 108)], [ax + V(24, 21), cy + V(152, 132)], [ax - V(28, 24), cy + V(180, 157)]], alpha(GOLD_HI, 0.9 * k3)); }
  text(g, 'ԱՌԱՋԻՆ ԱՆԳԱՄ ԴՈՒ ՉԵՍ ՍՊԱՍՈՒՄ', cx, E.H * 0.845, { size: V(48, 42), color: alpha(GOLD_HI, 0.98), font: FONTS.title, weight: 700, spacing: 4, glow: 22, glowColor: alpha(GOLD, 0.55), alpha: clamp((t - 1.2) / 0.45) });
}});

// s069 — now imagine: the bank
registerShot('s069', solo({ set: bankSet, mood: 'interiorCool', z0: 1.12, z1: 1.22, x0: -30, x1: 10, s: V(1.65, 1.7), dustColor: '#cfe6ff', dustCount: 30,
  f: { x: 0.42, who: YOU, pose: (t) => posesAt(t, [[0, POSES.relaxed], [1.6, POSES.phone]], 0.6), expr: 'neutral' },
}));

// s070 — the clerk calls you
registerShot('s070', solo({ set: bankSet, mood: 'interiorCool', z0: 1.18, z1: 1.26, x0: 0, x1: -8, s: V(1.7, 1.75), dustColor: '#cfe6ff', dustCount: 26,
  f: { x: 0.54, who: YOU, pose: (t) => posesAt(t, [[0, POSES.relaxed], [0.5, POSES.phone]], 0.45), expr: 'neutral' },
  after: (g, t, info, { gy }) => {
    // ringing phone UI
    const k = clamp(spring(t - 0.3, 0, { freq: 2.3 }));
    g.save(); g.globalAlpha = k; g.translate(E.W * 0.72, E.H * 0.34); g.scale(k, k);
    rr(g, -110, -150, 220, 300, 26); g.fillStyle = 'rgba(8,14,26,0.95)'; g.fill(); g.strokeStyle = alpha(CYAN, 0.5); g.lineWidth = 3; g.stroke();
    for (let i = 0; i < 3; i++) { const ph = (t * 1.4 + i / 3) % 1; ring(g, 0, -30, 40 + ph * 90, 3 * (1 - ph), alpha(CYAN, 0.5 * (1 - ph))); }
    text(g, 'ԱՆՀԱՅՏ', 0, 66, { size: V(26, 23), color: alpha('#cfe6ff', 0.9), font: FONTS.ui, weight: 900, spacing: 3 });
}}));

// s071 — "there's a problem with your account"
registerShot('s071', panel({ t0: 0.05, title: 'ԶԱՆԳ • ԱՆՀԱՅՏ ՀԱՄԱՐ', accent: LIE, line: LIE_HI, cy: 0.5, rows: [
  { tag: 'ԱՍՈՒՄ Է', t: '«Ձեր հաշվի հետ խնդիր կա»', color: GOLD },
  { tag: 'ՃԻՇՏԸ', t: 'Խնդիր կա միայն նրա պատմության մեջ', color: LIE }],
}));

// s072 — "move the money to a safe account"
registerShot('s072', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.4), shade(M.sky[1], -0.5)]);
  const cx = E.W / 2, cy = E.H * 0.46;
  // money gun: euro bundles leaving a wallet into a black hole
  const flow = ease.out(prog(t, 0.15, 0.8));
  for (let i = 0; i < 10; i++) {
    const u = ((t * 0.42 + i * 0.1) % 1);
    if (flow <= 0) continue;
    const x = lerp(cx - V(400, 344), cx + V(340, 296), u), y = cy - Math.sin(u * Math.PI) * 110 + Math.sin(i * 2.1 + t * 2) * 26;
    g.save(); g.translate(x, y); g.rotate(-0.3 + u * 0.5);
    rr(g, -52, -30, 104, 60, 5); g.fillStyle = ['#b8d0a8', '#cfe0c0', '#a8c498'][i % 3]; g.fill(); g.strokeStyle = alpha('#2a3a26', 0.35); g.lineWidth = 1.6; g.stroke();
    circle(g, 0, 0, 18, alpha('#2a3a26', 0.14)); g.restore();
  }
  // the hole
  circle(g, cx + V(360, 314), cy, V(150, 130), '#04060a'); ring(g, cx + V(360, 314), cy, V(154, 134), 4, alpha(LIE, 0.55));
  glow(g, cx + V(360, 314), cy, V(300, 262), LIE, 0.2);
  for (let i = 0; i < 5; i++) { const ph = (t * 0.5 + i / 5) % 1; ring(g, cx + V(360, 314), cy, V(150, 130) * (0.4 + ph * 0.9), 3 * (1 - ph), alpha(LIE, 0.3 * (1 - ph))); }
  // wallet: an open billfold with card slots
  g.save(); g.translate(cx - V(500, 430), cy - 40);
  g.fillStyle = '#5a4430'; rr(g, -V(110, 96), -V(70, 61), V(220, 192), V(150, 131), 14); g.fill();
  g.fillStyle = '#7a5f44'; rr(g, -V(110, 96), -V(70, 61), V(220, 192), V(52, 45), 14); g.fill();
  for (let i = 0; i < 3; i++) { g.fillStyle = alpha('#cfe0c0', 0.55 - i * 0.1); rr(g, -V(88, 77), -V(14, 12) + i * V(26, 23), V(150, 131), V(18, 16), 4); g.fill(); }
  g.strokeStyle = alpha('#ffffff', 0.16); g.lineWidth = 2.5; rr(g, -V(110, 96), -V(70, 61), V(220, 192), V(150, 131), 14); g.stroke();
  g.restore();
  text(g, '«ԱՆՎՏԱՆԳ» ՀԱՇԻՎ', cx + V(360, 314), cy + V(200, 176), { size: V(30, 26), color: alpha(LIE, 0.9), font: FONTS.ui, weight: 900, spacing: 2 });
  text(g, 'Ո՞ՒՐ', E.W / 2, E.H * 0.14, { size: V(50, 44), color: alpha('#cfe0ff', 0.9), font: FONTS.title, weight: 700, spacing: 8 });
}});

// s073 — you know immediately
registerShot('s073', faceShot({ who: YOU, expr: (t) => t > 0.3 ? 'smirk' : 'neutral', mood: 'interiorCool', set: bankSet, r: V(320, 340), cy: 0.55, veilA: 0.5, bgX: 60, rimSide: 1,
}));

// s074 — real banks don't do this (three rules)
registerShot('s074', panel({ t0: 0.05, title: 'ԻՐԱԿԱՆ ԲԱՆԿԸ ՉԻ ԱՆՈՒՄ', accent: CYAN, line: CYAN, cy: 0.5, h: V(520, 460), rows: [
  { tag: '1', t: 'Չի զանգում «անվտանգ հաշվի» համար', color: CYAN },
  { tag: '2', t: 'Չի շտապեցնում վայրկյանների մեջ', color: CYAN },
  { tag: '3', t: 'Չի խնդրում կոդը հեռախոսով', color: CYAN },
  { tag: 'X', t: 'Այս զանգը խաբեություն է', color: LIE }],
}));

// s075 — you hang up
registerShot('s075', { draw(g, t, info) {
  const M = mood('interiorCool'); backdrop(g, [shade(M.sky[0], -0.4), shade(M.sky[1], -0.5)]);
  const cx = E.W / 2, cy = E.H * 0.48;
  // the call card, knocked out of the frame
  const out = ease.in(prog(t, 0.78, 1.45));
  g.save(); g.translate(cx, cy - V(148, 129) * out); g.rotate(out * 0.22); g.globalAlpha = 1 - out * 0.92;
  const w = V(900, 780), h = V(210, 184);
  rr(g, -w / 2, -h / 2, w, h, V(26, 23)); g.fillStyle = 'rgba(26,40,64,0.99)'; g.fill();
  g.strokeStyle = alpha(CYAN, 0.6); g.lineWidth = 3.5; g.stroke();
  circle(g, -w / 2 + V(96, 84), 0, V(42, 36), alpha(CYAN, 0.22)); ring(g, -w / 2 + V(96, 84), 0, V(42, 36), 3, alpha(CYAN, 0.7));
  text(g, 'ԱՆՀԱՅՏ', -w / 2 + V(96, 84), V(2, 2), { size: V(24, 21), color: '#dbeaff', font: FONTS.ui, weight: 900 });
  text(g, '00:41', V(60, 52), V(-26, -22), { size: V(58, 50), color: '#f2f7ff', font: FONTS.ui, weight: 900, spacing: 2 });
  text(g, '«ԱՆՎՏԱՆԳ ՀԱՇԻՎ»', V(60, 52), V(40, 35), { size: V(26, 23), color: alpha('#a8c0e0', 0.9), font: FONTS.ui, weight: 800, spacing: 3 });
  g.restore();
  // the big red hang-up
  const kk = clamp(spring(t - 0.55, 0, { freq: 2.4, damp: 0.6 }));
  if (kk > 0) {
    g.save(); g.globalAlpha = kk; g.translate(cx, cy + V(95, 83)); g.scale(lerp(0.6, 1, kk), lerp(0.6, 1, kk));
    glow(g, 0, 0, V(300, 262), LIE, 0.45);
    circle(g, 0, 0, V(104, 91), alpha(LIE, 0.96));
    g.save(); g.rotate(-0.72); rr(g, -V(58, 51), -V(20, 18), V(116, 102), V(40, 35), V(16, 14)); g.fillStyle = '#ffffff'; g.fill(); g.restore();
    g.restore();
  }
  text(g, 'ԿԱՊԸ ԸՆԴՀԱՏՎԱԾ', cx, cy + V(268, 234), { size: V(40, 35), color: alpha('#cfe0ff', 0.95), font: FONTS.ui, weight: 900, spacing: 5, alpha: clamp((t - 0.7) / 0.4) });
}});

// s076 — how many have already lost everything
registerShot('s076', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.46), shade(M.sky[1], -0.56)]);
  const r = rng(120), n = 46, cols = 10;
  for (let i = 0; i < n; i++) {
    const k = clamp(spring(t - 0.1 - i * 0.028, 0, { freq: 2.2 })); if (k <= 0) continue;
    const cx = E.W * (0.13 + (i % cols) * 0.082), cy = E.H * (0.28 + Math.floor(i / cols) * 0.15);
    g.save(); g.globalAlpha = k * 0.95;
    fig(g, { x: cx, y: cy + V(46, 40), s: V(0.34, 0.31), facing: i % 2 ? 1 : -1, outfit: { top: 'tshirt', color: ['#4a5470', '#585060', '#3f5a58'][i % 3] }, pose: POSES.sad, expr: 'sad', rim: { color: '#6a7a9a', dir: [0, -1], w: 2.4 }, shadow: false, blink: 0 });
    g.restore();
  }
  text(g, 'ՔԱՆԻ՞ՍԸ', E.W / 2, E.H * 0.13, { size: V(64, 56), color: alpha('#cfe0ff', 0.94), font: FONTS.title, weight: 700, spacing: 6, alpha: clamp((t - 0.9) / 0.5) });
  text(g, 'ԿՈՐՑՐԵԼ Է ԱՄԵՆ ԻՆՉ', E.W / 2, E.H * 0.9, { size: V(38, 34), color: alpha(LIE_HI, 0.9), font: FONTS.ui, weight: 900, spacing: 6, alpha: clamp((t - 1.2) / 0.5) });
}});

// s077 — you could warn them. You start.
registerShot('s077', solo({ set: night, mood: 'night', z0: 1.16, z1: 1.24, x0: 10, x1: -20, s: V(1.4, 1.45), dustColor: '#9fb6d8', dustCount: 28,
  f: { x: 0.4, who: YOU, facing: -1, pose: (t) => posesAt(t, [[0, POSES.explain], [0.9, POSES.point]], 0.5), expr: 'neutral', talk: true },
  after: (g, t, info, { gy }) => {
    for (const [dx, s2] of [[0, 1], [-130, 0.92], [150, 0.88]]) fig(g, { x: E.W * 0.74 + dx, y: gy + 10, s: V(1.15, 1.2) * s2, facing: 1, outfit: { top: 'tshirt', color: '#4a4258' }, pose: POSES.relaxed, expr: 'surprised', rim: { color: mood('night').practical, dir: [0.4, -1], w: 3.6 }, dim: true });
    wordPop(g, t, 'ԴՈՒ ՍԿՍՈՒՄ ԵՍ ԶԳՈՒՇԱՑՆԵԼ', E.W / 2, E.H * 0.13, { t0: 0.4, size: V(42, 38), color: alpha(GOLD, 0.92), spacing: 5 });
}}));

// s078 — strangers write to you
registerShot('s078', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.44), shade(M.sky[1], -0.54)]);
  const r = rng(140);
  for (let i = 0; i < 11; i++) {
    const k = clamp(spring(t - 0.08 - i * 0.09, 0, { freq: 2.2 })); if (k <= 0) continue;
    const bx = E.W * (0.08 + r() * 0.72), by = E.H * (0.14 + r() * 0.68), side = i % 2 ? 1 : -1;
    g.save(); g.globalAlpha = clamp(k) * 0.92; g.translate(lerp(bx + side * 90, bx, clamp(k)), by); g.scale(lerp(0.9, 1, clamp(k)), lerp(0.9, 1, clamp(k)));
    rr(g, 0, 0, V(300, 260), V(96, 84), 18); g.fillStyle = 'rgba(14,20,34,0.94)'; g.fill(); g.strokeStyle = alpha(CYAN, 0.22); g.lineWidth = 2; g.stroke();
    circle(g, V(44, 38), V(48, 42), V(22, 19), alpha(MIA.color, 0.6));
    g.fillStyle = alpha('#cfe0ff', 0.35); g.fillRect(V(78, 68), V(34, 30), V(150, 130), 8); g.fillRect(V(78, 68), V(52, 46), V(190, 165), 8);
    g.restore();
  }
  text(g, 'ԱՆԾԱՆՈԹՆԵՐԸ ԳՐՈՒՄ ԵՆ', E.W / 2, E.H * 0.94, { size: V(36, 32), color: alpha('#cfe0ff', 0.9), font: FONTS.ui, weight: 900, spacing: 6 });
}});

// s079 — "should I trust him?"
registerShot('s079', statement({ lines: ['«ՎՍՏԱՀԵ՞Մ ԱՅՍ ՄԱՐԴՈՒՆ»', '«ԻՐԱԿԱ՞Ն Է ԱՅՍ ԱՌԱՋԱՐԿԸ»'], hi: 1, size: V(64, 56), color: GOLD_HI, y: 0.5, behind: (g, t) => {
}}));

// s080 — a live lie detector
registerShot('s080', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.42), shade(M.sky[1], -0.52)]);
  const cx = E.W / 2, cy = E.H * 0.5;
  const k = clamp(spring(t - 0.15, 0, { freq: 2 }));
  // radar rings
  for (let i = 0; i < 5; i++) { const ph = (t * 0.42 + i / 5) % 1; ring(g, cx, cy, V(110, 95) + ph * V(620, 520), 5 * (1 - ph), alpha(GOLD, 0.4 * (1 - ph))); }
  // the silhouette hero in the middle
  fig(g, { x: cx, y: cy + V(230, 200), s: V(2.1, 2.0) * lerp(0.9, 1, k), facing: 1, outfit: YOU, pose: POSES.stand, expr: 'neutral', rim: { color: GOLD, dir: [0, -1], w: 5 }, shadow: false });
  glyph(g, cx, cy - V(150, 130), { state: 'truth', s: V(86, 76), k, ring: clamp((t - 0.15) / 1.2) });
  text(g, 'ԿԵՆԴԱՆԻ ՍՏԻ ԴԵՏԵԿՏՈՐ', E.W / 2, E.H * 0.86, { size: V(44, 38), color: alpha(GOLD_HI, 0.95), font: FONTS.title, weight: 700, spacing: 5, glow: 22, glowColor: alpha(GOLD, 0.5), alpha: clamp((t - 0.7) / 0.5) });
}});

// s081 — the news changes for you
registerShot('s081', grid({ cols: 3, t0: 0.1, cells: [
  { label: 'ՔԱՂԱՔԱԿԱՆ', bg: '#161a2c', draw: (g, t, w, h) => { // podium + microphones
    g.fillStyle = '#2a3048'; g.fillRect(-w * 0.34, -h * 0.34, w * 0.68, h * 0.22);
    fig(g, { x: 0, y: -h * 0.34, s: h * 0.0022, facing: 1, outfit: { top: 'suit', color: '#4a5a80' }, pose: POSES.point, expr: 'smile', rim: { color: '#8fb8e8', dir: [0, -1], w: 3 }, shadow: false });
    for (const dx of [-34, 0, 34]) { seg(g, [[dx, -h * 0.36], [dx * 1.5, -h * 0.5]], 4, '#8fb8e8'); circle(g, dx * 1.5, -h * 0.5, 6, '#cfe6ff'); }
    text(g, 'ԽՈՍՏՈՒՄ', 0, -h * 0.16, { size: 20, color: alpha('#cfe0ff', 0.6), font: FONTS.ui, weight: 900, spacing: 3 });
  } },
  { label: 'ԳՈՎԱԶԱԴ', bg: '#1a1626', draw: (g, t, w, h) => { // product + sparkle
    rr(g, -w * 0.16, -h * 0.44, w * 0.32, h * 0.34, 12); g.fillStyle = '#6a5a8a'; g.fill();
    g.fillStyle = alpha('#ffffff', 0.14); rr(g, -w * 0.13, -h * 0.41, w * 0.26, h * 0.08, 6); g.fill();
    text(g, 'NEW', 0, -h * 0.27, { size: 26, color: '#ffe9c8', font: FONTS.ui, weight: 900, spacing: 2 });
    text(g, '+300%', 0, -h * 0.19, { size: 22, color: alpha(GOLD, 0.9), font: FONTS.ui, weight: 900 });
    for (let i = 0; i < 5; i++) FX.sparkle(g, Math.cos(i * 1.6 + t) * w * 0.22, -h * 0.46 + Math.sin(i * 1.6 + t) * h * 0.12, 14, GOLD, 0.55);
  } },
  { label: 'ԲԱՐԵԳՈՐԾ', bg: '#141e1c', draw: (g, t, w, h) => { // donation box
    rr(g, -w * 0.17, -h * 0.36, w * 0.34, h * 0.28, 8); g.fillStyle = '#3a5a4a'; g.fill();
    g.fillStyle = alpha('#000000', 0.3); g.fillRect(-w * 0.04, -h * 0.39, w * 0.08, h * 0.05);
    text(g, '♥', 0, -h * 0.23, { size: 34, color: '#ff9aa0', font: FONTS.ui, weight: 900 });
    text(g, 'ԲԱՐԵԳՈՐԾ', 0, -h * 0.13, { size: 18, color: alpha('#dff0e8', 0.7), font: FONTS.ui, weight: 900, spacing: 2 });
  } }],
}));

// s082/s083 — the politician
registerShot('s082', pair({ set: (g, t, cam) => SET.gala(g, t, cam, { mood: 'night' }), z0: 1.16, z1: 1.24, s: V(1.6, 1.64),
  right: { x: 0.62, who: { top: 'suit', color: '#3a4460' }, pose: (tt) => posesAt(tt, [[0, POSES.explain], [1.2, POSES.cheer]], 0.5), expr: 'joy', talk: true, glyph: { t0: 0.3, lieAt: 1.5, s: V(40, 36), seed: 82 } },
  left: null,
  onStage: (g, t, info, { gy, sc }) => { /* a lectern */ g.fillStyle = shade(mood('night').dark, 0.16); g.fillRect(E.W * 0.5, gy - 150, V(360, 320), 150); } ,
}));

registerShot('s083', panel({ t0: 0.05, title: 'ԽՈՍՏՈՒՄՆԵՐԻ ՀԱՇԻՎԸ', accent: LIE, line: LIE_HI, cy: 0.5, rows: [
  { t: 'Խոստացված', v: '12', vColor: '#9fb6d8' },
  { t: 'Կկատարի', v: '3', vColor: LIE },
]}));

// s084/s085 — the miracle product
registerShot('s084', insertShot({ mood: 'interiorCool', scale: 1.0, draw: (g, t) => {
  const cx = E.W / 2, cy = E.H * 0.5;
  // the box
  g.save(); g.translate(cx - V(190, 164), cy); g.rotate(Math.sin(t * 0.8) * 0.03);
  rr(g, -V(150, 128), -V(190, 160), V(300, 256), V(380, 320), V(30, 26)); g.fillStyle = '#5a4a7a'; g.fill();
  g.fillStyle = alpha('#ffffff', 0.10); rr(g, -V(140, 120), -V(180, 152), V(280, 240), V(120, 102), V(20, 18)); g.fill();
  text(g, 'ՀՐԱՇՔ', 0, -V(40, 34), { size: V(38, 32), color: alpha('#ffffff', 0.9), font: FONTS.title, weight: 700, spacing: 3 });
  text(g, 'ԱՊՐԱՆՔ', 0, V(20, 17), { size: V(26, 22), color: alpha('#ffe9c8', 0.7), font: FONTS.ui, weight: 900, spacing: 4 });
  g.restore();
  glow(g, cx - V(190, 164), cy, V(360, 310), '#a08aff', 0.16);
  // the fake +300% chart
  g.save(); g.translate(cx + V(230, 198), cy);
  g.strokeStyle = alpha('#8fb8e8', 0.3); g.lineWidth = 2; seg(g, [[-V(190, 164), -V(150, 130)], [-V(190, 164), V(160, 138)]], 2, alpha('#8fb8e8', 0.3)); seg(g, [[-V(190, 164), V(160, 138)], [V(190, 164), V(160, 138)]], 2, alpha('#8fb8e8', 0.3));
  const p = clamp(spring(t - 0.4, 0, { freq: 1.6, damp: 0.55 }));
  g.strokeStyle = alpha(GOLD, 0.95); g.lineWidth = 9; g.lineCap = 'round'; g.beginPath();
  for (let i = 0; i <= 40 * p; i++) { const u = i / 40; const x = -V(160, 138) + u * V(320, 276), y = V(140, 120) - Math.pow(u, 2.1) * V(280, 240); i ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.stroke();
  glow(g, V(160, 138), -V(140, 120), V(200, 172), GOLD, 0.3);
  text(g, '+300%', V(90, 78), -V(112, 96), { size: V(44, 38), color: GOLD_HI, font: FONTS.ui, weight: 900, glow: 18, glowColor: alpha(GOLD, 0.5) });
  g.restore();
  text(g, 'ՀՐԱՇՔ', cx, E.H * 0.84, { size: V(48, 42), color: alpha('#cfe0ff', 0.92), font: FONTS.title, weight: 700, spacing: 8 });
}}));

registerShot('s085', { draw(g, t, info) {
  const M = mood('interiorCool'); backdrop(g, [shade(M.sky[0], -0.44), shade(M.sky[1], -0.54)]);
  const cx = E.W / 2, cy = E.H * 0.48, w = V(820, 700), h = V(420, 380);
  rr(g, cx - w / 2, cy - h / 2, w, h, 20); g.fillStyle = 'rgba(10,16,30,0.9)'; g.fill(); g.strokeStyle = alpha(CYAN, 0.3); g.lineWidth = 2.5; g.stroke();
  // headline numbers
  text(g, '92%', cx - w * 0.24, cy - 30, { size: V(96, 82), color: alpha('#cfe6ff', 0.9), font: FONTS.ui, weight: 900 });
  text(g, 'ԽՈՍՏԱՑՎԱԾ', cx - w * 0.24, cy + 50, { size: V(26, 23), color: alpha('#9fb6d8', 0.8), font: FONTS.ui, weight: 900, spacing: 3 });
  const k = clamp(spring(t - 0.7, 0, { freq: 2.2 }));
  g.save(); g.globalAlpha = k; text(g, '31%', cx + w * 0.22, cy - 30, { size: V(96, 82), color: GOLD_HI, font: FONTS.ui, weight: 900, glow: 22, glowColor: alpha(GOLD, 0.45) }); g.restore();
  text(g, 'ԻՐԱԿԱՆ', cx + w * 0.22, cy + 50, { size: V(26, 23), color: alpha(GOLD, 0.85), font: FONTS.ui, weight: 900, spacing: 3 });
  // crossing out
  const kk = ease.out(prog(t, 1.0, 1.7));
  seg(g, [[cx - w * 0.4, cy - h * 0.1], [cx - w * 0.4 + (w * 0.8) * kk, cy + h * 0.1]], 8, alpha(LIE, 0.85));
}});

// s086/s087 — the charity man
registerShot('s086', { draw(g, t, info) {
  SET.gala(g, t, { z: 1.12, x: 0 }, { mood: 'night' });
  const gy = SET.GY(), M = mood('night');
  layer(g, { z: 1, x: 0, y: 0 }, 1, (g) => {
    fig(g, { x: E.W * 0.5, y: gy, s: V(1.85, 1.9), facing: 1, outfit: { top: 'suit', color: '#4a3a4a' }, pose: posesAt(t, [[0, POSES.explain], [1.3, POSES.reach]], 0.5), expr: 'smile', talk: talkAmount(info.globalT), rim: { color: M.practical, dir: [0.4, -1], w: 5 } });
    // a collection bucket
    rr(g, E.W * 0.28, gy - V(150, 138), V(190, 170), V(150, 138), 14); g.fillStyle = '#2e4a3c'; g.fill(); g.strokeStyle = alpha(GOLD, 0.5); g.lineWidth = 2.5; g.stroke();
    text(g, '♥', E.W * 0.28 + V(95, 85), gy - V(78, 72), { size: V(48, 42), color: alpha('#ff9aa0', 0.9), font: FONTS.ui, weight: 900 });
    talkGlyph(g, t, E.W * 0.5, gy - 470, { t0: 0.3, lieAt: 1.3, s: V(44, 40), seed: 86 });
  });
}});

registerShot('s087', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.44), shade(M.sky[1], -0.54)]);
  const cx = E.W / 2, cy = E.H * 0.46;
  const p = ease.inOut(prog(t, 0.35, 1.7));
  const PW = V(660, 578), PH = V(400, 350);
  // the page, torn down the middle; the right half slides away
  for (const side of [-1, 1]) {
    g.save(); g.translate(cx + side * (PW / 4) + side * V(58, 50) * p, cy);
    g.rotate(side * 0.035 * p);
    g.save(); g.beginPath();
    if (side < 0) g.rect(-PW / 2, -PH / 2, PW / 2, PH); else g.rect(0, -PH / 2, PW / 2, PH);
    g.clip();
    // paper
    g.fillStyle = '#e8e4da'; g.fillRect(-PW / 2, -PH / 2, PW, PH);
    g.fillStyle = alpha('#c9c2b4', 0.9); g.fillRect(-PW / 2, -PH / 2, PW, V(16, 14));
    // typed lines
    const r = rng(87);
    for (let i = 0; i < 11; i++) {
      const y = -PH / 2 + V(62, 54) + i * V(30, 26);
      const w2 = PW * (0.72 + r() * 0.2) * (i === 10 ? 0.45 : 1);
      const rotten = side > 0 && i === 5;
      g.fillStyle = rotten ? alpha(LIE, 0.55) : alpha('#3e4450', 0.42);
      g.fillRect(-PW / 2 + V(44, 38), y, w2 / (side < 0 ? 1.02 : 1) * (side < 0 ? 0.96 : 1), V(9, 8));
      if (rotten) { g.fillStyle = alpha(LIE, 0.95); g.fillRect(-PW / 2 + V(44, 38) - V(10, 9), y - V(3, 2), w2 * 0.96 + V(20, 18), V(15, 13)); }
    }
    g.restore();
    // the torn edge
    g.save(); g.strokeStyle = alpha(side < 0 ? '#f2efe6' : '#e8e4da', 0.95); g.lineWidth = 3; g.beginPath();
    for (let i = 0; i <= 26; i++) {
      const y = -PH / 2 + (i / 26) * PH;
      const x = side * (V(5, 4) + (i % 2 ? V(13, 11) : -V(9, 8)));
      i ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.stroke(); g.restore();
    // shadow under the lifted half
    if (side > 0 && p > 0.05) {
      g.save(); g.globalAlpha = 0.28 * p;
      g.fillStyle = '#000'; g.beginPath(); g.ellipse(0, PH / 2 + V(10, 8), PW / 3, V(16, 14), 0, 0, Math.PI * 2); g.fill();
      g.restore();
    }
    g.restore();
  }
  // the lie, circled on the right half
  const k = clamp(spring(t - 1.15, 0, { freq: 2.2 }));
  if (k > 0) {
    g.save(); g.globalAlpha = k;
    // centre of the visible red line on the right half
    const rx = cx + PW / 4 + V(58, 50) * p + V(96, 84) + V(2, 2);
    const ry = cy - PH / 2 + V(62, 54) + 5 * V(30, 26) + V(4, 3);
    g.strokeStyle = alpha(LIE, 0.95); g.lineWidth = 4;
    g.beginPath(); g.ellipse(rx, ry + V(4, 3), V(168, 147), V(44, 38), -0.02, 0, Math.PI * 2); g.stroke();
    g.restore();
  }
  text(g, 'ՄԻ ԿԱՐԵՎՈՐ ԲԱՆ ԿԵՂԾ Է', E.W / 2, E.H * 0.855, { size: V(44, 38), color: alpha(LIE_HI, 0.95 * k), font: FONTS.title, weight: 700, spacing: 4, alpha: k });
}});

// s088 — suddenly the whole world wants to listen
registerShot('s088', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.4), shade(M.sky[1], -0.5)]);
  const cx = E.W / 2, cy = E.H * 0.54;
  // radial crowd of heads leaning in
  const r = rng(200);
  for (let ring2 = 0; ring2 < 3; ring2++) {
    const n = 12 + ring2 * 6, rad = V(360, 320) + ring2 * V(210, 180);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + ring2 * 0.2 + Math.sin(t * 0.3 + ring2) * 0.04;
      const x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad * 0.62;
      const sc = (ring2 === 0 ? V(0.85, 0.8) : ring2 === 1 ? V(0.62, 0.58) : V(0.44, 0.4)) * (0.9 + r() * 0.2);
      g.save(); g.globalAlpha = 0.55 + ring2 * 0.12;
      fig(g, { x, y: y + V(60, 54), s: sc, facing: Math.cos(a) > 0 ? 1 : -1, outfit: { top: 'tshirt', color: ['#3a4460', '#4a3a4a', '#2f4a44', '#4a4432'][i % 4] }, pose: POSES.stand, expr: 'neutral', rim: false, shadow: false, blink: 0, dim: true });
      g.restore();
    }
  }
  fig(g, { x: cx, y: cy + V(120, 108), s: V(1.55, 1.5), facing: 1, outfit: YOU, pose: POSES.stand, expr: 'neutral', rim: { color: GOLD, dir: [0, -1], w: 5.4 }, shadow: false });
  // camera flashes
  for (let i = 0; i < 6; i++) { const ph = (t * 0.7 + i * 0.37) % 1; if (ph < 0.12) FX.sparkle(g, cx + Math.cos(i * 2.1) * V(520, 460), cy + Math.sin(i * 2.1) * V(280, 250), 40 * (1 - ph / 0.12), '#ffffff', 0.8 * (1 - ph / 0.12)); }
  text(g, 'ԱՄԲՈՂՋ ԱՇԽԱՐՀԸ ՈՒԶՈՒՄ Է ԼՍԵԼ', E.W / 2, E.H * 0.1, { size: V(40, 36), color: alpha(GOLD_HI, 0.95), font: FONTS.title, weight: 700, spacing: 5, alpha: clamp((t - 0.6) / 0.5) });
}});

// s089 — but who decides whom you talk about?
registerShot('s089', statement({ lines: ['Ո՞Վ Է ՈՐՈՇՈՒՄ', 'ՈՒՄ ՄԱՍԻՆ ԽՈՍԵՍ'], hi: 1, size: V(72, 62), color: '#cfe0ff', y: 0.5, behind: (g, t) => {
  // a hand pointing at a board of portraits
}}));

// s090 — who is responsible for what you say?
registerShot('s090', statement({ lines: ['Ո՞Վ Է ՊԱՏԱՍԽԱՆԱՏՈՒ', 'ՔՈ ԱՍԱԾԻ ՀԱՄԱՐ'], hi: 1, size: V(68, 58), color: GOLD_HI, y: 0.5, behind: (g, t) => {
  const k = clamp(spring(t - 0.3, 0, { freq: 2 }));
  // a microphone, off to the left of the type
  g.save(); g.globalAlpha = 0.85 * k; g.translate(E.W * 0.235, E.H * 0.5); g.scale(k, k);
  seg(g, [[0, 60], [0, 190]], 11, alpha('#8fb8e8', 0.8));
  rr(g, -5, 150, 120, 22, 10); g.fillStyle = alpha('#8fb8e8', 0.7); g.fill();
  rr(g, -52, -80, 104, 170, 52); g.fillStyle = alpha('#1a2334', 0.96); g.fill(); g.strokeStyle = alpha('#8fe0ff', 0.75); g.lineWidth = 4; g.stroke();
  g.save(); g.beginPath(); g.rect(-52, -80, 104, 170); g.clip(); g.strokeStyle = alpha('#8fe0ff', 0.35); g.lineWidth = 2.5;
  for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(-52, -60 + i * 26); g.lineTo(52, -60 + i * 26); g.stroke(); }
  g.restore();
}}));

// s091 — knowing it's a lie isn't knowing the truth
registerShot('s091', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, [shade(M.sky[0], -0.44), shade(M.sky[1], -0.54)]);
  const cx = E.W / 2, cy = E.H * 0.46;
  // a small broken glyph vs a huge unknown
  const k = clamp(spring(t - 0.2, 0, { freq: 2.2 }));
  glyph(g, cx - V(330, 290), cy, { state: 'lie', s: V(46, 42), k, a: 0.9 });
  text(g, 'ՍՈՒՏ', cx - V(330, 290), cy + V(96, 84), { size: V(28, 25), color: alpha(LIE_HI, 0.85), font: FONTS.ui, weight: 900, spacing: 3, alpha: clamp((t - 0.3) / 0.5) });
  // a giant unknown
  const k2 = clamp(spring(t - 0.7, 0, { freq: 1.9 }));
  g.save(); g.globalAlpha = k2;
  rr(g, cx + V(40, 34), cy - V(190, 164), V(560, 486), V(380, 330), 20); g.fillStyle = 'rgba(12,18,30,0.86)'; g.fill(); g.strokeStyle = alpha('#8fb8e8', 0.28); g.lineWidth = 2.5; g.stroke();
  text(g, '?', cx + V(320, 278), cy - V(40, 34), { size: V(230, 200), color: alpha(GOLD, 0.55), font: FONTS.title, weight: 700 });
  text(g, 'ԱՄԲՈՂՋ ՃՇՄԱՐՏՈՒԹՅՈՒՆԸ', cx + V(320, 278), cy + V(116, 100), { size: V(30, 27), color: alpha('#e8f0ff', 0.94), font: FONTS.title, weight: 700, spacing: 3 });
  g.restore();
}});
