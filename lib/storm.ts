import { emitFlash } from "@/lib/flash";

type Cloud = {
  sprite: HTMLCanvasElement;
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
};

type Point = [number, number];

/** One return stroke. Times are milliseconds from the start of the strike. */
type Stroke = {
  at: number;
  attack: number;
  peak: number;
  decay: number;
};

type Bolt = {
  main: Point[];
  branches: Point[][];
};

type Strike = {
  start: number;
  end: number;
  strokes: Stroke[];
  originX: number;
  left: number;
  top: number;
  w: number;
  h: number;
  from: number;
  to: number;
};

export function startStorm(
  canvas: HTMLCanvasElement,
  overlay: HTMLCanvasElement,
  reduced: boolean,
) {
  const ctx = canvas.getContext("2d", { alpha: false });
  const light = overlay.getContext("2d");
  if (!ctx || !light) return () => undefined;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let strike: Strike | null = null;
  let nextStrike = 0;
  let lit = false;
  let running = false;
  let disposed = false;
  let raf = 0;
  const clouds = makeClouds();
  const sprite = document.createElement("canvas");

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    for (const surface of [canvas, overlay]) {
      surface.width = Math.floor(width * dpr);
      surface.height = Math.floor(height * dpr);
    }
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    light!.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function setLit(on: boolean) {
    if (lit === on) return;
    lit = on;
    overlay.style.visibility = on ? "visible" : "hidden";
  }

  function paintStrike(now: number) {
    const current = strike;
    if (!current || !light) return;
    light.clearRect(0, 0, width, height);
    if (now >= current.end) {
      strike = null;
      setLit(false);
      return;
    }
    setLit(true);
    const t = now - current.start;
    const level = brightness(current.strokes, t);

    const sky = light.createRadialGradient(
      current.originX,
      height * 0.12,
      0,
      current.originX,
      height * 0.12,
      Math.max(width, height) * 1.1,
    );
    sky.addColorStop(0, `rgba(205, 255, 244, ${0.24 * level})`);
    sky.addColorStop(0.35, `rgba(170, 235, 222, ${0.11 * level})`);
    sky.addColorStop(1, `rgba(130, 205, 195, ${0.04 * level})`);
    light.fillStyle = sky;
    light.fillRect(0, 0, width, height);

    const lead = current.strokes[0].attack;
    light.save();
    if (t < lead) {
      const progress = t / lead;
      light.globalAlpha = 0.45 + 0.55 * progress;
      light.beginPath();
      light.rect(
        0,
        0,
        width,
        current.from + (current.to - current.from) * (1 - (1 - progress) ** 2),
      );
      light.clip();
    } else {
      light.globalAlpha = level ** 1.4;
    }
    light.drawImage(sprite, current.left, current.top, current.w, current.h);
    light.restore();
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
      const x =
        ((drift * cloud.speed + cloud.x) % (width + cloud.size)) -
        cloud.size * 0.5;
      const y = cloud.y * height + Math.sin(now * 0.00015 + cloud.x) * 18;
      ctx.globalAlpha = cloud.alpha;
      ctx.drawImage(
        cloud.sprite,
        x,
        y - cloud.size * 0.3,
        cloud.size,
        cloud.size * 0.7,
      );
    });
    ctx.restore();
    ctx.globalAlpha = 1;

    if (!reduced && !strike && now > nextStrike) {
      strike = makeStrike(sprite, now, width, height, dpr);
      nextStrike = now + 5000 + Math.random() * 7000;
      emitFlash();
    }
    if (strike) paintStrike(now);

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
    setLit(false);
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
  const fade = g.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.15,
    size / 2,
    size / 2,
    size * 0.5,
  );
  fade.addColorStop(0, "rgba(0,0,0,1)");
  fade.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = fade;
  g.fillRect(0, 0, size, size);
  return sprite;
}

function makeStrike(
  sprite: HTMLCanvasElement,
  now: number,
  width: number,
  height: number,
  dpr: number,
): Strike {
  const restrike = Math.random() < 0.65;
  const strokes: Stroke[] = [
    { at: 0, attack: 110, peak: 1, decay: restrike ? 180 : 300 },
  ];
  if (restrike) {
    strokes.push({
      at: 200 + Math.random() * 70,
      attack: 60,
      peak: 0.72 + Math.random() * 0.14,
      decay: 300,
    });
  }
  const last = strokes[strokes.length - 1];
  const life = last.at + last.attack + last.decay * Math.log(last.peak / 0.02);
  const bolt = makeBolt(width, height);
  return {
    start: now,
    end: now + life,
    strokes,
    originX: bolt.main[0][0],
    ...paintBolt(sprite, bolt, width, height, dpr),
  };
}

