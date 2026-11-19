#!/usr/bin/env node
// Generate an editable HyperFrames sale promo from offer.json.
// Usage:
//   node scripts/build.mjs --check offer.json
//   node scripts/build.mjs offer.json out/ [--aspect 9:16|4:5|1:1|16:9] [--duration 10|15] [--no-credit]
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SIZES, esc, width, money, minorDigits, price, theme, checkImage, project, readData, credit, parseDate, validISO, fit, tape, badge, echo } from './film.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = n => { const i = args.indexOf(n); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
const bool = n => { const i = args.indexOf(n); if (i < 0) return false; args.splice(i, 1); return true; };
const checkOnly = bool('--check');
const noCredit = bool('--no-credit');
const aspectArg = flag('--aspect');
const durArg = flag('--duration');
const [input, outDir] = args;
if (!input || (!checkOnly && !outDir)) { console.error('Usage: node scripts/build.mjs [--check] offer.json [out/] [--aspect 9:16] [--duration 10|15] [--no-credit]'); process.exit(2); }
const inputDir = path.dirname(path.resolve(input));
const data = await readData(input);

// ---------- validation ----------
const errors = [];
const aspect = aspectArg || data.aspect || '9:16';
if (!SIZES[aspect]) errors.push(`aspect must be one of ${Object.keys(SIZES).join(', ')}`);
const dur = Number(durArg || data.duration || 10);
if (![10, 15].includes(dur)) errors.push('duration must be 10 or 15 seconds');
if (!data.brand?.name) errors.push('brand.name is required');
else if (width(data.brand.name) > 24) errors.push(`brand.name "${data.brand.name}" is longer than 24 characters`);
if (!data.occasion) errors.push('occasion is required (e.g. "Black Friday")');
else if (width(data.occasion) > 18) errors.push(`occasion "${data.occasion}" is longer than 18 characters`);
if (!data.product?.name) errors.push('product.name is required');
else if (width(data.product.name) > 30) errors.push(`product.name "${data.product.name}" is longer than 30 characters`);
checkImage(data.product?.image, inputDir, 'product.image', errors);
const p = data.product ? price(data.product, 'product', errors, data.currency || 'USD') : null;
try { new Intl.NumberFormat(data.locale || 'en-US', { style: 'currency', currency: data.currency || 'USD' }); } catch { errors.push(`currency "${data.currency}" or locale "${data.locale}" is not valid`); }
if (!data.code) errors.push('code is required: the promo code shown on screen');
else if (!/^[A-Z0-9-]{3,16}$/.test(data.code)) errors.push(`code "${data.code}" must be 3-16 capital letters, digits or hyphens`);
const dl = data.deadline || {};
if (!dl.label) errors.push('deadline.label is required, e.g. "Ends Mon, Dec 1 · 11:59 pm ET"');
else if (width(dl.label) > 34) errors.push(`deadline.label is ${width(dl.label)} characters; keep it under 34`);
if (!validISO(dl.date || '')) errors.push('deadline.date must be an ISO date-time with an offset, e.g. 2026-12-01T23:59:00-05:00');
if (data.postDate && validISO(dl.date || '') && parseDate(data.postDate) != null && parseDate(data.postDate) >= parseDate(dl.date)) errors.push('deadline.date is not after postDate: the offer would already be over');
if (data.postDate != null && !validISO(data.postDate)) errors.push('postDate must be a real ISO date-time with an offset');
if (!data.cta) errors.push('cta is required, e.g. "Shop now"');
else if (width(data.cta) > 18) errors.push(`cta "${data.cta}" is longer than 18 characters`);
if (data.url && width(data.url) > 32) errors.push(`url "${data.url}" is longer than 32 characters`);
if (errors.length) { console.error(errors.map(e => '✗ ' + e).join('\n')); process.exit(1); }
const cur = data.currency || 'USD', loc = data.locale || 'en-US';
const $ = v => money(v, cur, loc);
if (checkOnly) { console.log(`✓ ${data.brand.name} · ${data.product.name}: ${$(p.was)} → ${$(p.now)} (${p.percent}% off, save ${$(p.save)}), code ${data.code}, ${aspect}, ${dur} s`); process.exit(0); }

