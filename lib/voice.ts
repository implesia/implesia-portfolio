type SpeakHooks = {
  onEnd?: () => void;
  onInterrupt?: () => void;
};

let voiceCtx: AudioContext | null = null;
let current: AudioBufferSourceNode | null = null;
let token = 0;
let onInterrupt: (() => void) | null = null;
const cache = new Map<string, Promise<AudioBuffer>>();

let roomCtx: AudioContext | null = null;
let roomInput: GainNode | null = null;
let roomWet: GainNode | null = null;

function ghostRoom(ctx: AudioContext) {
  if (roomInput && roomWet && roomCtx === ctx) return { input: roomInput, wet: roomWet };
  const input = ctx.createGain();
  const dark = ctx.createBiquadFilter();
  dark.type = "lowpass";
  dark.frequency.value = 2200;
  const wet = ctx.createGain();
  wet.gain.value = 0.12;
  input.connect(dark);
  for (const tap of [
    { delay: 0.011, feedback: 0.22 },
    { delay: 0.017, feedback: 0.16 },
    { delay: 0.023, feedback: 0.12 },
  ]) {
    const delay = ctx.createDelay(0.05);
    delay.delayTime.value = tap.delay;
    const feedback = ctx.createGain();
    feedback.gain.value = tap.feedback;
    dark.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
  }
  wet.connect(ctx.destination);
  roomCtx = ctx;
  roomInput = input;
  roomWet = wet;
  return { input, wet };
}

function openRoom() {
  if (!voiceCtx || !roomWet) return;
  const now = voiceCtx.currentTime;
  roomWet.gain.cancelScheduledValues(now);
  roomWet.gain.setTargetAtTime(0.12, now, 0.04);
}

function hushRoom() {
  if (!voiceCtx || !roomWet) return;
  const now = voiceCtx.currentTime;
  roomWet.gain.cancelScheduledValues(now);
  roomWet.gain.setTargetAtTime(0, now, 0.08);
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
  hushRoom();
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

      const lead = ctx.createGain();
      lead.gain.value = 1;
      src.connect(lead);
      lead.connect(ctx.destination);

      const room = ghostRoom(ctx);
      openRoom();
      src.connect(room.input);

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
