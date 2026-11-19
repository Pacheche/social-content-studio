#!/usr/bin/env node
// Generate an editable HyperFrames project (1920x1080, 30 fps) from growth.json.
// Usage:
//   node scripts/build.mjs --check growth.json
//   node scripts/build.mjs evidence/growth.json out/ [--lang zh] [--music file] [--no-score] [--gallery a.json,b.json]
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = name => { const i = args.indexOf(name); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
const checkOnly = args.includes('--check'); if (checkOnly) args.splice(args.indexOf('--check'), 1);
const langFlag = flag('--lang');
const music = flag('--music');
const galleryArg = flag('--gallery');
const noScore = args.includes('--no-score'); if (noScore) args.splice(args.indexOf('--no-score'), 1);
const [input, outDir] = args;
if (!input || (!checkOnly && !outDir)) {
  console.error('Usage: node scripts/build.mjs [--check] growth.json [out/] [--lang zh] [--music file]');
  process.exit(2);
}
const inputDir = path.dirname(path.resolve(input));
const data = JSON.parse(await readFile(input, 'utf8'));
const lang = langFlag || data.lang || 'en';
const zh = lang === 'zh';

// ---------- validation ----------
const errors = [];
const DATE = /^\d{4}-\d{2}(-\d{2})?$/;
// Month-only dates sit mid-month, matching how the curve is drawn.
const dateMs = d => { const [y, m, day] = String(d).split('-').map(Number); return Date.UTC(y, m - 1, day || 15); };
const width = s => [...String(s)].reduce((n, ch) => n + (/[　-鿿＀-￯]/.test(ch) ? 2 : 1), 0);
if (!data.company) errors.push('company is required');
const points = data.metric?.points || [];
if (points.length < 3) errors.push('metric.points needs at least 3 sourced points');
points.forEach((p, i) => {
  if (!DATE.test(p.date || '')) errors.push(`metric.points[${i}].date must be YYYY-MM or YYYY-MM-DD`);
  if (typeof p.value !== 'number') errors.push(`metric.points[${i}].value must be a number`);
  if (!p.source?.url) errors.push(`metric.points[${i}] has no source.url`);
  if (i && DATE.test(points[i - 1].date || '') && DATE.test(p.date || '') && dateMs(points[i - 1].date) > dateMs(p.date)) errors.push(`metric.points[${i}] is out of date order`);
});
const lanes = data.lanes || [];
if (lanes.length < 2 || lanes.length > 4) errors.push('use 2-4 lanes');
const httpUrl = u => { try { return /^https?:$/.test(new URL(u).protocol); } catch { return false; } };
lanes.forEach(l => {
  if (!Array.isArray(l.moves) || l.moves.length < 1 || l.moves.length > 6) { errors.push(`lane "${l.id}" needs 1-6 moves`); return; }
  l.moves.forEach((m, i) => {
    if (!DATE.test(m.date || '')) errors.push(`${l.id}:${i} needs a date`);
    if (!m.source?.url && !m.card) errors.push(`${l.id}:${i} needs source.url`);
    if (m.source?.url && !httpUrl(m.source.url)) errors.push(`${l.id}:${i} source.url "${m.source.url}" must be a full http(s) URL`);
    if (width(m.label || '') > 28) errors.push(`${l.id}:${i} label "${m.label}" is longer than 28 characters`);
  });
});
points.forEach((p, i) => { if (p.source?.url && !httpUrl(p.source.url)) errors.push(`metric.points[${i}] source.url "${p.source.url}" must be a full http(s) URL`); });
const plays = data.plays || [];
if (plays.length < 2 || plays.length > 3) errors.push('use 2-3 plays');
plays.forEach((p, i) => {
  if (!lanes.some(l => l.id === p.lane)) errors.push(`plays[${i}].lane "${p.lane}" is not a lane id`);
  if (!(p.evidence || []).length) errors.push(`plays[${i}] needs 1-3 evidence moves`);
  for (const ref of p.evidence || []) {
    const [lid, idx] = ref.split(':');
    if (!lanes.find(l => l.id === lid)?.moves?.[Number(idx)]) errors.push(`plays[${i}] evidence "${ref}" does not exist`);
  }
  if (width(p.headline || '') > 40) errors.push(`plays[${i}].headline is too long for one line`);
  if (typeof p.stat?.value !== 'number') errors.push(`plays[${i}].stat.value must be a number (the counted fact on screen)`);
  if (!p.instruction) errors.push(`plays[${i}] needs an instruction`);
  else if (width(p.instruction) > 220) errors.push(`plays[${i}].instruction is ${width(p.instruction)} characters; keep it under 220 so it fits its card`);
});
if (errors.length) { console.error(errors.map(e => '✗ ' + e).join('\n')); process.exit(1); }
if (checkOnly) { console.log(`✓ ${data.company}: ${points.length} metric points, ${lanes.reduce((n, l) => n + l.moves.length, 0)} moves in ${lanes.length} lanes, ${plays.length} plays`); process.exit(0); }

// ---------- helpers ----------
const W = 1920, H = 1080, FPS = 30;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const t = dateMs;
const unit = data.metric.unit ?? '';
function fmt(v) {
  const a = Math.abs(v);
  const n = a >= 1e9 ? (v / 1e9).toFixed(a >= 1e10 ? 0 : 2).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') + 'B'
    : a >= 1e6 ? (v / 1e6).toFixed(a >= 1e8 ? 0 : 1).replace(/\.0$/, '') + 'M'
    : a >= 1e3 ? (v / 1e3).toFixed(a >= 1e5 ? 0 : 1).replace(/\.0$/, '') + 'K' : String(Math.round(v));
  return unit === '$' ? '$' + n : n + (unit && unit !== '$' ? unit : '');
}
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthLabel = ms => { const d = new Date(ms); return zh ? `${String(d.getUTCFullYear()).slice(2)}年${d.getUTCMonth() + 1}月` : `${MONTHS[d.getUTCMonth()]} ${String(d.getUTCFullYear()).slice(2)}`; };
const accent = data.brand?.accent || '#3b5bff';
const lum = hex => { const v = hex.replace('#', ''); const [r, g, b] = [0, 2, 4].map(i => parseInt(v.slice(i, i + 2), 16) / 255).map(c => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const light = /^#[0-9a-f]{6}$/i.test(accent) && lum(accent) > 0.45;
const darken = (hex, k) => '#' + [0, 2, 4].map(i => Math.round(parseInt(hex.slice(1 + i, 3 + i), 16) * (1 - k)).toString(16).padStart(2, '0')).join('');
const accentInk = light ? darken(accent, 0.55) : accent, badgeInk = light ? '#14161c' : '#fff';
const C = { bg: '#f7f8fb', ink: '#14161c', sub: '#6b7280', faint: '#878d9a', line: '#e3e6ee', accent, violet: '#8b5cf6', hot: '#f59e0b', lane: 'rgba(99,102,241,0.07)' };
const laneColors = ['#3b5bff', '#14b8a6', '#8b5cf6', '#22a06b'];
const T = zh ? {
  intro: '增长逆向拆解。', cmd: c => `/growth-teardown ${c} 是怎么长大的`, sources: n => `同时问 ${n} 个信息源…`,
  signals: c => `正在搜 ${c} 的增长信号…`, map: c => `${c} 的增长地图。`, plays: n => `值得抄的 ${n} 招。`,
  outro: '拆解任何一家公司。', outroCmd: '/growth-teardown 你的竞品', after: '之后增长加速', calls: '次调用', minutes: '分钟',
  giveTeam: '交给团队', sourcesNote: '每个数字和动作都附原始出处',
} : {
  intro: 'growth reverse-engineering.', cmd: c => `/growth-teardown how ${c} grows`, sources: n => `asking ${n} sources at once…`,
  signals: c => `searching ${c}’s signals…`, map: c => `${c}’s growth map.`, plays: n => `${n} plays worth copying.`,
  outro: 'reverse-engineer any company.', outroCmd: '/growth-teardown how your competitor grows', after: 'growth sped up after', calls: 'calls', minutes: 'min',
  giveTeam: 'Give your team', sourcesNote: 'every number and move links to its source',
};

// time axis
const allDates = [...points.map(p => t(p.date)), ...lanes.flatMap(l => l.moves.map(m => t(m.date)))];
const d0 = Math.min(...allDates), d1 = Math.max(...allDates);
const pad = (d1 - d0) * 0.04 || 864e5 * 30;
const T0 = d0 - pad, T1 = d1 + pad;
const vmax = Math.max(...points.map(p => p.value), data.metric.headline?.value || 0) * 1.06;

// Monotone cubic curve through the metric points within a box.
function curve(box) {
  const xs = points.map(p => box.x + (t(p.date) - T0) / (T1 - T0) * box.w);
  const ys = points.map(p => box.y + box.h - p.value / vmax * box.h);
  const n = xs.length, dx = [], dy = [], s = [], m = new Array(n);
  for (let i = 0; i < n - 1; i++) { dx[i] = xs[i + 1] - xs[i] || 1e-6; dy[i] = ys[i + 1] - ys[i]; s[i] = dy[i] / dx[i]; }
  m[0] = s[0]; m[n - 1] = s[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = s[i - 1] * s[i] <= 0 ? 0 : (s[i - 1] + s[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (s[i] === 0) { m[i] = m[i + 1] = 0; continue; }
    const a = m[i] / s[i], b = m[i + 1] / s[i], h = a * a + b * b;
    if (h > 9) { const k = 3 / Math.sqrt(h); m[i] = k * a * s[i]; m[i + 1] = k * b * s[i]; }
  }
  let d = `M${xs[0].toFixed(1)},${ys[0].toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i];
    d += ` C${(xs[i] + h / 3).toFixed(1)},${(ys[i] + m[i] * h / 3).toFixed(1)} ${(xs[i + 1] - h / 3).toFixed(1)},${(ys[i + 1] - m[i + 1] * h / 3).toFixed(1)} ${xs[i + 1].toFixed(1)},${ys[i + 1].toFixed(1)}`;
  }
  const yAt = x => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0; while (x > xs[i + 1]) i++;
    const h = dx[i], u = (x - xs[i]) / h, h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u, h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
    return h00 * ys[i] + h10 * h * m[i] + h01 * ys[i + 1] + h11 * h * m[i + 1];
  };
  const xOf = ms => box.x + (ms - T0) / (T1 - T0) * box.w;
  const area = d + ` L${xs[n - 1].toFixed(1)},${box.y + box.h} L${xs[0].toFixed(1)},${box.y + box.h} Z`;
  return { d, area, xs, ys, yAt, xOf };
}
function ticks(box) {
  const out = []; const start = new Date(T0); let y = start.getUTCFullYear(), mo = start.getUTCMonth();
  const spanMonths = (T1 - T0) / (864e5 * 30.4);
  const step = spanMonths > 30 ? 6 : spanMonths > 10 ? 3 : 1;
  mo = Math.ceil(mo / step) * step; if (mo > 11) { mo -= 12; y++; }
  for (;;) { const ms = Date.UTC(y, mo, 1); if (ms > T1) break; if (ms >= T0) out.push({ x: box.x + (ms - T0) / (T1 - T0) * box.w, label: monthLabel(ms) }); mo += step; if (mo > 11) { mo -= 12; y++; } }
  return out;
}
// value at a time (piecewise linear between sourced points) for the ticking counter
const valueAt = ms => { if (ms <= t(points[0].date)) return points[0].value; for (let i = 0; i < points.length - 1; i++) { const a = t(points[i].date), b = t(points[i + 1].date); if (ms <= b) return points[i].value + (points[i + 1].value - points[i].value) * (ms - a) / (b - a); } return points[points.length - 1].value; };

// Place move labels into rows inside each lane without collisions.
function layoutLanes(box, opts = {}) {
  const fontPx = opts.font || 22, charW = fontPx * 0.5;
  const res = [];
  for (const [li, lane] of lanes.entries()) {
    const rows = [];
    const moves = lane.moves.map((m, i) => ({ ...m, i, ms: t(m.date) })).filter(m => m.show !== false).sort((a, b) => a.ms - b.ms);
    for (const m of moves) {
      const x = box.x + (m.ms - T0) / (T1 - T0) * box.w;
      const w = width(m.label) * charW + 22;
      const right = x + w < box.x + box.w - 10;
      const span = right ? [x - 6, x + w] : [x - w, x + 6];
      let r = rows.findIndex(row => row.every(s => span[1] < s[0] - 16 || span[0] > s[1] + 16));
      if (r < 0) { rows.push([]); r = rows.length - 1; }
      rows[r].push(span); res.push({ lane: li, laneId: lane.id, i: m.i, x, row: r, right, label: m.label, ms: m.ms });
    }
    lane._rows = Math.max(rows.length, 1);
  }
  return res;
}

// ---------- assets ----------
const out = path.resolve(outDir);
await mkdir(path.join(out, 'compositions'), { recursive: true });
await mkdir(path.join(out, 'assets', 'ev'), { recursive: true });
const require = createRequire(import.meta.url);
let gsapPath = null;
// Resolution walks up node_modules from each base: an OpenMotion checkout, the working directory or this Skill.
for (const base of [process.env.OPENMOTION_HOME, process.cwd(), here, path.resolve(here, '../../../..')].filter(Boolean)) {
  try { gsapPath = require.resolve('gsap/dist/gsap.min.js', { paths: [base] }); break; } catch {}
}
if (!gsapPath) { console.error('GSAP was not found. Set OPENMOTION_HOME to your OpenMotion checkout, or run `npm install gsap` in the working directory.'); process.exit(1); }
await copyFile(gsapPath, path.join(out, 'assets', 'gsap.min.js'));
// OpenMotion brand marks: the design-system source in a checkout, else this Skill's unchanged copy.
const brandDir = [path.resolve(here, '../../../../packages/design-system/brand'), process.env.OPENMOTION_HOME && path.join(process.env.OPENMOTION_HOME, 'packages/design-system/brand'), path.resolve(here, '../assets/brand')]
  .filter(Boolean).find(d => existsSync(path.join(d, 'openmotion-logo.svg')) && existsSync(path.join(d, 'loading-mark.svg')));
if (!brandDir) { console.error('OpenMotion brand marks not found (openmotion-logo.svg, loading-mark.svg).'); process.exit(1); }
await mkdir(path.join(out, 'assets', 'brand'), { recursive: true });
await copyFile(path.join(brandDir, 'openmotion-logo.svg'), path.join(out, 'assets', 'brand', 'openmotion-logo.svg'));
await copyFile(path.join(brandDir, 'loading-mark.svg'), path.join(out, 'assets', 'brand', 'openmotion-mark.svg'));
const copied = new Map();
async function asset(rel) {
  if (!rel) return null;
  if (copied.has(rel)) return copied.get(rel);
  const found = [path.resolve(inputDir, rel), path.resolve(inputDir, '..', rel), path.resolve(rel)].find(p => existsSync(p));
  if (!found) return null;
  const name = 'assets/ev/' + String(copied.size).padStart(3, '0') + '-' + path.basename(found).replace(/[^\w.-]/g, '_');
  await copyFile(found, path.join(out, name));
  copied.set(rel, name);
  return name;
}
const moveOf = ref => { const [lid, idx] = ref.split(':'); return lanes.find(l => l.id === lid).moves[Number(idx)]; };

// ---------- shared scene pieces ----------
const FONT = zh ? `'Outfit','PingFang SC','Noto Sans SC','Noto Sans JP',sans-serif` : `'Outfit','Inter',sans-serif`;
const MONO = `'JetBrains Mono','IBM Plex Mono',monospace`;
// CJK system fonts have no downloadable file; declare them with local() so the OpenMotion font check passes.
const CJK_FACES = zh ? ['PingFang SC', 'Noto Sans SC', 'Noto Sans JP']
  .map(name => `@font-face{font-family:'${name}';src:local('${name}');font-display:block}`).join('\n  ') : '';
const baseCss = id => `
  ${CJK_FACES}
  #root{position:absolute;inset:0;overflow:hidden;background:${C.bg};font-family:${FONT};color:${C.ink}}
  #${id}-bg{position:absolute;inset:-10%;background:
    radial-gradient(40% 45% at 12% 8%, rgba(147,197,253,.30), transparent 70%),
    radial-gradient(38% 40% at 88% 20%, rgba(196,181,253,.28), transparent 70%),
    radial-gradient(45% 50% at 50% 70%, rgba(165,180,252,.20), transparent 70%)}
  .${id}-head{position:absolute;left:120px;top:62px;display:flex;align-items:center;gap:26px;white-space:nowrap}
  .${id}-badge{width:66px;height:66px;flex:none;display:block}
  .${id}-h{font-size:${zh ? 76 : 88}px;font-weight:600;letter-spacing:-0.035em;line-height:1}
  .mono{font-family:${MONO}}`;
const badge = id => `<img class="${id}-badge" src="assets/brand/openmotion-mark.svg" alt="OpenMotion">`;
const headline = (id, text) => `<div class="${id}-head" id="${id}-head">${badge(id)}<div class="${id}-h" id="${id}-htext">${esc(text)}</div></div>`;
const headIn = (id, at = 0.05) => `tl.fromTo('#${id}-head',{opacity:0,y:18},{opacity:1,y:0,duration:0.5,ease:'power3.out'},${at});`;
function scene(id, css, body, script) {
  return `<template>
<style>${baseCss(id)}${css}</style>
<div id="root" data-composition-id="${id}" data-width="${W}" data-height="${H}">
<div id="${id}-bg"></div>
${body}
</div>
<script>
(function(){
const tl = gsap.timeline({ paused: true });
tl.fromTo('#${id}-bg',{x:0,y:0},{x:-40,y:-20,duration:12,ease:'none'},0);
${script}
window.__timelines["${id}"] = tl;
})();
</script>
</template>
`;
}
// chart SVG (curve, area, axis, points)
function chartSvg(id, box, c, opts = {}) {
  const tk = ticks(box);
  const grad = `${id}-grad`;
  return `<svg id="${id}-chart" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="position:absolute;left:0;top:0;overflow:visible">
  <defs><linearGradient id="${grad}" x1="0" x2="1"><stop offset="0" stop-color="${C.accent}"/><stop offset="1" stop-color="${C.violet}"/></linearGradient>
  <linearGradient id="${grad}-a" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${C.violet}" stop-opacity=".16"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/></linearGradient>
  <filter id="${id}-glow" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="6"/></filter></defs>
  <line x1="${box.x}" x2="${box.x + box.w}" y1="${box.y + box.h}" y2="${box.y + box.h}" stroke="${C.line}" stroke-width="2"/>
  ${tk.map(k => `<text x="${k.x.toFixed(1)}" y="${box.y + box.h + 30}" text-anchor="middle" font-family="${MONO}" font-size="19" fill="${C.faint}">${esc(k.label)}</text>`).join('')}
  <path id="${id}-area" d="${c.area}" fill="url(#${grad}-a)" opacity="${opts.area === false ? 0 : 1}"/>
  <path id="${id}-glowline" d="${c.d}" fill="none" stroke="url(#${grad})" stroke-width="10" opacity=".35" filter="url(#${id}-glow)" pathLength="1" stroke-dasharray="1 1"/>
  <path id="${id}-line" d="${c.d}" fill="none" stroke="url(#${grad})" stroke-width="5" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1"/>
  ${opts.extra || ''}
  ${c.xs.map((x, i) => `<circle id="${id}-pt${i}" cx="${x.toFixed(1)}" cy="${c.ys[i].toFixed(1)}" r="8" fill="#fff" stroke="${C.accent}" stroke-width="4"/>`).join('')}
</svg>`;
}
const drawChart = (id, at, dur, c, box) => `
tl.fromTo(['#${id}-line','#${id}-glowline'],{strokeDashoffset:1},{strokeDashoffset:0,duration:${dur},ease:'none'},${at});
tl.fromTo('#${id}-area',{opacity:0},{opacity:1,duration:${dur},ease:'none'},${at});
${c.xs.map((x, i) => `tl.fromTo('#${id}-pt${i}',{opacity:0,scale:0.2,transformOrigin:'50% 50%'},{opacity:1,scale:1,duration:0.3,ease:'back.out(3)'},${(at + (x - box.x) / box.w * dur).toFixed(2)});`).join('\n')}`;

// lanes block (used in map + full map)
function lanesBlock(id, box, top, opts = {}) {
  const placed = layoutLanes(box, { font: 22 });
  const gap = 14, rows = lanes.reduce((n, l) => n + l._rows, 0), room = (opts.bottom || 1030) - top - lanes.length * (28 + gap);
  const rowH = Math.max(26, Math.min(36, Math.floor(room / rows)));
  let y = top, html = '';
  const laneY = [];
  for (const [li, lane] of lanes.entries()) {
    const h = 28 + lane._rows * rowH;
    laneY.push(y);
    html += `<div id="${id}-lane${li}" style="position:absolute;left:120px;width:${W - 240}px;top:${y}px;height:${h}px;border-radius:14px;background:${C.lane}"></div>
<div id="${id}-lname${li}" style="position:absolute;left:138px;top:${y + 16}px;font-size:22px;font-weight:600;color:${C.ink};display:flex;align-items:center;gap:10px"><span style="width:9px;height:9px;border-radius:50%;background:${laneColors[li]}"></span>${esc(lane.name)}</div>`;
    y += h + gap;
  }
  for (const [k, p] of placed.entries()) {
    const yy = laneY[p.lane] + 14 + p.row * rowH;
    const dot = `<span style="width:9px;height:9px;border-radius:50%;background:${laneColors[p.lane]};flex:none"></span>`;
    html += `<div id="${id}-mv${k}" style="position:absolute;top:${yy}px;${p.right ? `left:${(p.x - 4).toFixed(1)}px` : `right:${(W - p.x - 4).toFixed(1)}px`};display:flex;align-items:center;gap:9px;font-size:22px;color:#3d4250;white-space:nowrap">${p.right ? dot + esc(p.label) : esc(p.label) + dot}</div>`;
  }
  return { html, placed, bottom: y, laneY };
}

// evidence card content
async function evidenceCard(id, ref, k, x, y, w, h, title) {
  const m = moveOf(ref);
  const card = m.card;
  const img = card ? null : await asset(m.source?.image);
  let inner;
  if (card?.type === 'chips') {
    inner = `<div style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center;align-content:center;height:100%;padding:24px">${card.items.map(s => `<span class="mono" style="padding:10px 18px;border-radius:12px;background:#eef1ff;color:${C.accent};font-size:30px;font-weight:600">${esc(s)}</span>`).join('')}</div>`;
  } else if (card?.type === 'list') {
    inner = `<div class="mono" style="padding:26px 30px;font-size:21px;line-height:1.75;color:#3d4250">${card.items.slice(0, 6).map(s => `<div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis"><span style="color:${C.accent}">›</span> ${esc(s)}</div>`).join('')}</div>`;
  } else if (card?.type === 'stat') {
    inner = `<div style="display:grid;place-items:center;height:100%;text-align:center"><div><div style="font-size:96px;font-weight:700;letter-spacing:-.04em;color:${C.ink}">${esc(card.value)}</div><div class="mono" style="font-size:20px;color:${C.sub}">${esc(card.label || '')}</div></div></div>`;
  } else if (img) {
    inner = `<img src="${img}" style="width:100%;height:100%;object-fit:cover;object-position:top center;display:block">`;
  } else {
    const pub = m.source?.publisher || (m.source?.url ? new URL(m.source.url).hostname.replace(/^www\./, '') : '');
    inner = `<div style="padding:28px 32px;height:100%;box-sizing:border-box;background:#fff">
  <div class="mono" style="font-size:16px;letter-spacing:.12em;text-transform:uppercase;color:${C.faint}">${esc(pub)}</div>
  <div style="margin-top:14px;font-family:'Inter',sans-serif;font-size:31px;line-height:1.18;font-weight:700;color:${C.ink};display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden">${esc(m.source?.title || m.label)}</div>
  <div class="mono" style="margin-top:16px;font-size:16px;color:${C.sub}">${esc(m.date)}</div>
  <div style="margin-top:18px;height:10px;width:86%;border-radius:5px;background:#eef0f4"></div><div style="margin-top:10px;height:10px;width:70%;border-radius:5px;background:#eef0f4"></div></div>`;
  }
  return `<div id="${id}-cap${k}" style="position:absolute;left:${x}px;top:${y - 44}px;width:${w}px;font-size:27px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(title || m.label)}</div>
<div id="${id}-card${k}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:16px;overflow:hidden;background:#fff;box-shadow:0 18px 50px rgba(30,40,90,.16),0 0 0 1px rgba(20,22,28,.06)">${inner}</div>`;
}

const fmt2 = d => { const u = d.metric?.unit ?? ''; const pts = d.metric?.points || []; const v = d.metric?.headline?.value ?? pts[pts.length - 1]?.value ?? 0; const a = Math.abs(v); const n = a >= 1e9 ? (v / 1e9).toFixed(2).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') + 'B' : a >= 1e6 ? Math.round(v / 1e6) + 'M' : a >= 1e3 ? Math.round(v / 1e3) + 'K' : String(v); return (u === '$' ? '$' + n : n) + ' ' + String(d.metric?.label || '').toUpperCase(); };
// ---------- scenes ----------
const scenes = [];
const cues = [];
const offset = () => scenes.reduce((n, s) => n + s.dur, 0);
const cue = (type, local) => cues.push({ type, t: +(offset() + local).toFixed(3) });
const company = data.company;
const logo = await asset(data.brand?.logo);

// 1 intro
{
  const id = 'intro', OFF = 2.2, dur = 4 + OFF;
  const cmd = T.cmd(company);
  const chars = [...cmd];
  const body = `<div id="${id}-lock" style="position:absolute;left:0;right:0;top:380px;display:flex;flex-direction:column;align-items:center;gap:34px">
  <img id="${id}-wordmark" src="assets/brand/openmotion-logo.svg" alt="OpenMotion" style="width:620px;height:auto">
  <div id="${id}-tag" style="font-size:58px;font-weight:600;letter-spacing:-.03em;color:${C.ink}">${esc(T.intro)}</div>
</div>
${headline(id, T.intro)}
<div id="${id}-term" style="position:absolute;left:460px;top:430px;width:1000px;height:150px;border-radius:18px;background:#16181f;box-shadow:0 30px 80px rgba(20,22,40,.35);overflow:hidden">
  <div style="height:40px;display:flex;align-items:center;gap:9px;padding-left:20px;background:#1f222b"><i style="width:13px;height:13px;border-radius:50%;background:#ff5f57"></i><i style="width:13px;height:13px;border-radius:50%;background:#febc2e"></i><i style="width:13px;height:13px;border-radius:50%;background:#28c840"></i><span class="mono" style="margin-left:14px;color:#8b90a0;font-size:16px">agent</span></div>
  <div class="mono" style="padding:30px 32px;font-size:32px;color:#e7e9f0;white-space:nowrap;display:flex;align-items:center"><span style="color:#7c8cff;margin-right:18px">›</span>${chars.map((ch, i) => `<span id="${id}-c${i}" style="${ch === ' ' ? 'white-space:pre' : ''}">${esc(ch)}</span>`).join('')}${logo ? `<img id="${id}-logo" src="${logo}" style="width:38px;height:38px;border-radius:9px;margin-left:16px;object-fit:contain;background:#fff">` : ''}<span id="${id}-caret" style="display:inline-block;width:16px;height:36px;background:#7c8cff;margin-left:6px"></span></div>
</div>`;
  const script = `tl.fromTo('#${id}-wordmark',{opacity:0,y:24,scale:.94},{opacity:1,y:0,scale:1,duration:.7,ease:'power3.out'},0.1);
tl.fromTo('#${id}-tag',{opacity:0,y:20},{opacity:1,y:0,duration:.55,ease:'power3.out'},0.55);
tl.to('#${id}-lock',{opacity:0,y:-40,duration:.45,ease:'power2.in'},${OFF - 0.5});
tl.set('#${id}-lock',{opacity:0},${OFF});
${headIn(id, OFF)}
tl.fromTo('#${id}-term',{opacity:0,y:40,scale:.96},{opacity:1,y:0,scale:1,duration:.6,ease:'power3.out'},${OFF + 0.5});
${chars.map((_, i) => `tl.fromTo('#${id}-c${i}',{opacity:0},{opacity:1,duration:0.01},${(OFF + 1.0 + i * 0.045).toFixed(3)});`).join('\n')}
${logo ? `tl.fromTo('#${id}-logo',{opacity:0,scale:.4},{opacity:1,scale:1,duration:.3,ease:'back.out(3)'},${(OFF + 1.0 + chars.length * 0.045).toFixed(2)});` : ''}
tl.fromTo('#${id}-caret',{opacity:1},{opacity:0,duration:0.01,repeat:${Math.floor((dur - OFF) / 0.5)},yoyo:true,repeatDelay:0.25},${OFF + 0.6});
tl.to('#${id}-term',{y:-260,scale:.7,opacity:0,duration:.5,ease:'power2.in'},${dur - 0.55});`;
  cue('rise', 0.1); cue('pop', 0.55); cue('whoosh', OFF);
  chars.forEach((ch, i) => { if (ch !== ' ') cue('tick', OFF + 1.0 + i * 0.045); });
  cue('pop', OFF + 1.0 + chars.length * 0.045);
  scenes.push({ id, dur, html: scene(id, '', body, script) });
}

// 2 sources
{
  const id = 'sources', dur = 3.6;
  const engines = data.research?.engines || [];
  const n = engines.length;
  const cols = Math.min(5, Math.ceil(n / 2)), tile = 150, gx = 210, gy = 230;
  const x0 = (W - (cols - 1) * gx) / 2, y0 = 360;
  const tiles = [];
  for (const [i, e] of engines.entries()) {
    const icon = (await asset(['png', 'jpg'].map(x => `evidence/engines/${e.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${x}`).find(p => existsSync(path.resolve(inputDir, p)) || existsSync(path.resolve(inputDir, '..', p)))))
      || (await asset(['png', 'jpg'].map(x => `engines/${e.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${x}`).find(p => existsSync(path.resolve(inputDir, p)))));
    const cx = x0 + (i % cols) * gx, cy = y0 + Math.floor(i / cols) * gy;
    tiles.push(`<div id="${id}-t${i}" style="position:absolute;left:${cx - tile / 2}px;top:${cy - tile / 2}px;width:${tile}px;text-align:center">
  <div style="width:${tile}px;height:${tile}px;border-radius:36px;background:#fff;box-shadow:0 14px 40px rgba(30,40,90,.12);display:grid;place-items:center;position:relative">
    ${icon ? `<img src="${icon}" style="width:76px;height:76px;object-fit:contain">` : `<span style="font-size:64px;font-weight:700;color:${C.accent}">${esc(e[0].toUpperCase())}</span>`}
    <span id="${id}-ok${i}" style="position:absolute;right:-8px;top:-8px;width:38px;height:38px;border-radius:50%;background:#22c55e;display:grid;place-items:center;box-shadow:0 4px 12px rgba(34,197,94,.4)"><svg width="20" height="20" viewBox="0 0 20 20"><path d="M4 10.5 L8.5 15 L16 6" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
  </div>
  <div class="mono" style="margin-top:14px;font-size:19px;color:${C.sub}">${esc(e)}</div></div>`);
  }
  const r = data.research || {};
  const meta = [r.calls && `${r.calls} ${T.calls}`, r.minutes && `${r.minutes} ${T.minutes}`].filter(Boolean).join(' · ');
  const body = `${headline(id, T.sources(n))}${tiles.join('')}
<div id="${id}-meta" class="mono" style="position:absolute;left:0;right:0;top:900px;text-align:center;font-size:22px;color:${C.sub}">${esc(meta)}</div>`;
  const script = `${headIn(id)}
${engines.map((_, i) => `tl.fromTo('#${id}-t${i}',{opacity:0,y:30,scale:.6},{opacity:1,y:0,scale:1,duration:.45,ease:'back.out(2.2)'},${(0.3 + i * 0.08).toFixed(2)});
tl.fromTo('#${id}-ok${i}',{opacity:0,scale:0},{opacity:1,scale:1,duration:.25,ease:'back.out(3)'},${(1.3 + ((i * 7) % n) * 0.09).toFixed(2)});`).join('\n')}
tl.fromTo('#${id}-meta',{opacity:0},{opacity:1,duration:.4},1.5);
tl.to('${engines.map((_, i) => `#${id}-t${i}`).join(',')}',{scale:.35,opacity:0,y:-120,duration:.45,ease:'power2.in',stagger:.02},${dur - 0.7});`;
  engines.forEach((_, i) => { cue('pop', 0.3 + i * 0.08); cue('ding', 1.3 + ((i * 7) % n) * 0.09); });
  scenes.push({ id, dur, html: scene(id, '', body, script) });
}

// 3 map build
const BOX = { x: 540, y: 190, w: 1260, h: 210 };
{
  const id = 'map', dur = 9;
  const c = curve(BOX);
  const lb = lanesBlock(id, BOX, 450);
  const drawAt = 0.5, drawDur = 6.2;
  const head = data.metric.headline || { value: points[points.length - 1].value, note: points[points.length - 1].date };
  const body = `${headline(id, T.signals(company))}
<div class="mono" style="position:absolute;left:120px;top:180px;font-size:20px;letter-spacing:.14em;color:${C.faint};text-transform:uppercase">${esc(data.metric.label)}</div>
<div id="${id}-num" style="position:absolute;left:116px;top:200px;font-size:120px;font-weight:700;letter-spacing:-.05em">${esc(fmt(points[0].value))}</div>
<div id="${id}-note" class="mono" style="position:absolute;left:120px;top:342px;font-size:22px;color:${C.sub}">${esc(head.note || '')}</div>
${chartSvg(id, BOX, c, { extra: `<line id="${id}-ph" x1="0" x2="0" y1="${BOX.y - 10}" y2="${lb.bottom - 10}" stroke="${C.ink}" stroke-opacity=".55" stroke-width="2"/>` })}
${lb.html}`;
  const laneIn = lanes.map((_, li) => `tl.fromTo(['#${id}-lane${li}','#${id}-lname${li}'],{opacity:0,x:-20},{opacity:1,x:0,duration:.4,ease:'power2.out'},${(0.3 + li * 0.1).toFixed(2)});`).join('\n');
  const mvIn = lb.placed.map((p, k) => `tl.fromTo('#${id}-mv${k}',{opacity:0,y:8},{opacity:1,y:0,duration:.3,ease:'power2.out'},${(drawAt + (p.x - BOX.x) / BOX.w * drawDur).toFixed(2)});`).join('\n');
  const ms0 = T0, ms1 = T1;
  const script = `${headIn(id)}
${laneIn}
${drawChart(id, drawAt, drawDur, c, BOX)}
tl.fromTo('#${id}-ph',{attr:{x1:${BOX.x},x2:${BOX.x}},opacity:1},{attr:{x1:${BOX.x + BOX.w},x2:${BOX.x + BOX.w}},duration:${drawDur},ease:'none'},${drawAt});
tl.to('#${id}-ph',{opacity:0,duration:.3},${drawAt + drawDur});
const P=${JSON.stringify(points.map(p => [t(p.date), p.value]))}, U=${JSON.stringify(unit)};
const fmt=${fmt.toString().replace(/unit/g, 'U')};
const val=ms=>{if(ms<=P[0][0])return P[0][1];for(let i=0;i<P.length-1;i++){if(ms<=P[i+1][0])return P[i][1]+(P[i+1][1]-P[i][1])*(ms-P[i][0])/(P[i+1][0]-P[i][0]);}return P[P.length-1][1];};
const num=document.querySelector('#${id}-num'); const st={ms:${ms0}};
tl.fromTo(st,{ms:${ms0}},{ms:${ms1},duration:${drawDur},ease:'none',onUpdate(){num.textContent=fmt(val(st.ms));}},${drawAt});
tl.fromTo('#${id}-num',{scale:1},{scale:1.06,transformOrigin:'0% 50%',duration:.25,yoyo:true,repeat:1},${drawAt + drawDur});
${mvIn}`;
  cue('rise', drawAt); lb.placed.forEach(p => cue('blip', drawAt + (p.x - BOX.x) / BOX.w * drawDur)); cue('hit', drawAt + drawDur);
  scenes.push({ id, dur, html: scene(id, '', body, script) });
}

// 4-6 plays
for (const [pi, play] of plays.entries()) {
  const id = 'play' + (pi + 1), dur = 6.6;
  const c = curve(BOX);
  const ev = play.evidence.slice(0, 3);
  // highlight the curve after each move of this lane until the next metric point
  const lane = lanes.find(l => l.id === play.lane);
  const segs = lane.moves.filter(m => m.show !== false).map(m => {
    const x = c.xOf(t(m.date)); const next = c.xs.find(px => px > x + 4) ?? BOX.x + BOX.w;
    return [Math.max(BOX.x, x), Math.min(next, BOX.x + BOX.w)];
  }).filter(([a, b]) => b > a);
  const clip = `${id}-hl`;
  const extra = `<clipPath id="${clip}">${segs.map(([a, b], k) => `<rect id="${id}-seg${k}" x="${a.toFixed(1)}" y="0" width="${(b - a).toFixed(1)}" height="${H}"/>`).join('')}</clipPath>
  <path d="${c.d}" fill="none" stroke="${C.hot}" stroke-width="18" opacity=".18" clip-path="url(#${clip})" id="${id}-hlglow"/>
  <path d="${c.d}" fill="none" stroke="${C.hot}" stroke-width="6" stroke-linecap="round" clip-path="url(#${clip})" id="${id}-hlline"/>`;
  const cardW = 530, cardH = 300, gapX = 45, cy = 700;
  const cx0 = (W - (ev.length * cardW + (ev.length - 1) * gapX)) / 2;
  let cards = '', leaders = '';
  for (const [k, ref] of ev.entries()) {
    const x = cx0 + k * (cardW + gapX);
    cards += await evidenceCard(id, ref, k, x, cy, cardW, cardH, play.cardTitles?.[k]);
    const m = moveOf(ref); const px = c.xOf(t(m.date)), py = c.yAt(px);
    leaders += `<line id="${id}-ld${k}" x1="${(x + cardW / 2).toFixed(1)}" y1="${cy - 56}" x2="${px.toFixed(1)}" y2="${(py + 8).toFixed(1)}" stroke="${C.accent}" stroke-opacity=".55" stroke-width="2" stroke-dasharray="4 7"/>
<circle id="${id}-ldp${k}" cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="11" fill="${C.hot}" stroke="#fff" stroke-width="4"/>`;
  }
  const wall = [];
  for (const f of (play.wall || []).slice(0, 48)) { const a = await asset(f); if (a) wall.push(a); }
  const wallCols = 12, tw = 140, th = 79;
  const wallX0 = (W - wallCols * (tw + 8)) / 2;
  const wallHtml = wall.map((a, k) => `<img id="${id}-w${k}" src="${a}" style="position:absolute;left:${(wallX0 + (k % wallCols) * (tw + 8)).toFixed(0)}px;top:${640 + Math.floor(k / wallCols) * (th + 8)}px;width:${tw}px;height:${th}px;object-fit:cover;border-radius:6px">`).join('');
  const stat = play.stat || {};
  const li = lanes.indexOf(lane);
  const lf = lanesBlock(id + 'f', BOX, 450);
  const others = [...lanes.keys()].filter(k => k !== li).flatMap(k => [`#${id}f-lane${k}`, `#${id}f-lname${k}`]).concat(lf.placed.map((p, k) => p.lane !== li ? `#${id}f-mv${k}` : null).filter(Boolean));
  const body = `<div id="${id}-focus">${lf.html}</div>
${headline(id, play.headline)}
<div class="mono" style="position:absolute;left:120px;top:190px;font-size:22px;color:${C.sub};display:flex;align-items:center;gap:12px"><span style="width:34px;height:5px;border-radius:3px;background:${C.hot}"></span>${esc(T.after)} · ${esc(lane.name)}</div>
<div id="${id}-stat" style="position:absolute;left:116px;top:236px;font-size:132px;font-weight:700;letter-spacing:-.05em;line-height:1">${esc((stat.prefix || '') + '0' + (stat.suffix || ''))}</div>
<div id="${id}-statl" style="position:absolute;left:120px;top:384px;width:400px;font-size:25px;color:#3d4250;line-height:1.3">${esc(stat.label || '')}</div>
${chartSvg(id, BOX, c, { extra, area: false })}
${wall.length ? `<div id="${id}-wall">${wallHtml}</div>` : ''}
<svg width="${W}" height="${H}" style="position:absolute;left:0;top:0;overflow:visible">${leaders}</svg>
${cards}
${play.wallSource ? `<div class="mono" style="position:absolute;right:120px;bottom:28px;font-size:16px;color:${C.faint}">${esc(play.wallSource)}</div>` : ''}`;
  const cardStart = wall.length ? 2.8 : 1.7;
  const script = `${headIn(id)}
tl.fromTo('${others.join(',')}',{opacity:1},{opacity:0,duration:.35,ease:'power1.out'},0);
tl.fromTo('#${id}f-lane${li}',{boxShadow:'0 0 0 0px ${C.accent}00',background:'${C.lane}'},{boxShadow:'0 0 0 3px ${C.accent}',background:'rgba(59,91,255,0.12)',duration:.35,ease:'power2.out'},0.1);
tl.to('#${id}-focus',{opacity:0,y:60,duration:.5,ease:'power2.in'},${wall.length ? 0.55 : 1.2});
tl.set(['#${id}-line','#${id}-glowline'],{strokeDashoffset:0},0);
${c.xs.map((_, i) => `tl.set('#${id}-pt${i}',{opacity:.6},0);`).join('')}
tl.fromTo('#${id}-chart',{opacity:0,y:20},{opacity:1,y:0,duration:.5,ease:'power2.out'},0.15);
${segs.map((s, k) => `tl.fromTo('#${id}-seg${k}',{attr:{width:0}},{attr:{width:${(s[1] - s[0]).toFixed(1)}},duration:.6,ease:'power2.inOut'},${(0.6 + k * 0.25).toFixed(2)});`).join('\n')}
const sv={v:0}, se=document.querySelector('#${id}-stat');
tl.fromTo(sv,{v:0},{v:${Number(stat.value) || 0},duration:1.4,ease:'power2.out',onUpdate(){se.textContent=${JSON.stringify(stat.prefix || '')}+(${Number(stat.value) % 1 ? `sv.v.toFixed(${String(stat.value).split('.')[1]?.length || 1})` : "Math.round(sv.v).toLocaleString('en-US')"})+${JSON.stringify(stat.suffix || '')};}},0.5);
tl.fromTo('#${id}-statl',{opacity:0},{opacity:1,duration:.4},0.9);
${wall.map((_, k) => `tl.fromTo('#${id}-w${k}',{opacity:0,y:20,scale:.8},{opacity:1,y:0,scale:1,duration:.3,ease:'power2.out'},${(0.6 + k * 0.035).toFixed(3)});`).join('\n')}
${wall.length ? `tl.to('#${id}-wall',{opacity:.16,filter:'blur(2px)',duration:.6},${cardStart - 0.3});` : ''}
${ev.map((_, k) => `tl.fromTo(['#${id}-card${k}','#${id}-cap${k}'],{opacity:0,y:50},{opacity:1,y:0,duration:.55,ease:'power3.out'},${(cardStart + k * 0.55).toFixed(2)});
tl.fromTo('#${id}-ld${k}',{opacity:0},{opacity:1,duration:.4},${(cardStart + k * 0.55 + 0.3).toFixed(2)});
tl.fromTo('#${id}-ldp${k}',{opacity:0,scale:0,transformOrigin:'50% 50%'},{opacity:1,scale:1,duration:.3,ease:'back.out(3)'},${(cardStart + k * 0.55 + 0.3).toFixed(2)});`).join('\n')}`;
  cue('rise', 0.5); wall.forEach((_, k) => { if (k % 4 === 0) cue('tick', 0.6 + k * 0.035); }); ev.forEach((_, k) => cue('pop', cardStart + k * 0.55));
  scenes.push({ id, dur, html: scene(id, '', body, script) });
}

// 7 full map
{
  const id = 'full', dur = 4.4;
  const c = curve(BOX);
  const lb = lanesBlock(id, BOX, 450, { bottom: 1010 });
  const head = data.metric.headline || { value: points[points.length - 1].value, note: '' };
  const body = `${headline(id, T.map(company))}
<div class="mono" style="position:absolute;left:120px;top:180px;font-size:20px;letter-spacing:.14em;color:${C.faint};text-transform:uppercase">${esc(data.metric.label)}</div>
<div style="position:absolute;left:116px;top:200px;font-size:120px;font-weight:700;letter-spacing:-.05em">${esc(fmt(head.value))}</div>
<div class="mono" style="position:absolute;left:120px;top:342px;font-size:22px;color:${C.sub}">${esc(head.note || '')}</div>
${chartSvg(id, BOX, c)}
${lb.html}
<div class="mono" style="position:absolute;right:120px;bottom:30px;font-size:18px;color:${C.faint}">${esc(T.sourcesNote)}</div>`;
  const script = `${headIn(id)}
tl.set(['#${id}-line','#${id}-glowline'],{strokeDashoffset:0},0);
tl.fromTo('#${id}-chart',{opacity:0},{opacity:1,duration:.5},0.1);
${lanes.map((_, li) => `tl.fromTo(['#${id}-lane${li}','#${id}-lname${li}'],{opacity:0,y:16},{opacity:1,y:0,duration:.4},${(0.2 + li * 0.08).toFixed(2)});`).join('\n')}
${lb.placed.map((_, k) => `tl.fromTo('#${id}-mv${k}',{opacity:0},{opacity:1,duration:.3},${(0.5 + k * 0.03).toFixed(2)});`).join('\n')}
tl.fromTo('#root[data-composition-id="${id}"]',{scale:1},{scale:1.035,transformOrigin:'50% 40%',duration:${dur},ease:'none'},0);`;
  cue('hit', 0.1);
  scenes.push({ id, dur, html: scene(id, '', body, script) });
}

// 8 plays to copy
{
  const id = 'copy', dur = 6.4;
  const n = plays.length, colW = 520, gap = 50, x0 = (W - (n * colW + (n - 1) * gap)) / 2;
  const cols = plays.map((p, k) => `<div id="${id}-col${k}" style="position:absolute;left:${x0 + k * (colW + gap)}px;top:250px;width:${colW}px;height:700px;border-radius:22px;background:#fff;box-shadow:0 18px 50px rgba(30,40,90,.12);padding:40px 40px;box-sizing:border-box">
  <div class="mono" style="font-size:24px;color:${C.accent};font-weight:600">0${k + 1}</div>
  <div style="margin-top:16px;font-size:40px;font-weight:600;letter-spacing:-.02em;line-height:1.1">${esc(p.headline)}</div>
  <div style="margin-top:22px;font-size:58px;font-weight:700;letter-spacing:-.04em;color:${C.hot}">${esc((p.stat?.prefix || '') + (Number.isInteger(p.stat?.value) ? p.stat.value.toLocaleString('en-US') : p.stat?.value) + (p.stat?.suffix || ''))}</div>
  <div style="font-size:22px;color:${C.sub};line-height:1.3">${esc(p.stat?.label || '')}</div>
  <div class="mono" style="margin-top:30px;font-size:16px;letter-spacing:.12em;text-transform:uppercase;color:${C.faint}">${esc(T.giveTeam)}</div>
  <div style="margin-top:10px;font-size:23px;line-height:1.42;color:#2b2f3a;display:-webkit-box;-webkit-line-clamp:7;-webkit-box-orient:vertical;overflow:hidden">${esc(p.instruction)}</div>
</div>`).join('');
  const body = `${headline(id, T.plays(n))}${cols}`;
  const script = `${headIn(id)}
${plays.map((_, k) => `tl.fromTo('#${id}-col${k}',{opacity:0,y:60},{opacity:1,y:0,duration:.6,ease:'power3.out'},${(0.35 + k * 0.3).toFixed(2)});`).join('\n')}`;
  plays.forEach((_, k) => cue('pop', 0.35 + k * 0.3));
  scenes.push({ id, dur, html: scene(id, '', body, script) });
}

// 9 outro
{
  const id = 'outro', dur = galleryArg ? 4.6 : 3.6;
  const chars = [...T.outroCmd];
  const gal = [{ data, dir: inputDir, current: true }];
  for (const f of (galleryArg ? galleryArg.split(',') : [])) { try { gal.push({ data: JSON.parse(await readFile(f, 'utf8')), dir: path.dirname(path.resolve(f)) }); } catch {} }
  const cw = 520, ch = 250, gap = 40, perRow = 3, show = gal.slice(0, 6);
  const gx0 = (W - (Math.min(show.length, perRow) * cw + (Math.min(show.length, perRow) - 1) * gap)) / 2;
  const colorsG = [C.accent, '#14b8a6', '#8b5cf6', '#f59e0b', '#22a06b', '#ef4444'];
  let galHtml = '';
  for (const [k, g] of show.entries()) {
    const pts = g.data.metric?.points || [];
    if (show.length < 2 || pts.length < 2) continue;
    const ts = pts.map(p => t(p.date)), mx = Math.max(...pts.map(p => p.value));
    const px = ts.map(v => 28 + (v - ts[0]) / ((ts[ts.length - 1] - ts[0]) || 1) * (cw - 56)), py = pts.map(p => 130 - p.value / mx * 100);
    const dd = px.map((x, i) => (i ? 'L' : 'M') + x.toFixed(1) + ',' + py[i].toFixed(1)).join(' ');
    let lg = null; if (g.data.brand?.logo) { const found = [path.resolve(g.dir, g.data.brand.logo), path.resolve(g.dir, '..', g.data.brand.logo)].find(p => existsSync(p)); if (found) lg = await asset(path.relative(inputDir, found)); }
    const moves = (g.data.lanes || []).reduce((n, l) => n + (l.moves || []).length, 0);
    const x = gx0 + (k % perRow) * (cw + gap), y = (show.length > perRow ? 200 : 290) + Math.floor(k / perRow) * (ch + 34);
    galHtml += `<div id="${id}-g${k}" style="position:absolute;left:${x}px;top:${y}px;width:${cw}px;height:${ch}px;border-radius:18px;background:#fff;box-shadow:0 18px 50px rgba(30,40,90,${g.current ? '.20' : '.10'}),0 0 0 ${g.current ? 3 : 1}px ${g.current ? C.accent : 'rgba(20,22,28,.06)'}">
  <svg width="${cw}" height="150" style="position:absolute;left:0;top:0"><line x1="28" x2="${cw - 28}" y1="131" y2="131" stroke="${C.line}" stroke-width="2"/><path id="${id}-gp${k}" d="${dd}" fill="none" stroke="${colorsG[k % colorsG.length]}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 1"/></svg>
  <div style="position:absolute;left:28px;bottom:26px;display:flex;align-items:center;gap:14px">${lg ? `<img src="${lg}" style="width:46px;height:46px;border-radius:11px;object-fit:contain;background:#fff">` : ''}<div><div style="font-size:32px;font-weight:600;letter-spacing:-.02em">${esc(g.data.company)}</div><div class="mono" style="font-size:15px;letter-spacing:.12em;color:${g.current ? accentInk : C.faint}">${esc(fmt2(g.data))} · ${moves} MOVES${g.current ? ' · READY' : ''}</div></div></div></div>`;
  }
  const termTop = galHtml ? (show.length > perRow ? 830 : 660) : 470;
  const body = `${headline(id, T.outro)}${galHtml}
<div id="${id}-term" style="position:absolute;left:410px;top:${termTop}px;width:1100px;height:130px;border-radius:18px;background:#16181f;box-shadow:0 30px 80px rgba(20,22,40,.35)">
  <div class="mono" style="padding:42px 34px;font-size:32px;color:#e7e9f0;white-space:nowrap"><span style="color:#7c8cff;margin-right:18px">›</span>${chars.map((ch, i) => `<span id="${id}-c${i}" style="${ch === ' ' ? 'white-space:pre' : ''}">${esc(ch)}</span>`).join('')}</div></div>
<div id="${id}-brand" style="position:absolute;left:0;right:0;top:${termTop + 175}px;display:flex;align-items:center;justify-content:center;gap:26px">
  <img src="assets/brand/openmotion-logo.svg" alt="OpenMotion" style="width:420px;height:auto">
  <span class="mono" style="font-size:24px;color:${C.sub};padding-left:26px;border-left:2px solid ${C.line}">growth-teardown skill</span>
</div>`;
  const script = `${headIn(id)}
${show.map((_, k) => `tl.fromTo('#${id}-g${k}',{opacity:0,y:40,scale:.94},{opacity:1,y:0,scale:1,duration:.5,ease:'power3.out'},${(0.2 + k * 0.12).toFixed(2)});
tl.fromTo('#${id}-gp${k}',{strokeDashoffset:1},{strokeDashoffset:0,duration:1.1,ease:'power2.inOut'},${(0.4 + k * 0.12).toFixed(2)});`).join('\n')}
tl.fromTo('#${id}-term',{opacity:0,y:30},{opacity:1,y:0,duration:.5,ease:'power3.out'},0.35);
${chars.map((_, i) => `tl.fromTo('#${id}-c${i}',{opacity:0},{opacity:1,duration:0.01},${(0.8 + i * 0.035).toFixed(3)});`).join('\n')}
tl.fromTo('#${id}-brand',{opacity:0},{opacity:1,duration:.5},${(0.9 + chars.length * 0.035).toFixed(2)});`;
  chars.forEach((ch, i) => { if (ch !== ' ') cue('tick', 0.8 + i * 0.035); });
  cue('hit', 0.9 + chars.length * 0.035);
  scenes.push({ id, dur, html: scene(id, '', body, script) });
}

// ---------- root ----------
let at = 0;
const hosts = scenes.map(s => {
  const h = `    <div id="${s.id}" class="clip" data-composition-id="${s.id}" data-composition-src="compositions/${s.id}.html" data-start="${at.toFixed(3)}" data-duration="${s.dur}" data-track-index="0" data-track-kind="graphics" data-width="${W}" data-height="${H}"></div>`;
  at += s.dur; return h;
});
const total = Math.round(at * FPS) / FPS;
let acc = 0; for (const s of scenes) { if (acc > 0) cues.push({ type: 'whoosh', t: +acc.toFixed(3) }); acc += s.dur; }
cues.sort((a, b) => a.t - b.t);
await writeFile(path.join(out, 'cues.json'), JSON.stringify({ duration: total, cues }, null, 1));
let audio = '';
if (!music && !noScore) {
  const { renderScore } = await import('./score.mjs');
  await mkdir(path.join(out, 'assets'), { recursive: true });
  await renderScore({ duration: total, cues: cues.concat(scenes.length ? [] : []) }, path.join(out, 'assets', 'score.wav'));
  audio = `    <audio id="score" class="clip" src="assets/score.wav" data-start="0" data-duration="${total}" data-track-index="1"></audio>`;
}
if (music) { const name = 'assets/music' + path.extname(music); await copyFile(music, path.join(out, name)); audio = `    <audio id="music" class="clip" src="${name}" data-start="0" data-duration="${total}" data-track-index="1" data-volume="0.5"></audio>`; }
for (const s of scenes) await writeFile(path.join(out, 'compositions', s.id + '.html'), s.html);
await writeFile(path.join(out, 'index.html'), `<!doctype html>
<html lang="${zh ? 'zh' : 'en'}">
<head>
  <meta charset="utf-8">
  <meta name="generator" content="openmotion-growth-teardown">
  <title>${esc(company)} · growth teardown</title>
  <script src="assets/gsap.min.js"></script>
  <style>body{margin:0;background:${C.bg}}#main{position:relative;width:${W}px;height:${H}px;overflow:hidden}</style>
</head>
<body>
  <div id="main" data-composition-id="main" data-start="0" data-duration="${total}" data-width="${W}" data-height="${H}" data-fps="${FPS}">
${hosts.join('\n')}
${audio}
  </div>
  <script>
    window.__timelines = window.__timelines || {};
    window.__timelines.main = gsap.timeline({ paused: true });
  </script>
</body>
</html>
`);
// Point the project's copy of growth.json at the copied assets so out/ rebuilds on its own.
const local = rel => copied.get(rel) || rel;
const project = JSON.parse(JSON.stringify(data));
if (project.brand?.logo) project.brand.logo = local(project.brand.logo);
for (const lane of project.lanes || []) for (const m of lane.moves || []) if (m.source?.image) m.source.image = local(m.source.image);
for (const p of project.plays || []) if (p.wall) p.wall = p.wall.map(local);
await writeFile(path.join(out, 'growth.json'), JSON.stringify(project, null, 2));
console.log(`✓ ${company}: ${scenes.length} scenes, ${total.toFixed(1)} s → ${out}`);
