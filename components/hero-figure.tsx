"use client";

import { useEffect, useRef } from "react";

const PLATE = "/hero-plate.jpg";
const WIDTH = 1280;
const HEIGHT = 720;

const HANDS = [
  { src: "/hero-hand-left.png", x: 260, y: 46, wristX: 346, wristY: 152, sign: -1, period: 6.6, phase: 0.2, swing: 0.092 },
  { src: "/hero-hand-right.png", x: 932, y: 30, wristX: 950, wristY: 158, sign: 1, period: 7.4, phase: 1.1, swing: 0.086 },
] as const;

function cover(boxW: number, boxH: number) {
  const scale = Math.max(boxW / WIDTH, boxH / HEIGHT);
  const dw = WIDTH * scale;
  const dh = HEIGHT * scale;
  return { scale, dx: (boxW - dw) * 0.5, dy: (boxH - dh) * 0.18, dw, dh };
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(src));
    image.src = src;
  });
}

export function HeroFigure() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let raf = 0;
    let alive = true;
    let plate: HTMLImageElement | null = null;
    let hands: HTMLImageElement[] = [];
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const paint = (now: number) => {
      if (!plate) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const cssW = canvas.clientWidth;
      const cssH = canvas.clientHeight;
      if (cssW < 2 || cssH < 2) return;
      const pxW = Math.round(cssW * dpr);
      const pxH = Math.round(cssH * dpr);
      if (canvas.width !== pxW || canvas.height !== pxH) {
        canvas.width = pxW;
        canvas.height = pxH;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const { scale, dx, dy, dw, dh } = cover(pxW, pxH);
      const seconds = now / 1000;
      ctx.clearRect(0, 0, pxW, pxH);
      ctx.drawImage(plate, dx, dy, dw, dh);
      HANDS.forEach((hand, index) => {
        const wave = Math.sin((seconds / hand.period) * Math.PI * 2 + hand.phase);
        const angle = motion.matches ? 0 : hand.sign * wave * hand.swing;
        const wx = dx + hand.wristX * scale;
        const wy = dy + hand.wristY * scale;
        ctx.save();
        ctx.translate(wx, wy);
        ctx.rotate(angle);
        ctx.translate(-wx, -wy);
        ctx.drawImage(hands[index], dx + hand.x * scale, dy + hand.y * scale, hands[index].width * scale, hands[index].height * scale);
        ctx.restore();
      });
    };

    const loop = (now: number) => {
      paint(now);
      if (!alive || motion.matches || document.hidden) return;
      raf = window.requestAnimationFrame(loop);
    };

    const wake = () => {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(loop);
    };

    void Promise.all([loadImage(PLATE), ...HANDS.map((hand) => loadImage(hand.src))]).then(([loaded, ...loadedHands]) => {
      if (!alive) return;
      plate = loaded;
      hands = loadedHands;
      wake();
    });

    const resize = new ResizeObserver(wake);
    resize.observe(canvas);
    document.addEventListener("visibilitychange", wake);
    motion.addEventListener("change", wake);

    return () => {
      alive = false;
      window.cancelAnimationFrame(raf);
      resize.disconnect();
      document.removeEventListener("visibilitychange", wake);
      motion.removeEventListener("change", wake);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="hero-figure"
      role="img"
      aria-label="A figure with raised hands over a field of machines in a storm"
    />
  );
}
