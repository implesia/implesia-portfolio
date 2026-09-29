type SpeakHooks = {
  onEnd?: () => void;
  onInterrupt?: () => void;
};

let voiceCtx: AudioContext | null = null;
let current: AudioBufferSourceNode | null = null;
let token = 0;
let onInterrupt: (() => void) | null = null;
const cache = new Map<string, Promise<AudioBuffer>>();

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
    .then((bytes) => ctx.decodeAudioData(bytes));
  cache.set(url, pending);
  return pending;
}

export function stopVoice() {
  token += 1;
  const interrupt = onInterrupt;
  onInterrupt = null;
  if (current) {
    try {
      current.onended = null;
      current.stop();
    } catch {
      /* already stopped */
    }
    current = null;
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

      const highpass = ctx.createBiquadFilter();
      highpass.type = "highpass";
      highpass.frequency.value = 80;

      const presence = ctx.createBiquadFilter();
      presence.type = "highshelf";
      presence.frequency.value = 3800;
      presence.gain.value = 2.2;

      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -18;
      compressor.knee.value = 10;
      compressor.ratio.value = 2.6;
      compressor.attack.value = 0.006;
      compressor.release.value = 0.2;

      const dry = ctx.createGain();
      dry.gain.value = 1;

      const dark = ctx.createBiquadFilter();
      dark.type = "lowpass";
      dark.frequency.value = 1600;

      const near = ctx.createDelay(0.5);
      near.delayTime.value = 0.046;
      const far = ctx.createDelay(0.5);
      far.delayTime.value = 0.132;
      const nearBack = ctx.createGain();
      nearBack.gain.value = 0.28;
      const wet = ctx.createGain();
      wet.gain.value = 0.22;

      src.connect(highpass);
      highpass.connect(presence);
      presence.connect(compressor);
      compressor.connect(dry);
      dry.connect(ctx.destination);

      compressor.connect(dark);
      dark.connect(near);
      near.connect(nearBack);
      nearBack.connect(near);
      near.connect(wet);
      dark.connect(far);
      far.connect(wet);
      wet.connect(ctx.destination);

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
