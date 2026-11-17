// lib.js — reusable shot factory: every template returns { draw(g, t, info) } so shots are one line each.
import { E, V, S, mood, clamp, lerp, ease, prog, rng, noise, alpha, shade, mix, seg, circle, ring, poly, rr, linGrad, radGrad, glow, text, measure, layer, blurLayer, veil, backdrop, FONTS, registerShot, shake, talkAmount, wordTime } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace, headPos, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { camPath, travel, drift, camAdd, spring, impact, posesSpring, smear, fg, kText } from '/engine/motion.js';
import * as SET from './sets/room.js';
import { YOU, MOM, LEO, MIA, BRO, BLACK, SELL, CROWD } from './cast.js';
import { glyph, talkGlyph, goldThread, sparkBurst, cracks, card, avatar, screenGlow, frozenAir, lensFlare, wordPop, fig, blink, GOLD, GOLD_HI, LIE, LIE_HI, CYAN } from './fx_truth.js';

export const T = text;
const SOF = () => SET.sofaSeats();
export const SIT = { ...POSES.sit, hip: [0, -72], kF: [56, -16], fF: [78, 72], kB: [48, -18], fB: [66, 76], eF: [22, -104], hF: [46, -74], eB: [16, -104], hB: [38, -74] };
export const SIT_BACK = { ...SIT, hip: [-6, -72], head: [-14, -180], sh: [-10, -146], eF: [8, -104], hF: [30, -80], eB: [-24, -104], hB: [-16, -78], kF: [62, -18], fF: [86, 70], kB: [52, -20], fB: [72, 74] };
const OUT = { x: [0.17, 0.5, 0.83], y: [0.42, 0.34, 0.44] };      // face anchors when someone sits at the sofa
const gy = () => SET.GY();
// ---- frame helpers ----------------------------------------------------------------
export const camera = (cam) => (cam ? cam : { z: 1, x: 0 });
export function vignetteEdge(g, a = 0.35) { const M = mood('dusk'); g.save(); g.globalCompositeOperation = 'source-over'; const gr = linGrad(g, 0, 0, 0, E.H, [alpha('#000000', 0), alpha('#000000', 0)]); g.restore(); }
export function lbox(dark = 0.0) { /* bars are handled by config */ }
// OTS foreground shoulder
export function ots(g, cam, side = -1, o = {}) {
  fg(g, cam, (g) => {
    const cx = side < 0 ? E.W * 0.06 : E.W * 0.94, cy = E.H * 0.66;
    circle(g, cx, cy, V(210, 260), o.color || '#0d0a12');
    g.fillStyle = o.color || '#0d0a12'; g.fillRect(cx - V(260, 300), cy, V(520, 600), E.H);
    g.save(); g.globalCompositeOperation = 'lighter'; glow(g, cx + side * -120, cy - 100, 300, o.rim || '#ffb070', 0.10); g.restore();
  }, { depth: 1.72, blur: o.blur ?? 18 });
}
// soft foreground prop (cup / chair / plant edge)
export function fgProp(g, cam, o = {}) {
  fg(g, cam, (g) => { const x = (o.x ?? 0.88) * E.W, y = (o.y ?? 1.04) * E.H, s = o.s ?? 1;
    if (o.kind === 'cup') { rr(g, x - 46 * s, y - 120 * s, 92 * s, 130 * s, 12 * s); g.fillStyle = o.color || '#241a20'; g.fill(); glow(g, x, y - 118 * s, 150 * s, '#ffd59a', 0.14); }
    else if (o.kind === 'chair') { ggChair(g, x, y, s, o.color || '#1a141c'); }
    else if (o.kind === 'plant') { SET.plant(g, x, y, s * 2.2, o.color || '#16301f'); }
    else if (o.kind === 'phone') { g.save(); g.translate(x, y); g.rotate(o.rot ?? 0.3); rr(g, -40 * s, -80 * s, 80 * s, 160 * s, 10 * s); g.fillStyle = '#0b0d16'; g.fill(); glow(g, 0, 0, 150 * s, CYAN, 0.12); g.restore(); }
    else { circle(g, x, y - 160 * s, 190 * s, o.color || '#0d0a12'); g.fillRect(x - 190 * s, y - 160 * s, 380 * s, 400 * s); }
  }, { depth: o.depth ?? 1.7, blur: o.blur ?? 16 });
}
function ggChair(g, x, y, s, c) { seg(g, [[x - 34 * s, y - 120 * s], [x - 30 * s, y - 10 * s]], 8 * s, c); seg(g, [[x + 34 * s, y - 120 * s], [x + 30 * s, y - 10 * s]], 8 * s, c); rr(g, x - 44 * s, y - 130 * s, 88 * s, 16 * s, 6 * s); g.fillStyle = c; g.fill(); seg(g, [[x, y - 120 * s], [x, y]], 8 * s, c); }

