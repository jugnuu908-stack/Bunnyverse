/* ============================================================
   BORAPLAY — a tiny purple music engine.
   Six original JK-era-inspired synth tributes + retro game SFX,
   all composed & performed live with Web Audio.
   No audio files needed → every track always plays, everywhere.
   ============================================================ */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let delaySend: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;

let musicPlaying = false;
let musicMuted = false;
let schedulerTimer: number | null = null;
let stepIdx = 0;
let nextStepTime = 0;
let currentTrack = 0;
let stepDur = 0.16;

const BAR = 16; // 16th-note steps per bar
const LOOP_BARS = 8;
const LOOP_STEPS = BAR * LOOP_BARS; // 128 steps
const ARP8 = [0, 1, 2, 3, 2, 1, 0, 2];

const KICK_4 = [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0];
const SNARE_2 = [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0];

const M = (rows: number[][]): number[] => rows.flat();

interface TrackDef {
  bpm: number;
  chords: number[][]; // 4-bar progression, each chord = 4 freqs low→high
  arpGain: number;
  bassRhythm: number[]; // per 8th of a bar: 0 rest · 1 root · 2 octave · 3 fifth
  bassGain: number;
  melody: number[]; // 128 entries (16ths × 8 bars), 0 = rest
  leadType: OscillatorType;
  leadGain: number;
  pad: boolean;
  padGain: number;
  kickMask: number[];
  snareMask: number[];
  hatStep: number;
  hatGain: number;
}

