// tools/check.js — parse-check every project shot module and report which shots register.
const fs = require('fs'), path = require('path');
const dir = process.argv[2] || 'projects/truth-ability/scenes/shots';
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort()) {
  const src = fs.readFileSync(path.join(dir, f), 'utf8').replace(/^import .*$/gm, '');
  const lines = src.split('\n'); const idx = []; lines.forEach((l, i) => { if (/^registerShot\(|^export /.test(l)) idx.push(i); }); idx.push(lines.length);
  const errs = [];
  for (let k = 0; k < idx.length - 1; k++) { const block = lines.slice(idx[k], idx[k + 1]).join('\n'); try { new Function(block); } catch (e) { errs.push(`line ${idx[k] + 1}: ${e.message}`); } }
  const ids = (src.match(/registerShot\('(\w+)'/g) || []).map(s => s.match(/'(\w+)'/)[1]);
  console.log(f.padEnd(16), errs.length ? 'ERR ' + errs[0] : 'ok', '|', ids.length, 'shots', ids.length > 6 ? ids[0] + '…' + ids[ids.length - 1] : ids.join(','));
  errs.slice(1, 4).forEach(e => console.log('   ', e));
}
