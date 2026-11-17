import path from 'node:path';
import { register } from 'node:module';
const ROOT = path.dirname(new URL(import.meta.url).pathname);
process.env.RAZGON_STUDIO = ROOT; process.env.RAZGON_PROJECT = path.join(ROOT,'projects/truth-ability');
register('file://' + path.join(ROOT, 'hooks.mjs'));
globalThis.document = { createElement() { const { createCanvas } = require2(); return createCanvas(1,1); } };
