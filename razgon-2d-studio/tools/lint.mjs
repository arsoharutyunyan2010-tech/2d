// tools/lint.mjs — hard parse gate: fails loudly if any shot module doesn't parse.
import fs from 'node:fs'; import path from 'node:path';
const dir = process.argv[2] || 'projects/truth-ability/scenes/shots';
let bad = 0;
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort()) {
  const src = fs.readFileSync(path.join(dir, f), 'utf8').replace(/^import .*$/gm, '');
  try { new Function(src); console.log('OK  ', f); }
  catch (e) { console.log('FAIL', f, '—', e.message); bad++; }
}
process.exit(bad ? 1 : 0);
