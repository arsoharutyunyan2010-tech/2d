// a2_mom.js — s112–s126: the kitchen, the three knocks, and the hand.
import { E, V, mood, clamp, lerp, ease, prog, rng, alpha, shade, mix, seg, circle, ring, poly, rr, linGrad, glow, text, layer, backdrop, FONTS, registerShot, talkAmount } from '/engine/core.js';
import { POSES, posesAt, breathe, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as SET from '../sets/room.js';
import { YOU, MOM, LEO, MIA, BRO, BLACK, SELL, CROWD } from '../cast.js';
import { glyph, talkGlyph, goldThread, sparkBurst, cracks, frozenAir, wordPop, fig, blink, GOLD, GOLD_HI, LIE, LIE_HI, CYAN } from '../fx_truth.js';
import { camAdd, camPath, drift, spring } from '/engine/motion.js';
import { faceShot, insertShot, wideShot } from '../lib.js';
import { pair, solo, panel, statement, grid, nameCard } from '../beat.js';

const kitchen = (g, t, cam) => SET.kitchenRoom(g, t, cam, { mood: 'interiorWarm' });
const GS = () => V(1.5, 1.55);
const MOMX = () => E.W * 0.38, YOUX = () => E.W * 0.6;

// shared kitchen two-shot (stools + table, same staging as a2_day)
function kitchenTwo(g, t, info, cam, o = {}) {
  SET.kitchenRoom(g, t, { z: 1, x: 0 }, { mood: 'interiorWarm' });
  const M = mood('interiorWarm'), gy = SET.GY(), s = GS();
  const rs = (p, tt) => (typeof p === 'function' ? p(tt) : p);
  layer(g, cam, 1, (g) => {
    FX.stool(g, MOMX(), gy - 2, s * 0.92, shade(M.dark, 0.1));
    FX.stool(g, YOUX(), gy - 2, s * 1.06, shade(M.dark, 0.1));
    fig(g, { x: MOMX(), y: gy, s: s * 0.92, facing: 1, outfit: MOM, pose: breathe(rs(o.momPose || POSES.sit, t), t, 1, 2), expr: (typeof o.momExpr === 'function' ? o.momExpr(t) : (o.momExpr || 'smile')), rim: { color: M.rim, dir: [0.3, -1], w: 4.4 }, shadow: false, talk: o.momTalk ? talkAmount(info.globalT) : 0, blink: blink(t, 2) });
    fig(g, { x: YOUX(), y: gy, s: s * 1.06, facing: -1, outfit: YOU, pose: breathe(rs(o.youPose || POSES.sit, t), t, 0.9, 5), expr: (typeof o.youExpr === 'function' ? o.youExpr(t) : (o.youExpr || 'neutral')), rim: { color: M.rim, dir: [-0.4, -1], w: 4.6 }, shadow: false, talk: o.youTalk ? talkAmount(info.globalT) : 0, blink: blink(t, 1) });
    if (o.glyphMom) { const hp = headPos({ x: MOMX(), y: gy, s: s * 0.92, facing: 1, pose: POSES.sit }); talkGlyph(g, t, hp[0] + 4, hp[1] - hp[2] * 2.15, { t0: o.glyphMom.t0 ?? 0.4, lieAt: o.glyphMom.lieAt, s: V(34, 31), seed: 7 }); }
    if (o.glyphYou) { const hp = headPos({ x: YOUX(), y: gy, s: s * 1.06, facing: -1, pose: POSES.sit }); talkGlyph(g, t, hp[0] - 4, hp[1] - hp[2] * 2.15, { t0: o.glyphYou.t0 ?? 0.4, lieAt: o.glyphYou.lieAt, s: V(34, 31), seed: 8 }); }
    if (o.onStage) o.onStage(g, t, info, { gy, s, M });
  });
  const ty = gy + V(46, 40);
  g.fillStyle = linGrad(g, 0, ty - 26, 0, ty + V(260, 230), [shade(M.wall, 0.10), shade(M.floor, -0.1), shade(M.dark, -0.4)]);
  g.beginPath(); g.moveTo(-E.W * 0.2, ty - 26); g.lineTo(E.W * 1.2, ty - 26); g.lineTo(E.W * 1.35, ty + V(300, 260)); g.lineTo(-E.W * 0.35, ty + V(300, 260)); g.closePath(); g.fill();
  g.fillStyle = alpha('#ffffff', 0.10); g.fillRect(-E.W * 0.2, ty - 26, E.W * 1.4, 4);
  // her tea, his cup
  for (const [mx, sc2, col] of [[MOMX() + V(150, 110), 1.2, '#b06a3a'], [YOUX() - V(170, 120), 1.05, '#8a5a3a']]) {
    rr(g, mx - 26 * sc2, ty - 60 * sc2, 52 * sc2, 58 * sc2, 8 * sc2); g.fillStyle = '#efe6dc'; g.fill();
    g.fillStyle = alpha(col, 0.6); g.fillRect(mx - 26 * sc2, ty - 60 * sc2, 52 * sc2, 7 * sc2);
    for (let i = 0; i < 3; i++) { const ph = ((t * 0.45 + i * 0.33) % 1); g.strokeStyle = alpha('#ffe9d2', 0.2 * (1 - ph)); g.lineWidth = 2.4; g.beginPath(); g.moveTo(mx - 8 + i * 8, ty - 66 * sc2); g.bezierCurveTo(mx - 20 + i * 8, ty - 96 * sc2 - ph * 40, mx + 4 + i * 8, ty - 120 * sc2 - ph * 60, mx - 6 + i * 8, ty - 150 * sc2 - ph * 80); g.stroke(); }
  }
}

// s112 — evening, you come home
registerShot('s112', solo({ set: kitchen, mood: 'interiorWarm', z0: 1.06, z1: 1.16, x0: 20, x1: -10, s: V(1.45, 1.5), dustColor: '#ffe2bd', dustCount: 36,
  f: { x: 0.5, who: YOU, facing: 1, pose: (t) => posesAt(t, [[0, POSES.relaxed], [1.2, POSES.stand]], 0.6), expr: (t) => t > 1.2 ? 'sad' : 'neutral' },
}));

// s113 — mom in the kitchen, your favourite tea
registerShot('s113', { draw(g, t, info) {
  const cam = camAdd(camPath(t, [[0, { z: 1.14, x: 20 }], [info.dur, { z: 1.24, x: -20 }]], { endEase: 0.3 }), drift(t, 2.4, 4));
  SET.kitchenRoom(g, t, { z: 1, x: 0 }, { mood: 'interiorWarm' });
  const M = mood('interiorWarm'), gy = SET.GY(), s = V(1.5, 1.55);
  layer(g, cam, 1, (g) => {
    fig(g, { x: E.W * 0.5, y: gy, s, facing: 1, outfit: MOM, pose: breathe(posesAt(t, [[0, POSES.holdFront], [1.2, POSES.reach]], 0.6), t, 1, 2), expr: 'smile', rim: { color: M.rim, dir: [0.4, -1], w: 5 }, blink: blink(t, 2) });
    // the cup of tea held out, steam rising
    const cx2 = E.W * 0.5 + V(150, 130), cy2 = gy - V(250, 230);
    rr(g, cx2 - 40, cy2 - 44, 80, 78, 10); g.fillStyle = '#f2ece4'; g.fill();
    g.fillStyle = alpha('#c27a3a', 0.55); g.fillRect(cx2 - 40, cy2 - 44, 80, 10);
    ring(g, cx2 + 44, cy2 - 8, 20, 8, alpha('#f2ece4', 0.9));
    for (let i = 0; i < 4; i++) { const ph = ((t * 0.5 + i * 0.25) % 1); g.strokeStyle = alpha('#ffe9d2', 0.28 * (1 - ph)); g.lineWidth = 3; g.beginPath(); g.moveTo(cx2 - 16 + i * 10, cy2 - 52); g.bezierCurveTo(cx2 - 34 + i * 10, cy2 - 100 - ph * 50, cx2 + 10 + i * 10, cy2 - 140 - ph * 70, cx2 - 12 + i * 10, cy2 - 190 - ph * 90); g.stroke(); }
    glow(g, cx2, cy2, V(300, 260), '#ffd8a8', 0.18);
  });
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.3 });
}});

