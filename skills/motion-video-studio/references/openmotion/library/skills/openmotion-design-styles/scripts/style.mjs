#!/usr/bin/env node
// OpenMotion Design Styles helper.
//   node style.mjs list                      → one line per style card
//   node style.mjs show <id>                 → the full card as JSON
//   node style.mjs check <plan.json>         → validate a film plan (exit 1 on errors)
//   node style.mjs fonts <plan.json> <dir>   → download subset fonts into <dir>/assets/fonts and write fonts.css
import { readFile, writeFile, mkdir, readdir, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const library = JSON.parse(await readFile(path.join(here, '../references/styles.json'), 'utf8'));
const byId = new Map(library.styles.map(s => [s.id, s]));
const HEX = /^#[0-9A-Fa-f]{6}$/;
const LIMITS = { headline: 48, body: 140 };

const [command, ...args] = process.argv.slice(2);
const fail = message => { console.error(message); process.exit(1); };

function family(spec) {
  const match = /^([A-Za-z][A-Za-z ]*?)(?=\s+\d|\s*,|\s*\(|$)/.exec(spec.trim());
  return match ? match[1].trim() : spec.trim();
}
function weight(spec) {
  const match = /\b([1-9]00)\b/.exec(spec);
  return match ? Number(match[1]) : 400;
}

export function checkPlan(plan) {
  const errors = [], warnings = [];
  const style = byId.get(plan.style);
  if (!style) errors.push(`style "${plan.style}" is not in the library; run: node style.mjs list`);
  if (!plan.title || typeof plan.title !== 'string') errors.push('title is required');
  if (!Array.isArray(plan.scenes) || plan.scenes.length < 2) errors.push('scenes needs at least 2 entries (opening and end card)');
  const scenes = Array.isArray(plan.scenes) ? plan.scenes : [];
  let total = 0;
  scenes.forEach((scene, index) => {
    const at = `scenes[${index}]`;
    if (!scene.id) errors.push(`${at}.id is required`);
    if (!(typeof scene.seconds === 'number' && Number.isFinite(scene.seconds) && scene.seconds >= 1 && scene.seconds <= 12)) errors.push(`${at}.seconds must be a number between 1 and 12`);
    else total += scene.seconds;
    if (!scene.headline) errors.push(`${at}.headline is required`);
    else if ([...scene.headline].length > LIMITS.headline) errors.push(`${at}.headline is ${[...scene.headline].length} characters; keep it within ${LIMITS.headline}`);
    if (scene.body && [...scene.body].length > LIMITS.body) errors.push(`${at}.body is longer than ${LIMITS.body} characters`);
    if (!scene.move) errors.push(`${at}.move is required: name the motion this scene uses (pick from the card's motion list or describe one in the same spirit)`);
    if (style && scene.rule !== undefined && !(Number.isInteger(scene.rule) && scene.rule >= 1 && scene.rule <= style.rules.length)) errors.push(`${at}.rule must be 1–${style.rules.length} (a rule number on the style card)`);
  });
  if (plan.seconds !== undefined && (typeof plan.seconds !== 'number' || !Number.isFinite(plan.seconds))) errors.push('seconds must be a number');
  else if (plan.seconds !== undefined && Math.abs(plan.seconds - total) > 0.01) errors.push(`seconds is ${plan.seconds} but scenes add up to ${total}`);
  if (total && (total < 6 || total > 60)) errors.push(`total length ${total}s is outside 6–60s`);
  if (style) {
    const allowed = new Set(style.palette.map(c => c.hex.toUpperCase()));
    for (const [name, hex] of Object.entries(plan.brandColors || {})) {
      if (!HEX.test(hex)) errors.push(`brandColors.${name} must be a #RRGGBB hex`);
      else allowed.add(hex.toUpperCase());
    }
    for (const hex of plan.colors || []) {
      if (!HEX.test(hex)) errors.push(`colors entry ${hex} must be a #RRGGBB hex`);
      else if (!allowed.has(hex.toUpperCase())) errors.push(`colour ${hex} is not on the ${style.name} card or in brandColors`);
    }
    const ruled = new Set(scenes.map(s => s.rule).filter(Boolean));
    if (ruled.size < 2) warnings.push('fewer than two style rules are shown on screen; the film may not read as this style');
    if (style.render === 'webgl') warnings.push(`${style.name} is a WebGL look; an HTML/Canvas film can only approximate it. Say so to the user.`);
  }
  const last = scenes.at(-1);
  if (last && !/openmotion/i.test(`${last.headline || ''} ${last.body || ''}`)) errors.push('the last scene must carry the OpenMotion end credit (e.g. "Made with OpenMotion")');
  return { errors, warnings, total };
}

async function fonts(planPath, dir) {
  const plan = JSON.parse(await readFile(planPath, 'utf8'));
  const style = byId.get(plan.style);
  if (!style) fail(`unknown style ${plan.style}`);
  // Subset from the plan and from every HTML file already in the project, so on-screen strings that
  // are not headlines (card labels, button states, URLs) still get their glyphs.
  let html = '', raw = '';
  for (const entry of await readdir(dir).catch(() => [])) {
    if (!entry.endsWith('.html')) continue;
    const source = await readFile(path.join(dir, entry), 'utf8');
    raw += source;
    html += source.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, ' ');
  }
  // Every string literal inside <script> blocks (textContent = "...", { textContent: '...' }, labels in
  // arrays): over-inclusive on purpose, since an extra glyph costs bytes and a missing one falls back.
  const scripts = [...raw.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n');
  const scripted = [...scripts.matchAll(/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)].map(m => m[1] ?? m[2] ?? (m[3] ?? '').replace(/\$\{[^}]*\}/g, ' ')).join('');
  const text = [...new Set([...JSON.stringify(plan) + html + scripted + 'OpenMotion0123456789 .,:·→'])].join('');
  const specs = Object.values(style.type).map(spec => ({ family: family(spec), weight: weight(spec) }));
  // Download every font file and licence into memory first; the project is only touched once all of
  // them succeed, so a failed lookup never leaves new fonts without their licences or fonts.css.
  const faces = [], files = [], records = [];
  const seen = new Set(), failed = [];
  for (const { family: name, weight: w } of specs) {
    for (const wt of [...new Set([400, w])]) {
      const key = `${name}:${wt}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name)}:wght@${wt}&text=${encodeURIComponent(text)}`;
      const response = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/124 Safari/537.36' } }).catch(() => null);
      if (!response?.ok) { failed.push(`${key}: Google Fonts returned ${response?.status ?? 'no response'}`); continue; }
      const css = await response.text();
      const src = /url\((https:[^)]+)\)/.exec(css)?.[1];
      if (!src) { failed.push(`${key}: no font file in response`); continue; }
      const file = `${name.replace(/\s+/g, '-')}-${wt}.woff2`;
      const download = await fetch(src).catch(() => null);
      const bytes = download?.ok ? Buffer.from(await download.arrayBuffer()) : null;
      // Only accept a real WOFF2 ('wOF2' signature).
      if (!bytes || bytes.subarray(0, 4).toString('latin1') !== 'wOF2') { failed.push(`${key}: font file download failed (${download?.status ?? 'no response'})`); continue; }
      files.push([file, bytes]);
      faces.push(`@font-face{font-family:'${name}';font-weight:${wt};font-display:block;src:url('assets/fonts/${file}') format('woff2')}`);
    }
  }
  // Record where each family came from and keep its licence text beside the files.
  for (const name of [...new Set(specs.map(s => s.family))]) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    let licence = null;
    for (const [dir, file, id] of [['ofl', 'OFL.txt', 'SIL Open Font License 1.1'], ['apache', 'LICENSE.txt', 'Apache License 2.0'], ['ufl', 'UFL.txt', 'Ubuntu Font Licence 1.0']]) {
      const response = await fetch(`https://raw.githubusercontent.com/google/fonts/main/${dir}/${slug}/${file}`).catch(() => null);
      if (response?.ok) { licence = { id, text: await response.text(), url: `https://github.com/google/fonts/tree/main/${dir}/${slug}` }; break; }
    }
    if (!licence) { failed.push(`${name}: licence text not found in google/fonts`); continue; }
    const target = `${name.replace(/\s+/g, '-')}-LICENSE.txt`;
    files.push([target, licence.text]);
    records.push(`| ${name} | ${licence.id} | [Google Fonts](https://fonts.google.com/specimen/${encodeURIComponent(name).replace(/%20/g, '+')}) · [source](${licence.url}) | ${target} |`);
  }
  if (failed.length) fail(`fonts not updated; the project was left unchanged:\n${failed.join('\n')}`);
  files.push(['SOURCES.md', `# Fonts\n\nGlyph subsets downloaded by the OpenMotion design-styles Skill. Keep this file and the licence texts with the project.\n\n| Family | Licence | Source | Licence text |\n| --- | --- | --- | --- |\n${records.join('\n')}\n`]);
  const out = path.join(dir, 'assets/fonts');
  await mkdir(out, { recursive: true });
  for (const [file, data] of files) {
    const target = path.join(out, file), temporary = target + '.part';
    await writeFile(temporary, data);
    await rename(temporary, target);
  }
  await writeFile(path.join(dir, 'fonts.css'), faces.join('\n') + '\n');
  console.log(`wrote ${faces.length} faces to ${path.join(dir, 'fonts.css')}`);
}

if (command === 'list') {
  for (const s of library.styles) console.log(`${s.id.padEnd(20)} ${s.kind.padEnd(7)} ${s.render.padEnd(7)} ${s.name} · ${s.zh} — ${s.idea}`);
} else if (command === 'show') {
  const style = byId.get(args[0]);
  if (!style) fail(`unknown style "${args[0]}"; run: node style.mjs list`);
  console.log(JSON.stringify(style, null, 2));
} else if (command === 'check') {
  if (!args[0]) fail('usage: node style.mjs check <plan.json>');
  const { errors, warnings, total } = checkPlan(JSON.parse(await readFile(args[0], 'utf8')));
  for (const w of warnings) console.warn('warning: ' + w);
  if (errors.length) fail(errors.map(e => 'error: ' + e).join('\n'));
  console.log(`ok: ${total}s plan passes`);
} else if (command === 'fonts') {
  if (!args[0] || !args[1]) fail('usage: node style.mjs fonts <plan.json> <project-dir>');
  await fonts(args[0], args[1]);
} else {
  fail('usage: node style.mjs list | show <id> | check <plan.json> | fonts <plan.json> <project-dir>');
}
