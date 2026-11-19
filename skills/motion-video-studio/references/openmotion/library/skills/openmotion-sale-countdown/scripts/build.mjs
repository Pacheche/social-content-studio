#!/usr/bin/env node
// Generate an editable HyperFrames sale countdown teaser from countdown.json.
// The number on screen is computed from postAt and the target time, so the teaser is true
// on the day it is posted.
// Usage:
//   node scripts/build.mjs --check countdown.json
//   node scripts/build.mjs countdown.json out/ [--aspect 9:16|4:5|1:1|16:9] [--no-credit]
import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { SIZES, esc, width, theme, project, readData, credit, parseDate, validISO, fit, tape, badge, checkImage } from './film.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = n => { const i = args.indexOf(n); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
const bool = n => { const i = args.indexOf(n); if (i < 0) return false; args.splice(i, 1); return true; };
const checkOnly = bool('--check');
const noCredit = bool('--no-credit');
const aspectArg = flag('--aspect');
const [input, outDir] = args;
if (!input || (!checkOnly && !outDir)) { console.error('Usage: node scripts/build.mjs [--check] countdown.json [out/] [--aspect 9:16] [--no-credit]'); process.exit(2); }
const inputDir = path.dirname(path.resolve(input));
const data = await readData(input);

// ---------- validation ----------
const errors = [];
const aspect = aspectArg || data.aspect || '9:16';
if (!SIZES[aspect]) errors.push(`aspect must be one of ${Object.keys(SIZES).join(', ')}`);
if (!data.brand?.name) errors.push('brand.name is required');
else if (width(data.brand.name) > 24) errors.push(`brand.name "${data.brand.name}" is longer than 24 characters`);
if (!data.occasion) errors.push('occasion is required (e.g. "Black Friday")');
else if (width(data.occasion) > 18) errors.push(`occasion "${data.occasion}" is longer than 18 characters`);
const mode = data.mode || 'starts';
if (!['starts', 'ends'].includes(mode)) errors.push('mode must be "starts" (counting down to the sale) or "ends" (last hours of the sale)');
if (!validISO(data.postAt || '')) errors.push('postAt is required: the ISO date-time with offset when the video goes live, e.g. 2026-11-20T09:00:00-05:00');
if (!validISO(data.target?.date || '')) errors.push('target.date must be an ISO date-time with an offset: when the sale starts (mode starts) or ends (mode ends)');
if (!data.target?.label) errors.push('target.label is required, e.g. "Fri, Nov 27 · 12:00 am ET"');
else if (width(data.target.label) > 34) errors.push(`target.label is ${width(data.target.label)} characters; keep it under 34`);
let unit = null, value = null;
if (validISO(data.postAt || '') && validISO(data.target?.date || '')) {
  const ms = parseDate(data.target.date) - parseDate(data.postAt);
  if (ms <= 0) errors.push('target.date must be after postAt');
  else {
    // Whole units remaining, rounded down so the claim is never overstated.
    const hours = Math.floor(ms / 36e5), days = Math.floor(ms / 864e5);
    unit = data.unit || (days >= 2 ? 'days' : 'hours');
    if (!['days', 'hours'].includes(unit)) errors.push('unit must be "days" or "hours"');
    value = unit === 'days' ? days : hours;
    if (value < 1) errors.push(`less than one ${unit === 'days' ? 'day' : 'hour'} is left between postAt and target.date; use unit "hours" or post earlier`);
    if (value > 99) errors.push(`${value} ${unit} is too far out for a countdown; post closer to the date`);
  }
}
const images = data.images || [];
if (!Array.isArray(images) || images.length > 4) errors.push('images must be a list of up to 4 photos');
else images.forEach((im, i) => checkImage(im, inputDir, `images[${i}]`, errors));
if (data.teaser && width(data.teaser) > 30) errors.push(`teaser is ${width(data.teaser)} characters; keep it under 30`);
if (!data.cta) errors.push('cta is required, e.g. "Get early access"');
else if (width(data.cta) > 20) errors.push(`cta "${data.cta}" is longer than 20 characters`);
if (data.url && width(data.url) > 32) errors.push(`url "${data.url}" is longer than 32 characters`);
if (errors.length) { console.error(errors.map(e => '✗ ' + e).join('\n')); process.exit(1); }
const L = {
  starts: 'starts in', ends: 'ends in', days: value === 1 ? 'day' : 'days', hours: value === 1 ? 'hour' : 'hours',
  left: mode === 'ends' ? 'left' : 'to go', ...(data.labels || {}),
};
if (checkOnly) { console.log(`✓ ${data.brand.name}: ${data.occasion} ${L[mode]} ${value} ${L[unit]} (posted ${data.postAt}), ${aspect}`); process.exit(0); }