// s114 — the three knocks, when you were little
registerShot('s114', { draw(g, t, info) {
  const M = mood('interiorCool'); backdrop(g, [shade('#241a2a', 0), shade('#140e18', 0.2)]);
  const cx = E.W * 0.5, cy = E.H * 0.52;
  // a child's bedroom door in the dark, warm light under it
  const dw = V(460, 400), dh = V(820, 740);
  g.fillStyle = '#241d2e'; g.fillRect(cx - dw / 2, cy - dh / 2, dw, dh);
  // two recessed panels
  for (const [a, b] of [[0.1, 0.46], [0.54, 0.9]]) {
    rr(g, cx - dw * 0.36, cy - dh / 2 + dh * a, dw * 0.72, dh * (b - a), 10);
    g.strokeStyle = alpha('#3d3348', 0.85); g.lineWidth = 5; g.stroke();
    g.fillStyle = alpha('#000000', 0.12); g.fill();
  }
  g.strokeStyle = alpha('#5a4a5a', 0.8); g.lineWidth = 7; g.strokeRect(cx - dw / 2, cy - dh / 2, dw, dh);
  g.fillStyle = alpha(GOLD, 0.5); g.fillRect(cx - dw / 2, cy + dh / 2 - 6, dw, 8);
  glow(g, cx, cy + dh / 2, V(420, 360), GOLD, 0.28);
  // handle
  circle(g, cx + dw * 0.36, cy + dh * 0.02, 16, alpha('#b8a890', 0.85));
  const k = clamp(spring(t - 0.3, 0, { freq: 2 }));
  g.save(); g.globalAlpha = k; g.translate(cx, cy - dh * 0.1); g.scale(k, k);
  text(g, 'ԹԱԿ • ԹԱԿ • ԹԱԿ', 0, 0, { size: V(58, 50), color: alpha('#f2e6fa', 0.95), font: FONTS.ui, weight: 900, spacing: 8, glow: 24, glowColor: alpha(GOLD, 0.5) });
  g.restore();
  // three knock rings
  for (let i = 0; i < 3; i++) { const ph = clamp((t - 0.4 - i * 0.55) / 1.2); if (ph <= 0 || ph >= 1) continue; ring(g, cx + dw * 0.1, cy - dh * 0.06, V(40, 36) + ph * V(190, 160), 4 * (1 - ph), alpha(GOLD, 0.5 * (1 - ph))); }
  text(g, 'ՄԵԿ • ԵՐԿՈՒ • ԵՐԵՔ', cx, E.H * 0.9, { size: V(34, 30), color: alpha('#cfe0ff', 0.8), font: FONTS.ui, weight: 900, spacing: 7, alpha: clamp((t - 1.4) / 0.6) });
}});