// ---------- layout ----------
// One continuous world: the product photo stays on screen the whole time and reframes,
// a sale tape scrolls and a badge spins from first frame to last, and display type moves
// through line masks instead of slides fading in and out.
const [W, H] = SIZES[aspect];
const t = theme(data);
const wide = W > H, portrait = H / W > 1.5;
const u = Math.min(W, H) / 1080;
const px = n => Math.round(n * u);
const k = dur / 10;
const B = { hook: 0, disc: 1.7 * k, price: 4.0 * k, code: 7.0 * k, cta: 8.6 * k, end: dur };
const img = data.product.image;
const L = { off: 'OFF', useCode: 'Use code', save: 'Save', ends: 'Ends', ...(data.labels || {}) };
const occWords = String(data.occasion).toUpperCase().split(/\s+/);
const big = p.framing === 'percent' ? `${p.percent}%` : $(p.save).replace(/\.00$/, '');
const textW = wide ? W * 0.44 : W * 0.88;
const occSize = fit(occWords.reduce((a, b) => (a.length > b.length ? a : b)), textW, px(wide ? 300 : 330), 0.57);
const bigSize = fit(big, wide ? W * 0.5 : W * 0.86, px(wide ? 520 : 560), 0.64);
const nowSize = fit($(p.now), (wide || !portrait ? W * 0.42 : W * 0.86), px(wide ? 230 : 250), 0.62);
const endSize = fit(String(data.occasion), W * 0.86, px(wide ? 200 : 210), 0.57);
const codeSize = fit(data.code, (wide || !portrait ? W * 0.42 : W * 0.86) - px(110), px(130), 0.62);
// Where the photo sits once it becomes a card, and where the price column goes.
// Card centre relative to the frame centre, so the photo slides with the card and keeps its subject in view.
const cardShift = wide ? { x: -W * 0.235, y: -H * 0.035 } : portrait ? { x: 0, y: -H * 0.165 } : { x: -W * 0.22, y: -H * 0.075 };
const cardBox = wide ? [0.05, 0.09, 0.43, 0.75] : portrait ? [0.09, 0.07, 0.82, 0.53] : [0.06, 0.07, 0.44, 0.71];
const card = wide ? 'inset(9% 52% 16% 5% round 28px)' : portrait ? 'inset(7% 9% 40% 9% round 36px)' : 'inset(7% 50% 22% 6% round 32px)';
const col = wide ? { left: W * 0.52, top: H * 0.16, w: W * 0.43, align: 'left' } : portrait ? { left: W * 0.06, top: H * 0.61, w: W * 0.88, align: 'left' } : { left: W * 0.53, top: H * 0.16, w: W * 0.42, align: 'left' };
const tapeText = `${data.occasion} · ${big} ${L.off} · ${L.useCode} ${data.code}`;
const shade = `rgba(${t.shade},`;