function brightness(strokes: Stroke[], t: number) {
  let value = 0;
  for (const stroke of strokes) {
    const dt = t - stroke.at;
    if (dt < 0) continue;
    const rise =
      dt < stroke.attack ? Math.sin((dt / stroke.attack) * Math.PI * 0.5) : 1;
    const fall =
      dt < stroke.attack ? 1 : Math.exp(-(dt - stroke.attack) / stroke.decay);
    value = Math.max(value, stroke.peak * rise * fall);
  }
  return value;
}

/** Bolts come down in the open sky left or right of the hero figure, and stop above the headline. */
function makeBolt(width: number, height: number): Bolt {
  const x0 =
    width *
    (Math.random() < 0.5
      ? 0.08 + Math.random() * 0.22
      : 0.7 + Math.random() * 0.22);
  const y0 = -height * 0.03;
  const y1 = height * (0.42 + Math.random() * 0.2);
  const steps = 8 + Math.floor(Math.random() * 3);
  const trunk: Point[] = [[x0, y0]];
  let x = x0;
  for (let i = 1; i <= steps; i++) {
    x = Math.min(
      width * 0.97,
      Math.max(width * 0.03, x + (Math.random() - 0.5) * width * 0.07),
    );
    trunk.push([
      x,
      y0 + ((y1 - y0) * i) / steps + (Math.random() - 0.5) * height * 0.015,
    ]);
  }
  const main = jag(trunk, 0.34, 2);
  const branches: Point[][] = [];
  const count = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    branches.push(
      makeBranch(
        main[Math.floor(main.length * (0.2 + Math.random() * 0.5))],
        width,
        height,
      ),
    );
  }
  return { main, branches };
}

function makeBranch(start: Point, width: number, height: number) {
  const dir = Math.random() < 0.5 ? -1 : 1;
  const points: Point[] = [start];
  let [x, y] = start;
  const steps = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < steps; i++) {
    x += dir * width * (0.01 + Math.random() * 0.025);
    y += height * (0.02 + Math.random() * 0.03);
    points.push([x, y]);
  }
  return jag(points, 0.4, 1);
}

/** Midpoint displacement, so long segments get small natural kinks. */
function jag(points: Point[], rough: number, depth: number) {
  let out = points;
  let amount = rough;
  for (let level = 0; level < depth; level++) {
    const next: Point[] = [out[0]];
    for (let i = 1; i < out.length; i++) {
      const [ax, ay] = out[i - 1];
      const [bx, by] = out[i];
      const shift = (Math.random() - 0.5) * amount;
      next.push(
        [(ax + bx) / 2 - (by - ay) * shift, (ay + by) / 2 + (bx - ax) * shift],
        out[i],
      );
    }
    out = next;
    amount *= 0.6;
  }
  return out;
}

/** Glow, body and core are painted once per strike; each frame only fades the sprite. */
function paintBolt(
  sprite: HTMLCanvasElement,
  bolt: Bolt,
  width: number,
  height: number,
  dpr: number,
) {
  const scale = Math.min(1.3, Math.max(0.9, Math.min(width, height) / 820));
  const points = [bolt.main, ...bolt.branches].flat();
  const xs = points.map((point) => point[0]);
  const ys = points.map((point) => point[1]);
  const pad = 44 * scale;
  const left = Math.min(...xs) - pad;
  const top = Math.min(...ys) - pad;
  const w = Math.max(...xs) + pad - left;
  const h = Math.max(...ys) + pad - top;
  sprite.width = Math.ceil(w * dpr);
  sprite.height = Math.ceil(h * dpr);
  const g = sprite.getContext("2d");
  if (g) {
    g.setTransform(dpr, 0, 0, dpr, -left * dpr, -top * dpr);
    g.lineCap = "round";
    g.lineJoin = "round";
    g.shadowColor = "rgba(150, 255, 228, 0.85)";
    g.shadowBlur = 26 * scale * dpr;
    trace(
      g,
      bolt,
      7 * scale,
      "rgba(185, 255, 238, 0.3)",
      "rgba(185, 255, 238, 0.18)",
    );
    g.shadowBlur = 0;
    trace(
      g,
      bolt,
      4 * scale,
      "rgba(220, 255, 247, 0.62)",
      "rgba(220, 255, 247, 0.4)",
    );
    trace(
      g,
      bolt,
      1.9 * scale,
      "rgba(255, 255, 255, 0.96)",
      "rgba(255, 255, 255, 0.72)",
    );
  }
  return { left, top, w, h, from: Math.min(...ys), to: Math.max(...ys) };
}

function trace(
  g: CanvasRenderingContext2D,
  bolt: Bolt,
  width: number,
  main: string,
  branch: string,
) {
  line(g, bolt.main, width, main);
  bolt.branches.forEach((points) => line(g, points, width * 0.52, branch));
}

function line(
  g: CanvasRenderingContext2D,
  points: Point[],
  width: number,
  color: string,
) {
  g.strokeStyle = color;
  g.lineWidth = width;
  g.beginPath();
  points.forEach(([x, y], index) => (index ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.stroke();
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
