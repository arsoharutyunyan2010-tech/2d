// a1_hook.js — cold open: the hangout, three friends, three lies already in the air.
import { E, V, S, mood, clamp, lerp, ease, prog,  rng, noise, alpha, shade, mix, seg, circle, ring, poly, rr, linGrad, radGrad, glow, text, measure, layer, blurLayer, veil, backdrop, FONTS, registerShot, shake, talkAmount } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { camPath, travel, drift, camAdd, spring, spring as spr, impact, posesSpring, smear, fg, kText } from '/engine/motion.js';
import { hangout, street, gala, GY as GYof } from '../sets/room.js';
import { YOU, MOM, LEO, MIA, BRO, BLACK, SELL, CROWD } from '../cast.js';
import { glyph, talkGlyph, goldThread, sparkBurst, cracks, card, avatar, screenGlow, frozenAir, lensFlare, wordPop, fig, blink, GOLD, GOLD_HI, LIE, LIE_HI, CYAN } from '../fx_truth.js';

const SS = () => V(1.6, 1.7);
const seats = () => ({ you: E.W / 2 - V(470, 300), leo: E.W / 2 - V(150, 90), mia: E.W / 2 + V(190, 130), bro: E.W / 2 + V(500, 320) });

// s001 — establishing wide, the sun burning behind them
registerShot('s001', { draw(g, t, info) {
  const cam = camAdd(camPath(t, [[0, { z: 1.0, x: 0 }], [info.dur, { z: 1.07, x: -34 }]]), drift(t, 4, 2));
  const { GY, M } = hangout(g, t, cam, { mood: 'dusk' });
  const p = seats(), s = SS(), gt = info.globalT;
  layer(g, cam, 1, (g) => {
    const tp = [0, 999];
    fig(g, { x: p.leo, y: GY, s, facing: -1, outfit: LEO, pose: breathe(POSES.sitBack, t, 1, 1), expr: 'smile', talk: talkAmount(gt, 0.6, 3.4), rim: { color: M.rim, dir: [-0.4, -1], w: 4.2 }, shadow: false });
    fig(g, { x: p.mia, y: GY, s: s * 0.98, facing: 1, outfit: MIA, pose: breathe(POSES.crossArms === undefined ? POSES.sitBack : POSES.sitBack, t, 1, 2), expr: 'smirk', rim: { color: M.rim, dir: [0.4, -1], w: 4.2 }, shadow: false, blink: blink(t, 2) });
    fig(g, { x: p.bro, y: GY, s: s * 0.96, facing: 1, outfit: BRO, pose: breathe(POSES.sit, t, 1, 3), expr: 'smile', rim: { color: M.rim, dir: [0.5, -1], w: 4.2 }, shadow: false });
    fig(g, { x: p.you, y: GY, s: s * 1.02, facing: 1, outfit: YOU, pose: breathe(POSES.sitBack, t, 0.6, 4), expr: 'neutral', rim: { color: M.rim, dir: [-0.5, -1], w: 4.6 }, shadow: false, blink: blink(t, 1) });
    // their glyphs hang in the air, already cracked
    talkGlyph(g, t, p.leo + 10, GY - 420 * s, { t0: 0.35, lieAt: 1.15, s: V(30, 28), seed: 1 });
    talkGlyph(g, t, p.mia, GY - 400 * s, { t0: 1.0, lieAt: 1.9, s: V(27, 25), seed: 2 });
    talkGlyph(g, t, p.bro + 6, GY - 380 * s, { t0: 1.6, lieAt: 2.4, s: V(25, 24), seed: 3 });
  });
  FX.dust(g, t, { count: 46, color: '#ffe2bd', a: 0.35 });
  lensFlare(g, E.W * 0.5, E.H * 0.30, E.W * 1.2, '#ffe0b0', 0.14);
  wordPop(g, t, 'ՃՇՄԱՐՏՈՒԹՅԱՆ ԳԻՆԸ', E.W / 2, V(120, 150), { t0: 3.4, dur: 2.2, size: V(56, 50), color: alpha(GOLD, 0.9), glowA: 22, spacing: 6 });
}});

