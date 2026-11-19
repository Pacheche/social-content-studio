#!/usr/bin/env node
// Generate an editable HyperFrames multi-product sale carousel from carousel.json.
// Usage:
//   node scripts/build.mjs --check carousel.json
//   node scripts/build.mjs carousel.json out/ [--aspect 9:16|4:5|1:1|16:9] [--no-credit]
import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { SIZES, esc, width, money, price, theme, checkImage, project, readData, credit, parseDate, validISO, fit, tape, badge } from './film.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = n => { const i = args.indexOf(n); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
const bool = n => { const i = args.indexOf(n); if (i < 0) return false; args.splice(i, 1); return true; };
const checkOnly = bool('--check');
const noCredit = bool('--no-credit');
const aspectArg = flag('--aspect');
const [input, outDir] = args;
if (!input || (!checkOnly && !outDir)) { console.error('Usage: node scripts/build.mjs [--check] carousel.json [out/] [--aspect 9:16] [--no-credit]'); process.exit(2); }
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
if (!data.title) errors.push('title is required, e.g. "Gifts under $100"');
else if (width(data.title) > 26) errors.push(`title "${data.title}" is longer than 26 characters`);
const items = data.products || [];
if (items.length < 3 || items.length > 7) errors.push(`use 3-7 products (got ${items.length})`);
const prices = items.map((it, i) => {
  if (!it.name) errors.push(`products[${i}].name is required`);
  else if (width(it.name) > 26) errors.push(`products[${i}].name "${it.name}" is longer than 26 characters`);
  if (!it.image) errors.push(`products[${i}].image is required: every card shows the real product`);
  checkImage(it.image, inputDir, `products[${i}].image`, errors);
  return price(it, `products[${i}]`, errors, data.currency || 'USD');
});
try { new Intl.NumberFormat(data.locale || 'en-US', { style: 'currency', currency: data.currency || 'USD' }); } catch { errors.push(`currency "${data.currency}" or locale "${data.locale}" is not valid`); }
if (data.code && !/^[A-Z0-9-]{3,16}$/.test(data.code)) errors.push(`code "${data.code}" must be 3-16 capital letters, digits or hyphens`);
if (data.deadline) {
  if (!data.deadline.label) errors.push('deadline.label is required when deadline is given');
  else if (width(data.deadline.label) > 34) errors.push('deadline.label is longer than 34 characters');
  if (!validISO(data.deadline.date || '')) errors.push('deadline.date must be an ISO date-time with an offset');
  else if (data.postDate && parseDate(data.postDate) >= parseDate(data.deadline.date)) errors.push('deadline.date is not after postDate');
}
if (data.postDate != null && !validISO(data.postDate)) errors.push('postDate must be a real ISO date-time with an offset');
if (!data.cta) errors.push('cta is required, e.g. "Shop the gift guide"');
else if (width(data.cta) > 20) errors.push(`cta "${data.cta}" is longer than 20 characters`);
if (data.url && width(data.url) > 32) errors.push(`url "${data.url}" is longer than 32 characters`);
if (errors.length) { console.error(errors.map(e => '✗ ' + e).join('\n')); process.exit(1); }
const cur = data.currency || 'USD', loc = data.locale || 'en-US';
const $ = v => money(v, cur, loc);
const L = { off: 'off', useCode: 'Code', ...(data.labels || {}) };
if (checkOnly) { console.log(`✓ ${data.brand.name} · ${data.title}: ${items.map((it, i) => `${it.name} ${$(prices[i].was)}→${$(prices[i].now)}`).join(', ')}; ${aspect}`); process.exit(0); }

