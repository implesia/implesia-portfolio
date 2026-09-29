const BED = "/audio/ghost-bed.wav?v=room";
const OPEN = 0.8;
const UNDER = 0.5;

export class StormAudio {
  on = false;
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private source: AudioBufferSourceNode | null = null;
  private ready: AudioBuffer | null = null;
  private want = false;

  constructor() {
    if (typeof window === "undefined") return;
    const ctx = new AudioContext();
    this.ctx = ctx;
    const master = ctx.createGain();
    master.gain.value = UNDER;
    this.master = master;
    master.connect(ctx.destination);
    void fetch(BED)
      .then((response) => {
        if (!response.ok) throw new Error(BED);
        return response.arrayBuffer();
      })
      .then((bytes) => ctx.decodeAudioData(bytes))
      .then((buffer) => {
        this.ready = buffer;
        if (this.want) this.play();
      })
      .catch(() => {
        this.ready = null;
      });
  }

  start() {
    if (this.on) return;
    this.on = true;
    this.want = true;
    void this.ctx?.resume();
    this.play();
  }

  duck(speaking: boolean) {
    if (!this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.setTargetAtTime(speaking ? UNDER : OPEN, now, 0.45);
  }

  stop() {
    this.on = false;
    this.want = false;
    if (this.source) {
      try {
        this.source.stop();
      } catch {
        /* already stopped */
      }
      this.source = null;
    }
    if (this.master && this.ctx) this.master.gain.value = UNDER;
  }

  private play() {
    if (!this.want || !this.ctx || !this.master || !this.ready || this.source) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.ready;
    src.loop = true;
    src.connect(this.master);
    src.start();
    this.source = src;
  }
}