const css = `
#bg{position:absolute;inset:0;background:${t.bg}}
#ph{position:absolute;inset:0;overflow:hidden}
#phi{position:absolute;inset:0;background:${img ? `${t.bg} center/cover no-repeat` : `radial-gradient(120% 90% at 70% 20%,${t.accent} 0,${t.bg} 70%)`};transform-origin:50% 45%}
#shade{position:absolute;inset:0;background:linear-gradient(180deg,${shade}.55) 0,${shade}.05) 35%,${shade}.15) 55%,${shade}.9) 100%)}
#veil{position:absolute;inset:0;background:${shade}.55);opacity:0}
.brand{position:absolute;top:${px(54)}px;left:${px(54)}px;font-weight:600;font-size:${px(30)}px;letter-spacing:.22em;text-transform:uppercase;color:${t.ink}}
.mask{overflow:hidden}
.col{position:absolute;color:${t.ink}}
.pname{font-weight:600;font-size:${px(44)}px;letter-spacing:.02em;opacity:.9}
.was{position:relative;display:inline-block;font-size:${px(64)}px;color:${t.sub};margin-top:${px(10)}px}
.strike{position:absolute;left:-4%;right:-4%;top:50%;height:${px(8)}px;background:${t.accent};transform:scaleX(0);transform-origin:left center}
.tag{position:absolute;border-radius:50%;background:${t.accent};color:${t.accentInk};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.chip{display:inline-block;border:${px(6)}px dashed ${t.ink};border-radius:${px(22)}px;padding:${px(14)}px ${px(40)}px ${px(6)}px;background:${shade}.35)}
.cta{display:inline-block;background:${t.ink};color:${t.bg};font-weight:700;font-size:${px(64)}px;padding:${px(26)}px ${px(64)}px;border-radius:${px(999)}px}
`;
const echoes = (id, words, size) => words.map((w, i) => `<div class="mask" style="height:${Math.round(size * 0.9)}px"><div id="${id}${i}">${echo(`${id}${i}x`, w, size, t, { copies: 0, align: wide ? 'left' : 'center' })}</div></div>`).join('');
const headTop = wide ? H * 0.2 : portrait ? H * 0.2 : H * 0.14;
const body = src => `<div id="bg"></div>
<div id="ph"><div id="phi"${img ? ` style="background-image:url('${src(img)}')"` : ''}></div></div>
${img ? `<div id="cimg" style="position:absolute;left:${Math.round(W * cardBox[0])}px;top:${Math.round(H * cardBox[1])}px;width:${Math.round(W * cardBox[2])}px;height:${Math.round(H * cardBox[3])}px;border-radius:${px(30)}px;background:url('${src(img)}') center 22%/cover no-repeat;opacity:0"></div>` : ''}
<div id="shade"></div><div id="veil"></div>
<div class="grain" id="grain"></div>
<div class="brand">${esc(data.brand.name)}</div>
<div id="hook" style="position:absolute;left:${wide ? W * 0.06 : 0}px;right:${wide ? W * 0.5 : 0}px;top:${headTop}px">${echoes('occ', occWords, occSize)}</div>
<div id="disc" style="opacity:0;position:absolute;left:0;right:0;top:${wide ? H * 0.18 : H * 0.24}px;text-align:center">
  <div class="mask" style="height:${Math.round(bigSize * 0.92)}px"><div id="big" class="d" style="font-size:${bigSize}px;color:${t.ink}">${esc(big)}</div></div>
  <div class="mask" style="height:${Math.round(bigSize * 0.42)}px"><div id="off" class="d" style="font-size:${Math.round(bigSize * 0.44)}px;color:${t.ink}">${esc(L.off)}</div></div>
</div>
<div id="pcol" class="col" style="left:${col.left}px;top:${col.top}px;width:${col.w}px;text-align:${col.align};opacity:0">
  <div class="pname">${esc(data.product.name)}</div>
  <div><span class="was">${esc($(p.was))}<span id="strike" class="strike"></span></span></div>
  <div class="mask" style="height:${Math.round(nowSize * 0.95)}px"><div id="now" class="d" style="font-size:${nowSize}px">${esc($(p.was))}</div></div>
</div>
<div id="tag" class="tag d" style="width:${px(230)}px;height:${px(230)}px;${wide ? `left:${W * 0.03}px;top:${H * 0.6}px` : portrait ? `right:${W * 0.05}px;top:${H * 0.05}px` : `left:${W * 0.03}px;top:${H * 0.6}px`};font-size:${px(78)}px;line-height:.9;opacity:0">${esc(big)}<span style="font-size:${px(34)}px">${esc(L.save)} ${esc($(p.save))}</span></div>
<div id="codeb" class="col" style="left:${col.left}px;top:${col.top}px;width:${col.w}px;opacity:0">
  <div style="font-size:${px(34)}px;letter-spacing:.2em;text-transform:uppercase;color:${t.sub};font-weight:600">${esc(L.useCode)}</div>
  <div id="chip" class="chip d" style="font-size:${codeSize}px;margin-top:${px(14)}px">${esc(data.code)}</div>
  <div id="dl" style="margin-top:${px(26)}px;font-size:${px(42)}px;font-weight:600">${esc(dl.label)}</div>
</div>
<div id="ctab" style="position:absolute;left:0;right:0;top:${portrait ? H * 0.38 : H * 0.3}px;text-align:center;color:${t.ink};opacity:0">
  <div class="mask" style="height:${Math.round(endSize * 0.92)}px"><div id="ctaocc" class="d" style="font-size:${endSize}px;white-space:nowrap">${esc(data.occasion)}</div></div>
  <div id="cta" class="cta" style="margin-top:${px(40)}px">${esc(data.cta)}</div>
  ${data.url ? `<div style="margin-top:${px(26)}px;font-size:${px(40)}px;font-weight:600;color:${t.ink};opacity:.8">${esc(data.url)}</div>` : ''}
</div>
${tape('tape', tapeText, t, W, H, { y: portrait ? 0.9 : 0.88, size: px(wide ? 56 : 62) })}
<div id="badgewrap" style="position:absolute;${portrait ? `right:${W * 0.05}px;top:${H * 0.63}px` : `right:${W * 0.04}px;top:${H * 0.58}px`};width:${px(250)}px;height:${px(250)}px;opacity:0">${badge('bdg', `${data.occasion} • ${big} ${L.off} • ${data.brand.name} • `, t, px(250))}</div>
${noCredit ? '' : credit(t, px(26)).replace('opacity:.72', 'opacity:0').replace(/bottom:\d+px/, `bottom:${Math.round(H * (portrait ? 0.15 : 0.17))}px`)}`;