// s002 — Leo tells his story
registerShot('s002', { draw(g, t, info) {
  const cam = camAdd(camPath(t, [[0, { z: 1.28, x: -30 }], [info.dur * 0.55, { z: 1.36, x: -58 }], [info.dur, { z: 1.32, x: -20 }]]), drift(t, 3, 5));
  const { GY, M } = hangout(g, t, cam, { mood: 'dusk' });
  const p = seats(), s = SS() * 1.02, gt = info.globalT;
  layer(g, cam, 1, (g) => {
    fig(g, { x: p.bro, y: GY, s: s * 0.95, facing: 1, outfit: BRO, pose: breathe(POSES.sit, t, 1, 3), expr: 'smile', rim: { color: M.rim, dir: [0.6, -1], w: 3.4 }, shadow: false, dim: true });
    fig(g, { x: p.leo, y: GY, s: s * 1.12, facing: -1, outfit: LEO, pose: breathe(posesAt(t, [[0, 'sit'], [1.0, 'explain'], [info.dur - 0.5, 'sitBack']], 0.45), t, 1, 1), expr: posesAt(t, [[0, 'smile']]) && (t > info.dur * 0.62 ? 'smirk' : 'happy'), talk: talkAmount(gt), rim: { color: M.rim, dir: [-0.35, -1], w: 5 }, shadow: false, blink: blink(t, 1) });
    // the lie arrives mid-sentence
    talkGlyph(g, t, p.leo + 20, GY - 470 * s, { t0: 0.5, lieAt: info.dur * 0.68, s: V(38, 34), seed: 4 });
    sparkBurst(g, t, p.leo + 20, GY - 470 * s, { t0: info.dur * 0.68, color: LIE, n: 14, seed: 9 });
  });
  // foreground: a blurred cup on the low table
  fg(g, cam, (g) => { const bx = E.W * 0.82, by = E.H * 1.03; rr(g, bx - 60, by - 120, 120, 130, 16); g.fillStyle = '#241a20'; g.fill(); glow(g, bx, by - 118, 200, '#ffd59a', 0.16); }, { depth: 1.75, blur: 16 });
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.3 });
}});

// s003 — Mia, no secrets
registerShot('s003', { draw(g, t, info) {
  const cam = camAdd(camPath(t, [[0, { z: 1.3, x: 40 }], [info.dur, { z: 1.42, x: 66 }]]), drift(t, 3, 7));
  const { GY, M } = hangout(g, t, cam, { mood: 'dusk' });
  const p = seats(), s = SS() * 1.1, gt = info.globalT;
  layer(g, cam, 1, (g) => {
    fig(g, { x: p.mia, y: GY, s: s * 0.98, facing: 1, outfit: MIA, pose: breathe(posesAt(t, [[0, 'sitBack'], [1.4, 'sit']], 0.5), t, 1, 2), expr: t > 1.5 ? 'smirk' : 'neutral', talk: talkAmount(gt), rim: { color: M.rim, dir: [0.5, -1], w: 5 }, shadow: false, blink: blink(t, 2) });
    talkGlyph(g, t, p.mia + 4, GY - 450 * s, { t0: 0.3, lieAt: info.dur * 0.45, s: V(36, 33), seed: 5 });
  });
  fg(g, cam, (g) => { const bx = E.W * 0.14, by = E.H * 1.02; circle(g, bx, by - 40, 120, '#1a1218'); }, { depth: 1.8, blur: 18 });
  FX.dust(g, t, { count: 30, color: '#ffe2bd', a: 0.3 });
}});

// s004 — the brother's phone
registerShot('s004', { draw(g, t, info) {
  const cam = camAdd(camPath(t, [[0, { z: 1.22, x: 70 }], [info.dur, { z: 1.3, x: 40 }]]), drift(t, 3, 3));
  const { GY, M } = hangout(g, t, cam, { mood: 'dusk' });
  const p = seats(), s = SS(), gt = info.globalT;
  layer(g, cam, 1, (g) => {
    fig(g, { x: p.bro, y: GY, s: s * 1.05, facing: 1, outfit: BRO, pose: breathe(POSES.sit, t, 1, 3), expr: 'smile', talk: talkAmount(gt), rim: { color: M.rim, dir: [0.4, -1], w: 4.8 }, shadow: false });
    // the stolen phone glows behind his leg
    screenGlow(g, p.bro + 46 * s, GY - 74 * s, 90, CYAN, 0.28 + 0.1 * Math.sin(t * 3));
    talkGlyph(g, t, p.bro + 6, GY - 430 * s, { t0: 0.4, lieAt: 1.3, s: V(32, 30), seed: 6 });
  });
  // OTS: blurred shoulder of the hero in the foreground
  fg(g, cam, (g) => { circle(g, E.W * 0.16, E.H * 0.82, 190, '#120c10'); g.fillRect(E.W * 0.16 - 200, E.H * 0.82, 400, 500); }, { depth: 1.7, blur: 20 });
  FX.dust(g, t, { count: 34, color: '#ffe2bd', a: 0.3 });
}});

