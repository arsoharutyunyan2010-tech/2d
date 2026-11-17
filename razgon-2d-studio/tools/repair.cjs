// tools/repair.cjs — rebalance registerShot blocks by auto-closing unmatched brackets.
const fs = require('fs'), path = require('path');
const dir = process.argv[2] || 'projects/truth-ability/scenes/shots';
const PAIR = { '(': ')', '[': ']', '{': '}' };
let report = [];
for (const f of fs.readdirSync(dir).filter(f => /^a.*\.js$/.test(f))) {
  const file = path.join(dir, f);
  const lines = fs.readFileSync(file, 'utf8').replace(/\n+$/, '').split('\n');
  const starts = []; lines.forEach((l, i) => { if (l.startsWith('registerShot(')) starts.push(i); });
  starts.push(lines.length);
  let changed = 0;
  for (let k = 0; k < starts.length - 1; k++) {
    const a = starts[k], b = starts[k + 1] - 1;
    let end = b;
    while (end > a && (lines[end].trim() === '' || lines[end].trim().startsWith('//'))) end--;
    const text = lines.slice(a, end + 1).join('\n');
    const stack = []; let inS = null, esc = false, line = false, inTpl = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i], n = text[i + 1];
      if (line) { if (c === '\n') line = false; continue; }
      if (inS) { if (esc) { esc = false; continue; } if (c === '\\') { esc = true; continue; } if (c === inS) inS = null; continue; }
      if (c === '/' && n === '/') { line = true; i++; continue; }
      if (c === '"' || c === "'" || c === '`') { inS = c; continue; }
      if ('([{'.includes(c)) stack.push(c);
      else if (')]}'.includes(c)) stack.pop();
    }
    if (stack.length) {
      const closers = stack.reverse().map(c => PAIR[c]).join('');
      const t = lines[end];
      const m = t.match(/^(\s*)([\}\)\]]*)(;?)\s*$/);
      if (m) { lines[end] = m[1] + closers + ';'; }
      else { lines[end] = lines[end] + closers + ';'; }
      changed++;
      report.push(`${f}:${a + 1} closed with "${closers}"`);
    }
  }
  fs.writeFileSync(file, lines.join('\n') + '\n');
  if (changed) console.log(f, changed, 'blocks repaired');
}
report.slice(0, 12).forEach(r => console.log('  ' + r));
