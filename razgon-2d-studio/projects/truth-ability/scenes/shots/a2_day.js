// a2_day.js — first day: the kitchen with mom, the phone shop, and the friends who stop lying.
import { E, V, S, mood, clamp, lerp, ease, prog, rng, alpha, shade, mix, seg, circle, ring, poly, rr, linGrad, radGrad, glow, text, measure, layer, blurLayer, veil, backdrop, FONTS, registerShot, talkAmount, wordTime } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { camPath, drift, camAdd, spring, impact, fg } from '/engine/motion.js';
import * as SET from '../sets/room.js';
import { YOU, MOM, LEO, MIA, BRO, BLACK, SELL } from '../cast.js';
import { glyph, talkGlyph, goldThread, sparkBurst, cracks, card, screenGlow, frozenAir, lensFlare, wordPop, fig, blink, GOLD, GOLD_HI, LIE, LIE_HI, CYAN } from '../fx_truth.js';
import { sofaShot, faceShot, insertShot, bpShot, wideShot, camPush, camPull, camDrift, fgProp, ots, T } from '../lib.js';

const UIc = () => S().ui;
const KGY = () => SET.GY();
const KS = () => V(1.5, 1.55);           // figure scale in the kitchen
const kSeats = () => ({ mom: E.W * 0.38, you: E.W * 0.60 });

// ---------- kitchen pair helper ----------
function kitchenPair(g, t, cam, o = {}) {
  SET.kitchenRoom(g, t, { z: 1, x: 0 }, { mood: 'interiorWarm' });   // background at its natural camera
  const M = mood('interiorWarm'), gy = KGY(), s = KS(), p = kSeats();
  const seatY = gy;                   // the sit pose puts the feet on y=0, so feet stay on the floor
  layer(g, cam, 1, (g) => {
    FX.stool(g, p.mom, gy - 2, s * 0.92, shade(M.dark, 0.1));
    FX.stool(g, p.you, gy - 2, s * 1.06, shade(M.dark, 0.1));
    fig(g, { x: p.mom, y: seatY, s: s * 0.92, facing: 1, outfit: MOM, pose: breathe(o.momPose || POSES.sit, t, 1, 2), expr: col(o.momExpr, t, 'smile'), rim: { color: M.rim, dir: [0.3, -1], w: 4.2 }, shadow: false, talk: o.momTalk ? talkAmount(o.gt ?? t) : 0, blink: blink(t, 2) });
    fig(g, { x: p.you, y: seatY, s: s * 1.06, facing: -1, outfit: YOU, pose: breathe(o.youPose || POSES.sit, t, 0.8, 5), expr: col(o.youExpr, t, 'neutral'), rim: { color: M.rim, dir: [-0.4, -1], w: 4.4 }, shadow: false, talk: o.youTalk ? talkAmount(o.gt ?? t) : 0, blink: blink(t, 1) });
    if (o.glyphMom) { const hp = headPos({ x: p.mom, y: seatY, s: s * 0.92, facing: 1, pose: o.momPose || POSES.sit }); talkGlyph(g, t, hp[0] + 6, hp[1] - hp[2] * 2.1, { t0: o.glyphMom.t0 ?? 0.3, lieAt: o.glyphMom.lieAt, s: V(30, 28), seed: 7 }); }
    if (o.glyphYou) { const hp = headPos({ x: p.you, y: seatY, s: s * 1.06, facing: -1, pose: o.youPose || POSES.sit }); talkGlyph(g, t, hp[0] - 6, hp[1] - hp[2] * 2.1, { t0: o.glyphYou.t0 ?? 0.3, lieAt: o.glyphYou.lieAt, s: V(30, 28), seed: 8 }); }
    if (o.onStage) o.onStage(g, M, { p, s, seatY, gy });
  });
  // warm key over the pair so they read against the dark kitchen
  g.save(); g.globalCompositeOperation = 'lighter';
  glow(g, E.W * 0.5, gy - 200 * s, V(980, 760), '#ffbf7a', 0.13);
  g.restore();
  // the table top in front (hides the stool legs, gives the scene a readable foreground)
  const M2 = M;
  const ty = gy + V(46, 40);
  g.fillStyle = linGrad(g, 0, ty - 26, 0, ty + V(260, 230), [shade(M2.wall, 0.10), shade(M2.floor, -0.1), shade(M2.dark, -0.4)]);
  g.beginPath(); g.moveTo(-E.W * 0.2, ty - 26); g.lineTo(E.W * 1.2, ty - 26); g.lineTo(E.W * 1.35, ty + V(300, 260)); g.lineTo(-E.W * 0.35, ty + V(300, 260)); g.closePath(); g.fill();
  g.fillStyle = alpha('#ffffff', 0.10); g.fillRect(-E.W * 0.2, ty - 26, E.W * 1.4, 4);
  // two mugs with steam
  for (const [mx, sc2] of [[p.mom + V(170, 120), 1.15], [p.you - V(190, 130), 1.05]]) {
    rr(g, mx - 26 * sc2, ty - 60 * sc2, 52 * sc2, 58 * sc2, 8 * sc2); g.fillStyle = '#efe6dc'; g.fill();
    g.fillStyle = alpha('#b06a3a', 0.55); g.fillRect(mx - 26 * sc2, ty - 60 * sc2, 52 * sc2, 7 * sc2);
    ring(g, mx + 30 * sc2, ty - 34 * sc2, 13 * sc2, 5 * sc2, alpha('#efe6dc', 0.9));
    for (let i = 0; i < 3; i++) { const ph = ((t * 0.5 + i * 0.33) % 1); g.strokeStyle = alpha('#ffe9d2', 0.22 * (1 - ph)); g.lineWidth = 2.4; g.beginPath(); g.moveTo(mx - 8 + i * 8, ty - 66 * sc2); g.bezierCurveTo(mx - 20 + i * 8, ty - 96 * sc2 - ph * 40, mx + 4 + i * 8, ty - 120 * sc2 - ph * 60, mx - 6 + i * 8, ty - 150 * sc2 - ph * 80); g.stroke(); }
    FX.sparkle(g, mx, ty - 60 * sc2, 16 * sc2, '#ffd59a', 0.35);
  }
  return { M, gy, s, p, seatY };
}
const col = (v, t, d) => (typeof v === 'function' ? v(t) : (v || d));
// seated gesture variants (must stay seated — blending a standing pose lifts the figure off the cushion)
const SIT_TALK = { ...POSES.sit, head: [6, -183], sh: [2, -148], eF: [28, -122], hF: [58, -140], eB: [12, -112], hB: [34, -88] };
const SIT_LEAN = { ...POSES.sit, head: [10, -178], sh: [4, -145], eF: [30, -118], hF: [62, -104], eB: [18, -112], hB: [42, -92] };
const SIT_OPEN = { ...POSES.sit, eF: [24, -126], hF: [50, -152], eB: [4, -118], hB: [22, -150] };

