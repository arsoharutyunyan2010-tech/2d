import fs from 'node:fs'; import path from 'node:path'; import { register } from 'node:module';
const ROOT = process.cwd();
register('file://' + path.join(ROOT,'hooks.mjs'));
process.env.RAZGON_STUDIO=ROOT; process.env.RAZGON_PROJECT=path.join(ROOT,'projects/truth-ability');
globalThis.document={createElement(){return {getContext(){return {}}};}};
const core = await import('file://'+path.join(ROOT,'engine/core.js'));
const {createCanvas} = await import('@napi-rs/canvas');
globalThis.document={createElement(){return createCanvas(1,1);}};
const dir=path.join(ROOT,'projects/truth-ability/scenes/shots');
for (const f of fs.readdirSync(dir).sort()) if (f.endsWith('.js')&&!f.startsWith('_')) { try { await import('file://'+path.join(dir,f)); } catch(e){ console.log('ERR',f,e.message);} }
const story = JSON.parse(fs.readFileSync('projects/truth-ability/story/shots.json','utf8'));
const missing = story.shots.map(s=>s.id).filter(id=>id.startsWith('s') && !core.getShot(id));
console.log('missing:', missing.join(',') || 'none');
