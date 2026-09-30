type Vec3 = [number, number, number];
type Edge = [number, number];

type Mesh = {
  verts: Vec3[];
  edges: Edge[];
  offset: Vec3;
  scale: number;
  spin: number;
  tilt: number;
  alpha: number;
  accent: boolean;
};

type Segment = {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  depth: number;
  alpha: number;
  accent: boolean;
};

const PHI = (1 + Math.sqrt(5)) / 2;

const ICO_VERTS: Vec3[] = [
  [-1, PHI, 0],
  [1, PHI, 0],
  [-1, -PHI, 0],
  [1, -PHI, 0],
  [0, -1, PHI],
  [0, 1, PHI],
  [0, -1, -PHI],
  [0, 1, -PHI],
  [PHI, 0, -1],
  [PHI, 0, 1],
  [-PHI, 0, -1],
  [-PHI, 0, 1],
];

const ICO_FACES: Array<[number, number, number]> = [
  [0, 11, 5],
  [0, 5, 1],
  [0, 1, 7],
  [0, 7, 10],
  [0, 10, 11],
  [1, 5, 9],
  [5, 11, 4],
  [11, 10, 2],
  [10, 7, 6],
  [7, 1, 8],
  [3, 9, 4],
  [3, 4, 2],
  [3, 2, 6],
  [3, 6, 8],
  [3, 8, 9],
  [4, 9, 5],
  [2, 4, 11],
  [6, 2, 10],
  [8, 6, 7],
  [9, 8, 1],
];

const OCT_VERTS: Vec3[] = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
];

const OCT_FACES: Array<[number, number, number]> = [
  [0, 2, 4],
  [0, 4, 3],
  [0, 3, 5],
  [0, 5, 2],
  [1, 2, 5],
  [1, 5, 3],
  [1, 3, 4],
  [1, 4, 2],
];