// s028 — установка: the morning kitchen
registerShot('s028', wideShot({ set: (g, t, cam) => SET.kitchenRoom(g, t, cam, { mood: 'interiorWarm' }), cam: (t, info) => camPush(t, info, 1.0, 1.07, 0, -26, 3),
  figures: [{ x: E.W * 0.44, y: KGY(), s: KS(), facing: 1, outfit: YOU, pose: POSES.relaxed, expr: 'sleepy' }, { x: E.W * 0.62, y: KGY(), s: KS() * 0.98, facing: -1, outfit: MOM, pose: POSES.stand, expr: 'smile' }],
  fg: { kind: 'chair', x: 0.09, y: 1.06, s: 1.5 },
}));

// s029 — mom: "did you eat?"
registerShot('s029', { draw(g, t, info) {
  const cam = camPush(t, info, 1.22, 1.3, 20, 44, 5);
  const { M, gy, s, p, seatY } = kitchenPair(g, t, cam, { momExpr: 'smile', momTalk: true, youExpr: 'neutral', gt: info.globalT, momPose: posesAt(t, [[0, 'sit'], [1.1, 'sitBack']], 0.4) });
  if (t > 0.7) talkGlyph(g, t, p.mom + 10, seatY - 210 * s, { t0: 0.7, s: V(30, 28), seed: 11, state: 'truth' });
  fgProp(g, cam, { kind: 'cup', x: 0.86, y: 1.05, s: 1.1, color: '#20161a' });
}});

// s030 — "yes." and the glyph cracks
registerShot('s030', { draw(g, t, info) {
  const cam = camPush(t, info, 1.55, 1.62, -10, -20, 6);
  const { M, gy, s, p, seatY } = kitchenPair(g, t, cam, { youExpr: (t) => t > 0.5 ? 'neutral' : 'nervous', youTalk: true, gt: info.globalT, youPose: POSES.sit, momPose: POSES.sit });
  const hp = headPos({ x: p.you, y: seatY, s: s * 1.06, facing: -1, pose: POSES.sit });
  talkGlyph(g, t, hp[0] - 4, hp[1] - hp[2] * 2.0, { t0: 0.15, lieAt: 0.55, s: V(38, 34), seed: 12 });
  sparkBurst(g, t, hp[0] - 4, hp[1] - hp[2] * 2.0, { t0: 0.55, color: LIE, n: 10, seed: 4 });
}});

// s031 — she looks at you
registerShot('s031', { draw(g, t, info) {
  const cam = camDrift(t, info, 7);
  const { M, gy, s, p } = kitchenPair(g, t, cam, { momExpr: (t) => t > 0.4 ? 'smile' : 'neutral', youExpr: 'nervous', momPose: posesAt(t, [[0, 'sit'], [0.5, 'think'], [1.6, 'sitBack']], 0.5) });
  ots(g, cam, 1, { color: '#120c10', rim: '#ffd9a0' });
}});