// s005 — you already know (giant face, three red glyphs in the eyes)
registerShot('s005', { draw(g, t, info) {
  blurLayer(g, 15, (g) => hangout(g, t, { z: 1.55, x: -180, y: -90 }, { mood: 'dusk' }), null, 1);
  veil(g, '#140a12', 0.42);
  const M = mood('dusk'), r = V(300, 330) * (1 + 0.05 * t / info.dur);
  bigFace(g, E.W * 0.5, E.H * V(0.58, 0.52), r, { outfit: YOU, expr: t > 1.1 ? 'determined' : 'neutral', look: [0.15, -0.1], rimColor: M.rim, rimSide: -1, blink: blink(t, 1) });
  const hp = [E.W * 0.5, E.H * V(0.58, 0.52)];
  [[-0.34, -0.08], [0.32, -0.08], [-0.02, -0.12]].forEach(([dx, dy], i) => glyph(g, hp[0] + dx * r * 2.2, hp[1] + dy * r * 2.2, { state: 'lie', s: r * 0.14, k: clamp(spring(t - 0.5 - i * 0.25, 0, { freq: 2.4, damp: 0.5 })), a: 0.85, seed: 4 + i }));
  FX.dust(g, t * 0.4, { count: 26, color: '#ffd0b0', a: 0.25 });
}});

// s006 — the party photo
registerShot('s006', { draw(g, t, info) {
  const M = mood('dusk');
  backdrop(g, [shade(M.sky[0], -0.45), shade(M.sky[1], -0.5)]);
  const k = ease.out(prog(t, 0.05, 0.5));
  const pw = V(760, 760), ph = pw * 0.78, px = E.W / 2 - pw / 2, py = E.H / 2 - ph / 2 - 20;
  g.save(); g.translate(E.W / 2, E.H / 2); g.rotate(-0.025); g.scale(0.92 + 0.08 * k, 0.92 + 0.08 * k); g.globalAlpha = k; g.translate(-E.W / 2, -E.H / 2);
  rr(g, px - 14, py - 14, pw + 28, ph + 28, 22); g.fillStyle = '#f2ece4'; g.fill();
  g.save(); rr(g, px, py, pw, ph, 8); g.clip();
  g.fillStyle = linGrad(g, 0, py, 0, py + ph, ['#3a1e48', '#6a2a44', '#1c1424']); g.fillRect(px, py, pw, ph);
  for (let i = 0; i < 26; i++) { const r = rng(i + 3)(); const cx = px + pw * (0.08 + r * 0.84), cy = py + ph * (0.1 + rng(i + 31)() * 0.7); g.save(); g.translate(cx, cy); g.rotate(r * 6 + t * 0.3); g.fillStyle = ['#ff8a8a', '#ffd47e', '#8fe0ff', '#c9a6ff'][i % 4]; g.globalAlpha = 0.5; g.fillRect(-4, -16, 8, 32); g.restore(); }
  g.globalAlpha = 1;
  // Leo in the photo, arms up, laughing — but the caption says he was home
  fig(g, { x: px + pw * 0.5, y: py + ph * 0.92, s: pw / 720 * 2.1, facing: -1, outfit: LEO, pose: POSES.cheer, expr: 'joy', rim: { color: '#ffcf9a', dir: [0, -1], w: 4 } });
  fig(g, { x: px + pw * 0.22, y: py + ph * 0.96, s: pw / 720 * 1.6, facing: 1, outfit: { top: 'tshirt', color: '#3a5a8a' }, pose: POSES.wave, expr: 'happy', rim: { color: '#ff9ad0', dir: [0, -1], w: 3.4 } });
  g.restore();
  // timestamp stamp
  g.font = `800 ${Math.round(pw * 0.042)}px NotoArm`; g.textAlign = 'left'; g.textBaseline = 'top';
  g.fillStyle = '#f7cf98'; g.fillText('ԵՐԵԿ, 23:41', px + 18, py + ph - pw * 0.07);
  g.restore();
  // the glyph stamps onto the photo
  glyph(g, E.W / 2 + pw * 0.36, py + 40, { state: 'lie', s: V(52, 48), k: clamp(spring(t - 0.7, 0, { freq: 2.6, damp: 0.45 })), ring: clamp((t - 0.7) / 0.9), seed: 12 });
  sparkBurst(g, t, E.W / 2 + pw * 0.36, py + 40, { t0: 0.7, color: LIE, n: 12 });
  FX.dust(g, t, { count: 30, color: '#ffd0b0', a: 0.22 });
}});

