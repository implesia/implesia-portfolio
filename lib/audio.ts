const BED = "/audio/videoplayback.webm?v=20";
const OPEN = 0.52;
const UNDER = 0.3;

export class StormAudio {
  on = false;
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bed: HTMLAudioElement | null = null;
  private level = 0.82;
  private speaking = false;
  private stopTimer = 0;

  constructor() {
    if (typeof window === "undefined") return;
    const ctx = new AudioContext();
    this.ctx = ctx;
    const master = ctx.createGain();
    master.gain.value = UNDER;
    this.master = master;
    master.connect(ctx.destination);

    const bed = new Audio(BED);
    bed.loop = true;
    bed.preload = "auto";
    bed.addEventListener("ended", () => {
      if (!this.on) return;
      bed.currentTime = 0;
      void bed.play();
    });
    ctx.createMediaElementSource(bed).connect(master);
    this.bed = bed;
  }

  private bedGain(speaking: boolean) {
    return (speaking ? UNDER : OPEN) * this.level;
  }

  setLevel(level: number) {
    this.level = Math.min(1, Math.max(0, level));
    this.duck(this.speaking);
  }

  start() {
    if (this.on) return;
    this.on = true;
    window.clearTimeout(this.stopTimer);
    if (this.master && this.ctx) {
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(0, now);
      this.master.gain.setTargetAtTime(this.bedGain(this.speaking), now, 0.6);
    }
    void this.ctx?.resume();
    void this.bed?.play().catch(() => {
      /* the click was blocked or this browser cannot play the file */
    });
  }

  duck(speaking: boolean) {
    this.speaking = speaking;
    if (!this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.setTargetAtTime(this.bedGain(speaking), now, 0.55);
  }

  stop() {
    this.on = false;
    this.speaking = false;
    if (this.master && this.ctx) {
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(this.master.gain.value, now);
      this.master.gain.setTargetAtTime(0, now, 0.08);
    }
    const bed = this.bed;
    window.clearTimeout(this.stopTimer);
    this.stopTimer = window.setTimeout(() => {
      if (this.on || !bed) return;
      bed.pause();
      bed.currentTime = 0;
    }, 320);
  }
}