// ---- camera recipes ---------------------------------------------------------------
export const camPush = (t, info, z0 = 1.0, z1 = 1.08, x0 = 0, x1 = -30, seed = 1) =>
  camAdd(camPath(t, [[0, { z: z0, x: x0 }], [info.dur * 0.55, { z: lerp(z0, z1, 0.66), x: lerp(x0, x1, 0.62) }], [info.dur, { z: z1, x: x1 }]], { endEase: 0.28 }), drift(t, 3.2, seed));
export const camPull = (t, info, z0 = 1.16, z1 = 1.0, x0 = 30, x1 = 0, seed = 1) => camPush(t, info, z0, z1, x0, x1, seed);
export const camDrift = (t, info, seed = 1) => camAdd(camPath(t, [[0, { z: 1.04, x: -18 }], [info.dur, { z: 1.1, x: 22 }]], { endEase: 0.3 }), drift(t, 2.4, seed));

// ---- crowd helpers ---------------------------------------------------------------
export function backs(g, cam, t, o = {}) {
  const M = o.M || mood('night'), n = o.n || 7, base = o.y ?? gy() + 20;
  layer(g, cam, o.depth ?? 1, (g) => { const r = rng(o.seed || 5);
    for (let i = 0; i < n; i++) { const x = E.W * (0.04 + i * (0.92 / n)) + (r() - 0.5) * 70, sc = (o.s || 1.25) * (0.76 + r() * 0.4);
      fig(g, { x, y: base + (i % 3) * 26, s: sc, facing: r() > 0.5 ? 1 : -1, outfit: { top: i % 2 ? 'tshirt' : 'hoodie', color: shade(M.wall, 0.04 + r() * 0.1) }, pose: breathe(i % 3 ? POSES.relaxed : POSES.phone, t, 1, i), expr: ['neutral', 'smile', 'worried'][i % 3], rim: { color: M.practical, dir: [0, -1], w: 3 }, alpha: 0.9, dim: o.dim !== false }); } });
}
// a grid of heads (the "everybody" montage)
export function headGrid(g, t, o = {}) {
  const M = o.M || mood('void'), cols = o.cols || 6, rows = o.rows || 3, a = o.a ?? 1;
  for (let r2 = 0; r2 < rows; r2++) for (let c = 0; c < cols; c++) {
    const x = E.W * (0.09 + c * 0.82 / (cols - 1)), y = E.H * (0.22 + r2 * 0.26);
    const k = clamp(spring(t - (o.t0 ?? 0) - (r2 * cols + c) * 0.03, 0, { freq: 2 }));
    if (k <= 0) continue;
    g.save(); g.globalAlpha = a * k;
    circle(g, x, y, 46, shade(M.wall, -0.2)); circle(g, x + 8, y - 4, 6, alpha('#ffffff', 0.7));
    g.fillStyle = shade(M.wall, -0.36); g.beginPath(); g.ellipse(x, y + 84, 66, 54, 0, 0, 7); g.fill();
    g.restore();
    if (o.glyphs) glyph(g, x, y - 78, { state: (r2 + c) % 3 === 0 ? 'truth' : (r2 + c) % 3 === 1 ? 'lie' : 'hidden', s: 18, k, a: 0.75 * a, seed: r2 * cols + c });
  }
}