// s007 — two cups, top down
registerShot('s007', { draw(g, t, info) {
  const M = mood('dusk');
  backdrop(g, [shade(M.floor, -0.3), shade(M.dark, -0.2)]);
  const k = ease.out(prog(t, 0, 0.6));
  g.save(); g.translate(E.W / 2, E.H / 2 + 30); g.scale(0.94 + 0.06 * k, 0.94 + 0.06 * k); g.rotate(-0.03); g.translate(-E.W / 2, -E.H / 2);
  // table top
  g.fillStyle = linGrad(g, 0, E.H * 0.2, 0, E.H, ['#4a3226', '#2a1b16']); g.fillRect(0, E.H * 0.18, E.W, E.H * 0.8);
  FX.floorLines(g, E.H * 0.2, E.H, 'rgba(0,0,0,.22)', 0.09);
  // two cups + a plate
  const cup = (x, y, s) => { circle(g, x, y, 62 * s, '#f2ece4'); circle(g, x, y, 52 * s, '#3a1e16'); circle(g, x, y, 52 * s, alpha('#7a4a2a', 0.85)); glow(g, x, y, 120 * s, '#ffd59a', 0.15); ring(g, x, y, 62 * s, 4 * s, alpha('#ffffff', 0.4)); };
  cup(E.W * 0.38, E.H * 0.56, 1.15); cup(E.W * 0.62, E.H * 0.48, 1.0);
  // Mia's sleeve at the edge
  g.fillStyle = '#c9a6d6'; g.beginPath(); g.ellipse(E.W * 0.86, E.H * 0.78, 190, 96, -0.5, 0, 7); g.fill();
  g.fillStyle = shade('#c9a6d6', -0.25); g.beginPath(); g.ellipse(E.W * 0.86, E.H * 0.78, 150, 70, -0.5, 0, 7); g.fill();
  // a phone lying face up beside the cups
  g.save(); g.translate(E.W * 0.5, E.H * 0.72); g.rotate(0.22); rr(g, -52, -96, 104, 192, 14); g.fillStyle = '#0c0e18'; g.fill(); rr(g, -44, -88, 88, 176, 10); g.fillStyle = alpha(CYAN, 0.25); g.fill(); glow(g, 0, 0, 160, CYAN, 0.18);
  g.fillStyle = alpha('#dce8ff', 0.6); for (let i = 0; i < 3; i++) g.fillRect(-32, -58 + i * 26, 64 - i * 12, 10); g.restore();
  g.restore();
  glyph(g, E.W * 0.62, E.H * 0.26, { state: 'lie', s: V(44, 40), k: clamp(spring(t - 0.6, 0, { freq: 2.4 })), ring: clamp((t - 0.6) / 0.9) });
  FX.dust(g, t, { count: 26, color: '#ffd0b0', a: 0.2 });
}});

// s008 — the phone in a brother-sized hand
registerShot('s008', { draw(g, t, info) {
  const M = mood('dusk');
  backdrop(g, [shade(M.floor, -0.35), shade(M.dark, -0.25)]);
  const k = ease.out(prog(t, 0, 0.5));
  g.save(); g.translate(E.W * 0.5, E.H * 0.56); g.scale(0.9 + 0.1 * k, 0.9 + 0.1 * k); g.rotate(-0.12);
  // a chunky hand holding the phone
  g.fillStyle = '#0e0b12'; g.beginPath(); g.ellipse(0, 250, 300, 190, 0, 0, 7); g.fill();
  rr(g, -150, -230, 300, 500, 34); g.fillStyle = '#0c0e18'; g.fill();
  rr(g, -136, -216, 272, 472, 26); g.fillStyle = alpha(CYAN, 0.22); g.fill();
  glow(g, 0, -40, 420, CYAN, 0.2);
  // lock-screen: "3 missed calls — Mom"
  g.fillStyle = alpha('#eaf6ff', 0.85); g.font = `700 ${V(30, 28)}px NotoArm`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('ՄԱՅՐԻԿ', 0, -160); g.font = `800 ${V(24, 22)}px NotoArm`; g.fillStyle = alpha('#eaf6ff', 0.5); g.fillText('3 բաց թողնված', 0, -120);
  g.fillStyle = alpha('#0c0e18', 0.6); for (let i = 0; i < 4; i++) g.fillRect(-104, 40 + i * 62, 208, 46);
  // thumb over the screen
  g.fillStyle = '#141018'; g.beginPath(); g.ellipse(150, 240, 92, 60, -0.5, 0, 7); g.fill();
  g.restore();
  glyph(g, E.W * 0.74, E.H * 0.24, { state: 'lie', s: V(46, 42), k: clamp(spring(t - 0.7, 0, { freq: 2.5 })), ring: clamp((t - 0.7) / 0.9) });
  glyph(g, E.W * 0.26, E.H * 0.30, { state: 'truth', s: V(30, 28), k: clamp(spring(t - 1.4, 0, { freq: 2.5 })), a: 0.6 });
  FX.dust(g, t, { count: 26, color: '#cfe0ff', a: 0.22 });
}});

