// Shared helpers for the OpenMotion holiday-sale Skills: sizes, themes, money, assets and the
// HyperFrames project writer. Each Skill ships its own copy so it installs on its own.
// Canonical copy: library/skills/openmotion-sale-promo/scripts/film.mjs. Edit it there, then copy it
// unchanged to openmotion-sale-countdown and openmotion-sale-carousel; tests/library-install.test.mjs
// fails when the three copies differ.
import { mkdir, writeFile, copyFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

export const FPS = 30;
export const SIZES = { '9:16': [1080, 1920], '4:5': [1080, 1350], '1:1': [1080, 1080], '16:9': [1920, 1080] };

// Occasion palettes. A brand accent from the data replaces the theme accent.
export const THEMES = {
  'black-friday': { bg: '#0a0a0b', panel: '#151517', ink: '#ffffff', sub: '#b8b8c0', accent: '#ff2e2e', accentInk: '#ffffff', shade: '10,10,11' },
  'cyber-monday': { bg: '#06061a', panel: '#10123a', ink: '#f2f6ff', sub: '#9aa6d6', accent: '#2ee6ff', accentInk: '#03121a', shade: '6,6,26' },
  holiday: { bg: '#0c2f24', panel: '#123d30', ink: '#fdf6e8', sub: '#bcd2c5', accent: '#ff3b30', accentInk: '#ffffff', shade: '8,30,22' },
  'new-year': { bg: '#0d0c0a', panel: '#1b1914', ink: '#fbf5e6', sub: '#b9ae94', accent: '#f0c24b', accentInk: '#16130a', shade: '13,12,10' },
  light: { bg: '#efeee9', panel: '#ffffff', ink: '#111113', sub: '#55555e', accent: '#e11d2e', accentInk: '#ffffff', shade: '239,238,233' },
};
export const OCCASION_THEME = { 'black friday': 'black-friday', 'cyber monday': 'cyber-monday', christmas: 'holiday', holiday: 'holiday', 'new year': 'new-year' };

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Display width in "Latin character" units; CJK counts double.
export const width = s => [...String(s ?? '')].reduce((n, ch) => n + (/[　-鿿＀-￯]/.test(ch) ? 2 : 1), 0);

// Decimal places of the currency's minor unit: 2 for USD, 0 for JPY, 3 for KWD.
export function minorDigits(currency = 'USD') {
  try { return new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits; }
  catch { return 2; }
}
export function money(value, currency = 'USD', locale = 'en-US') {
  const digits = minorDigits(currency);
  const whole = Math.abs(value - Math.round(value)) < 0.5 / 10 ** digits;
  return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: whole ? 0 : digits, maximumFractionDigits: digits }).format(value);
}
export const round2 = v => Math.round(v * 100) / 100;