// ---------- layout ----------
// Depth, not slides: a giant number fills the back of the frame and rolls down to the true value,
// the product (ideally a transparent cutout) floats in front of it under a spotlight, and each tick
// of the number brings the next product forward.
const [W, H] = SIZES[aspect];
const t = theme(data);
const wide = W > H, portrait = H / W > 1.5;
const u = Math.min(W, H) / 1080;
const px = n => Math.round(n * u);
const B = { kick: 0, roll: 1.1, date: 5.4, cta: 7.6, end: 9.6 };
const start = Math.min(99, value + Math.max(4, Math.min(9, Math.ceil(value * 0.6))));
const steps = []; for (let v = start; v >= value; v--) steps.push(v);
const numSize = Math.min(fit(String(start), W * (wide ? 0.62 : 0.96), px(1400), 0.56), Math.round(H * (portrait ? 0.5 : 0.6)));
const rowH = Math.round(numSize * 1.2);
const numY = portrait ? H * 0.47 : H * 0.6;                       // centre of the number
const occSize = fit(String(data.occasion), W * 0.86, px(wide ? 110 : 130), 0.57);
const prodW = Math.round(Math.min(W * (portrait ? 0.78 : wide ? 0.4 : 0.6), H * (portrait ? 0.46 : 0.62)));
const prodY = portrait ? H * 0.5 : H * 0.56;                       // centre of the product
const shade = `rgba(${t.shade},`;
const css = `
#bg{position:absolute;inset:0;background:radial-gradient(60% 45% at 50% ${Math.round((numY / H) * 100)}%,${t.panel} 0,${t.bg} 70%)}
#spot{position:absolute;left:50%;top:-20%;width:${Math.round(W * 1.1)}px;height:${Math.round(H * 1.1)}px;margin-left:${-Math.round(W * 0.55)}px;background:conic-gradient(from 180deg at 50% 0%,transparent 160deg,${t.ink}14 175deg,${t.ink}22 180deg,${t.ink}14 185deg,transparent 200deg);opacity:.9}
.mask{overflow:hidden}
.prod{position:absolute;left:${Math.round(W / 2 - prodW / 2)}px;top:${Math.round(prodY - prodW / 2)}px;width:${prodW}px;height:${prodW}px;background:center/contain no-repeat;filter:drop-shadow(0 ${px(40)}px ${px(50)}px rgba(0,0,0,.55));opacity:0}
#floor{position:absolute;left:50%;top:${Math.round(prodY + prodW * 0.44)}px;width:${Math.round(prodW * 0.8)}px;height:${Math.round(prodW * 0.1)}px;margin-left:${-Math.round(prodW * 0.4)}px;border-radius:50%;background:radial-gradient(closest-side,rgba(0,0,0,.6),transparent);filter:blur(${px(8)}px)}
#sweep{position:absolute;top:-20%;bottom:-20%;width:${Math.round(W * 0.18)}px;background:linear-gradient(90deg,transparent,${t.ink}2e,transparent);transform:rotate(18deg);left:-30%}
.pill{display:inline-block;background:${t.accent};color:${t.accentInk};padding:${px(10)}px ${px(30)}px ${px(4)}px;border-radius:${px(999)}px}
.cta{display:inline-block;background:${t.accent};color:${t.accentInk};font-weight:700;padding:${px(22)}px ${px(54)}px;border-radius:${px(999)}px;white-space:nowrap}`;
const reel = steps.map(v => `<div style="height:${rowH}px;line-height:${rowH}px">${v}</div>`).join('');
const prods = images.length ? images : [];
const body = src => `<div id="bg"></div><div id="spot"></div>
<div id="numwrap" style="position:absolute;left:0;right:0;top:${Math.round(numY - rowH / 2)}px;height:${rowH}px;text-align:center" class="mask">
  <div id="reel" class="d" style="font-size:${numSize}px;color:transparent;background:linear-gradient(180deg,${t.ink} 0%,${t.ink} 45%,${t.ink}00 100%);-webkit-background-clip:text;background-clip:text">${reel}</div>
</div>
<div id="sweep"></div>
<div id="floor"></div>
${prods.map((im, i) => `<div id="pr${i}" class="prod" style="background-image:url('${src(im)}')"></div>`).join('')}
<div class="grain" id="grain"></div>
<div id="head" style="position:absolute;left:0;right:0;top:${portrait ? H * 0.07 : H * 0.06}px;text-align:center;color:${t.ink}">
  <div style="font-size:${px(28)}px;letter-spacing:.3em;text-transform:uppercase;font-weight:600;opacity:.75">${esc(data.brand.name)}</div>
  <div class="mask" style="height:${Math.round(occSize * 0.92)}px;margin-top:${px(12)}px"><div id="occ" class="d" style="font-size:${occSize}px;white-space:nowrap">${esc(data.occasion)}</div></div>
  <div id="kick" style="margin-top:${px(10)}px;font-size:${px(34)}px;letter-spacing:.32em;text-transform:uppercase;font-weight:600;color:${t.accent}">${esc(L[mode])}</div>
</div>
<div id="unit" style="position:absolute;left:0;right:0;top:${Math.round(prodY + prodW * 0.5 + px(10))}px;text-align:center"><span class="pill d" style="font-size:${px(wide ? 56 : 64)}px">${esc(L[unit])} ${esc(L.left)}</span></div>
${(() => {
  const tw = portrait ? W * 0.84 : W * 0.44;
  const dateSize = fit(data.target.label, tw, px(52), 0.55), tsz = data.teaser ? fit(data.teaser, tw, px(wide ? 120 : 140), 0.57) : 0;
  return `<div id="dt" style="opacity:0;position:absolute;${portrait ? `left:0;right:0;top:${Math.round(prodY + prodW * 0.5 - px(10))}px;text-align:center` : `left:${Math.round(W * 0.5)}px;width:${Math.round(W * 0.44)}px;top:${Math.round(H * 0.4)}px;text-align:left`};color:${t.ink}">
  <div id="date" style="font-size:${dateSize}px;font-weight:600">${esc(data.target.label)}</div>
  ${data.teaser ? `<div class="mask"><div id="teaser" class="d" style="margin-top:${px(10)}px;font-size:${tsz}px">${esc(data.teaser)}</div></div>` : ''}
  <div><div id="cta" class="cta" style="margin-top:${px(26)}px;font-size:${fit(data.cta, portrait ? W * 0.7 : W * 0.36, px(52), 0.55)}px">${esc(data.cta)}</div></div>
  ${data.url ? `<div id="url" style="margin-top:${px(14)}px;font-size:${px(34)}px;font-weight:600;opacity:.8">${esc(data.url)}</div>` : ''}