// s009 — no proof at all
registerShot('s009', { draw(g, t, info) {
  const cam = camAdd(camPath(t, [[0, { z: 1.16, x: 0 }], [info.dur, { z: 1.04, x: 0, y: 10 }]]), drift(t, 3, 9));
  const { GY, M } = hangout(g, t, cam, { mood: 'dusk' });
  const p = seats(), s = SS() * 1.06;
  layer(g, cam, 1, (g) => {
    fig(g, { x: p.you, y: GY, s, facing: 1, outfit: YOU, pose: breathe(POSES.sad, t, 0.8, 4), expr: 'sad', rim: { color: M.rim, dir: [-0.5, -1], w: 4.8 }, shadow: false, blink: blink(t, 1) });
  });
  // the glyphs dissolve into dust
  [[0.22, 0.30], [0.5, 0.26], [0.76, 0.33]].forEach(([fx, fy], i) => {
    const a = 1 - ease.in(prog(t, 0.3 + i * 0.25, info.dur * 0.85));
    if (a <= 0) return;
    const xx = E.W * fx, yy = E.H * fy;
    glyph(g, xx, yy, { state: 'lie', s: V(30, 28) * (1 + (1 - a) * 0.4), a: a * 0.7, seed: 20 + i });
    const r = rng(40 + i);
    for (let k = 0; k < 16; k++) { const ang = r() * 6.28, d = (1 - a) * 220 * r(); circle(g, xx + Math.cos(ang) * d, yy + Math.sin(ang) * d - (1 - a) * 40, 2.2 * a, alpha('#ffd59a', 0.5 * a)); }
  });
  FX.dust(g, t, { count: 60, color: '#ffd0b0', a: 0.3 });
  wordPop(g, t, 'ՈՉ ՄԻ ԱՊԱՑՈՒՅՑ', E.W / 2, E.H * V(0.24, 0.2), { t0: 1.1, size: V(62, 54), color: alpha('#ffffff', 0.85), glowA: 18, spacing: 8 });
}});

// s010 — just know
registerShot('s010', { draw(g, t, info) {
  blurLayer(g, 16, (g) => hangout(g, t, { z: 1.6, x: 60, y: -80 }, { mood: 'dusk' }));
  veil(g, '#100810', 0.44);
  const M = mood('dusk'), r = V(310, 330);
  bigFace(g, E.W * 0.5, E.H * V(0.58, 0.52), r, { outfit: YOU, expr: 'determined', look: [0.05, 0.1], rimColor: M.rim, rimSide: -1, blink: blink(t, 1) });
  goldThread(g, t, [[0, E.H * 0.72], [E.W * 0.3, E.H * 0.70], [E.W * 0.7, E.H * 0.71], [E.W, E.H * 0.73]], { p: ease.inOut(prog(t, 0.6, 2.2)), w: 3.4, a: 0.9 });
  glyph(g, E.W * 0.5, E.H * 0.20, { state: 'truth', s: V(40, 36), k: clamp(spring(t - 1.4, 0, { freq: 2.4 })), ring: clamp((t - 1.4) / 1.2) });
}});

// s011 — and from today nobody can lie to you (the room flares)
registerShot('s011', { draw(g, t, info) {
  const cam = camAdd(camPath(t, [[0, { z: 1.02, x: 0 }], [info.dur * 0.6, { z: 1.18, x: -30, y: -20 }], [info.dur, { z: 1.3, x: -50, y: -34 }]]), drift(t, 4, 11));
  const { GY, M } = hangout(g, t, cam, { mood: t > 1.2 ? 'golden' : 'dusk' });
  const p = seats(), s = SS();
  const flare = clamp((t - 1.2) / 1.6);
  layer(g, cam, 1, (g) => {
    [p.leo, p.mia, p.bro].forEach((x, i) => fig(g, { x: x + i * 4, y: GY, s: s * 0.98, facing: 1, outfit: [LEO, MIA, BRO][i], pose: breathe(POSES.sitBack, t, 1, i), expr: 'surprised', rim: { color: '#fff0c8', dir: [0, -1], w: 5 }, shadow: false, dim: t > 1.2, alpha: 1 - flare * 0.55 }));
    fig(g, { x: p.you, y: GY, s: s * 1.08, facing: 1, outfit: YOU, pose: posesSpring(t, [[0, POSES.sad], [1.1, POSES.stand]], { freq: 2.2, damp: 0.55 }), expr: 'determined', rim: { color: '#fff3d6', dir: [0, -1], w: 6 }, shadow: false });
  });
  // window light floods the room
  if (flare > 0) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, E.W * 0.42, E.H * 0.3, E.W * (0.35 + flare * 0.5), '#ffd9a0', 0.4 * flare); g.restore(); }
  for (let i = 0; i < 8; i++) { const a = t * 0.9 + i; goldThread(g, t, [[E.W / 2 + Math.cos(a) * 300, E.H / 2 + Math.sin(a) * 200], [E.W / 2 + Math.cos(a + 1) * 700, E.H / 2 + Math.sin(a + 1) * 460]], { p: clamp(spring(t - 1.2 - i * 0.05, 0, { freq: 2 })), w: 1.6, a: 0.25, color: GOLD }); }
  FX.dust(g, t, { count: 60, color: '#ffe9c8', a: 0.4 });
  lensFlare(g, E.W * 0.42, E.H * 0.32, E.W * 1.3, '#ffe0b0', 0.2);
  wordPop(g, t, 'ԱՅՍՕՐՎԱՆԻՑ', E.W / 2, E.H * V(0.16, 0.13), { t0: 1.5, dur: 2, size: V(50, 46), color: alpha('#fff2cf', 0.9), glowA: 20, spacing: 5 });
}});