// ---------- layout ----------
// A product shelf, not slides: every card sits on one row that keeps gliding; each product in turn
// slides to the centre, grows and shows its price while its neighbours wait at the edges; at the end
// the camera pulls back to show the whole row with the code and call to action.
const [W, H] = SIZES[aspect];
const t = theme(data);
const wide = W > H, portrait = H / W > 1.5;
const u = Math.min(W, H) / 1080;
const px = n => Math.round(n * u);
const n = items.length;
const INTRO = 1.4, PER = 1.7, END = 2.9;
const dur = INTRO + n * PER + END;
const cw = Math.round(Math.min(portrait ? W * 0.62 : wide ? W * 0.26 : W * 0.42, (H * (portrait ? 0.44 : wide ? 0.5 : 0.42)) / 1.42)), chh = Math.round(cw * 1.42);
const gap = Math.round(cw * 0.12), pitch = cw + gap;
const rowY = portrait ? H * 0.5 : H * 0.57;
const titleSize = fit(data.title, W * 0.88, px(wide ? 120 : portrait ? 130 : 100), 0.57);
const occSize = fit(String(data.occasion), W * 0.9, px(wide ? 70 : 80), 0.57);
const xFor = i => Math.round(W / 2 - cw / 2 - i * pitch);          // row offset that centres card i
const pull = Math.max(Math.min(1, (W * 0.94) / (n * pitch - gap)), portrait ? 0.56 : 0.6);   // end: whole row, or the middle of it on narrow frames
const css = `
#bg{position:absolute;inset:0;background:radial-gradient(90% 60% at 50% ${Math.round((rowY / H) * 100)}%,${t.panel} 0,${t.bg} 75%)}
#floor{position:absolute;left:-10%;right:-10%;top:${Math.round(rowY + chh * 0.52)}px;height:${px(4)}px;background:${t.ink};opacity:.18}
.word{position:absolute;left:0;white-space:nowrap;font-size:${px(wide ? 260 : 300)}px;color:transparent;-webkit-text-stroke:${px(2)}px ${t.ink};opacity:.09}
.brand{position:absolute;top:${px(54)}px;left:${px(54)}px;font-weight:600;font-size:${px(30)}px;letter-spacing:.22em;text-transform:uppercase;color:${t.ink}}
.mask{overflow:hidden}
.pc{position:absolute;top:${Math.round(rowY - chh / 2)}px;width:${cw}px;height:${chh}px;border-radius:${px(28)}px;background:${t.ink};overflow:hidden;box-shadow:0 ${px(30)}px ${px(70)}px rgba(0,0,0,.45);transform-origin:50% 100%}
.pc .im{position:absolute;left:0;right:0;top:0;height:72%;background:${t.panel} center/cover no-repeat}
.pc .tx{position:absolute;left:0;right:0;bottom:0;height:28%;padding:${Math.round(cw * 0.05)}px ${Math.round(cw * 0.07)}px;color:${t.bg};display:flex;flex-direction:column;justify-content:center}
.was{position:relative;display:inline-block;opacity:.6;margin-right:${Math.round(cw * 0.04)}px}
.was i{position:absolute;left:-4%;right:-4%;top:50%;height:${Math.max(3, Math.round(cw * 0.012))}px;background:${t.accent};transform:scaleX(0);transform-origin:left center}
.tag{position:absolute;right:${Math.round(cw * 0.05)}px;top:${Math.round(cw * 0.05)}px;width:${Math.round(cw * 0.3)}px;height:${Math.round(cw * 0.3)}px;border-radius:50%;background:${t.accent};color:${t.accentInk};display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:.9}
.cta{display:inline-block;background:${t.accent};color:${t.accentInk};font-weight:700;font-size:${px(56)}px;padding:${px(22)}px ${px(56)}px;border-radius:${px(999)}px}`;
const card = (it, i, src) => { const p = prices[i]; const nm = fit(it.name, cw * 0.86, Math.round(cw * 0.12), 0.57); return `<div id="pc${i}" class="pc" style="left:${Math.round(W / 2 - cw / 2)}px">
  <div class="im" style="background-image:url('${src(it.image)}')"></div>
  <div id="tg${i}" class="tag d" style="font-size:${Math.round(cw * 0.1)}px">${p.framing === 'percent' ? `${p.percent}%` : esc($(p.save).replace(/\.00$/, ''))}<span style="font-size:${Math.round(cw * 0.05)}px">${esc(L.off)}</span></div>
  <div class="tx"><div class="d" style="font-size:${nm}px">${esc(it.name)}</div>
  <div style="margin-top:${Math.round(cw * 0.02)}px;display:flex;align-items:baseline"><span class="was" style="font-size:${fit($(p.was), cw * 0.32, Math.round(cw * 0.075), 0.6)}px">${esc($(p.was))}<i id="st${i}"></i></span><span class="d" style="font-size:${fit($(p.now), cw * 0.5, Math.round(cw * 0.15), 0.55)}px;color:${t.accent === '#ffffff' ? t.bg : t.accent}">${esc($(p.now))}</span></div></div>
</div>`; };
const words = [data.occasion, data.title, data.occasion].map((w, i) => `<div id="wd${i}" class="word d" style="top:${Math.round(H * (0.12 + i * 0.32))}px">${esc(`${w} · `.repeat(4))}</div>`).join('');
const body = src => `<div id="bg"></div>${words}<div id="floor"></div>
<div id="cam" style="position:absolute;inset:0;transform-origin:50% ${Math.round((rowY / H) * 100)}%"><div id="row" style="position:absolute;inset:0;perspective:${Math.round(W * 1.6)}px">${items.map((it, i) => card(it, i, src)).join('')}</div></div>
<div class="grain" id="grain"></div>
<div class="brand">${esc(data.brand.name)}</div>
<div id="head" style="position:absolute;left:0;right:0;top:${Math.max(px(104), portrait ? H * 0.08 : H * 0.07)}px;text-align:center;color:${t.ink}">
  <div class="mask" style="height:${Math.round(occSize * 0.92)}px"><div id="occ" class="d" style="font-size:${occSize}px;color:${t.accent};white-space:nowrap">${esc(data.occasion)}</div></div>
  <div class="mask" style="height:${Math.round(titleSize * 0.92)}px;margin-top:${px(6)}px"><div id="title" class="d" style="font-size:${titleSize}px;white-space:nowrap">${esc(data.title)}</div></div>
</div>
<div id="count" class="d" style="position:absolute;left:0;right:0;top:${Math.round(rowY + chh * 0.56)}px;text-align:center;font-size:${px(56)}px;color:${t.ink};opacity:0">${items.map((_, i) => `<span id="cn${i}" style="position:absolute;left:0;right:0;opacity:0">${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}</span>`).join('')}</div>
<div id="end" style="position:absolute;left:0;right:0;top:${Math.round(rowY + chh * (portrait ? 0.45 : 0.3) + px(16))}px;text-align:center;color:${t.ink};opacity:0">
  ${data.code ? `<div class="d" style="display:inline-block;font-size:${px(64)}px;border:${px(5)}px dashed ${t.ink};border-radius:${px(18)}px;padding:${px(10)}px ${px(32)}px ${px(2)}px">${esc(L.useCode)} ${esc(data.code)}</div>` : ''}
  ${data.deadline ? `<div style="margin-top:${px(14)}px;font-size:${px(36)}px;font-weight:600;opacity:.85">${esc(data.deadline.label)}</div>` : ''}
  <div><div id="cta" class="cta" style="margin-top:${px(24)}px">${esc(data.cta)}</div></div>${data.url ? `<div style="margin-top:${px(12)}px;font-size:${px(34)}px;opacity:.8;font-weight:600">${esc(data.url)}</div>` : ''}
</div>
${noCredit ? '' : credit(t, px(24)).replace('opacity:.72', 'opacity:0')}`;