</div>`; })()}
${noCredit ? '' : credit(t, px(24)).replace('opacity:.72', 'opacity:0')}`;

const f = v => v.toFixed(2);
const stepDur = (B.date - 0.9 - B.roll) / Math.max(1, steps.length - 1);
let rollJs = '';
steps.forEach((_, i) => { if (i) rollJs += `tl.to('#reel',{y:${-i * rowH},duration:${f(Math.min(0.32, stepDur * 0.8))},ease:'power3.inOut'},${f(B.roll + 0.3 + (i - 1) * stepDur)});\n`; });
// Products take turns in front of the number: each one pops in, floats, and hands over to the next.
let prodJs = '';
if (prods.length) {
  const slots = Math.max(1, prods.length), span = (B.date - B.roll) / slots;
  prods.forEach((_, i) => {
    const a = i === 0 ? 0.35 : B.roll + i * span, last = i === prods.length - 1;
    prodJs += `tl.fromTo('#pr${i}',{opacity:0,scale:.6,rotation:${i % 2 ? 12 : -12},y:${px(120)}},{opacity:1,scale:1,rotation:${i % 2 ? 4 : -4},y:0,duration:.6,ease:'back.out(1.5)'},${f(a)});\n`;
    prodJs += `tl.to('#pr${i}',{y:${-px(26)},rotation:${i % 2 ? -2 : 2},duration:${f(Math.max(0.6, (last ? B.end - a : span) - 0.6))},ease:'sine.inOut'},${f(a + 0.6)});\n`;
    if (!last) prodJs += `tl.to('#pr${i}',{opacity:0,scale:.7,x:${i % 2 ? px(200) : -px(200)},duration:.4,ease:'power3.in'},${f(B.roll + (i + 1) * span - 0.2)});\n`;
  });
}
const script = `
tl.fromTo('#grain',{x:0,y:0},{x:-40,y:30,duration:${f(B.end)},ease:'steps(${Math.round(B.end * 12)})'},0);
tl.fromTo('#spot',{rotation:-8,transformOrigin:'50% 0%'},{rotation:8,duration:${f(B.end)},ease:'sine.inOut'},0);
tl.fromTo('#occ',{yPercent:110},{yPercent:0,duration:.55,ease:'power4.out'},0.1);
tl.fromTo('#kick',{opacity:0,y:${px(16)}},{opacity:1,y:0,duration:.4},0.35);
tl.fromTo('#numwrap',{opacity:0,scale:1.25},{opacity:1,scale:1,duration:.7,ease:'power3.out'},0.2);
${rollJs}tl.fromTo('#unit',{opacity:0,y:${px(30)}},{opacity:1,y:0,duration:.4,ease:'back.out(2)'},${f(B.roll + 0.2)});
${[0, 1, 2].map(k => `tl.fromTo('#sweep',{left:'-30%'},{left:'120%',duration:.9,ease:'power2.inOut'},${f(0.6 + k * 2.6)});`).join('\n')}
${prodJs}
tl.fromTo('#numwrap',{scale:1},{scale:1.06,duration:.15,yoyo:true,repeat:1},${f(B.date - 0.95)});
tl.to('#unit',{opacity:0,duration:.25},${f(B.date - 0.25)});
tl.to('#numwrap',{opacity:.18,duration:.5},${f(B.date - 0.2)});
${!portrait && prods.length ? `tl.to('#pr${prods.length - 1}',{x:${-Math.round(W * (wide ? 0.22 : 0.25))},scale:${wide ? 1 : 0.78},duration:.6,ease:'power3.inOut'},${f(B.date - 0.25)});\ntl.to('#floor',{x:${-Math.round(W * 0.22)},duration:.6,ease:'power3.inOut'},${f(B.date - 0.25)});` : ''}
tl.set('#dt',{opacity:1},${f(B.date - 0.01)});
tl.fromTo('#date',{opacity:0,y:${px(24)}},{opacity:1,y:0,duration:.4,ease:'power3.out'},${f(B.date)});
${data.teaser ? `tl.fromTo('#teaser',{yPercent:110},{yPercent:0,duration:.5,ease:'power4.out'},${f(B.date + 0.2)});` : ''}
tl.fromTo('#cta',{opacity:0,scale:.6},{opacity:1,scale:1,duration:.4,ease:'back.out(2)'},${f(B.cta)});
${data.url ? `tl.fromTo('#url',{opacity:0},{opacity:.85,duration:.3},${f(B.cta + 0.2)});` : ''}
${noCredit ? '' : `tl.fromTo('#credit',{opacity:0},{opacity:.75,duration:.4},${f(B.cta + 0.4)});`}
tl.set({}, {}, ${f(B.end)});`;

const out = path.resolve(outDir);
const { total, src: copiedAs } = await project({ here, out, inputDir, W, H, dur: B.end, title: `${data.brand.name} · ${data.occasion} countdown`, css, body, script, images });
await writeFile(path.join(out, 'countdown.json'), JSON.stringify({ ...data, ...(data.images ? { images: images.map(im => copiedAs(im) || im) } : {}), aspect, computed: { value, unit, from: start } }, null, 2));
console.log(`✓ ${data.brand.name}: ${data.occasion} ${L[mode]} ${value} ${L[unit]}, ${aspect}, ${total.toFixed(1)} s → ${out}`);
