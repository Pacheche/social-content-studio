#!/usr/bin/env node
// Collect real evidence images for a growth.json:
//   - a screenshot of each evidence move's page (YouTube links use the video thumbnail)
//   - the page's og:image as a fallback
//   - a thumbnail wall for plays with "wallQuery" (YouTube search results)
//   - favicons for the research engines and the company logo
// Usage: node scripts/evidence.mjs growth.json evidence/ [--no-browser]
// Writes evidence/<files> and evidence/growth.json (a copy with image paths filled in).
import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { existsSync } from 'node:fs';

const [input, outDir = 'evidence', ...flags] = process.argv.slice(2);
if (!input) {
  console.error('Usage: node scripts/evidence.mjs growth.json evidence/ [--no-browser]');
  process.exit(2);
}
const useBrowser = !flags.includes('--no-browser');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const data = JSON.parse(await readFile(input, 'utf8'));
const out = path.resolve(outDir);
await mkdir(out, { recursive: true });

const ENGINE_DOMAINS = {
  google: 'google.com', bing: 'bing.com', duckduckgo: 'duckduckgo.com', reddit: 'reddit.com', x: 'x.com', twitter: 'x.com',
  youtube: 'youtube.com', github: 'github.com', wikipedia: 'wikipedia.org', news: 'news.google.com', hackernews: 'news.ycombinator.com',
  producthunt: 'producthunt.com', forbes: 'forbes.com', saastr: 'saastr.com', sacra: 'sacra.com', theverge: 'theverge.com', verge: 'theverge.com',
  bloomberg: 'bloomberg.com', reuters: 'reuters.com', theinformation: 'theinformation.com', cnbc: 'cnbc.com', businessinsider: 'businessinsider.com', ft: 'ft.com', wsj: 'wsj.com', linkedin: 'linkedin.com', crunchbase: 'crunchbase.com', tiktok: 'tiktok.com', techcrunch: 'techcrunch.com',
};

async function fetchBuffer(url, timeout = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { headers: { 'user-agent': UA, accept: '*/*' }, redirect: 'follow', signal: controller.signal });
    if (!res.ok) return null;
    return { buf: Buffer.from(await res.arrayBuffer()), type: res.headers.get('content-type') || '' };
  } catch { return null; } finally { clearTimeout(timer); }
}
const extFor = type => (type.includes('png') ? '.png' : type.includes('webp') ? '.webp' : type.includes('svg') ? '.svg' : '.jpg');
async function saveUrl(url, base, minBytes = 1500) {
  const got = await fetchBuffer(url);
  if (!got || got.buf.length < minBytes || !/image/.test(got.type)) return null;
  const file = base + extFor(got.type);
  await writeFile(path.join(out, file), got.buf);
  return file;
}
function youtubeId(url) {
  const m = String(url).match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}
