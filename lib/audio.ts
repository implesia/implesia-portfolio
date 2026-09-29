import { onFlash } from "@/lib/flash";

export class StormAudio {
  on = false;
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sources: AudioScheduledSourceNode[] = [];
  private unlisten: (() => void) | null = null;
  private heart: number | null = null;

  start() {
    if (this.on) return;
    const ctx = new AudioContext();
    this.ctx = ctx;
    void ctx.resume();

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -14;
    compressor.knee.value = 8;
    compressor.ratio.value = 2.4;
    compressor.attack.value = 0.005;
    compressor.release.value = 0.22;

    const master = ctx.createGain();
    master.gain.value = 0.9;
    this.master = master;

    const tremolo = ctx.createGain();
    tremolo.gain.value = 1;
    master.connect(tremolo);
    tremolo.connect(compressor);
    compressor.connect(ctx.destination);

    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.22;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 0.22;
    lfo.connect(lfoDepth);
    lfoDepth.connect(tremolo.gain);
    lfo.start();
    this.sources.push(lfo);

    const drones: Array<{ freq: number; type: OscillatorType; gain: number }> = [
      { freq: 55, type: "sawtooth", gain: 0.07 },
      { freq: 58.27, type: "sine", gain: 0.16 },
      { freq: 82.41, type: "triangle", gain: 0.08 },
      { freq: 110, type: "sine", gain: 0.05 },
      { freq: 155.56, type: "sine", gain: 0.03 },
    ];
    drones.forEach((drone) => {
      const osc = ctx.createOscillator();
      osc.type = drone.type;
      osc.frequency.value = drone.freq;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = drone.type === "sawtooth" ? 240 : 900;
      const gain = ctx.createGain();
      gain.gain.value = drone.gain;
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      osc.start();
      this.sources.push(osc);
    });

    const wind = noiseBuffer(ctx, 3);
    const windSrc = ctx.createBufferSource();
    windSrc.buffer = wind;
    windSrc.loop = true;
    const windLow = ctx.createBiquadFilter();
    windLow.type = "lowpass";
    windLow.frequency.value = 380;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.55;
    windSrc.connect(windLow);
    windLow.connect(windGain);
    windGain.connect(master);
    windSrc.start();
    this.sources.push(windSrc);

    const air = ctx.createBufferSource();
    air.buffer = whiteBuffer(ctx, 2);
    air.loop = true;
    const airFilter = ctx.createBiquadFilter();
    airFilter.type = "bandpass";
    airFilter.frequency.value = 1400;
    airFilter.Q.value = 0.7;
    const airGain = ctx.createGain();
    airGain.gain.value = 0.08;
    air.connect(airFilter);
    airFilter.connect(airGain);
    airGain.connect(master);
    air.start();
    this.sources.push(air);

    this.on = true;
    this.hit(0.55);
    this.unlisten = onFlash(() => this.thunder());
    this.heart = window.setInterval(() => this.thump(), 2400);
  }

  duck(level: number) {
    if (!this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(level, now + 0.18);
  }

  stop() {
    this.on = false;
    this.unlisten?.();
    this.unlisten = null;
    if (this.heart !== null) {
      window.clearInterval(this.heart);
      this.heart = null;
    }
    this.sources.forEach((node) => {
      try {
        node.stop();
      } catch {
        /* already stopped */
      }
    });
    this.sources = [];
    void this.ctx?.close();
    this.ctx = null;
    this.master = null;
  }

  thunder() {
    this.hit(0.85);
  }

  private thump() {
    if (!this.on || !this.ctx || !this.master) return;
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(70, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(34, this.ctx.currentTime + 0.18);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.45, this.ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.28);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  private hit(level: number) {
    if (!this.ctx || !this.master) return;
    const dur = 1.4;
    const buffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * dur), this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / this.ctx.sampleRate;
      const env = Math.exp(-t * 2.4) * (0.4 + 0.6 * Math.exp(-t * 16));
      data[i] = (Math.random() * 2 - 1) * env;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    const now = this.ctx.currentTime;
    filter.frequency.setValueAtTime(520, now);
    filter.frequency.exponentialRampToValueAtTime(80, now + dur);
    const body = this.ctx.createOscillator();
    body.type = "sine";
    body.frequency.setValueAtTime(90, now);
    body.frequency.exponentialRampToValueAtTime(36, now + 0.7);
    const bodyGain = this.ctx.createGain();
    bodyGain.gain.setValueAtTime(level * 0.45, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
    const gain = this.ctx.createGain();
    gain.gain.value = level;
    src.connect(filter);
    filter.connect(gain);
    body.connect(bodyGain);
    bodyGain.connect(this.master);
    gain.connect(this.master);
    src.start();
    body.start();
    body.stop(now + 1);
  }
}

function noiseBuffer(ctx: AudioContext, seconds: number) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.08 * white) / 1.08;
    data[i] = last * 4.5;
  }
  return buffer;
}

function whiteBuffer(ctx: AudioContext, seconds: number) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}