const f = v => v.toFixed(2);
const digits = minorDigits(cur), unit = 10 ** digits;
const nowFmt = `new Intl.NumberFormat(${JSON.stringify(loc)},{style:'currency',currency:${JSON.stringify(cur)},minimumFractionDigits:${Math.abs(p.now - Math.round(p.now)) < 0.5 / unit ? 0 : digits},maximumFractionDigits:${digits}})`;
const script = `
// world: continuous camera, grain, tape and badge
tl.fromTo('#phi',{scale:1.22},{scale:1.02,duration:${f(B.end)},ease:'none'},0);
tl.fromTo('#grain',{x:0,y:0},{x:-40,y:30,duration:${f(B.end)},ease:'steps(${Math.round(B.end * 12)})'},0);
tl.fromTo('#tape',{xPercent:-30,opacity:0},{xPercent:0,opacity:1,duration:.5,ease:'power3.out'},0.3);
tl.fromTo('#tape-run',{xPercent:0},{xPercent:-50,duration:${f(B.end + 4)},ease:'none'},0);
tl.fromTo('#bdg',{rotation:0},{rotation:${Math.round(B.end * 24)},transformOrigin:'50% 50%',duration:${f(B.end)},ease:'none'},0);
tl.fromTo('#badgewrap',{opacity:0,scale:.6},{opacity:1,scale:1,duration:.4,ease:'back.out(1.8)'},${f(B.disc + 0.2)});
// hook: the occasion rises line by line with outline echoes
${occWords.map((_, i) => `tl.fromTo('#occ${i}',{yPercent:105},{yPercent:0,duration:.55,ease:'power4.out'},${f(0.1 + i * 0.14)});`).join('\n')}
${occWords.map((_, i) => `tl.to('#occ${i}',{yPercent:-105,duration:.4,ease:'power3.in'},${f(B.disc - 0.35 + i * 0.05)});`).join('\n')}
tl.to('#hook',{opacity:0,duration:.25},${f(B.disc - 0.2)});
// discount slams in over a darker veil
tl.to('#veil',{opacity:1,duration:.3},${f(B.disc - 0.1)});
tl.set('#disc',{opacity:1},${f(B.disc - 0.01)});
tl.fromTo('#big',{yPercent:110,scale:1.15},{yPercent:0,scale:1,duration:.5,ease:'power4.out'},${f(B.disc)});
tl.fromTo('#off',{yPercent:110},{yPercent:0,duration:.4,ease:'power4.out'},${f(B.disc + 0.18)});
tl.to('#disc',{scale:1.06,duration:${f(B.price - B.disc - 0.4)},ease:'none'},${f(B.disc + 0.4)});
tl.to(['#big','#off'],{yPercent:-110,duration:.35,ease:'power3.in'},${f(B.price - 0.35)});
tl.to('#veil',{opacity:0,duration:.4},${f(B.price - 0.2)});
tl.set('#disc',{opacity:0},${f(B.price + 0.05)});
// the photo reframes into a card; the regular price is struck before the sale price lands
tl.fromTo('#ph',{clipPath:'inset(0% 0% 0% 0% round 0px)'},{clipPath:'${card}',duration:.6,ease:'power3.inOut'},${f(B.price - 0.2)});
tl.to('#phi',{x:${Math.round(cardShift.x)},y:${Math.round(cardShift.y)},duration:.6,ease:'power3.inOut'},${f(B.price - 0.2)});
${img ? `tl.fromTo('#cimg',{opacity:0,scale:1.08},{opacity:1,scale:1,duration:.5,ease:'power2.out'},${f(B.price + 0.15)});
tl.to('#cimg',{opacity:0,duration:.3},${f(B.cta - 0.15)});` : ''}
tl.fromTo('#pcol',{opacity:0,y:${px(40)}},{opacity:1,y:0,duration:.4,ease:'power3.out'},${f(B.price + 0.2)});
tl.fromTo('#strike',{scaleX:0},{scaleX:1,duration:.3,ease:'power2.out'},${f(B.price + 0.6)});
const fmt=${nowFmt};const nowEl=document.querySelector('#root #now');const o={v:${p.was}};
tl.fromTo(o,{v:${p.was}},{v:${p.now},duration:.7,ease:'power3.out',onUpdate:()=>{nowEl.textContent=fmt.format(Math.round(o.v*${unit})/${unit})}},${f(B.price + 0.95)});
tl.fromTo('#tag',{opacity:0,scale:0,rotation:-40},{opacity:1,scale:1,rotation:-10,duration:.45,ease:'back.out(2)'},${f(B.price + 1.6)});
tl.to(['#pcol','#tag'],{opacity:0,duration:.3},${f(B.code - 0.3)});
// code and deadline beside the card, held still
tl.fromTo('#codeb',{opacity:0,y:${px(40)}},{opacity:1,y:0,duration:.4,ease:'power3.out'},${f(B.code)});
tl.fromTo('#chip',{scale:.85},{scale:1,duration:.4,ease:'back.out(2)'},${f(B.code + 0.05)});
tl.to('#codeb',{opacity:0,duration:.3},${f(B.cta - 0.3)});
// the photo opens back to full frame for the call to action
tl.to('#ph',{clipPath:'inset(0% 0% 0% 0% round 0px)',duration:.6,ease:'power3.inOut'},${f(B.cta - 0.2)});
tl.to('#phi',{x:0,y:0,duration:.6,ease:'power3.inOut'},${f(B.cta - 0.2)});
tl.to('#veil',{opacity:.8,duration:.5},${f(B.cta)});
tl.fromTo('#ctab',{opacity:0},{opacity:1,duration:.2},${f(B.cta + 0.1)});
tl.fromTo('#ctaocc',{yPercent:110},{yPercent:0,duration:.5,ease:'power4.out'},${f(B.cta + 0.1)});
tl.fromTo('#cta',{scale:.6,opacity:0},{scale:1,opacity:1,duration:.4,ease:'back.out(2)'},${f(B.cta + 0.35)});
${noCredit ? '' : `tl.fromTo('#credit',{opacity:0},{opacity:.75,duration:.4},${f(B.cta + 0.5)});`}
tl.set({}, {}, ${f(B.end)});`;

const out = path.resolve(outDir);
const { total, src: copiedAs } = await project({ here, out, inputDir, W, H, dur, title: `${data.brand.name} · ${data.occasion} promo`, css, body, script, images: [img] });
const { writeFile } = await import('node:fs/promises');
await writeFile(path.join(out, 'offer.json'), JSON.stringify({ ...data, product: { ...data.product, image: copiedAs(img) || data.product.image }, aspect, duration: dur, computed: { was: p.was, now: p.now, percentOff: p.percent, save: p.save } }, null, 2));
console.log(`✓ ${data.brand.name}: ${$(p.was)} → ${$(p.now)}, ${aspect}, ${total.toFixed(1)} s → ${out}`);