// ===================================================================================
// TEMPLATE: sofa scene, up to 4 figures sitting, glyph per speaker
// ===================================================================================
export function sofaShot(o = {}) {
  return { draw(g, t, info) {
    const cam = (o.cam || camDrift)(t, info);
    const sc = o.s ?? V(1.46, 1.5);
    const S2 = SET.hangout(g, t, cam, { mood: o.mood || 'dusk', seatScale: sc });
    const M = S2.M, se = S2.seats;
    layer(g, cam, 1, (g) => {
      const people = o.people || [
        { who: YOU, seat: 0, pose: POSES.sitBack }, { who: LEO, seat: 1, pose: POSES.sitBack },
        { who: MIA, seat: 2, pose: POSES.sitBack }, { who: BRO, seat: 3, pose: POSES.sitBack }];
      people.forEach((p, i) => {
        if (p.hidden) return;
        const pose = p.poses ? posesAt(t, p.poses, p.blend ?? 0.4) : (p.pose || POSES.sitBack);
        fig(g, { x: se.x[p.seat] + (p.dx || 0), y: se.y, s: sc * (p.s ?? 1), facing: p.facing ?? 1, outfit: p.who,
          pose: p.still ? pose : breathe(pose, t, p.breathe ?? 1, i + 2), expr: typeof p.expr === 'function' ? p.expr(t) : (p.expr || 'neutral'),
          talk: p.talk === false ? 0 : talkAmount(info.globalT, -1, 1e9), rim: { color: M.rim, dir: [p.facing === -1 ? -0.45 : 0.45, -1], w: 4.4 }, shadow: false,
          blink: blink(t, i + 1), dim: p.dim, alpha: p.alpha ?? 1, look: p.look, prop: p.prop });
        if (p.glyph) { const hp = headPos({ x: se.x[p.seat] + (p.dx || 0), y: se.y, s: sc * (p.s ?? 1), facing: p.facing ?? 1, pose }); talkGlyph(g, t, hp[0] + (p.glyph.dx || 0), hp[1] - hp[2] * 1.9, { t0: p.glyph.t0 ?? 0.3, lieAt: p.glyph.lieAt, s: p.glyph.s ?? V(32, 30), seed: i + 4 }); }
      });
      if (o.onStage) o.onStage(g, M, se, sc);
    });
    if (o.fg !== false) fgProp(g, cam, o.fg || { kind: 'cup', x: 0.13, y: 1.05, s: 1.2, color: '#1d151b' });
    FX.dust(g, t, { count: 42, color: '#ffe2bd', a: 0.32 });
    if (o.lens !== false) lensFlare(g, E.W * 0.44, E.H * 0.30, E.W * 1.1, '#ffe0b0', 0.12);
    if (o.overlay) o.overlay(g, t, info, M);
  } };
}

// ===================================================================================
// TEMPLATE: giant face close-up with a blurred location behind
// ===================================================================================
export function faceShot(o = {}) {
  return { draw(g, t, info, ) {
    const setFn = o.set || ((g, t, cam) => SET.hangout(g, t, cam, { mood: o.mood || 'dusk' }));
    blurLayer(g, o.blur ?? 16, (g) => setFn(g, t, { z: 1.55, x: o.bgX ?? -140, y: o.bgY ?? -90 }), null, 1);
    veil(g, o.veilColor || '#140a12', o.veilA ?? 0.44);
    const M = mood(o.mood || 'dusk'), r = (o.r ?? V(300, 330)) * (1 + 0.05 * clamp(t / info.dur));
    const cx = E.W * (o.cx ?? 0.5), cy = E.H * (o.cy ?? 0.56);
    bigFace(g, cx, cy, r, { outfit: o.who || YOU, expr: typeof o.expr === 'function' ? o.expr(t, info) : (o.expr || 'neutral'),
      look: o.look, rimColor: M.rim, rimSide: o.rimSide ?? -1, blink: blink(t, o.seed ?? 1), talk: o.talk ? talkAmount(info.globalT) : 0, tilt: o.tilt ? o.tilt(t) : 0, face: o.face });
    if (o.after) o.after(g, t, info, { cx, cy, r, M });
    FX.dust(g, t, { count: o.dust ?? 30, color: '#ffd8b4', a: 0.28 });
    if (o.overlay) o.overlay(g, t, info, M);
  } };
}

