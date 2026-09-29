import { emitFlash } from "@/lib/flash";

type Cloud = {
  sprite: HTMLCanvasElement;
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
};

export function startStorm(canvas: HTMLCanvasElement, reduced: boolean) {
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return () => undefined;

  let width = 0;
  let height = 0;
  let flash = 0;
  let bolt: Array<[number, number]> | null = null;
  let nextFlash = 0;
  let running = false;
  let disposed = false;
  let raf = 0;
  const clouds = makeClouds();

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function frame(now: number) {
    if (disposed || !ctx) return;
    ctx.fillStyle = "#07110f";
    ctx.fillRect(0, 0, width, height);

    const glow = ctx.createRadialGradient(
      width * 0.5,
      height * 0.4,
      40,
      width * 0.5,
      height * 0.42,
      Math.max(width, height) * 0.7,
    );
    glow.addColorStop(0, "rgba(36, 110, 96, 0.55)");
    glow.addColorStop(0.45, "rgba(10, 40, 36, 0.25)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    const drift = reduced ? 0 : now * 0.02;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    clouds.forEach((cloud) => {
      const x = ((drift * cloud.speed + cloud.x) % (width + cloud.size)) - cloud.size * 0.5;
      const y = cloud.y * height + Math.sin(now * 0.00015 + cloud.x) * 18;
      ctx.globalAlpha = cloud.alpha;
      ctx.drawImage(cloud.sprite, x, y - cloud.size * 0.3, cloud.size, cloud.size * 0.7);
    });
    ctx.restore();
    ctx.globalAlpha = 1;

    if (!reduced && now > nextFlash && flash <= 0) {
      flash = 1;
      bolt = makeBolt(width, height);
      nextFlash = now + 5000 + Math.random() * 7000;
      emitFlash();
    }

    if (flash > 0 && bolt) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = `rgba(226, 255, 248, ${0.35 + flash * 0.55})`;
      ctx.lineWidth = 2.2;
      ctx.shadowColor = "#d7fff4";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      bolt.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point[0], point[1]);
        else ctx.lineTo(point[0], point[1]);
      });
      ctx.stroke();
      ctx.fillStyle = `rgba(190, 255, 240, ${flash * 0.16})`;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
      flash -= 0.045;
    }

    if (!reduced && !document.hidden) {
      running = true;
      raf = requestAnimationFrame(frame);
    } else {
      running = false;
    }
  }

  function onVisibility() {
    if (!document.hidden && !running && !disposed) {
      running = true;
      raf = requestAnimationFrame(frame);
    }
  }

  resize();
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", onVisibility);
  running = true;
  raf = requestAnimationFrame(frame);

  return () => {
    disposed = true;
    running = false;
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", onVisibility);
  };
}

function makeClouds(): Cloud[] {
  return [0, 1, 2, 3, 4].map((index) => ({
    sprite: cloudSprite(420, index + 3),
    x: index * 180,
    y: 0.08 + (index % 3) * 0.22,
    size: 520 + index * 80,
    speed: 0.35 + index * 0.12,
    alpha: 0.72,
  }));
}

function cloudSprite(size: number, seed: number) {
  const sprite = document.createElement("canvas");
  sprite.width = size;
  sprite.height = size;
  const g = sprite.getContext("2d");
  if (!g) return sprite;
  const rand = mulberry32(seed * 997);
  for (let i = 0; i < 16; i++) {
    const x = rand() * size;
    const y = rand() * size * 0.7 + size * 0.1;
    const radius = size * (0.16 + rand() * 0.22);
    const gradient = g.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(214, 244, 232, ${0.22 + rand() * 0.28})`);
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    g.fillStyle = gradient;
    g.beginPath();
    g.arc(x, y, radius, 0, Math.PI * 2);
    g.fill();
  }
  g.globalCompositeOperation = "destination-in";
  const fade = g.createRadialGradient(size / 2, size / 2, size * 0.15, size / 2, size / 2, size * 0.5);
  fade.addColorStop(0, "rgba(0,0,0,1)");
  fade.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = fade;
  g.fillRect(0, 0, size, size);
  return sprite;
}

function makeBolt(width: number, height: number) {
  const points: Array<[number, number]> = [];
  let x = width * (0.3 + Math.random() * 0.4);
  let y = height * 0.08;
  points.push([x, y]);
  const steps = 9 + Math.floor(Math.random() * 4);
  for (let i = 0; i < steps; i++) {
    x += (Math.random() - 0.5) * width * 0.08;
    y += height * 0.08;
    points.push([x, y]);
    if (Math.random() > 0.72 && i > 2) {
      const fork: Array<[number, number]> = [[x, y]];
      let fx = x;
      let fy = y;
      for (let j = 0; j < 3; j++) {
        fx += (Math.random() - 0.3) * 36;
        fy += 28;
        fork.push([fx, fy]);
      }
      points.push(...fork.reverse(), [x, y]);
    }
  }
  return points;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