// s115 — one, two, three
registerShot('s115', statement({ lines: ['ՄԵԿ', 'ԵՐԿՈՒ', 'ԵՐԵՔ'], hi: 2, size: V(120, 104), y: 0.5, color: GOLD_HI,
  behind: (g, t) => {
    const cx = E.W / 2, cy = E.H * 0.5;
    for (let i = 0; i < 3; i++) {
      const ph = clamp((t - 0.15 - i * 0.62) / 1.5); if (ph <= 0 || ph >= 1) continue;
      ring(g, cx, cy, V(90, 78) + ph * V(560, 480), 6 * (1 - ph), alpha(GOLD, 0.55 * (1 - ph)));
      ring(g, cx, cy, V(60, 52) + ph * V(420, 360), 3 * (1 - ph), alpha(GOLD_HI, 0.35 * (1 - ph)));
    }
}}));

// s116 — your secret sign
registerShot('s116', statement({ lines: ['ԴԱ ՁԵՐ', 'ԳԱՂՏՆԻ ՆՇԱՆՆ ԷՐ'], hi: 1, size: V(64, 56), y: 0.5, color: GOLD_HI,
  behind: (g, t) => {
    const k = clamp(spring(t - 0.3, 0, { freq: 1.8 }));
    if (k <= 0) return;
    g.save(); g.globalAlpha = 0.8 * k; g.translate(E.W / 2, E.H * 0.755); g.scale(k, k);
    // a small interlocking knot: two hands, one shape
    g.strokeStyle = alpha(GOLD, 0.6); g.lineWidth = 8; g.lineCap = 'round';
    for (const s2 of [-1, 1]) { g.beginPath(); g.moveTo(s2 * V(150, 130), 0); g.bezierCurveTo(s2 * V(60, 52), -V(90, 78), -s2 * V(60, 52), -V(90, 78), -s2 * V(40, 34), 0); g.stroke(); }
    g.restore();
}}));

