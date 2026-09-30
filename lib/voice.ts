type SpeakHooks = {
  onEnd?: () => void;
  onInterrupt?: () => void;
  /** Seconds for the line to rise in. The first line of a cycle uses a longer rise. */
  fade?: number;
};

const PRESENCE = 0.56;

let voiceCtx: AudioContext | null = null;
let current: AudioBufferSourceNode | null = null;
let fading: AudioBufferSourceNode | null = null;
let token = 0;
let onInterrupt: (() => void) | null = null;
let userLevel = 0.82;
const cache = new Map<string, Promise<AudioBuffer>>();

let chainCtx: AudioContext | null = null;
let voiceIn: GainNode | null = null;
let voiceMaster: GainNode | null = null;
let meter: AnalyserNode | null = null;
let samples = new Float32Array(0);

function voiceTarget() {
  return userLevel * PRESENCE;
}

function chain(ctx: AudioContext) {
  if (voiceIn && voiceMaster && chainCtx === ctx) {
    return { input: voiceIn, master: voiceMaster };
  }

  const input = ctx.createGain();
  const master = ctx.createGain();
  master.gain.value = 0;
  input.connect(master);
  master.connect(ctx.destination);

  const tap = ctx.createAnalyser();
  tap.fftSize = 1024;
  input.connect(tap);

  chainCtx = ctx;
  voiceIn = input;
  voiceMaster = master;
  meter = tap;
  samples = new Float32Array(tap.fftSize);
  return { input, master };
}

/** How loud the line being spoken is right now, 0 to 1. The listener's volume does not change it. */
export function voiceLevel() {
  if (!meter || !current) return 0;
  meter.getFloatTimeDomainData(samples);
  let sum = 0;
  for (let i = 0; i < samples.length; i += 1) sum += samples[i] * samples[i];
  return Math.min(1, Math.sqrt(sum / samples.length) * 5);
}

function rise(master: GainNode, ctx: AudioContext, fade: number) {
  const now = ctx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(0, now);
  master.gain.setTargetAtTime(voiceTarget(), now, Math.max(0.08, fade / 3));
}

function context() {
  if (!voiceCtx || voiceCtx.state === "closed") voiceCtx = new AudioContext();
  return voiceCtx;
}

function load(url: string, ctx: AudioContext) {
  const cached = cache.get(url);
  if (cached) return cached;
  const pending = fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error(url);
      return response.arrayBuffer();
    })
    .then((bytes) => ctx.decodeAudioData(bytes.slice(0)));
  cache.set(url, pending);
  return pending;
}

export function setVoiceLevel(level: number) {
  userLevel = Math.min(1, Math.max(0, level));
  if (!voiceCtx || !voiceMaster) return;
  const now = voiceCtx.currentTime;
  voiceMaster.gain.cancelScheduledValues(now);
  voiceMaster.gain.setValueAtTime(voiceMaster.gain.value, now);
  voiceMaster.gain.setTargetAtTime(voiceTarget(), now, 0.08);
}

export function stopVoice(fade = false) {
  token += 1;
  const interrupt = onInterrupt;
  onInterrupt = null;
  if (fading) {
    try {
      fading.stop();
    } catch {
      /* already stopped */
    }
    fading = null;
  }
  const src = current;
  current = null;
  if (src) {
    src.onended = null;
    if (fade && voiceCtx && voiceMaster) {
      const now = voiceCtx.currentTime;
      voiceMaster.gain.cancelScheduledValues(now);
      voiceMaster.gain.setValueAtTime(voiceMaster.gain.value, now);
      voiceMaster.gain.setTargetAtTime(0, now, 0.06);
      fading = src;
      window.setTimeout(() => {
        if (fading !== src) return;
        try {
          src.stop();
        } catch {
          /* already stopped */
        }
        fading = null;
      }, 220);
    } else {
      try {
        src.stop();
      } catch {
        /* already stopped */
      }
    }
  }
  interrupt?.();
}

export function speakFile(url: string, hooks?: SpeakHooks) {
  stopVoice();
  const mine = token;
  onInterrupt = hooks?.onInterrupt ?? null;
  const ctx = context();
  void ctx.resume();

  void load(url, ctx)
    .then((buffer) => {
      if (mine !== token) return;

      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.playbackRate.value = 1;

      const { input, master } = chain(ctx);
      src.connect(input);
      rise(master, ctx, hooks?.fade ?? 0.45);

      src.onended = () => {
        if (mine !== token) return;
        current = null;
        onInterrupt = null;
        hooks?.onEnd?.();
      };
      current = src;
      src.start();
    })
    .catch(() => {
      if (mine !== token) return;
      onInterrupt = null;
      hooks?.onEnd?.();
    });
}