// s032 — she already knows (giant face)
registerShot('s032', faceShot({ who: MOM, expr: 'smile', mood: 'interiorWarm', set: (g, t, cam) => SET.kitchenRoom(g, t, cam, { mood: 'interiorWarm' }), r: V(310, 330), veilA: 0.4, cy: 0.55,
}));

// s033 — at least you both know
registerShot('s033', { draw(g, t, info) {
  const cam = camPull(t, info, 1.3, 1.22, 0, 0, 8);
  const { M, gy, s, p, seatY } = kitchenPair(g, t, cam, { momExpr: (t) => t > 0.3 ? 'happy' : 'smile', youExpr: (t) => t > 0.6 ? 'smile' : 'neutral', momPose: POSES.sit, youPose: posesAt(t, [[0, 'sit'], [0.7, 'sitBack']], 0.5),
    onStage: (g2, M2, ctx) => { goldThread(g2, t, [[ctx.p.mom, ctx.seatY - 160 * ctx.s], [E.W / 2, ctx.seatY - 230 * ctx.s], [ctx.p.you, ctx.seatY - 160 * ctx.s]], { p: ease.inOut(prog(t, 0.5, 1.6)), w: 2.8, a: 0.75 }); } });
}});

// s034 — the shop
registerShot('s034', wideShot({ set: (g, t, cam) => SET.shop(g, t, cam, { mood: 'interiorCool' }), cam: (t, info) => camPush(t, info, 1.02, 1.1, 20, -20, 4),
  figures: [{ x: E.W * 0.4, y: KGY(), s: V(1.62, 1.66), facing: 1, outfit: YOU, pose: POSES.stand, expr: 'neutral' }, { x: E.W * 0.19, y: KGY(), s: V(1.55, 1.6), facing: 1, outfit: LEO, pose: POSES.relaxed, expr: 'smile' }, { x: E.W * 0.7, y: KGY(), s: V(1.68, 1.72), facing: -1, outfit: SELL, pose: POSES.holdFront, expr: 'smile' }],
}));

// s035 — "it's brand new"
registerShot('s035', { draw(g, t, info) {
  const cam = camPush(t, info, 1.26, 1.34, 30, 60, 9);
  SET.shop(g, t, cam, { mood: 'interiorCool' });
  const gy = KGY(), s = V(1.9, 1.95);
  layer(g, cam, 1, (g) => {
    fig(g, { x: E.W * 0.4, y: gy, s, facing: -1, outfit: SELL, pose: breathe(posesAt(t, [[0, 'holdFront'], [0.9, 'explain']], 0.45), t, 1, 2), expr: 'smile', rim: { color: '#cfe6ff', dir: [-0.4, -1], w: 4.4 }, shadow: false, talk: talkAmount(info.globalT), blink: blink(t, 2) });
    // the phone held up, screen flickers on
    screenGlow(g, E.W * 0.5, gy - 300, 120, CYAN, 0.3);
    talkGlyph(g, t, E.W * 0.4 + 20, gy - 500 * s / 1.9, { t0: 0.3, lieAt: info.dur * 0.62, s: V(48, 44), seed: 16 });
  });
  fgProp(g, cam, { kind: 'phone', x: 0.9, y: 1.04, s: 1.1, rot: 0.2 });
}});

// s036 — it's used (macro)
registerShot('s036', insertShot({ set: (g, t, cam) => SET.shop(g, t, cam, { mood: 'interiorCool' }), scale: 1.05,
  draw: (g, t) => {
    const cx = E.W * 0.5, cy = E.H * 0.52;
    g.save(); g.translate(cx, cy); g.rotate(-0.12);
    rr(g, -300, -420, 600, 840, 60); g.fillStyle = '#0d1220'; g.fill();
    rr(g, -282, -402, 564, 792, 48); g.fillStyle = alpha(CYAN, 0.18); g.fill();
    // scratches
    const r = rng(5);
    g.strokeStyle = alpha('#ffffff', 0.35); g.lineWidth = 1.6;
    for (let i = 0; i < 14; i++) { const x = -260 + r() * 520, y = -380 + r() * 740; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 20 + r() * 60, y + (r() - 0.5) * 26); g.stroke(); }
    // speaker dust
    g.fillStyle = alpha('#cfe0ff', 0.25); for (let i = 0; i < 26; i++) circle(g, -80 + r() * 160, -380 + r() * 14, 1.6 + r() * 2.2, alpha('#cfe0ff', 0.2 + r() * 0.3));
    g.restore();
    // a magnifier ring sweeps the corner
    const mx = cx - 120 + Math.sin(t * 1.2) * 40, my = cy + 210;
    ring(g, mx, my, 150, 5, alpha('#ffffff', 0.5)); glow(g, mx, my, 180, '#ffffff', 0.10);
  },
  glyph: { state: 'lie', x: 0.5, y: 0.16, t0: 0.8, s: V(44, 40) },
}));