// s117 — you sit next to her
registerShot('s117', { draw(g, t, info) {
  const cam = camAdd(camPath(t, [[0, { z: 1.32, x: 0 }], [info.dur, { z: 1.4, x: 0 }]], { endEase: 0.3 }), drift(t, 2.2, 6));
  kitchenTwo(g, t, info, cam, { momPose: POSES.sit, youPose: (tt) => posesAt(tt, [[0, POSES.stand], [0.6, POSES.sit]], 0.6), youExpr: 'sad', momExpr: 'smile' });
}});

// s118 — "how are you?"
registerShot('s118', { draw(g, t, info) {
  const cam = camAdd(camPath(t, [[0, { z: 1.42, x: -20 }], [info.dur, { z: 1.5, x: 10 }]], { endEase: 0.3 }), drift(t, 2, 7));
  kitchenTwo(g, t, info, cam, { momPose: POSES.sit, momExpr: 'smile', momTalk: true, youExpr: 'neutral', glyphMom: { t0: 0.4 } });
}});

// s119 — she's worried, and hides the weight
registerShot('s119', panel({ t0: 0.05, title: 'ԻՆՉ Է ՆԱ ԹԱՔՑՆՈՒՄ', accent: LIE, line: LIE_HI, cy: 0.5, rows: [
  { tag: 'ԱՍՈՒՄ Է', t: '«Ինչպե՞ս ես»', color: GOLD },
  { tag: 'ՄՏԱԾՈՒՄ Է', t: 'Չուզեմ քեզ ծանրաբեռնել', color: LIE }],
}));

// s120 — she is tired. very tired.
registerShot('s120', { draw(g, t, info) {
  const cam = camAdd(camPath(t, [[0, { z: 1.5, x: 30 }], [info.dur, { z: 1.58, x: 10 }]], { endEase: 0.3 }), drift(t, 1.8, 8));
  kitchenTwo(g, t, info, cam, { momPose: (tt) => posesAt(tt, [[0, POSES.sit], [1.0, POSES.sad]], 0.9), momExpr: (tt) => tt > 1.0 ? 'sleepy' : 'smile', youExpr: 'worried', youPose: POSES.sit,
    onStage: (g, t, info, { gy, s }) => { const hp = headPos({ x: MOMX(), y: gy, s: s * 0.92, facing: 1, pose: POSES.sad }); glyph(g, hp[0] + 6, hp[1] - hp[2] * 2.2, { state: 'lie', s: V(32, 29), k: clamp(spring(t - 1.4, 0, { freq: 2.3 })), a: 0.85 }); } });
}});

// s121 — "why don't you say when you need help?"
registerShot('s121', { draw(g, t, info) {
  const cam = camAdd(camPath(t, [[0, { z: 1.44, x: -10 }], [info.dur, { z: 1.52, x: -30 }]], { endEase: 0.3 }), drift(t, 2, 9));
  kitchenTwo(g, t, info, cam, { momPose: POSES.sit, momExpr: 'sleepy', youPose: (tt) => posesAt(tt, [[0, POSES.sit], [0.8, POSES.explain]], 0.5), youExpr: 'worried', youTalk: true, glyphYou: { t0: 0.5, state: 'truth' } });
}});

// s122 — she smiles
registerShot('s122', faceShot({ who: MOM, expr: (t) => t > 0.5 ? 'smile' : 'sleepy', mood: 'interiorWarm', set: kitchen, r: V(320, 340), cy: 0.55, veilA: 0.42,
}));

// s123 — "I'll manage on my own"
registerShot('s123', { draw(g, t, info) {
  const cam = camAdd(camPath(t, [[0, { z: 1.36, x: 20 }], [info.dur, { z: 1.44, x: 0 }]], { endEase: 0.3 }), drift(t, 2.2, 10));
  kitchenTwo(g, t, info, cam, { momPose: (tt) => posesAt(tt, [[0, POSES.sit], [0.7, POSES.sitBack]], 0.6), momExpr: 'smile', momTalk: true, youExpr: 'sad', glyphMom: { t0: 0.5, lieAt: 1.0 } });
}});