// Resolve an offer's price fields into exact numbers. Exactly one of discount.percent,
// discount.amount or now may be given; everything shown on screen is derived from was.
export function price(item, where, errors, currency = 'USD') {
  const was = item.was;
  if (typeof was !== 'number' || !(was > 0)) { errors.push(`${where}.was must be a positive number`); return null; }
  const d = item.discount || {};
  const given = ['percent', 'amount'].filter(k => d[k] != null).length + (item.now != null ? 1 : 0);
  if (given !== 1) { errors.push(`${where} needs exactly one of discount.percent, discount.amount or now`); return null; }
  // Work in whole minor units (cents, fils, yen) so rounding is exact; a percentage rounds half-units up.
  const unit = 10 ** minorDigits(currency);
  const cents = v => Math.round(v * unit);
  const wasC = cents(was);
  let nowC;
  if (d.percent != null) {
    if (typeof d.percent !== 'number' || d.percent < 1 || d.percent > 95) { errors.push(`${where}.discount.percent must be 1-95`); return null; }
    nowC = Math.round(wasC * (100 - d.percent) / 100);
  } else if (d.amount != null) {
    if (typeof d.amount !== 'number' || d.amount <= 0) { errors.push(`${where}.discount.amount must be above 0 and below was`); return null; }
    nowC = wasC - cents(d.amount);
  } else {
    if (typeof item.now !== 'number') { errors.push(`${where}.now must be above 0 and below was`); return null; }
    nowC = cents(item.now);
  }
  // Check after rounding: what is shown must still be a real discount.
  if (!(nowC > 0 && nowC < wasC)) {
    errors.push(d.amount != null ? `${where}.discount.amount must be above 0 and below was` : d.percent != null ? `${where} rounds to no discount or a zero price` : `${where}.now must be above 0 and below was`);
    return null;
  }
  // Never show 0% or 100% for a discount that is neither free nor nothing.
  const percent = Math.min(99, Math.max(1, Math.round((1 - nowC / wasC) * 100)));
  const saveC = wasC - nowC;
  // Headline framing: a percentage for higher prices, a flat amount for low prices, unless the data chose.
  const framing = d.amount != null ? 'amount' : d.percent != null ? 'percent' : (saveC < 10 * unit || percent < 10 ? 'amount' : 'percent');
  return { was: wasC / unit, now: nowC / unit, percent, save: saveC / unit, framing };
}

export const ISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(Z|[+-](\d{2}):(\d{2}))$/;
// A real calendar moment: rejects dates such as Feb 30 that Date.parse would silently roll over.
export function validISO(s) {
  const m = ISO.exec(String(s ?? ''));
  if (!m) return false;
  const [y, mo, d, h, mi, se] = m.slice(1, 7).map(v => (v === undefined ? 0 : Number(v)));
  const probe = new Date(Date.UTC(y, mo - 1, d, h, mi, se));
  return probe.getUTCFullYear() === y && probe.getUTCMonth() === mo - 1 && probe.getUTCDate() === d && h < 24 && mi < 60 && se < 60
    && (m[7] === 'Z' || (Number(m[8]) <= 14 && Number(m[9]) < 60));
}
export function parseDate(s) { if (!validISO(s)) return null; const t = Date.parse(s); return Number.isFinite(t) ? t : null; }

