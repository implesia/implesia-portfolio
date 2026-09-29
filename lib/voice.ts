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

      const shade = ctx.createBiquadFilter();
      shade.type = "lowpass";
      shade.frequency.value = 1100;

      const ghost = ctx.createDelay(0.3);
      ghost.delayTime.value = 0.12;

      const wet = ctx.createGain();
      wet.gain.value = 0.18;

      src.connect(ctx.destination);
      src.connect(shade);
      shade.connect(ghost);
      ghost.connect(wet);
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