const TRACKS: TrackDef[] = [
  /* 0 — Euphoria · airy bells over warm pads · A major, 92 bpm */
  {
    bpm: 92,
    chords: [
      [220.0, 277.18, 329.63, 440.0],
      [185.0, 220.0, 277.18, 369.99],
      [146.83, 220.0, 293.66, 369.99],
      [164.81, 246.94, 329.63, 415.3],
    ],
    arpGain: 0.11,
    bassRhythm: [1, 0, 1, 0, 1, 0, 2, 0],
    bassGain: 0.16,
    melody: M([
      [659.25, 0, 659.25, 0, 739.99, 0, 830.61, 0, 880, 0, 830.61, 0, 739.99, 0, 659.25, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [659.25, 0, 659.25, 0, 739.99, 0, 830.61, 0, 880, 0, 830.61, 0, 739.99, 0, 659.25, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [659.25, 0, 739.99, 0, 830.61, 0, 739.99, 0, 659.25, 0, 0, 0, 739.99, 0, 830.61, 0],
      [880, 0, 987.77, 0, 830.61, 0, 880, 0, 739.99, 0, 659.25, 0, 659.25, 0, 0, 0],
      [659.25, 0, 659.25, 0, 739.99, 0, 830.61, 0, 880, 0, 830.61, 0, 739.99, 0, 659.25, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ]),
    leadType: "sine",
    leadGain: 0.2,
    pad: true,
    padGain: 0.05,
    kickMask: KICK_4,
    snareMask: SNARE_2,
    hatStep: 2,
    hatGain: 0.06,
  },

  /* 1 — Still With You · soft pads, slow night rain · G minor, 70 bpm */
  {
    bpm: 70,
    chords: [
      [196.0, 233.08, 293.66, 392.0],
      [155.56, 196.0, 233.08, 311.13],
      [233.08, 293.66, 349.23, 466.16],
      [174.61, 220.0, 261.63, 349.23],
    ],
    arpGain: 0.07,
    bassRhythm: [1, 0, 0, 0, 1, 0, 0, 0],
    bassGain: 0.15,
    melody: M([
      [392, 0, 0, 0, 466.16, 0, 0, 0, 523.25, 0, 0, 0, 466.16, 0, 0, 0],
      [392, 0, 0, 0, 466.16, 0, 0, 0, 587.33, 0, 0, 0, 523.25, 0, 0, 0],
      [466.16, 0, 0, 0, 523.25, 0, 0, 0, 587.33, 0, 0, 0, 523.25, 0, 0, 0],
      [392, 0, 0, 0, 349.23, 0, 0, 0, 392, 0, 0, 0, 0, 0, 0, 0],
      [523.25, 0, 0, 0, 466.16, 0, 0, 0, 523.25, 0, 0, 0, 587.33, 0, 0, 0],
      [587.33, 0, 0, 0, 523.25, 0, 0, 0, 466.16, 0, 0, 0, 392, 0, 0, 0],
      [392, 0, 0, 0, 466.16, 0, 0, 0, 523.25, 0, 0, 0, 0, 0, 0, 0],
      [392, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ]),
    leadType: "triangle",
    leadGain: 0.2,
    pad: true,
    padGain: 0.06,
    kickMask: KICK_4,
    snareMask: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    hatStep: 4,
    hatGain: 0.05,
  },

  /* 2 — My Time · midnight drive, driving 8ths · F minor, 98 bpm */
  {
    bpm: 98,
    chords: [
      [174.61, 207.65, 261.63, 349.23],
      [138.59, 174.61, 207.65, 277.18],
      [207.65, 261.63, 311.13, 415.3],
      [155.56, 186.47, 233.08, 311.13],
    ],
    arpGain: 0.09,
    bassRhythm: [1, 0, 2, 1, 0, 1, 2, 3],
    bassGain: 0.18,
    melody: M([
      [349.23, 415.3, 466.16, 415.3, 349.23, 0, 415.3, 0, 466.16, 523.25, 466.16, 415.3, 349.23, 0, 0, 0],
      [415.3, 466.16, 523.25, 466.16, 415.3, 0, 349.23, 0, 311.13, 349.23, 415.3, 349.23, 311.13, 0, 0, 0],
      [415.3, 0, 466.16, 0, 523.25, 0, 466.16, 0, 523.25, 622.25, 523.25, 466.16, 415.3, 0, 0, 0],
      [466.16, 523.25, 466.16, 415.3, 349.23, 0, 415.3, 0, 349.23, 0, 0, 0, 0, 0, 0, 0],
      [349.23, 415.3, 466.16, 415.3, 349.23, 0, 415.3, 0, 466.16, 523.25, 466.16, 415.3, 349.23, 0, 0, 0],
      [415.3, 466.16, 523.25, 466.16, 415.3, 0, 349.23, 0, 311.13, 349.23, 415.3, 349.23, 311.13, 0, 0, 0],
      [415.3, 0, 466.16, 0, 523.25, 0, 466.16, 0, 523.25, 622.25, 523.25, 466.16, 415.3, 0, 0, 0],
      [466.16, 523.25, 466.16, 415.3, 349.23, 0, 0, 0, 349.23, 0, 0, 0, 0, 0, 0, 0],
    ]),
    leadType: "sawtooth",
    leadGain: 0.1,
    pad: false,
    padGain: 0,
    kickMask: KICK_4,
    snareMask: SNARE_2,
    hatStep: 2,
    hatGain: 0.07,
  },

  /* 3 — Seven · sunny pop bop · C major, 110 bpm */
  {
    bpm: 110,
    chords: [
      [130.81, 164.81, 196.0, 261.63],
      [98.0, 123.47, 146.83, 196.0],
      [110.0, 130.81, 164.81, 220.0],
      [87.31, 110.0, 130.81, 174.61],
    ],
    arpGain: 0.12,
    bassRhythm: [1, 0, 1, 0, 2, 0, 1, 0],
    bassGain: 0.17,
    melody: M([
      [523.25, 0, 587.33, 0, 659.25, 0, 587.33, 0, 523.25, 0, 523.25, 587.33, 659.25, 0, 0, 0],
      [659.25, 0, 587.33, 0, 523.25, 0, 587.33, 0, 659.25, 0, 659.25, 587.33, 523.25, 0, 0, 0],
      [587.33, 0, 659.25, 0, 783.99, 0, 659.25, 0, 587.33, 0, 587.33, 659.25, 783.99, 0, 0, 0],
      [880, 0, 783.99, 0, 659.25, 0, 587.33, 0, 659.25, 0, 0, 0, 0, 0, 0, 0],
      [523.25, 0, 587.33, 0, 659.25, 0, 587.33, 0, 523.25, 0, 523.25, 587.33, 659.25, 0, 0, 0],
      [659.25, 0, 587.33, 0, 523.25, 0, 587.33, 0, 659.25, 0, 659.25, 587.33, 523.25, 0, 0, 0],
      [587.33, 0, 659.25, 0, 783.99, 0, 659.25, 0, 587.33, 0, 587.33, 659.25, 783.99, 0, 0, 0],
      [880, 0, 783.99, 0, 659.25, 0, 587.33, 0, 523.25, 0, 0, 0, 0, 0, 0, 0],
    ]),
    leadType: "square",
    leadGain: 0.11,
    pad: false,
    padGain: 0,
    kickMask: KICK_4,
    snareMask: SNARE_2,
    hatStep: 2,
    hatGain: 0.08,
  },

  /* 4 — Standing Next to You · funky gold bass · D minor, 104 bpm */
  {
    bpm: 104,
    chords: [
      [146.83, 174.61, 220.0, 293.66],
      [116.54, 146.83, 174.61, 233.08],
      [130.81, 164.81, 196.0, 261.63],
      [110.0, 138.59, 164.81, 220.0],
    ],
    arpGain: 0.08,
    bassRhythm: [1, 0, 1, 2, 0, 1, 2, 3],
    bassGain: 0.2,
    melody: M([
      [587.33, 0, 0, 587.33, 698.46, 0, 587.33, 0, 783.99, 0, 587.33, 0, 698.46, 0, 587.33, 0],
      [880, 0, 0, 0, 783.99, 0, 0, 0, 698.46, 0, 587.33, 0, 0, 0, 0, 0],
      [587.33, 698.46, 783.99, 698.46, 587.33, 0, 0, 0, 880, 0, 783.99, 0, 698.46, 0, 587.33, 0],
      [698.46, 0, 587.33, 0, 783.99, 0, 698.46, 0, 587.33, 0, 0, 0, 0, 0, 0, 0],
      [587.33, 0, 0, 587.33, 698.46, 0, 587.33, 0, 783.99, 0, 587.33, 0, 698.46, 0, 587.33, 0],
      [880, 0, 0, 0, 783.99, 0, 0, 0, 698.46, 0, 587.33, 0, 0, 0, 0, 0],
      [587.33, 698.46, 783.99, 698.46, 587.33, 0, 0, 0, 880, 0, 783.99, 0, 698.46, 0, 587.33, 0],
      [698.46, 0, 587.33, 0, 783.99, 0, 698.46, 0, 587.33, 0, 0, 0, 0, 0, 0, 0],
    ]),
    leadType: "square",
    leadGain: 0.11,
    pad: false,
    padGain: 0,
    kickMask: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0],
    snareMask: SNARE_2,
    hatStep: 1,
    hatGain: 0.045,
  },

  /* 5 — Never Let Go · music-box fan letter · E major, 76 bpm */
  {
    bpm: 76,
    chords: [
      [164.81, 207.65, 246.94, 329.63],
      [138.59, 164.81, 207.65, 277.18],
      [110.0, 138.59, 164.81, 220.0],
      [123.47, 155.56, 185.0, 246.94],
    ],
    arpGain: 0.08,
    bassRhythm: [1, 0, 0, 0, 1, 0, 2, 0],
    bassGain: 0.15,
    melody: M([
      [659.25, 0, 739.99, 0, 830.61, 0, 0, 0, 739.99, 0, 659.25, 0, 0, 0, 0, 0],
      [830.61, 0, 0, 0, 987.77, 0, 830.61, 0, 739.99, 0, 0, 0, 659.25, 0, 0, 0],
      [739.99, 0, 830.61, 0, 987.77, 0, 0, 0, 1108.73, 0, 987.77, 0, 830.61, 0, 0, 0],
      [987.77, 0, 830.61, 0, 739.99, 0, 659.25, 0, 659.25, 0, 0, 0, 0, 0, 0, 0],
      [659.25, 0, 739.99, 0, 830.61, 0, 0, 0, 739.99, 0, 659.25, 0, 0, 0, 0, 0],
      [830.61, 0, 0, 0, 987.77, 0, 830.61, 0, 739.99, 0, 0, 0, 659.25, 0, 0, 0],
      [739.99, 0, 830.61, 0, 987.77, 0, 0, 0, 1108.73, 0, 987.77, 0, 830.61, 0, 0, 0],
      [987.77, 0, 830.61, 0, 739.99, 0, 659.25, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ]),
    leadType: "sine",
    leadGain: 0.22,
    pad: true,
    padGain: 0.06,
    kickMask: KICK_4,
    snareMask: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    hatStep: 4,
    hatGain: 0.05,
  },
];

/* ---------------- engine setup ---------------- */

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();

    master = ctx.createGain();
    master.gain.value = 1;

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -20;
    compressor.knee.value = 12;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;
    master.connect(compressor);
    compressor.connect(ctx.destination);

    musicGain = ctx.createGain();
    musicGain.gain.value = musicMuted ? 0 : 0.45;
    musicGain.connect(master);

    sfxGain = ctx.createGain();
    sfxGain.gain.value = 0.6;
    sfxGain.connect(master);

    // dreamy echo — fed from the music bus so muting kills the tail too
    const delay = ctx.createDelay(2);
    delay.delayTime.value = 0.35;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.32;
    const wet = ctx.createGain();
    wet.gain.value = 0.28;
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(master);

    delaySend = ctx.createGain();
    delaySend.gain.value = 0.5;
    delaySend.connect(delay);
    musicGain.connect(delaySend);
    sfxGain.connect(delaySend);

    // white noise buffer for drums
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setMusicMuted(m: boolean) {
  musicMuted = m;
  if (musicGain && ctx) {
    musicGain.gain.setTargetAtTime(m ? 0 : 0.45, ctx.currentTime, 0.08);
  }
}

/* ---------------- music synthesis ---------------- */

function musicNote(freq: number, time: number, dur: number, type: OscillatorType, gain: number) {
  const c = ensureCtx();
  if (!c || !musicGain || freq <= 0) return;
  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, time);
  g.gain.exponentialRampToValueAtTime(gain, time + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  osc.connect(g);
  g.connect(musicGain);
  osc.start(time);
  osc.stop(time + dur + 0.05);
}

function kick(time: number) {
  const c = ensureCtx();
  if (!c || !musicGain) return;
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(165, time);
  o.frequency.exponentialRampToValueAtTime(46, time + 0.11);
  const g = c.createGain();
  g.gain.setValueAtTime(0.9, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.22);
  o.connect(g);
  g.connect(musicGain);
  o.start(time);
  o.stop(time + 0.25);
}

function snare(time: number) {
  const c = ensureCtx();
  if (!c || !musicGain || !noiseBuf) return;
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1800;
  bp.Q.value = 0.9;
  const g = c.createGain();
  g.gain.setValueAtTime(0.32, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.16);
  src.connect(bp);
  bp.connect(g);
  g.connect(musicGain);
  src.start(time);
  src.stop(time + 0.2);

  const o = c.createOscillator();
  o.type = "triangle";
  o.frequency.value = 190;
  const og = c.createGain();
  og.gain.setValueAtTime(0.14, time);
  og.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
  o.connect(og);
  og.connect(musicGain);
  o.start(time);
  o.stop(time + 0.12);
}

function hat(time: number, gain: number) {
  const c = ensureCtx();
  if (!c || !musicGain || !noiseBuf) return;
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 7200;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
  src.connect(hp);
  hp.connect(g);
  g.connect(musicGain);
  src.start(time);
  src.stop(time + 0.06);
}

function scheduleStep(s: number, t: number) {
  const tr = TRACKS[currentTrack];
  const bar = Math.floor(s / BAR) % 4;
  const chord = tr.chords[bar];
  const s16 = s % BAR;
  const e8 = Math.floor(s / 2) % 8; // 8th note within the bar

  // sparkling arpeggio (every 8th)
  if (s % 2 === 0) {
    const f = chord[ARP8[e8]];
    musicNote(f, t, stepDur * 1.7, "triangle", tr.arpGain);
    musicNote(f * 2, t, stepDur * 1.1, "sine", tr.arpGain * 0.35);
  }

  // bass line
  if (s % 2 === 0) {
    const b = tr.bassRhythm[e8];
    if (b) {
      const root = chord[0];
      const f = b === 1 ? root : b === 2 ? root * 2 : root * 1.5;
      musicNote(f, t, stepDur * 1.6, "sine", tr.bassGain);
    }
  }

  // lead melody
  const mel = tr.melody[s];
  if (mel > 0) {
    musicNote(mel, t, stepDur * 2.8, tr.leadType, tr.leadGain);
    musicNote(mel * 2, t, stepDur * 1.6, "sine", tr.leadGain * 0.3);
  }

  // warm pads on every bar start
  if (tr.pad && s16 === 0) {
    const dur = stepDur * BAR * 1.05;
    chord.forEach((f, i) => {
      musicNote(f, t, dur, "triangle", tr.padGain * (i === 0 ? 1.1 : 0.8));
    });
  }

  // drums
  if (tr.kickMask[s16]) kick(t);
  if (tr.snareMask[s16]) snare(t);
  if (s % tr.hatStep === 0) hat(t, tr.hatGain);
}

function tick() {
  const c = ctx;
  if (!c || !musicPlaying) return;
  while (nextStepTime < c.currentTime + 0.8) {
    scheduleStep(stepIdx, nextStepTime);
    stepIdx = (stepIdx + 1) % LOOP_STEPS;
    nextStepTime += stepDur;
  }
}

export function loadTrack(index: number) {
  currentTrack = Math.max(0, Math.min(TRACKS.length - 1, index));
  stepDur = 60 / TRACKS[currentTrack].bpm / 4;
  stepIdx = 0;
  if (ctx) nextStepTime = ctx.currentTime + 0.06;
}

export function startMusic(trackIndex = 0) {
  const c = ensureCtx();
  if (!c) return;
  loadTrack(trackIndex);
  if (!musicPlaying) {
    musicPlaying = true;
    tick();
    if (schedulerTimer === null) schedulerTimer = window.setInterval(tick, 180);
  }
}

export function stopMusic() {
  musicPlaying = false;
  if (schedulerTimer !== null) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
  }
}

/* ---------------- retro game SFX (routed outside the music bus) ---------------- */

function tone(freq: number, time: number, dur: number, type: OscillatorType, gain: number, send = false) {
  const c = ensureCtx();
  if (!c || !sfxGain) return;
  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, time);
  g.gain.exponentialRampToValueAtTime(gain, time + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  osc.connect(g);
  const dest = send && delaySend ? delaySend : sfxGain;
  g.connect(dest);
  osc.start(time);
  osc.stop(time + dur + 0.05);
}

export function playFlip() {
  tone(340, 0, 0.07, "triangle", 0.25);
  tone(520, 0.04, 0.06, "triangle", 0.18);
}

export function playMatch() {
  tone(523.25, 0, 0.16, "sine", 0.3);
  tone(783.99, 0.09, 0.22, "sine", 0.28);
}

export function playWrong() {
  tone(160, 0, 0.25, "sawtooth", 0.16);
  tone(120, 0.08, 0.3, "sawtooth", 0.14);
}

export function playPop(combo = 1) {
  const base = 420 + Math.min(combo, 6) * 70;
  tone(base, 0, 0.09, "sine", 0.35);
  tone(base * 1.5, 0.03, 0.08, "sine", 0.2);
}

export function playBomb() {
  tone(90, 0, 0.35, "sawtooth", 0.35);
  tone(60, 0.05, 0.4, "square", 0.2);
}

export function playWin() {
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
  notes.forEach((n, i) => {
    tone(n, i * 0.09, 0.3, "triangle", 0.3, true);
    tone(n * 2, i * 0.09, 0.2, "sine", 0.08, true);
  });
}

export function playClick() {
  tone(700, 0, 0.05, "sine", 0.18);
}

export function playHeartRain() {
  const notes = [659.25, 783.99, 987.77, 1318.5, 1567.98];
  notes.forEach((n, i) => tone(n, i * 0.07, 0.4, "sine", 0.22, true));
}
