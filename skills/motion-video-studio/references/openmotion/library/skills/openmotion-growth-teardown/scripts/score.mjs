// Deterministic, license-free score for the growth film: a warm chord bed with a
// pulse that enters when the curve starts drawing, plus sound effects placed on
// the film's own visual cues (typing, pops, blips, whooshes, hits).
// Usage (standalone): node scripts/score.mjs out/cues.json out/assets/score.wav
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SR = 44100;
const BPM = 104, BEAT = 60 / BPM;
const midi = n => 440 * 2 ** ((n - 69) / 12);
// Imaj7 – vi9 – IVmaj9 – V6sus in D
const CHORDS = [[50, 62, 66, 69, 73], [47, 59, 62, 66, 69, 73], [43, 59, 62, 66, 69], [45, 57, 62, 64, 69]];

function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1; }

export async function renderScore({ duration, cues }, file) {
  const n = Math.ceil((duration + 0.05) * SR);
  const L = new Float32Array(n), R = new Float32Array(n);
  const add = (i, l, r = l) => { if (i >= 0 && i < n) { L[i] += l; R[i] += r; } };
  const noise = rng(7);
  const pulseStart = cues.find(c => c.type === 'rise')?.t ?? duration * 0.2;
  const lastHit = [...cues].reverse().find(c => c.type === 'hit')?.t ?? duration - 2;
  const fadeOut = t => (t > duration - 1.6 ? Math.max(0, (duration - t) / 1.6) : 1);
  const fadeIn = t => Math.min(1, t / 1.2);

  // pad: two bars per chord, detuned sines + soft triangle, slow swell
  const bar = BEAT * 4, chordLen = bar * 2;
  for (let c = 0; c * chordLen < duration; c++) {
    const notes = CHORDS[c % CHORDS.length], t0 = c * chordLen;
    for (const [k, note] of notes.entries()) {
      const f = midi(note + 12 * (k === 0 ? 0 : 0)), pan = (k / (notes.length - 1)) * 0.6 - 0.3;
      const start = Math.floor(t0 * SR), len = Math.floor((chordLen + 0.6) * SR);
      for (let i = 0; i < len; i++) {
        const t = i / SR, gt = t0 + t; if (gt >= duration) break;
        const env = Math.min(1, t / 0.9) * Math.min(1, (chordLen + 0.6 - t) / 0.7);
        const ph = 2 * Math.PI * f * gt;
        const tri = (2 / Math.PI) * Math.asin(Math.sin(ph * 1.0015));
        let v = (Math.sin(ph) * 0.55 + Math.sin(ph * 1.003) * 0.35 + tri * 0.18) * env * (k === 0 ? 0.05 : 0.026);
        v *= fadeIn(gt) * fadeOut(gt);
        add(start + i, v * (1 - pan), v * (1 + pan));
      }
    }
  }
  // pulse: kick on beats, hats on offbeats, bass on 1 and 3 — from the curve draw to the last hit
  for (let b = Math.ceil(pulseStart / BEAT); b * BEAT < Math.min(duration - 1.2, lastHit + bar); b++) {
    const t0 = b * BEAT, beatInBar = b % 4, chord = CHORDS[Math.floor(t0 / chordLen) % CHORDS.length];
    const gain = Math.min(1, (t0 - pulseStart) / (bar * 2) + 0.35) * fadeOut(t0);
    // kick
    for (let i = 0, ph = 0; i < 0.32 * SR; i++) { const t = i / SR; ph += 2 * Math.PI * (48 + 90 * Math.exp(-t * 28)) / SR; add(Math.floor(t0 * SR) + i, Math.sin(ph) * Math.exp(-t * 9) * 0.16 * gain); }
    // hat on the offbeat
    const th = t0 + BEAT / 2; let lp = 0;
    for (let i = 0; i < 0.05 * SR; i++) { const t = i / SR; const x = noise(); const hp = x - lp; lp = lp * 0.6 + x * 0.4; add(Math.floor(th * SR) + i, hp * Math.exp(-t * 90) * 0.035 * gain, hp * Math.exp(-t * 90) * 0.045 * gain); }
    // bass
    if (beatInBar % 2 === 0) {
      const f = midi(chord[0] - 12);
      for (let i = 0; i < BEAT * 1.6 * SR; i++) { const t = i / SR; const v = Math.tanh(Math.sin(2 * Math.PI * f * (t0 + t)) * 1.6) * Math.exp(-t * 2.2) * 0.07 * gain; add(Math.floor(t0 * SR) + i, v); }
    }
  }
  // cue effects
  for (const c of cues) {
    const s = Math.floor(c.t * SR);
    if (c.type === 'tick') { for (let i = 0; i < 0.012 * SR; i++) add(s + i, noise() * Math.exp(-i / SR * 380) * 0.05); }
    else if (c.type === 'pop' || c.type === 'blip' || c.type === 'ding') {
      const [f0, f1, dur, g] = c.type === 'pop' ? [520, 900, 0.09, 0.09] : c.type === 'ding' ? [1320, 1320, 0.22, 0.035] : [880, 1180, 0.06, 0.04];
      for (let i = 0, ph = 0; i < dur * SR; i++) { const t = i / SR; ph += 2 * Math.PI * (f0 + (f1 - f0) * Math.min(1, t / 0.03)) / SR; add(s + i, Math.sin(ph) * Math.exp(-t * (c.type === 'ding' ? 18 : 45)) * g); }
    } else if (c.type === 'whoosh') {
      let lp = 0; const len = 0.5 * SR, st = s - Math.floor(0.38 * SR);
      for (let i = 0; i < len; i++) { const t = i / SR; const cut = 0.02 + 0.25 * Math.sin(Math.PI * t / 0.5); lp += cut * (noise() - lp); const env = Math.sin(Math.PI * t / 0.5) ** 2; add(st + i, lp * env * 0.22, lp * env * 0.18); }
    } else if (c.type === 'rise') {
      for (let i = 0; i < 0.7 * SR; i++) { const t = i / SR; add(s + i, Math.sin(2 * Math.PI * (220 + 440 * t) * t) * Math.sin(Math.PI * t / 0.7) * 0.03); }
    } else if (c.type === 'hit') {
      for (let i = 0, ph = 0; i < 0.9 * SR; i++) { const t = i / SR; ph += 2 * Math.PI * (60 + 70 * Math.exp(-t * 20)) / SR; add(s + i, (Math.sin(ph) * 0.2 + noise() * 0.04 * Math.exp(-t * 30)) * Math.exp(-t * 5)); }
    }
  }
  // master: gentle saturation and normalize to -1 dBFS peak
  let peak = 0;
  for (let i = 0; i < n; i++) { L[i] = Math.tanh(L[i] * 1.4); R[i] = Math.tanh(R[i] * 1.4); peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i])); }
  const g = peak ? 0.89 / peak : 1;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) { buf.writeInt16LE(Math.round(L[i] * g * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(R[i] * g * 32767), 46 + i * 4); }
  await writeFile(file, buf);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [cuesFile, outFile] = process.argv.slice(2);
  await renderScore(JSON.parse(await readFile(cuesFile, 'utf8')), outFile);
  console.log('Wrote ' + outFile);
}