export function theme(data) {
  const key = data.theme || OCCASION_THEME[String(data.occasion || '').toLowerCase()] || 'black-friday';
  const t = { ...(THEMES[key] || THEMES['black-friday']) };
  if (/^#[0-9a-f]{6}$/i.test(data.brand?.accent || '')) {
    t.accent = data.brand.accent;
    const v = t.accent.slice(1), [r, g, b] = [0, 2, 4].map(i => parseInt(v.slice(i, i + 2), 16) / 255).map(c => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    t.accentInk = 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? '#111111' : '#ffffff';
  }
  return { key, ...t };
}

// Font size at which a string of `text` fits `room` px, given the face's average glyph width in em.
export const fit = (text, room, max, em = 0.6) => Math.max(12, Math.min(max, Math.floor(room / (em * Math.max(1, [...String(text)].length)))));

export function checkImage(file, baseDir, where, errors) {
  if (!file) return;
  if (!/\.(png|jpe?g|webp|svg)$/i.test(file)) errors.push(`${where} must be a png, jpg, webp or svg file`);
  else if (!existsSync(path.resolve(baseDir, file))) errors.push(`${where} "${file}" was not found next to the data file`);
}

// ---------- project writer ----------
export async function project({ here, out, inputDir, W, H, dur, title, lang = 'en', css, body, script, images = [] }) {
  await mkdir(path.join(out, 'compositions'), { recursive: true });
  await mkdir(path.join(out, 'assets', 'brand'), { recursive: true });
  await mkdir(path.join(out, 'assets', 'media'), { recursive: true });
  const require = createRequire(import.meta.url);
  const roots = [process.env.OPENMOTION_HOME, process.cwd(), here, path.resolve(here, '../../../..')].filter(Boolean);
  let gsap = null;
  for (const base of roots) { try { gsap = require.resolve('gsap/dist/gsap.min.js', { paths: [base] }); break; } catch {} }
  if (!gsap) throw new Error('GSAP was not found. Set OPENMOTION_HOME to your OpenMotion checkout, or run `npm install gsap` in the working directory.');
  await copyFile(gsap, path.join(out, 'assets', 'gsap.min.js'));
  for (const f of ['openmotion-logo.svg', 'loading-mark.svg']) await copyFile(path.join(here, '..', 'assets', 'brand', f), path.join(out, 'assets', 'brand', f));
  // Geist ships with OpenMotion (SIL OFL); without a checkout the film falls back to system sans.
  let fontCss = '';
  for (const base of roots) {
    const dir = path.join(base, 'library/components/showcase/glass-shard-title/assets/fonts');
    if (existsSync(path.join(dir, 'Geist-Bold.ttf'))) {
      await mkdir(path.join(out, 'assets', 'fonts'), { recursive: true });
      for (const [f, w] of [['Geist-Regular.ttf', 400], ['Geist-SemiBold.ttf', 600], ['Geist-Bold.ttf', 800]]) {
        await copyFile(path.join(dir, f), path.join(out, 'assets', 'fonts', f));
        fontCss += `@font-face{font-family:'Geist';src:url('assets/fonts/${f}') format('truetype');font-weight:${w};font-style:normal}`;
      }
      break;
    }
  }
  // Anton (SIL OFL) ships inside the Skill for the display type.
  await mkdir(path.join(out, 'assets', 'fonts'), { recursive: true });
  await copyFile(path.join(here, '..', 'assets', 'fonts', 'Anton-Regular.woff2'), path.join(out, 'assets', 'fonts', 'Anton-Regular.woff2'));
  fontCss += `@font-face{font-family:'Anton';src:url('assets/fonts/Anton-Regular.woff2') format('woff2');font-weight:400;font-style:normal}`;
  const copied = new Map();
  for (const rel of images) {
    if (!rel || copied.has(rel)) continue;
    const name = `assets/media/${copied.size + 1}-${path.basename(rel).replace(/[^\w.-]/g, '_')}`;
    await copyFile(path.resolve(inputDir, rel), path.join(out, name));
    copied.set(rel, name);
  }
  const src = rel => copied.get(rel) || '';
  const html = `<template>
<style>${fontCss}
#root{position:relative;width:${W}px;height:${H}px;overflow:hidden;font-family:'Geist','Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;font-variant-numeric:tabular-nums}
#root *{box-sizing:border-box}\n.d{font-family:'Anton',sans-serif;font-weight:400;text-transform:uppercase;line-height:.88;letter-spacing:.005em}\n.grain{position:absolute;inset:-10%;pointer-events:none;opacity:.10;mix-blend-mode:overlay;background-image:url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")}
${css}</style>
<div id="root" data-composition-id="film" data-width="${W}" data-height="${H}">
${typeof body === 'function' ? body(src) : body}
</div>
<script>
(function(){
const tl = gsap.timeline({ paused: true });
${script}
window.__timelines["film"] = tl;
})();
</script>
</template>
`;
  const total = Math.round(dur * FPS) / FPS;
  await writeFile(path.join(out, 'compositions', 'film.html'), html);
  await writeFile(path.join(out, 'index.html'), `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <title>${esc(title)}</title>
  <script src="assets/gsap.min.js"></script>
  <style>body{margin:0;background:#000}#main{position:relative;width:${W}px;height:${H}px;overflow:hidden}</style>
</head>
<body>
  <div id="main" data-composition-id="main" data-start="0" data-duration="${total}" data-width="${W}" data-height="${H}" data-fps="${FPS}">
    <div id="film" class="clip" data-composition-id="film" data-composition-src="compositions/film.html" data-start="0" data-duration="${total}" data-track-index="0" data-track-kind="graphics" data-width="${W}" data-height="${H}"></div>
  </div>
  <script>
    window.__timelines = window.__timelines || {};
    window.__timelines.main = gsap.timeline({ paused: true });
  </script>
</body>
</html>
`);
  return { total, src };
}

export async function readData(input) {
  return JSON.parse(await readFile(input, 'utf8'));
}

// "Made with OpenMotion" sign-off for the end card; the advertiser's brand stays the hero.
export function credit(t, size) {
  return `<div id="credit" style="position:absolute;top:${Math.round(size * 2)}px;right:${Math.round(size * 2)}px;display:flex;align-items:center;gap:${Math.round(size * 0.5)}px;opacity:.72">
  <span style="font-size:${size}px;color:${t.ink};letter-spacing:.04em;opacity:.8">Made with</span>
  <img src="assets/brand/openmotion-logo.svg" alt="OpenMotion" style="height:${Math.round(size * 1.4)}px;width:auto;filter:${t.key === 'light' ? 'none' : 'invert(1) grayscale(1) brightness(1.6)'}">
</div>`;
}

// ---------- shared visual layers ----------
// A diagonal sale tape whose text scrolls for the whole film: the element that carries every beat.
export function tape(id, text, t, W, H, { y = 0.86, angle = -5, size = 64 } = {}) {
  const run = Array.from({ length: 14 }, () => `<span>${esc(text)}</span><b style="display:inline-block;width:${Math.round(size * 0.35)}px;height:${Math.round(size * 0.35)}px;border-radius:50%;background:${t.accentInk};margin:0 ${Math.round(size * 0.5)}px;vertical-align:middle;opacity:.85"></b>`).join('');
  return `<div id="${id}" style="position:absolute;left:${-W * 0.25}px;width:${W * 1.5}px;top:${Math.round(H * y - size)}px;height:${Math.round(size * 1.9)}px;background:${t.accent};transform:rotate(${angle}deg);overflow:hidden;box-shadow:0 ${Math.round(size * .25)}px ${Math.round(size * .8)}px rgba(0,0,0,.35)">
  <div id="${id}-run" class="d" style="position:absolute;left:0;top:50%;white-space:nowrap;transform:translateY(-46%);font-size:${size}px;color:${t.accentInk};line-height:1">${run}${run}</div></div>`;
}
// A circular text badge that keeps spinning.
export function badge(id, text, t, size, { fill = 'none', ink } = {}) {
  const r = size / 2 - size * 0.09;
  return `<svg id="${id}" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="position:absolute;overflow:visible">
  <defs><path id="${id}-p" d="M ${size / 2} ${size / 2} m -${r} 0 a ${r} ${r} 0 1 1 ${2 * r} 0 a ${r} ${r} 0 1 1 -${2 * r} 0"/></defs>
  <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="${fill}" stroke="${ink || t.ink}" stroke-opacity=".35" stroke-width="2"/>
  <text font-family="Anton, sans-serif" font-size="${Math.round(size * 0.115)}" letter-spacing="${(size * 0.012).toFixed(1)}" fill="${ink || t.ink}"><textPath href="#${id}-p">${esc(text)}</textPath></text></svg>`;
}
// Stacked outline echoes under a solid line of display type.
export function echo(id, text, size, t, { copies = 3, step = 0.82, align = 'center' } = {}) {
  const layers = Array.from({ length: copies }, (_, i) => `<div id="${id}-e${i}" class="d" style="position:absolute;left:0;right:0;top:${Math.round((i + 1) * size * step)}px;text-align:${align};font-size:${size}px;color:transparent;-webkit-text-stroke:${Math.max(2, Math.round(size / 70))}px ${t.ink};opacity:${(0.55 - i * 0.15).toFixed(2)}">${esc(text)}</div>`).join('');
  return `<div id="${id}" style="position:relative;height:${Math.round(size * 0.9)}px">${layers}<div id="${id}-s" class="d" style="position:absolute;left:0;right:0;top:0;text-align:${align};font-size:${size}px;color:${t.ink}">${esc(text)}</div></div>`;
}