async function youtubeThumb(id, base) {
  return (await saveUrl(`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`, base)) || saveUrl(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`, base);
}
async function ogImage(url) {
  const got = await fetchBuffer(url);
  if (!got) return null;
  const html = got.buf.toString('utf8');
  const m = html.match(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)(?::src)?["'][^>]*>/i);
  const c = m && m[0].match(/content=["']([^"']+)["']/i);
  return c ? new URL(c[1].replace(/&amp;/g, '&'), url).href : null;
}

let browser = null;
async function getBrowser() {
  if (!useBrowser) return null;
  if (browser) return browser;
  let puppeteer;
  try { puppeteer = (await import('puppeteer-core')).default; } catch { return null; }
  const candidates = [process.env.CHROME_PATH, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    'C:/Program Files/Google/Chrome/Application/chrome.exe'].filter(Boolean);
  const executablePath = candidates.find(p => existsSync(p));
  if (!executablePath) return null;
  browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox', '--hide-scrollbars', '--lang=en-US'] });
  return browser;
}
const BLOCKED = /just a moment|attention required|access denied|verify you are human|enable javascript and cookies|captcha|403 forbidden|404|page not found|subscribe to continue|can.t be reached|err_[a-z_]+|security (?:check|verification)|checking your browser|sign in to continue|not a bot|are you a robot|one more step|log in to continue|无法访问|安全验证|正在进行|拒绝访问|验证您是/i;
async function screenshot(url, base) {
  const b = await getBrowser();
  if (!b) return null;
  const page = await b.newPage();
  try {
    await page.setUserAgent(UA);
    await page.setExtraHTTPHeaders({ 'accept-language': 'en-US,en;q=0.9' });
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1.5 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 2200));
    // Hide common cookie/consent overlays so the headline is visible.
    await page.evaluate(() => {
      for (const el of document.querySelectorAll('[id*="cookie" i],[class*="cookie" i],[id*="consent" i],[class*="consent" i],[class*="gdpr" i],[aria-modal="true"]')) {
        const s = getComputedStyle(el);
        if (s.position === 'fixed' || s.position === 'sticky') el.remove();
      }
      // Any remaining small box that talks about cookies: remove its floating container.
      const COOKIE = /we use cookies|cookies are used|use of cookies|cookie (?:policy|settings|preferences)|accept all|reject all|manage preferences/i;
      for (const el of [...document.querySelectorAll('body *')].reverse()) {
        if (!el.isConnected || (el.innerText || '').length > 700 || !COOKIE.test(el.innerText || '')) continue;
        let node = el, target = null;
        while (node && node !== document.body) {
          const p = getComputedStyle(node).position;
          if (p === 'fixed' || p === 'sticky' || p === 'absolute') target = node;
          node = node.parentElement;
        }
        const r = (target || el).getBoundingClientRect();
        if (target && r.width * r.height < innerWidth * innerHeight * 0.6) target.remove();
      }
      document.documentElement.style.overflow = 'hidden';
    }).catch(() => {});
    const text = await page.evaluate(() => (document.title + ' ' + document.body.innerText.slice(0, 600))).catch(() => '');
    if (BLOCKED.test(text) || text.trim().length < 40) return null;
    // Crop to the story: the main headline and what follows it, at the card's 16:9 shape.
    const clip = await page.evaluate(() => {
      const h = [...document.querySelectorAll('h1, h2')].find(e => { const r = e.getBoundingClientRect(); return r.width > 200 && r.height > 20 && r.top < 1400 && getComputedStyle(e).visibility !== 'hidden'; });
      if (!h) return null;
      const box = (h.closest('article, main, [role="main"]') || document.body).getBoundingClientRect(), r = h.getBoundingClientRect();
      const x = Math.max(0, Math.min(r.left, box.left) - 32), w = Math.min(innerWidth - x, Math.max(r.width + 64, Math.min(box.width + 64, 1100)));
      const y = Math.max(0, r.top + scrollY - 48);
      return { x, y, width: w, height: Math.round(w * 0.566) };
    }).catch(() => null);
    const file = base + '.jpg';
    await page.screenshot({ path: path.join(out, file), type: 'jpeg', quality: 85, ...(clip ? { clip, captureBeyondViewport: true } : {}) });
    return file;
  } catch { return null; } finally { await page.close().catch(() => {}); }
}
async function youtubeSearchIds(query, max = 60) {
  const got = await fetchBuffer('https://www.youtube.com/results?search_query=' + encodeURIComponent(query) + '&hl=en');
  if (!got) return [];
  const ids = [...got.buf.toString('utf8').matchAll(/"videoId":"([\w-]{11})"/g)].map(m => m[1]);
  return [...new Set(ids)].slice(0, max);
}

const report = [];
// Company logo: apple-touch-icon, then favicon service.
if (!data.brand?.logo && data.domain) {
  let logo = null;
  const home = await fetchBuffer('https://' + data.domain);
  if (home) {
    const html = home.buf.toString('utf8');
    const m = html.match(/<link[^>]+rel=["'][^"']*apple-touch-icon[^"']*["'][^>]*>/i);
    const h = m && m[0].match(/href=["']([^"']+)["']/i);
    if (h) logo = await saveUrl(new URL(h[1], 'https://' + data.domain).href, 'logo');
  }
  logo ||= await saveUrl(`https://www.google.com/s2/favicons?domain=${data.domain}&sz=128`, 'logo', 200);
  if (logo) { data.brand = { ...(data.brand || {}), logo: path.join(path.basename(out), logo) }; report.push('logo ' + logo); }
}
// Engine favicons.
await mkdir(path.join(out, 'engines'), { recursive: true });
for (const engine of data.research?.engines || []) {
  const key = engine.toLowerCase().replace(/[^a-z0-9.]+/g, '');
  const own = /company|blog|sitemap|pricing|changelog|docs|site/.test(engine.toLowerCase()) && data.domain;
  const domain = ENGINE_DOMAINS[key] || ENGINE_DOMAINS[engine.toLowerCase()] || own || (/web|search/.test(key) && 'google.com') || (key.includes('.') ? key : key + '.com');
  const target = path.join('engines', engine.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
  if (!['.png', '.jpg'].some(e => existsSync(path.join(out, target + e)))) await saveUrl(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`, target, 200);
}
// Evidence images (a few pages at a time) and thumbnail walls.
async function pool(items, limit, fn) {
  const results = []; let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => { while (next < items.length) { const i = next++; results[i] = await fn(items[i], i); } }));
  return results;
}
const lanes = Object.fromEntries((data.lanes || []).map(l => [l.id, l]));
const jobs = [];
for (const play of data.plays || []) for (const ref of play.evidence || []) {
  const [laneId, index] = ref.split(':');
  const move = lanes[laneId]?.moves?.[Number(index)];
  if (move && !move.card && !move.source?.image && move.source?.url) jobs.push({ ref, laneId, index, move });
}
await pool(jobs, 4, async ({ ref, laneId, index, move }) => {
  const url = move.source.url, base = `ev-${laneId}-${index}`;
  let file = null;
  const yt = youtubeId(url);
  if (yt) file = await youtubeThumb(yt, base);
  if (!file && /\.xml$/i.test(url)) {
    // A sitemap is better drawn: list its real paths and count them.
    const got = await fetchBuffer(url);
    const locs = got ? [...got.buf.toString('utf8').matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map(m => m[1]) : [];
    if (locs.length) {
      const paths = locs.map(u => { try { return new URL(u).pathname; } catch { return u; } }).filter(p => p.length > 1);
      const focus = move.label.match(/\/[\w-]+/)?.[0];
      const pick = (focus ? paths.filter(p => p.startsWith(focus)) : []).concat(paths).filter((p, i, a) => a.indexOf(p) === i).slice(0, 6);
      move.card = { type: 'list', items: pick, note: `${locs.length} URLs in ${new URL(url).pathname}` };
      report.push(`${ref} list card from sitemap (${locs.length} URLs)`);
      return;
    }
  }
  if (!file) file = await screenshot(url, base);
  if (!file) { const og = await ogImage(url); if (og) file = await saveUrl(og, base); }
  if (file) move.source.image = path.join(path.basename(out), file);
  report.push(`${ref} ${file ? 'image ' + file : 'clipping card (no image)'}`);
});
for (const play of data.plays || []) {
  if (!play.wallQuery || play.wall) continue;
  const ids = await youtubeSearchIds(play.wallQuery);
  const files = await pool(ids.slice(0, 56), 8, async (id, i) => {
    const wb = `wall-${id}`; // keyed by video id, so a changed query never reuses another query's thumbnails
    return existsSync(path.join(out, wb + '.jpg')) ? wb + '.jpg' : saveUrl(`https://i.ytimg.com/vi/${id}/mqdefault.jpg`, wb);
  });
  const wall = files.filter(Boolean).slice(0, 48).map(f => path.join(path.basename(out), f));
  if (wall.length) { play.wall = wall; play.wallSource = 'YouTube search: ' + play.wallQuery; }
  report.push(`wall ${play.lane}: ${wall.length} thumbnails`);
}
if (browser) await browser.close();
// Paths already in the input are relative to its folder (or that folder's parent);
// rewrite them relative to the output's parent, where new paths are anchored.
const inputDir = path.dirname(path.resolve(input)), anchor = path.dirname(out);
const relocate = rel => {
  if (!rel || path.isAbsolute(rel)) return rel;
  if (existsSync(path.resolve(anchor, rel))) return rel;
  const found = [path.resolve(inputDir, rel), path.resolve(inputDir, '..', rel)].find(p => existsSync(p));
  return found ? path.relative(anchor, found) : rel;
};
if (data.brand?.logo) data.brand.logo = relocate(data.brand.logo);
for (const lane of data.lanes || []) for (const m of lane.moves || []) if (m.source?.image) m.source.image = relocate(m.source.image);
for (const p of data.plays || []) if (p.wall) p.wall = p.wall.map(relocate);
await writeFile(path.join(out, 'growth.json'), JSON.stringify(data, null, 2));
console.log(report.join('\n'));
console.log('Wrote ' + path.join(out, 'growth.json'));
process.exit(0);