// s124 — you know it's not true, and you say nothing
registerShot('s124', { draw(g, t, info) {
  const cam = camAdd(camPath(t, [[0, { z: 1.5, x: 0 }], [info.dur, { z: 1.58, x: 0 }]], { endEase: 0.3 }), drift(t, 1.8, 11));
  kitchenTwo(g, t, info, cam, { momPose: POSES.sitBack, momExpr: 'smile', youExpr: 'sad', youPose: POSES.sit,
    onStage: (g, t, info, { gy, s }) => {
      const hp = headPos({ x: MOMX(), y: gy, s: s * 0.92, facing: 1, pose: POSES.sitBack });
      glyph(g, hp[0] + 10, hp[1] - hp[2] * 2.2, { state: 'lie', s: V(40, 36), k: clamp(spring(t - 0.6, 0, { freq: 2.3 })), a: 0.9, ring: clamp((t - 0.6) / 1.2) });
      // ...and you let it go: the glyph fades instead of breaking
      const fade = clamp((t - 1.8) / 1.0);
      if (fade > 0) { g.save(); g.globalAlpha = 1 - fade; g.restore(); }
      if (fade > 0.1) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, hp[0] + 10, hp[1] - hp[2] * 2.2, V(180, 156), GOLD, 0.18 * (1 - fade)); g.restore(); }
    } });
}});

// s125 — you take her hand
registerShot('s125', { draw(g, t, info) {
  const cam = camAdd(camPath(t, [[0, { z: 1.5, x: 0, y: 60 }], [info.dur, { z: 1.62, x: 0, y: 40 }]], { endEase: 0.35 }), drift(t, 1.6, 12));
  SET.kitchenRoom(g, t, { z: 1, x: 0 }, { mood: 'interiorWarm' });
  const M = mood('interiorWarm'), gy = SET.GY(), s = V(1.5, 1.55);
  layer(g, cam, 1, (g) => {
    fig(g, { x: MOMX(), y: gy, s: s * 0.92, facing: 1, outfit: MOM, pose: breathe(POSES.sitBack, t, 0.8, 2), expr: 'smile', rim: { color: M.rim, dir: [0.3, -1], w: 4.4 }, shadow: false });
    fig(g, { x: YOUX(), y: gy, s: s * 1.06, facing: -1, outfit: YOU, pose: breathe({ ...POSES.sit, eF: [30, -108], hF: [72, -96], eB: [16, -108], hB: [58, -96] }, t, 0.6, 5), expr: (tt) => tt > 0.7 ? 'sad' : 'neutral', rim: { color: M.rim, dir: [-0.4, -1], w: 4.6 }, shadow: false });
    // the two hands meet in the middle of the table
    const p = ease.inOut(prog(t, 0.4, 1.3));
    const hx = lerp(YOUX() - V(180, 156), MOMX() + V(180, 156), p);
    const hy = gy - V(180, 164);
    glow(g, hx, hy, V(200, 172), GOLD, 0.22);
    circle(g, hx, hy, V(26, 22), alpha(GOLD, 0.30 * p));
    ring(g, hx, hy, V(34, 29), 3, alpha(GOLD_HI, 0.5 * p));
    // a gold thread passing from one wrist to the other
    goldThread(g, t, [[YOUX() - V(120, 104), gy - V(140, 128)], [hx, hy], [MOMX() + V(120, 104), gy - V(140, 128)]], { p: ease.inOut(prog(t, 0.6, 1.6)), w: 3.4, a: 0.85 });
  });
}});

// s126 — sometimes you don't need to say it
registerShot('s126', statement({ lines: ['ԵՐԲԵՄՆ ՃՇՄԱՐՏՈՒԹՅՈՒՆԸ', 'ԱՍԵԼՈՒ ԿԱՐԻՔ ՉԿԱ'], hi: 1, size: V(60, 52), y: 0.46, color: GOLD_HI,
  behind: (g, t) => {
    const k = clamp(spring(t - 0.4, 0, { freq: 1.8 }));
    g.save(); g.globalAlpha = 0.5 * k; glow(g, E.W / 2, E.H * 0.5, V(620, 520), GOLD, 0.14); g.restore();
    const k2 = clamp(spring(t - 1.1, 0, { freq: 2 }));
    g.save(); g.globalAlpha = k2 * 0.9; text(g, 'ՊԱՐԶԱՊԵՍ ԿՈՂՔԻՆ ԼԻՆԵԼ', E.W / 2, E.H * 0.62, { size: V(52, 45), color: alpha('#ffe9c8', 0.9), font: FONTS.title, weight: 700, spacing: 5 }); g.restore();
}}));