// s012 — not one human
registerShot('s012', { draw(g, t, info) {
  const M = mood('dusk');
  backdrop(g, [shade(M.sky[0], -0.5), shade(M.sky[1], -0.55)]);
  const faces = [[0.2, 0.42, '#3a4a6a'], [0.5, 0.38, '#5a4a5a'], [0.8, 0.44, '#4a5a4a']];
  faces.forEach(([fx, fy, c], i) => {
    const k = clamp(spring(t - 0.1 - i * 0.22, 0, { freq: 2.2 }));
    if (k <= 0) return;
    g.save(); g.globalAlpha = k;
    fig(g, { x: E.W * fx, y: E.H * 1.02, s: V(1.9, 1.6), facing: i === 1 ? 1 : -1, outfit: { top: 'tshirt', color: c }, pose: breathe(i === 2 ? POSES.phone : POSES.relaxed, t, 1, i), expr: ['neutral', 'smile', 'nervous'][i], rim: { color: M.rim, dir: [0, -1], w: 5 } });
    g.restore();
    talkGlyph(g, t, E.W * fx, E.H * fy - 120, { t0: 0.25 + i * 0.22, lieAt: 0.9 + i * 0.22, s: V(40, 36), seed: 30 + i });
  });
  wordPop(g, t, 'ՈՉ ՄԻ ՄԱՐԴ', E.W / 2, E.H * V(0.82, 0.78), { t0: 0.8, size: V(58, 52), color: alpha('#ffffff', 0.9), glowA: 16, spacing: 7 });
  FX.dust(g, t, { count: 40, color: '#ffd0b0', a: 0.25 });
}});

// s013 — not one actor
registerShot('s013', { draw(g, t, info) {
  const M = mood('void');
  backdrop(g, ['#0b1024', '#161a34']);
  // stage floor + spotlight
  g.fillStyle = shade(M.floor, -0.2); g.fillRect(0, E.H * 0.78, E.W, E.H * 0.3);
  FX.lightCone(g, E.W * 0.5, -80, { angle: Math.PI / 2, spread: 0.42, len: E.H * 1.05, color: '#ffe9c8', a: 0.16 });
  FX.pool(g, E.W * 0.5, E.H * 0.79, 380, 70, '#ffe9c8', 0.3);
  const k = clamp(spring(t - 0.2, 0, { freq: 2 }));
  const sway = Math.sin(t * 1.2) * 0.03;
  g.save(); g.globalAlpha = k; g.translate(E.W * 0.5, E.H * 0.80); g.rotate(sway);
  // empty costume on a hanger
  seg(g, [[0, -560], [0, -420]], 3, '#8a93b0');
  g.beginPath(); g.moveTo(-64, -470); g.lineTo(64, -470); g.setLineDash([]); g.strokeStyle = '#c9d4ea'; g.lineWidth = 4; g.stroke();
  poly(g, [[-120, -420], [120, -420], [90, -60], [-90, -60]], '#2a2438');
  poly(g, [[-120, -420], [0, -350], [120, -420], [0, -420]], '#3a3450');
  g.fillStyle = '#2a1e2a'; g.fillRect(-20, -60, 40, 60);
  g.restore();
  // the actor's mask on the floor
  circle(g, E.W * 0.66, E.H * 0.795, 46, '#e8e4f4'); circle(g, E.W * 0.63, E.H * 0.78, 8, '#1a1622'); circle(g, E.W * 0.70, E.H * 0.78, 8, '#1a1622');
  g.strokeStyle = '#1a1622'; g.lineWidth = 4; g.beginPath(); g.arc(E.W * 0.665, E.H * 0.80, 18, 0.3, Math.PI - 0.3); g.stroke();
  talkGlyph(g, t, E.W * 0.5, E.H * 0.24, { t0: 0.3, lieAt: 1.1, s: V(44, 40), seed: 33 });
  wordPop(g, t, 'ՈՉ ՄԻ ԴԵՐԱՍԱՆ', E.W / 2, E.H * V(0.12, 0.10), { t0: 1.0, size: V(46, 42), color: alpha('#ffffff', 0.85), spacing: 6 });
  FX.dust(g, t, { count: 50, color: '#ffe9c8', a: 0.35 });
}});