// s037 — "battery is excellent"
registerShot('s037', { draw(g, t, info) {
  const cam = camPush(t, info, 1.28, 1.36, -20, -50, 12);
  SET.shop(g, t, cam, { mood: 'interiorCool' });
  const gy = KGY(), s = V(1.95, 2.0);
  layer(g, cam, 1, (g) => { fig(g, { x: E.W * 0.6, y: gy, s, facing: -1, outfit: SELL, pose: breathe(posesAt(t, [[0, 'holdFront'], [1.0, 'shrug']], 0.45), t, 1, 2), expr: 'smile', rim: { color: '#cfe6ff', dir: [-0.4, -1], w: 4.4 }, shadow: false, talk: talkAmount(info.globalT) }); });
  // floating battery card
  const k = clamp(spring(t - 0.4, 0, { freq: 2.2 }));
  const bx = E.W * 0.3, by = E.H * 0.34;
  g.save(); g.globalAlpha = k; g.translate(bx, by); g.scale(lerp(0.8, 1, k), lerp(0.8, 1, k));
  rr(g, -180, -70, 360, 140, 20); g.fillStyle = 'rgba(10,18,32,0.9)'; g.fill(); g.strokeStyle = alpha('#7fd0ff', 0.4); g.lineWidth = 2.5; g.stroke();
  rr(g, -140, -22, 280, 52, 10); g.strokeStyle = alpha('#cfe6ff', 0.7); g.lineWidth = 4; g.stroke();
  const lvl = lerp(0.92, 0.34, ease.inOut(prog(t, 0.7, info.dur * 0.85)));
  rr(g, -134, -16, 268 * lvl, 40, 6); g.fillStyle = lvl > 0.6 ? alpha(GOLD, 0.9) : alpha(LIE, 0.9); g.fill();
  g.fillStyle = alpha('#cfe6ff', 0.7); g.fillRect(142, -6, 12, 20);
  text(g, '92%', 0, -92, { size: 34, color: alpha('#cfe6ff', 0.9), font: FONTS.ui, weight: 900 });
  text(g, 'ՄԱՐՏԿՈՑ', 0, 92, { size: 26, color: alpha('#8fb8e8', 0.8), font: FONTS.ui, weight: 900, spacing: 4 });
  g.restore();
  talkGlyph(g, t, E.W * 0.62, gy - 500, { t0: 0.3, lieAt: 0.8, s: V(46, 42), seed: 17 });
}});