// ===================================================================================
// TEMPLATE: insert / macro shot over a blurred set
// ===================================================================================
export function insertShot(o = {}) {
  return { draw(g, t, info) {
    const cam = { z: 1 + 0.04 * ease.inOut(t / info.dur), x: 0, y: 0 };
    if (o.set) blurLayer(g, o.blur ?? 20, (g) => o.set(g, t, cam), null, 1);
    else { const M = mood(o.mood || 'dusk'); backdrop(g, [shade(M.floor, -0.4), shade(M.dark, -0.3)]); }
    if (o.dim !== false) veil(g, o.veilColor || '#0a0710', o.veilA ?? 0.35);
    g.save();
    const k = spring(t - (o.t0 ?? 0.05), 0, { freq: 2.2, damp: 0.55 });
    g.translate(E.W / 2, E.H / 2); const sc = (o.scale ?? 1) * lerp(0.93, 1, clamp(k)); g.scale(sc, sc); g.translate(-E.W / 2, -E.H / 2);
    o.draw(g, t, info);
    g.restore();
    if (o.overlay) o.overlay(g, t, info);
    if (o.glyph) glyph(g, E.W * (o.glyph.x ?? 0.5), E.H * (o.glyph.y ?? 0.24), { state: o.glyph.state || 'lie', s: o.glyph.s ?? V(46, 42), k: clamp(spring(t - (o.glyph.t0 ?? 0.6), 0, { freq: 2.4 })), ring: clamp((t - (o.glyph.t0 ?? 0.6)) / 0.9), seed: 3 });
  } };
}

// ===================================================================================
// TEMPLATE: blueprint diagram (navy grid, line art, gold highlights)
// ===================================================================================
export function bpShot(o = {}) {
  return { draw(g, t, info) {
    const cam = { z: 1 + 0.03 * ease.inOut(t / info.dur), x: 0, y: 0 };
    layer(g, cam, 1, (g) => { if (o.layout) o.layout(g, E, t, info); else UI.blueprint(g); });
    const ui = S().ui;
    g.save(); g.globalAlpha = 1;
    if (o.draw) o.draw(g, t, info, ui);
    g.restore();
    FX.dust(g, t, { count: 22, color: '#bfe0ff', a: 0.18, size: 1.8 });
    if (o.overlay) o.overlay(g, t, info);
  } };
}

// ===================================================================================
// TEMPLATE: wide location shot with optional figures + foreground
// ===================================================================================
export function wideShot(o = {}) {
  return { draw(g, t, info) {
    const cam = (o.cam || camPush)(t, info);
    const S2 = o.set(g, t, cam);
    const M = S2.M || mood(o.mood || 'dusk');
    if (o.afterSet) o.afterSet(g, t, cam, S2, M);
    if (o.figures) layer(g, cam, 1, (g) => o.figures.forEach(f => fig(g, { rim: { color: M.practical || M.rim, dir: [0, -1], w: 4.4 }, ...f })));
    if (o.fg) fgProp(g, cam, o.fg);
    if (o.after) o.after(g, t, info, S2, M);
    if (o.overlay) o.overlay(g, t, info, M);
    if (o.dust !== false) FX.dust(g, t, { count: o.dustCount || 36, color: o.dustColor || '#ffd8b4', a: 0.26 });
  } };
}

// ===================================================================================
// TEMPLATE: UI card shot (data / chat / legal / ledger)
// ===================================================================================
export function uiShot(o = {}) {
  return { draw(g, t, info) {
    const M = mood(o.mood || 'void');
    backdrop(g, [shade(M.sky[0], -0.25), shade(M.sky[1], -0.3)]);
    FX.dust(g, t, { count: 24, color: '#bfe0ff', a: 0.16 });
    const k = clamp(spring(t - 0.05, 0, { freq: 2.3, damp: 0.55 }));
    const wob = (o.parallax ?? 1) * 0.0025;
    g.save(); g.translate(E.W / 2, E.H / 2); g.scale(lerp(0.94, 1, k), lerp(0.94, 1, k)); g.rotate(Math.sin(t * 0.4) * wob); g.translate(-E.W / 2, -E.H / 2);
    if (o.frame !== false) o.draw(g, t, info);
    else o.draw(g, t, info);
    g.restore();
    if (o.overlay) o.overlay(g, t, info);
  } };
}
export const WORD = (t, txt, after = 0) => wordTime(txt, after);