const f = v => v.toFixed(2);
// Coverflow: the focused card sits forward and large; its neighbours turn away in 3D and dim.
const spread = Math.round(cw * (portrait ? 0.62 : 0.72));
const state = (j, i) => { const d = j - i, ad = Math.abs(d);
  return d === 0 ? `{x:0,scale:1.12,rotationY:0,opacity:1,zIndex:${50},filter:'brightness(1)'}`
    : `{x:${Math.sign(d) * (spread + (ad - 1) * spread * 0.55)},scale:${Math.max(0.55, 0.82 - (ad - 1) * 0.1).toFixed(2)},rotationY:${-Math.sign(d) * 42},opacity:${ad > 3 ? 0 : 1},zIndex:${50 - ad},filter:'brightness(${Math.max(0.35, 0.62 - (ad - 1) * 0.12).toFixed(2)})'}`; };
let focus = '';
items.forEach((_, i) => {
  const a = INTRO + i * PER;
  focus += items.map((__, j) => `tl.to('#pc${j}',${state(j, i).replace('}', `,duration:.6,ease:'power3.inOut'}`)},${f(a - 0.3)});`).join('\n') + `
tl.fromTo('#st${i}',{scaleX:0},{scaleX:1,duration:.3,ease:'power2.out'},${f(a + 0.3)});
tl.fromTo('#tg${i}',{scale:0,rotation:-40},{scale:1,rotation:-10,duration:.4,ease:'back.out(2)'},${f(a + 0.45)});
tl.set('#cn${i}',{opacity:1},${f(a)});${i ? `\ntl.set('#cn${i - 1}',{opacity:0},${f(a)});` : ''}\n`;
});
const endAt = INTRO + n * PER;
const script = `
tl.fromTo('#grain',{x:0,y:0},{x:-40,y:30,duration:${f(dur)},ease:'steps(${Math.round(dur * 12)})'},0);
${[0, 1, 2].map(i => `tl.fromTo('#wd${i}',{xPercent:${i % 2 ? -40 : 0}},{xPercent:${i % 2 ? 0 : -40},duration:${f(dur)},ease:'none'},0);`).join('\n')}
${items.map((_, j) => `tl.set('#pc${j}',${state(j, -1)},0);`).join('\n')}
tl.fromTo('#row',{x:${W * 0.6}},{x:0,duration:${f(INTRO)},ease:'power2.out'},0);
tl.fromTo('#occ',{yPercent:110},{yPercent:0,duration:.5,ease:'power4.out'},0.1);
tl.fromTo('#title',{yPercent:110},{yPercent:0,duration:.55,ease:'power4.out'},0.25);
tl.fromTo('#count',{opacity:0},{opacity:.9,duration:.3},${f(INTRO)});
${focus}// pull back to the whole shelf
tl.to('#count',{opacity:0,duration:.2},${f(endAt - 0.3)});
${(() => { const fs = Math.min(1, (W * 0.92) / (n * cw * 0.62 + cw * 0.4)); return items.map((_, j) => { const k = j - (n - 1) / 2; return `tl.to('#pc${j}',{x:${Math.round(k * cw * 0.62 * fs)},y:${Math.round(Math.abs(k) * cw * 0.06 * fs - chh * (portrait ? 0.08 : 0.24))},scale:${(fs * 0.92).toFixed(3)},rotationY:0,rotation:${(k * 5).toFixed(1)},opacity:1,zIndex:${20 + j},filter:'brightness(1)',duration:.7,ease:'back.out(1.2)'},${f(endAt - 0.3 + j * 0.04)});`; }).join('\n'); })()}
tl.to('#head',{y:${-px(20)},duration:.5},${f(endAt - 0.3)});
tl.fromTo('#end',{opacity:0,y:${px(40)}},{opacity:1,y:0,duration:.45,ease:'power3.out'},${f(endAt + 0.2)});
tl.fromTo('#cta',{scale:.6},{scale:1,duration:.4,ease:'back.out(2)'},${f(endAt + 0.4)});
tl.to('#row',{rotation:1.5,duration:${f(END - 0.4)},ease:'none'},${f(endAt + 0.4)});
${noCredit ? '' : `tl.fromTo('#credit',{opacity:0},{opacity:.75,duration:.4},${f(endAt + 0.6)});`}
tl.set({}, {}, ${f(dur)});`;

const out = path.resolve(outDir);
const { total, src: copiedAs } = await project({ here, out, inputDir, W, H, dur, title: `${data.brand.name} · ${data.title}`, css, body, script, images: items.map(it => it.image) });
await writeFile(path.join(out, 'carousel.json'), JSON.stringify({ ...data, products: items.map(it => ({ ...it, image: copiedAs(it.image) || it.image })), aspect, computed: items.map((it, i) => ({ name: it.name, was: prices[i].was, now: prices[i].now, percentOff: prices[i].percent })) }, null, 2));
console.log(`✓ ${data.brand.name}: ${n} products, ${aspect}, ${total.toFixed(1)} s → ${out}`);