// s038 — it's worn out
registerShot('s038', insertShot({ mood: 'interiorCool',
  draw: (g, t) => {
    const cx = E.W * 0.5, cy = E.H * 0.54, w = V(760, 640), h = V(420, 380);
    g.save(); g.translate(cx, cy);
    rr(g, -w / 2, -h / 2, w, h, 18); g.fillStyle = 'rgba(10,18,32,0.9)'; g.fill(); g.strokeStyle = alpha('#7fd0ff', 0.35); g.lineWidth = 2.5; g.stroke();
    // axes
    g.strokeStyle = alpha('#8fb8e8', 0.4); g.lineWidth = 2; seg(g, [[-w / 2 + 60, -h / 2 + 40], [-w / 2 + 60, h / 2 - 56]], 2, alpha('#8fb8e8', 0.4)); seg(g, [[-w / 2 + 60, h / 2 - 56], [w / 2 - 40, h / 2 - 56]], 2, alpha('#8fb8e8', 0.4));
    // health curve dropping
    const p = ease.inOut(prog(t, 0.2, 1.6));
    g.strokeStyle = LIE; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath();
    for (let i = 0; i <= 60 * p; i++) { const u = i / 60, x = -w / 2 + 70 + u * (w - 120), y = -h / 2 + 70 + Math.pow(u, 1.6) * (h - 150); i ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke();
    g.fillStyle = alpha('#ffffff', 0.12); g.fillRect(-w / 2 + 60, h / 2 - 150, w - 100, 90);
    g.restore();
    text(g, '93%', cx - V(150, 128), cy - h / 2 - 34, { size: V(52, 46), color: alpha('#cfe0ff', 0.9), font: FONTS.ui, weight: 900 });
    seg(g, [[cx - V(66, 56), cy - h / 2 - 44], [cx + V(6, 5), cy - h / 2 - 34], [cx - V(66, 56), cy - h / 2 - 24]], 6, alpha(LIE, 0.9));
    text(g, '61%', cx + V(150, 128), cy - h / 2 - 34, { size: V(52, 46), color: alpha(LIE, 0.95), font: FONTS.ui, weight: 900, glow: 20, glowColor: alpha(LIE, 0.5) });
    text(g, 'ՄԱՐՏԿՈՑԻ ՄԱՇՎԱԾ', cx, cy + h / 2 + 40, { size: V(30, 26), color: alpha('#8fb8e8', 0.8), font: FONTS.ui, weight: 900, spacing: 4 });
}}));

// s039 — he smiles
registerShot('s039', faceShot({ who: SELL, expr: 'smirk', mood: 'interiorCool', set: (g, t, cam) => SET.shop(g, t, cam, { mood: 'interiorCool' }), r: V(300, 320), cy: 0.52, veilA: 0.42,
}));

// s040 — you don't
registerShot('s040', faceShot({ who: YOU, expr: 'neutral', mood: 'interiorCool', set: (g, t, cam) => SET.shop(g, t, cam, { mood: 'interiorCool' }), r: V(310, 330), cy: 0.55, veilA: 0.46, bgX: 120,
}));

// s041 — the money comes back
registerShot('s041', insertShot({ set: (g, t, cam) => SET.shop(g, t, cam, { mood: 'interiorCool' }),
  draw: (g, t) => {
    const cx = E.W * 0.5, cy = E.H * 0.52;
    // counter
    g.fillStyle = shade(mood('interiorCool').dark, 0.16); g.fillRect(cx - 520, cy + 40, 1040, 40);
    g.fillStyle = shade(mood('interiorCool').dark, 0.26); g.fillRect(cx - 520, cy + 32, 1040, 12);
    // cash sliding across
    const k = ease.out(prog(t, 0.15, 0.9));
    g.save(); g.translate(lerp(cx + 260, cx - 150, k), cy + 10); g.rotate(-0.04);
    for (let i = 0; i < 5; i++) { g.save(); g.translate(i * 3, -i * 5); rr(g, -110, -34, 220, 68, 6); g.fillStyle = ['#cfe0c0', '#b8d0a8', '#d8e4c0'][i % 3]; g.fill(); g.strokeStyle = alpha('#3a4a30', 0.4); g.lineWidth = 1.6; g.stroke(); circle(g, 0, 0, 22, alpha('#3a4a30', 0.12)); g.restore(); }
    g.restore();
    // receipt
    g.save(); g.translate(cx + 300, cy + 26); g.rotate(0.08);
    g.fillStyle = '#eef2f8'; g.fillRect(-70, -120, 140, 150); g.fillStyle = alpha('#3a4a60', 0.35); for (let i = 0; i < 6; i++) g.fillRect(-54, -100 + i * 20, 100 - i * 8, 6);
    g.restore();
    // two hands on the counter, fingers spread on the cash
    const hand = (hx, hy, rot, dir, cuffCol) => {
      g.save(); g.translate(hx, hy); g.rotate(rot);
      g.fillStyle = '#100c14';
      rr(g, dir * 120, -58, 160 * (dir > 0 ? 1 : -1), 116, 40); g.fill();      // wrist
      rr(g, -56, -52, 132, 104, 34); g.fill();                                  // palm
      for (let i = 0; i < 4; i++) {                                              // fingers
        const fx = -48 + i * 34, len = 92 - Math.abs(1.5 - i) * 18;
        rr(g, fx, -len, 26, len + 30, 13); g.fill();
      }
      rr(g, -70, -6, 40, 86, 18); g.fill();                                      // thumb
      g.fillStyle = cuffCol; rr(g, dir * 250 - 60, -70, 122, 140, 34); g.fill();
      g.restore();
    };
    hand(cx + 300, cy - 26, -0.12, 1, alpha('#1a1622', 0.96));
    hand(cx - 330, cy + 2, 0.1, -1, alpha('#3a2a20', 0.96));
  },
}));

// s042 — ten minutes, hundreds saved (counter)
registerShot('s042', { draw(g, t, info) {
  const M = mood('interiorCool');
  backdrop(g, [shade(M.sky[0], -0.5), shade(M.sky[1], -0.55)]);
  const k = clamp(spring(t - 0.1, 0, { freq: 2.2 }));
  const val = Math.round(lerp(0, 320, ease.out(prog(t, 0.25, 1.5))));
  const cx = E.W / 2, cy = E.H * 0.44;
  g.save(); g.translate(cx, cy); g.scale(lerp(0.86, 1, k), lerp(0.86, 1, k));
  text(g, '−' + val + ' €', 0, 0, { size: V(190, 150), color: GOLD_HI, font: FONTS.ui, weight: 900, glow: 34, glowColor: alpha(GOLD, 0.55), spacing: 2 });
  g.restore();
  text(g, '10 ՐՈՊԵՈՒՄ', cx, cy + V(140, 120), { size: V(38, 32), color: alpha('#9fd8ff', 0.85), font: FONTS.ui, weight: 900, spacing: 9, alpha: clamp((t - 0.5) / 0.5) });
  // rising bars behind
  for (let i = 0; i < 14; i++) { const h = (i / 14) * V(300, 240) * k, x = cx - V(420, 340) + i * V(62, 52); g.fillStyle = alpha(GOLD, 0.08 + 0.1 * (i / 14)); g.fillRect(x, cy + V(250, 220) - h, V(42, 36), h); }
  glyph(g, cx, E.H * 0.16, { state: 'truth', s: V(40, 36), k, ring: clamp((t - 0.4) / 1.1) });
}});

// s043 — you don't fall for it
registerShot('s043', { draw(g, t, info) {
  const cam = camPush(t, info, 1.06, 1.0, 0, 20, 14);
  SET.shop(g, t, cam, { mood: 'interiorCool' });
  const gy = KGY();
  // walking out: you move right past the counter
  const x = lerp(E.W * 0.3, E.W * 0.62, ease.inOut(prog(t, 0.2, info.dur)));
  layer(g, cam, 1, (g) => {
    fig(g, { x, y: gy, s: V(1.72, 1.76), facing: 1, outfit: YOU, pose: { ...POSES.relaxed, kF: [26, -50], fF: [44, 0], kB: [-26, -50], fB: [-44, 0] }, expr: 'smirk', rim: { color: '#cfe6ff', dir: [0.4, -1], w: 4.6 } });
    fig(g, { x: x - 190, y: gy - 6, s: V(1.62, 1.66), facing: 1, outfit: LEO, pose: POSES.relaxed, expr: 'happy', rim: { color: '#cfe6ff', dir: [0.4, -1], w: 4.2 } });
    fig(g, { x: E.W * 0.87, y: gy, s: V(1.6, 1.64), facing: -1, outfit: SELL, pose: POSES.shrug, expr: 'worried', rim: { color: '#cfe6ff', dir: [-0.4, -1], w: 3.6 }, dim: true });
    talkGlyph(g, t, E.W * 0.87, gy - 470, { t0: 0.2, s: V(32, 30), lieAt: 0.9, seed: 19 });
  });
}});

// s044 — next: friendship
registerShot('s044', { draw(g, t, info) {
  const cam = camPush(t, info, 1.12, 1.2, 30, 0, 16);
  const S2 = SET.hangout(g, t, cam, { mood: 'dusk', seatScale: V(1.74, 1.78) });
  const se = S2.seats, M = S2.M, sc = V(1.46, 1.5);
  layer(g, cam, 1, (g) => {
    fig(g, { x: se.x[2], y: se.y, s: sc, facing: -1, outfit: LEO, pose: breathe(POSES.sitBack, t, 1, 2), expr: 'smile', rim: { color: M.rim, dir: [-0.4, -1], w: 4.6 }, shadow: false });
    fig(g, { x: se.x[1], y: se.y, s: sc, facing: 1, outfit: YOU, pose: breathe(POSES.sit, t, 1, 1), expr: 'neutral', rim: { color: M.rim, dir: [0.4, -1], w: 4.6 }, shadow: false });
  });
  fgProp(g, cam, { kind: 'cup', x: 0.1, y: 1.05, s: 1.3 });
}});

// s045 — "your new video is great"
registerShot('s045', { draw(g, t, info) {
  const cam = camPush(t, info, 1.46, 1.56, -10, 30, 17);
  const sc = V(1.74, 1.78);
  const S2 = SET.hangout(g, t, cam, { mood: 'dusk', seatScale: sc }); const se = S2.seats, M = S2.M;
  layer(g, cam, 1, (g) => {
    fig(g, { x: se.x[2], y: se.y, s: sc, facing: -1, outfit: LEO, pose: breathe(posesAt(t, [[0, POSES.sitBack], [1.0, SIT_TALK]], 0.4), t, 1, 2), expr: 'happy', talk: talkAmount(info.globalT), rim: { color: M.rim, dir: [-0.4, -1], w: 4.6 }, shadow: false, blink: blink(t, 2) });
    const hp = headPos({ x: se.x[2], y: se.y, s: sc, facing: -1, pose: POSES.sit }); talkGlyph(g, t, hp[0] + 8, hp[1] - hp[2] * 2, { t0: 0.25, lieAt: 0.9, s: V(38, 35), seed: 21 });
  });
  ots(g, cam, -1, { color: '#120c10', rim: '#ffd9a0' });
}});

// s046 — he thinks it's boring (giant face)
registerShot('s046', faceShot({ who: LEO, expr: (t) => t > 1.1 ? 'sleepy' : 'smile', mood: 'dusk', r: V(310, 335), cy: 0.54, veilA: 0.46, bgX: 60,
  after: (g, t, info, { cx, cy, r }) => {
    // a small thought bubble: a dull screen and a yawn
    const k = clamp(spring(t - 1.2, 0, { freq: 2.2 })); if (k <= 0) return;
    g.save(); g.globalAlpha = k * 0.95; g.translate(cx + r * 1.16, cy - r * 0.62); g.scale(k, k);
    // thought bubble: a phone with a flat progress bar and a yawn
    rr(g, -V(150, 130), -V(110, 96), V(300, 260), V(200, 175), 30); g.fillStyle = 'rgba(12,18,30,0.95)'; g.fill();
    g.strokeStyle = alpha('#9fb6d8', 0.45); g.lineWidth = 3; g.stroke();
    // tail bubbles toward his head
    for (const [bx, by, br] of [[-V(150, 130), V(120, 105), V(20, 17)], [-V(196, 170), V(168, 146), V(11, 10)]]) { circle(g, bx, by, br, 'rgba(12,18,30,0.95)'); ring(g, bx, by, br, 2.5, alpha('#9fb6d8', 0.4)); }
    rr(g, -V(96, 83), -V(76, 66), V(192, 168), V(108, 94), 10); g.fillStyle = alpha('#4a5a7a', 0.5); g.fill();
    // the bar, barely moving
    rr(g, -V(80, 70), V(10, 8), V(160, 140), V(18, 16), 9); g.fillStyle = alpha('#ffffff', 0.16); g.fill();
    rr(g, -V(80, 70), V(10, 8), V(160, 140) * 0.12, V(18, 16), 9); g.fillStyle = alpha('#9fb6d8', 0.85); g.fill();
    text(g, '...', 0, -V(40, 35), { size: V(46, 40), color: alpha('#9fb6d8', 0.85), font: FONTS.ui, weight: 900 });
}}));

// s047 — "what didn't you like?"
registerShot('s047', { draw(g, t, info) {
  const cam = camPush(t, info, 1.46, 1.54, 0, -24, 18);
  const sc = V(1.74, 1.78);
  const S2 = SET.hangout(g, t, cam, { mood: 'dusk', seatScale: sc }); const se = S2.seats, M = S2.M;
  layer(g, cam, 1, (g) => {
    fig(g, { x: se.x[1], y: se.y, s: sc, facing: 1, outfit: YOU, pose: breathe(posesAt(t, [[0, POSES.sit], [0.6, SIT_OPEN]], 0.4), t, 1, 1), expr: 'neutral', talk: talkAmount(info.globalT), rim: { color: M.rim, dir: [0.4, -1], w: 4.6 }, shadow: false });
    fig(g, { x: se.x[2], y: se.y, s: sc, facing: -1, outfit: LEO, pose: breathe(POSES.sitBack, t, 0.6, 2), expr: 'surprised', rim: { color: M.rim, dir: [-0.4, -1], w: 4.4 }, shadow: false });
    // the cup stops halfway (freeze of a small action)
    const hp = headPos({ x: se.x[1], y: se.y, s: sc, facing: 1, pose: POSES.sit }); talkGlyph(g, t, hp[0] + 10, hp[1] - hp[2] * 2, { t0: 0.3, s: V(36, 33), seed: 23 });
  });
}});

// s048 — silence
registerShot('s048', { draw(g, t, info) {
  const cam = camAdd(camPath(t, [[0, { z: 1.34, x: 0 }], [info.dur, { z: 1.3, x: 0 }]], { endEase: 0.4 }), drift(t, 1.2, 19));
  const sc = V(1.74, 1.78);
  const S2 = SET.hangout(g, t, cam, { mood: 'dusk', seatScale: sc }); const se = S2.seats, M = S2.M;
  layer(g, cam, 1, (g) => {
    fig(g, { x: se.x[1], y: se.y, s: sc, facing: 1, outfit: YOU, pose: breathe(POSES.sit, t, 0.5, 1), expr: 'neutral', rim: { color: M.rim, dir: [0.4, -1], w: 4.6 }, shadow: false });
    fig(g, { x: se.x[2], y: se.y, s: sc, facing: -1, outfit: LEO, pose: breathe(POSES.sitBack, t, 0.5, 2), expr: 'thinking', rim: { color: M.rim, dir: [-0.4, -1], w: 4.4 }, shadow: false });
  });
  // a hanging grey glyph, undecided
  const k = clamp(spring(t - 0.4, 0, { freq: 2 }));
  glyph(g, E.W * 0.52, E.H * 0.22, { state: 'hidden', s: V(38, 34), k, a: 0.7 });
  // clock ticking: a small digital time
  text(g, '20:14', E.W * 0.86, E.H * 0.1, { size: V(28, 26), color: alpha('#9fb6d8', 0.5), font: FONTS.ui, weight: 900 });
}});

// s049 — "finally, a normal opinion"
registerShot('s049', { draw(g, t, info) {
  const cam = camPush(t, info, 1.5, 1.58, -30, -12, 20);
  const sc = V(1.74, 1.78);
  const S2 = SET.hangout(g, t, cam, { mood: 'dusk', seatScale: sc }); const se = S2.seats, M = S2.M;
  layer(g, cam, 1, (g) => {
    fig(g, { x: se.x[2], y: se.y, s: sc, facing: -1, outfit: LEO, pose: breathe(posesAt(t, [[0, POSES.sitBack], [0.5, SIT_OPEN], [1.6, SIT_LEAN]], 0.45), t, 1, 2), expr: 'smirk', talk: talkAmount(info.globalT), rim: { color: M.rim, dir: [-0.4, -1], w: 4.6 }, shadow: false, blink: blink(t, 2) });
    const hp = headPos({ x: se.x[2], y: se.y, s: sc, facing: -1, pose: POSES.sitBack }); talkGlyph(g, t, hp[0] + 6, hp[1] - hp[2] * 2, { t0: 0.2, s: V(38, 35), seed: 25 });
  });
  fgProp(g, cam, { kind: 'cup', x: 0.9, y: 1.04, s: 1.2 });
}});

// s050 — feels like a win
registerShot('s050', { draw(g, t, info) {
  const cam = camPush(t, info, 1.62, 1.7, -16, -30, 21);
  const sc = V(1.74, 1.78);
  const S2 = SET.hangout(g, t, cam, { mood: 'dusk', seatScale: sc }); const se = S2.seats, M = S2.M;
  layer(g, cam, 1, (g) => { fig(g, { x: se.x[1], y: se.y, s: sc, facing: 1, outfit: YOU, pose: POSES.sit, expr: 'smirk', rim: { color: M.rim, dir: [0.4, -1], w: 4.6 }, shadow: false }); });
  // gold sparkles
  const r = rng(31);
  for (let i = 0; i < 18; i++) { const ph = (t * 0.5 + r()) % 1, x = E.W * (0.3 + r() * 0.4), y = E.H * (0.3 + r() * 0.4) - ph * 60; circle(g, x, y, 2.4 * (1 - ph), alpha(GOLD, 0.7 * (1 - ph))); }
  const k = clamp(spring(t - 0.3, 0, { freq: 2.2 })); glyph(g, E.W * 0.62, E.H * 0.2, { state: 'truth', s: V(34, 31), k, ring: clamp((t - 0.3) / 0.9) });
}});

// s051 — but wait (freeze)
registerShot('s051', { draw(g, t, info) {
  const cam = camAdd(camPath(t, [[0, { z: 1.42, x: -10 }], [info.dur, { z: 1.36, x: -4 }]], { endEase: 0.5 }), drift(t * 0.3, 1, 22));
  const sc = V(1.74, 1.78);
  const S2 = SET.hangout(g, t, cam, { mood: 'dusk', seatScale: sc }); const se = S2.seats, M = S2.M;
  layer(g, cam, 1, (g) => { fig(g, { x: se.x[1], y: se.y, s: sc, facing: 1, outfit: YOU, pose: POSES.sit, expr: (tt) => tt > 0.6 ? 'worried' : 'smirk', rim: { color: M.rim, dir: [0.4, -1], w: 4.6 }, shadow: false }); });
  frozenAir(g, t, { count: 70, color: '#ffe9c8' });
  veil(g, '#0a0612', 0.22);
  text(g, '1 վրկ', E.W - V(90, 60), V(120, 140), { size: V(34, 30), color: alpha('#cfe0ff', 0.85), font: FONTS.ui, weight: 900, align: 'right', spacing: 3 });
  const k = clamp(spring(t - 0.7, 0, { freq: 2.2 })); glyph(g, E.W * 0.5, E.H * 0.2, { state: 'question', s: V(44, 40), k });
}});

// s052 — stronger or more fragile?
registerShot('s052', { draw(g, t, info) {
  const M = mood('void'); backdrop(g, M.sky);
  const cx = E.W / 2, cy = E.H * 0.5;
  // left: a thick gold cable
  const p1 = ease.inOut(prog(t, 0.1, 1.2));
  goldThread(g, t, [[cx - 620, cy - 120], [cx - 420, cy - 40], [cx - 220, cy - 90], [cx - 60, cy - 10]], { p: p1, w: 9, a: 0.9 });
  // right: a cable cracking into dust
  const p2 = ease.inOut(prog(t, 0.5, 1.8));
  goldThread(g, t, [[cx + 60, cy - 10], [cx + 220, cy - 90], [cx + 420, cy - 40], [cx + 620, cy - 120]], { p: p2, w: 9, a: 0.55 });
  const r = rng(41);
  for (let i = 0; i < 40; i++) { const u = r(), x = cx + 60 + u * 560, y = cy - 10 - Math.sin(u * Math.PI) * 70 + (r() - 0.5) * 40; const a = clamp((t - 3.2) / 1.2) * (1 - clamp((t - 4.4) / 1.4)); if (a > 0) circle(g, x, y + (t - 3.2) * 30 * r(), 2.4, alpha(GOLD, 0.5 * a)); }
  const k1 = clamp(spring(t - 3.2, 0, { freq: 2.4 })); cracks(g, cx + 340, cy - 60, { p: clamp((t - 3.3) / 1.1), n: 9, len: 260, color: '#ffffff', a: 0.35, seed: 8 });
  text(g, 'ԱՄՈՒՐ', cx - 340, cy + 130, { size: V(44, 38), color: alpha(GOLD, 0.9 * p1), font: FONTS.title, weight: 700, spacing: 6 });
  text(g, 'ՓԽՐՈՒՆ', cx + 340, cy + 130, { size: V(44, 38), color: alpha('#9fb6d8', 0.9 * p2), font: FONTS.title, weight: 700, spacing: 6 });
}});