function edgesFromFaces(faces: Array<[number, number, number]>): Edge[] {
  const seen = new Set<string>();
  const edges: Edge[] = [];
  for (const [a, b, c] of faces) {
    for (const pair of [
      [a, b],
      [b, c],
      [c, a],
    ] as Edge[]) {
      const key = pair[0] < pair[1] ? `${pair[0]}-${pair[1]}` : `${pair[1]}-${pair[0]}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push(pair);
    }
  }
  return edges;
}

function torus(major: number, minor: number, radius: number, tube: number): { verts: Vec3[]; edges: Edge[] } {
  const verts: Vec3[] = [];
  const edges: Edge[] = [];
  for (let i = 0; i < major; i += 1) {
    for (let j = 0; j < minor; j += 1) {
      const u = (i / major) * Math.PI * 2;
      const v = (j / minor) * Math.PI * 2;
      const ring = radius + tube * Math.cos(v);
      verts.push([ring * Math.cos(u), tube * Math.sin(v), ring * Math.sin(u)]);
      const index = i * minor + j;
      edges.push([index, i * minor + ((j + 1) % minor)]);
      edges.push([index, ((i + 1) % major) * minor + j]);
    }
  }
  return { verts, edges };
}

function floorGrid(steps: number, span: number, y: number): { verts: Vec3[]; edges: Edge[] } {
  const verts: Vec3[] = [];
  const edges: Edge[] = [];
  const step = (span * 2) / steps;
  for (let i = 0; i <= steps; i += 1) {
    const at = -span + i * step;
    const row = verts.length;
    verts.push([-span, y, at], [span, y, at]);
    edges.push([row, row + 1]);
    const col = verts.length;
    verts.push([at, y, -span], [at, y, span]);
    edges.push([col, col + 1]);
  }
  return { verts, edges };
}

function rotateY(v: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c];
}

function rotateX(v: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c];
}

function buildScene(wide: boolean): Mesh[] {
  const grid = floorGrid(wide ? 12 : 8, wide ? 7.2 : 5.4, -1.7);
  const scene: Mesh[] = [
    {
      verts: grid.verts,
      edges: grid.edges,
      offset: [0, 0, 0],
      scale: 1,
      spin: 0,
      tilt: 0,
      alpha: 0.28,
      accent: false,
    },
    {
      verts: ICO_VERTS,
      edges: edgesFromFaces(ICO_FACES),
      offset: [-2.15, 0.35, 0.2],
      scale: 1.15,
      spin: 0.35,
      tilt: 0.22,
      alpha: 0.9,
      accent: true,
    },
    {
      verts: OCT_VERTS,
      edges: edgesFromFaces(OCT_FACES),
      offset: [2.25, 0.05, 0.55],
      scale: 0.92,
      spin: -0.48,
      tilt: 0.4,
      alpha: 0.82,
      accent: true,
    },
  ];

  if (wide) {
    const ring = torus(18, 7, 1.55, 0.38);
    scene.push({
      verts: ring.verts,
      edges: ring.edges,
      offset: [0.1, -0.15, -0.4],
      scale: 1.35,
      spin: 0.16,
      tilt: 0.9,
      alpha: 0.34,
      accent: false,
    });
  }

  return scene;
}

export function startDepth(canvas: HTMLCanvasElement, reduced: boolean) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => undefined;

  let width = 0;
  let height = 0;
  let disposed = false;
  let raf = 0;
  let wide = true;
  let scene = buildScene(true);
  let pointerX = 0;
  let pointerY = 0;
  let leanX = 0;
  let leanY = 0;
  const fine = window.matchMedia("(pointer: fine)").matches;

  function resize() {
    wide = window.innerWidth >= 700;
    scene = buildScene(wide);
    const dpr = Math.min(window.devicePixelRatio || 1, wide ? 1.6 : 1.25);
    width = canvas.clientWidth || window.innerWidth;
    height = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function shown() {
    const letter = document.getElementById("letter");
    // The Ask stage draws its own ring; the wireframe steps aside while it holds the middle of the screen.
    const ask = document.getElementById("ask")?.getBoundingClientRect();
    const middle = window.innerHeight / 2;
    const quiet = !!ask && ask.top < middle && ask.bottom > middle;
    const show = !quiet && !!letter && letter.getBoundingClientRect().top < window.innerHeight * 0.9;
    document.documentElement.classList.toggle("depth-on", show);
    return show;
  }

  function travel() {
    const letter = document.getElementById("letter");
    if (!letter) return 0;
    return Math.max(0, -letter.getBoundingClientRect().top);
  }

  function draw(now: number) {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    const seconds = reduced ? 1.4 : now / 1000;
    leanX += ((fine ? pointerX : 0) - leanX) * 0.06;
    leanY += ((fine ? pointerY : 0) - leanY) * 0.06;
    const yaw = seconds * 0.18 + travel() * 0.00035 + leanX * 0.55;
    const pitch = 0.18 + leanY * 0.28;
    const dolly = (wide ? 7.4 : 8.2) + Math.sin(seconds * 0.25) * (reduced ? 0 : 0.18);
    const focal = Math.min(width, height) * (wide ? 1.02 : 0.92);
    const horizon = height * (wide ? 0.44 : 0.36);
    const segments: Segment[] = [];

    for (const mesh of scene) {
      const spun = seconds * mesh.spin;
      const local: Array<Vec3 | null> = mesh.verts.map((vert) => {
        let point: Vec3 = [vert[0] * mesh.scale, vert[1] * mesh.scale, vert[2] * mesh.scale];
        point = rotateY(point, spun);
        point = rotateX(point, mesh.tilt + spun * 0.35);
        point = [point[0] + mesh.offset[0], point[1] + mesh.offset[1], point[2] + mesh.offset[2]];
        point = rotateY(point, yaw);
        point = rotateX(point, pitch);
        const z = point[2] + dolly;
        if (z < 0.45) return null;
        return [point[0], point[1], z];
      });

      mesh.edges.forEach((edge, index) => {
        const a = local[edge[0]];
        const b = local[edge[1]];
        if (!a || !b) return;
        const depth = (a[2] + b[2]) / 2;
        const fade = Math.max(0.08, 1 - (depth - 2.2) / 9);
        segments.push({
          ax: width / 2 + (a[0] * focal) / a[2],
          ay: horizon - (a[1] * focal) / a[2],
          bx: width / 2 + (b[0] * focal) / b[2],
          by: horizon - (b[1] * focal) / b[2],
          depth,
          alpha: mesh.alpha * fade,
          accent: mesh.accent && index % 5 === 0,
        });
      });
    }

    segments.sort((a, b) => b.depth - a.depth);
    for (const segment of segments) {
      ctx.beginPath();
      ctx.moveTo(segment.ax, segment.ay);
      ctx.lineTo(segment.bx, segment.by);
      ctx.strokeStyle = segment.accent
        ? `rgba(226, 61, 50, ${segment.alpha})`
        : `rgba(243, 238, 230, ${segment.alpha})`;
      ctx.lineWidth = segment.accent ? 1.4 : 1;
      ctx.stroke();
    }
  }

  function frame(now: number) {
    if (disposed) return;
    raf = window.requestAnimationFrame(frame);
    if (width < 2) resize();
    if (!shown()) return;
    draw(now);
  }

  function onPointer(event: PointerEvent) {
    pointerX = event.clientX / Math.max(window.innerWidth, 1) - 0.5;
    pointerY = event.clientY / Math.max(window.innerHeight, 1) - 0.5;
  }

  function onResize() {
    resize();
    if (reduced) draw(1400);
  }

  function onScroll() {
    if (reduced) {
      shown();
      draw(1400);
    }
  }

  resize();
  window.addEventListener("resize", onResize);
  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });

  if (reduced) {
    shown();
    draw(1400);
  } else {
    raf = window.requestAnimationFrame(frame);
  }

  return () => {
    disposed = true;
    document.documentElement.classList.remove("depth-on");
    window.cancelAnimationFrame(raf);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("pointermove", onPointer);
    window.removeEventListener("scroll", onScroll);
  };
}