// s014 — not one politician
registerShot('s014', { draw(g, t, info) {
  const cam = camAdd(camPath(t, [[0, { z: 1.0, x: 0 }], [info.dur, { z: 1.1, x: 30 }]]), drift(t, 3, 13));
  const { GY, M } = gala(g, t, cam, { mood: 'storm', screenText: 'ԽՈՍՏՈՒՄ', screenSub: 'ՄԵԾ ԽՈՍՏՈՒՄՆԵՐ' });
  const s = V(1.5, 1.55);
  layer(g, cam, 1, (g) => {
    fig(g, { x: E.W * 0.53, y: GY - 30, s, facing: 1, outfit: BLACK, pose: breathe(posesAt(t, [[0, 'explain'], [1.2, 'pointUp']], 0.4), t, 1, 5), expr: 'smirk', talk: talkAmount(info.globalT), rim: { color: '#cfe0ff', dir: [0.2, -1], w: 5 }, shadow: false });
  });
  talkGlyph(g, t, E.W * 0.53, E.H * V(0.20, 0.18), { t0: 0.3, lieAt: 0.9, s: V(46, 42), seed: 35 });
  // half the glyph breaks away as glass shards
  const r = rng(77);
  for (let i = 0; i < 9; i++) { const lt = t - 0.9; if (lt < 0) break; const ang = -1.2 + r() * 2.4, sp = 160 + r() * 260; poly(g, [[E.W * 0.53 + Math.cos(ang) * sp * lt, E.H * V(0.20, 0.18) + Math.sin(ang) * sp * lt + 420 * lt * lt], [E.W * 0.53 + Math.cos(ang) * sp * lt + 10, E.H * V(0.20, 0.18) + Math.sin(ang) * sp * lt + 420 * lt * lt + 14], [E.W * 0.53 + Math.cos(ang) * sp * lt - 8, E.H * V(0.20, 0.18) + Math.sin(ang) * sp * lt + 420 * lt * lt + 8]], alpha(LIE, 0.5 * (1 - clamp(lt / 1.2)))); }
  wordPop(g, t, 'ՈՉ ՄԻ ՔԱՂԱՔԱԿԱՆ', E.W / 2, E.H * V(0.86, 0.80), { t0: 0.5, size: V(44, 40), color: alpha('#ffffff', 0.85), spacing: 5 });
  FX.dust(g, t, { count: 40, color: '#cfe0ff', a: 0.25 });
}});

// s015 — what if behind every sentence you see reality
registerShot('s015', { draw(g, t, info) {
  const cam = camAdd(camPath(t, [[0, { z: 1.0, x: 0 }], [info.dur * 0.5, { z: 1.14, x: -40 }], [info.dur, { z: 1.24, x: -70, y: -10 }]]), drift(t, 4, 15));
  const { GY, M } = street(g, t, cam, { mood: 'night' });
  const s = V(1.25, 1.3);
  layer(g, cam, 1, (g) => {
    // a crowd of backs, all facing away
    const r = rng(5);
    for (let i = 0; i < 7; i++) { const x = E.W * (0.08 + i * 0.14) + (r() - 0.5) * 60, sc = s * (0.8 + r() * 0.4); fig(g, { x, y: GY + 20 + i % 3 * 30, s: sc, facing: r() > 0.5 ? 1 : -1, outfit: { top: i % 2 ? 'tshirt' : 'hoodie', color: shade(M.wall, 0.05) }, pose: breathe(i % 3 ? POSES.relaxed : POSES.phone, t, 1, i), expr: 'neutral', rim: { color: M.practical, dir: [0, -1], w: 3.4 }, alpha: 0.85, dim: true }); }
    fig(g, { x: E.W * 0.5, y: GY - 6, s: s * 1.15, facing: 1, outfit: YOU, pose: breathe(POSES.stand, t, 1, 9), expr: 'neutral', rim: { color: M.practical, dir: [-0.4, -1], w: 5.6 }, shadow: true });
  });
  // hundreds of tiny glyphs over the crowd
  const r2 = rng(9);
  for (let i = 0; i < 46; i++) { const x = E.W * (0.02 + r2() * 0.96), y = E.H * (0.16 + r2() * 0.5), ph = r2() * 6.28; const k = clamp(spring(t - 0.2 - r2() * 1.6, 0, { freq: 2 })); glyph(g, x, y + Math.sin(t * 1.4 + ph) * 8, { state: r2() > 0.55 ? 'lie' : 'truth', s: V(16, 14) + r2() * 12, k, a: 0.35 + r2() * 0.4, seed: 200 + i }); }
  FX.rain(g, t, { count: 120, a: 0.16, color: '#b8c8ff', speed: 1500 });
  lensFlare(g, E.W * 0.2, E.H * 0.4, E.W, '#ffd9a0', 0.12);
}});

// s016 — title card
registerShot('s016', { draw(g, t, info) {
  const cam = camAdd(camPath(t, [[0, { z: 1.12, x: 0 }], [info.dur, { z: 1.0, x: 20 }]]), drift(t, 3, 17));
  const { GY, M } = street(g, t, cam, { mood: 'night' });
  veil(g, '#06070f', 0.5);
  // rain frozen for the title
  frozenAir(g, t, { count: 90, color: '#cfe0ff' });
  const k = spring(t - 0.25, 0, { freq: 2.0, damp: 0.55 });
  g.save(); g.translate(E.W / 2, E.H * 0.46); const sc = lerp(0.86, 1, clamp(k)); g.scale(sc, sc);
  text(g, 'ՃՇՄԱՐՏՈՒԹՅԱՆ', 0, -V(74, 70), { size: V(132, 96), color: GOLD_HI, font: FONTS.title, weight: 700, glow: 40, glowColor: alpha(GOLD, 0.7), spacing: 8 });
  text(g, 'ԳԻՆԸ', 0, V(96, 92), { size: V(158, 110), color: '#ffffff', font: FONTS.title, weight: 700, glow: 46, glowColor: 'rgba(255,140,60,.85)', spacing: 14 });
  g.fillStyle = alpha(GOLD, 0.7); g.fillRect(-V(300, 220), V(28, 26), V(600, 440), 3);
  g.restore();
  text(g, 'WHAT IF NOBODY COULD EVER LIE TO YOU?', E.W / 2, E.H * V(0.76, 0.72), { size: V(28, 26), color: alpha('#dce8ff', 0.7), font: FONTS.ui, weight: 900, spacing: 7, alpha: clamp((t - 0.9) / 0.5) });
  glyph(g, E.W / 2, E.H * V(0.20, 0.17), { state: 'truth', s: V(46, 42), k: clamp(spring(t - 0.6, 0, { freq: 2.4 })), ring: clamp((t - 0.6) / 1.3) });
  lensFlare(g, E.W * 0.5, E.H * 0.46, E.W * 1.2, '#ffd9a0', 0.18);
}});

// s017 — "and then?"
registerShot('s017', { draw(g, t, info) {
  const cam = drift(t, 2, 19);
  const { GY, M } = street(g, t, cam, { mood: 'storm' });
  veil(g, '#070810', 0.42);
  frozenAir(g, t, { count: 120, color: '#dfe8ff' });
  const s = V(1.3, 1.35);
  layer(g, cam, 1, (g) => { fig(g, { x: E.W * 0.42, y: GY, s, facing: 1, outfit: YOU, pose: POSES.stand, expr: 'worried', rim: { color: '#cfe0ff', dir: [0, -1], w: 5 } }); });
  // badge
  const aa = clamp((t - 0.3) / 0.4);
  text(g, '1 վրկ  ԱՊԱԳԱ', E.W - V(90, 60), V(120, 140), { size: V(30, 30), color: alpha('#cfe0ff', 0.8 * aa), font: FONTS.ui, weight: 900, align: 'right', spacing: 3 });
  text(g, '?', E.W * 0.66, E.H * 0.36, { size: V(210, 170), color: alpha(GOLD, 0.9 * clamp((t - 1.0) / 0.5)), font: FONTS.title, weight: 700, glow: 40, glowColor: alpha(GOLD, 0.6) });
  glyph(g, E.W * 0.5, E.H * V(0.26, 0.22), { state: 'hidden', s: V(38, 34), k: clamp(spring(t - 0.2, 0, { freq: 2 })), a: 0.55 });
  FX.dust(g, t * 0.2, { count: 40, color: '#cfe0ff', a: 0.3 });
}});
