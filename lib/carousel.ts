export type CarouselVariant = "orbit" | "wall";

export type CarouselHandle = {
  step: (direction: number) => void;
  setPlaying: (playing: boolean) => void;
  dispose: () => void;
};

type CarouselOptions = {
  variant: CarouselVariant;
  /** Slides per second while it turns on its own. */
  speed: number;
  playing: boolean;
  reduced: boolean;
};

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;
/** Seconds to ease into the cruise speed, and to ease out of it. */
const RISE = 1.2;
const FALL = 0.4;
/** After a drag, a click or a key, the chosen slide stays in front this long. */
const HOLD = 2600;

/** The orbit is laid out against the figure; lengths are shares of the figure's height. */
const ORBIT = {
  /** Centre of the ring, measured down from the top of the figure. */
  core: 0.35,
  /** How far out a card passes at the sides. Also capped by the stage width. */
  reach: 0.64,
  /** How far below the centre the front card passes; the back card passes half as far above. */
  rise: 0.21,
  bob: 0.011,
  /** Degrees the whole ring leans in the picture plane. */
  roll: -5,
  /** Degrees a card turns outward at the sides. */
  turn: 28,
  /**
   * Depth at which a card moves in front of the figure. A card is furthest from the
   * figure's silhouette at depth 1/3, so the swap is not visible there.
   */
  flip: 0.3,
  /** Seconds for one card to swirl into place, and the delay between cards. */
  intro: 1.9,
  stagger: 0.09,
} as const;

export function startCarousel(
  root: HTMLElement,
  options: CarouselOptions,
): CarouselHandle {
  const stage = root.querySelector<HTMLElement>(".c3d-stage");
  const track = root.querySelector<HTMLElement>(".c3d-track");
  const slides = Array.from(root.querySelectorAll<HTMLElement>(".c3d-slide"));
  if (!stage || !track || slides.length < 3) {
    return {
      step: () => undefined,
      setPlaying: () => undefined,
      dispose: () => undefined,
    };
  }
  return spin(root, stage, track, slides, options);
}

function spin(
  root: HTMLElement,
  stage: HTMLElement,
  track: HTMLElement,
  slides: HTMLElement[],
  options: CarouselOptions,
): CarouselHandle {
  const count = slides.length;
  const orbit = options.variant === "orbit";
  const shades = slides.map((slide) =>
    slide.querySelector<HTMLElement>(".c3d-shade"),
  );
  const center = root.querySelector<HTMLElement>(".c3d-center");
  const captions = Array.from(
    root.querySelectorAll<HTMLElement>(".c3d-caption"),
  );
  const counter = root.querySelector<HTMLElement>(".c3d-now");
  const meters = Array.from(
    root.querySelectorAll<HTMLElement>(".c3d-meter span"),
  );
  const lean =
    !options.reduced &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const spring = options.reduced ? 10 : 4.4;
  const shadeNow = slides.map(() => -1);
  const fadeNow = slides.map(() => -1);
  const blurNow = slides.map(() => -1);
  const layerNow = slides.map(() => -1);
  const seeds = slides.map((_, index) => {
    const noise = (salt: number) => {
      const value =
        Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
      return value - Math.floor(value);
    };
    return {
      tilt: (noise(1) - 0.5) * 11,
      phase: noise(2) * TAU,
      rate: 0.7 + noise(3) * 0.45,
      sway: noise(4) * TAU,
    };
  });
  const introLength = ORBIT.intro + ORBIT.stagger * count;

  let offset = 0;
  let velocity = 0;
  let target: number | null = null;
  let playing = options.playing;
  let hovering = false;
  let focused = false;
  let visible = false;
  let holdUntil = 0;
  let raf = 0;
  let last = 0;
  let front = -1;
  let drawn = "";
  let figureDrawn = "";

  let spread = 0;
  let radius = 0;
  let stepPx = 1;
  const ring = {
    cx: 0,
    cy: 0,
    reach: 0,
    rise: 0,
    bob: 0,
    blur: 0,
    perspective: 0,
    halfW: 0,
    halfH: 0,
  };
  let clock = 0;
  /** Seconds of intro played so far; it only advances on drawn frames. */
  let introTime: number | null = null;
  let introDone = !orbit || options.reduced;

  let aimX = 0;
  let aimY = 0;
  let leanX = 0;
  let leanY = 0;

  let pointer = -1;
  let downX = 0;
  let downY = 0;
  let grabX = 0;
  let grabOffset = 0;
  let dragging = false;
  let swallow = false;
  let trail: Array<[number, number]> = [];

  const wrap = (value: number) => ((value % count) + count) % count;
  const nearest = (index: number) =>
    index + Math.round((offset - index) / count) * count;
  const floating = () => orbit && !options.reduced && playing;

  function measure() {
    const width = slides[0].offsetWidth || 1;
    if (orbit) {
      const stageWidth = stage.clientWidth;
      const figureTop = center ? center.offsetTop : 0;
      const figureHeight = center ? center.offsetHeight : stage.clientHeight;
      ring.halfW = width / 2;
      ring.halfH = slides[0].offsetHeight / 2;
      ring.cx = stageWidth / 2;
      ring.cy = figureTop + figureHeight * ORBIT.core;
      ring.reach = Math.min(stageWidth * 0.42, figureHeight * ORBIT.reach);
      ring.rise = figureHeight * ORBIT.rise;
      ring.bob = figureHeight * ORBIT.bob;
      ring.blur = ring.halfW / 55;
      ring.perspective = Math.round(width * 3.4);
      stepPx = Math.max(120, ring.reach * 0.9);
    } else {
      const spacing = width * (window.innerWidth < 700 ? 1.05 : 1.1);
      radius = width * 2.8;
      spread = spacing / radius / DEG;
      stepPx = spacing;
    }
    drawn = "";
    figureDrawn = "";
  }

  /** Skips changes too small to see, but always lands exactly on 0 and 1. */
  const unchanged = (value: number, last: number) =>
    value === last || (value > 0 && value < 1 && Math.abs(value - last) < 0.004);

  function shade(index: number, value: number) {
    const node = shades[index];
    if (!node || unchanged(value, shadeNow[index])) return;
    shadeNow[index] = value;
    node.style.opacity = value.toFixed(3);
  }

  function fade(index: number, value: number) {
    if (unchanged(value, fadeNow[index])) return;
    fadeNow[index] = value;
    slides[index].style.opacity = value.toFixed(3);
  }

  function blur(index: number, value: number) {
    const px = Math.round(value * 10) / 10;
    if (px === blurNow[index]) return;
    blurNow[index] = px;
    slides[index].style.filter = px > 0 ? `blur(${px}px)` : "";
  }

  function layer(index: number, value: number) {
    if (value === layerNow[index]) return;
    layerNow[index] = value;
    slides[index].style.zIndex = String(value);
  }

  function revealOf(index: number) {
    if (introDone) return 1;
    if (introTime === null) return 0;
    const t = (introTime - index * ORBIT.stagger) / ORBIT.intro;
    return Math.min(1, Math.max(0, t));
  }

  function renderOrbit() {
    const yaw = leanX * 0.2;
    const rise = ring.rise * (1 - leanY * 0.5);
    const roll = ORBIT.roll * DEG;
    const cosRoll = Math.cos(roll);
    const sinRoll = Math.sin(roll);
    for (let index = 0; index < count; index += 1) {
      const seed = seeds[index];
      const away = (1 - revealOf(index)) ** 3;
      const angle = ((index - offset) / count) * TAU + yaw - away * 1.7;
      const depth = Math.cos(angle);
      const scale = 2 / (3 - depth);
      const x = ring.reach * 1.5 * Math.sin(angle) * scale * (1 + away * 0.6);
      const y = rise * depth * scale;
      const bob = Math.sin(clock * seed.rate + seed.phase) * ring.bob * scale;
      const left = ring.cx + x * cosRoll - y * sinRoll - ring.halfW;
      const top = ring.cy + x * sinRoll + y * cosRoll + bob - ring.halfH;
      const turn = Math.sin(angle) * ORBIT.turn;
      const tilt = seed.tilt + Math.sin(clock * 0.5 + seed.sway) * 1.5;
      slides[index].style.transform =
        `translate3d(${left.toFixed(1)}px, ${top.toFixed(1)}px, 0) scale(${scale.toFixed(4)}) perspective(${ring.perspective}px) rotateY(${turn.toFixed(2)}deg) rotate(${tilt.toFixed(2)}deg)`;
      const back = (1 - depth) / 2;
      shade(index, back ** 1.35 * 0.62);
      blur(index, Math.max(0, (back - 0.42) / 0.58) * ring.blur + away * 4);
      fade(index, 1 - away);
      layer(
        index,
        (depth > ORBIT.flip ? 101 : 1) + Math.round((depth + 1) * 24),
      );
    }
    if (center) {
      const key = `${leanX.toFixed(4)}|${leanY.toFixed(4)}`;
      if (key !== figureDrawn) {
        figureDrawn = key;
        center.style.transform = `translate3d(${(-leanX * 18).toFixed(2)}px, ${(-leanY * 10).toFixed(2)}px, 0)`;
      }
    }
  }

  function renderWall() {
    track.style.transform = `rotateX(${(leanY * -5).toFixed(2)}deg) rotateY(${(leanX * 8).toFixed(2)}deg)`;
    for (let index = 0; index < count; index += 1) {
      let place = wrap(index - offset);
      if (place > count / 2) place -= count;
      slides[index].style.transform =
        `translateZ(${radius.toFixed(1)}px) rotateY(${(-place * spread).toFixed(3)}deg) translateZ(${(-radius).toFixed(1)}px)`;
      fade(
        index,
        Math.min(1, Math.max(0, (count / 2 - Math.abs(place)) / 0.8)),
      );
      shade(index, Math.min(1, Math.abs(place)) * 0.55);
    }
  }

  function render() {
    const moving = orbit
      ? `|${clock.toFixed(3)}|${introDone ? "" : (introTime ?? -1).toFixed(3)}`
      : "";
    const key = `${offset.toFixed(5)}|${leanX.toFixed(4)}|${leanY.toFixed(4)}${moving}`;
    if (key === drawn) return;
    drawn = key;

    if (orbit) renderOrbit();
    else renderWall();

    const index = wrap(Math.round(offset));
    if (index !== front) {
      if (front >= 0) {
        slides[front].classList.remove("is-front");
        captions[front]?.classList.remove("is-front");
      }
      slides[index].classList.add("is-front");
      captions[index]?.classList.add("is-front");
      front = index;
      if (counter) counter.textContent = String(index + 1).padStart(2, "0");
    }
    const position = wrap(offset);
    meters.forEach((meter, lap) => {
      meter.style.transform = `translateX(${((position - lap * count) * 100).toFixed(2)}%)`;
    });
  }

  function tick(time: number) {
    raf = 0;
    const dt = Math.min(0.05, Math.max(0, (time - last) / 1000));
    last = time;

    if (lean) {
      const ease = 1 - Math.exp(-dt / 0.45);
      leanX += (aimX - leanX) * ease;
      leanY += (aimY - leanY) * ease;
    }
    if (floating()) clock += dt;
    if (!introDone && introTime !== null) {
      introTime += dt;
      if (introTime >= introLength) introDone = true;
    }

    const cruising = playing && !hovering && !focused;
    if (!dragging) {
      if (target !== null) {
        for (let left = dt; left > 0; left -= 1 / 120) {
          const h = Math.min(left, 1 / 120);
          velocity +=
            (-spring * spring * (offset - target) - 2 * spring * velocity) * h;
          offset += velocity * h;
        }
        if (Math.abs(offset - target) < 0.001 && Math.abs(velocity) < 0.004) {
          offset = target;
          velocity = 0;
          target = null;
        }
      } else {
        const run = cruising && time >= holdUntil;
        velocity +=
          ((run ? options.speed : 0) - velocity) *
          (1 - Math.exp(-dt / (run ? RISE : FALL)));
        if (!run && Math.abs(velocity) < 0.0004) velocity = 0;
        offset += velocity * dt;
      }
      if (offset < 0 || offset >= count) {
        const shift = Math.floor(offset / count) * count;
        offset -= shift;
        if (target !== null) target -= shift;
      }
    }

    render();

    const settled =
      !dragging &&
      target === null &&
      velocity === 0 &&
      !cruising &&
      !floating() &&
      (introDone || introTime === null) &&
      Math.abs(aimX - leanX) + Math.abs(aimY - leanY) < 0.002;
    if (visible && !document.hidden && !settled)
      raf = window.requestAnimationFrame(tick);
  }

  function wake() {
    if (raf || !visible || document.hidden) return;
    last = performance.now();
    raf = window.requestAnimationFrame(tick);
  }

  function moveTo(goal: number) {
    target = goal;
    holdUntil = performance.now() + HOLD;
    wake();
  }

  function onDown(event: PointerEvent) {
    if (event.button !== 0 || pointer !== -1) return;
    pointer = event.pointerId;
    downX = grabX = event.clientX;
    downY = event.clientY;
    grabOffset = offset;
    swallow = false;
    trail = [[event.timeStamp, event.clientX]];
  }

  function onMove(event: PointerEvent) {
    if (lean && event.pointerType === "mouse" && !dragging) {
      const box = stage.getBoundingClientRect();
      aimX = Math.max(
        -0.5,
        Math.min(0.5, (event.clientX - box.left) / box.width - 0.5),
      );
      aimY = Math.max(
        -0.5,
        Math.min(0.5, (event.clientY - box.top) / box.height - 0.5),
      );
      wake();
    }
    if (event.pointerId !== pointer) return;
    if (!dragging) {
      const dx = event.clientX - downX;
      const dy = event.clientY - downY;
      if (Math.abs(dx) < 7) return;
      if (Math.abs(dy) > Math.abs(dx)) {
        pointer = -1;
        return;
      }
      dragging = true;
      target = null;
      velocity = 0;
      grabX = event.clientX;
      grabOffset = offset;
      root.classList.add("is-dragging");
      try {
        stage.setPointerCapture(pointer);
      } catch {
        /* the pointer is already gone */
      }
    }
    offset = grabOffset - (event.clientX - grabX) / stepPx;
    trail.push([event.timeStamp, event.clientX]);
    while (trail.length > 2 && event.timeStamp - trail[0][0] > 90)
      trail.shift();
    wake();
  }

  function onUp(event: PointerEvent) {
    if (event.pointerId !== pointer) return;
    // Touch input is implicitly captured by the element under the finger. Moving the
    // capture to the stage fires lostpointercapture on that element, and it bubbles here.
    if (event.type === "lostpointercapture" && event.target !== stage) return;
    pointer = -1;
    if (!dragging) return;
    dragging = false;
    swallow = event.type === "pointerup";
    root.classList.remove("is-dragging");
    const [t0, x0] = trail[0];
    const [t1, x1] = trail[trail.length - 1];
    const fresh = event.timeStamp - t1 < 80;
    const fling = fresh
      ? (-(x1 - x0) / stepPx) * (1000 / Math.max(16, t1 - t0))
      : 0;
    velocity = Math.max(-5, Math.min(5, fling));
    moveTo(Math.round(offset + velocity * 0.3));
  }

  function onClick(event: MouseEvent) {
    if (swallow) {
      swallow = false;
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const slide =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>(".c3d-slide")
        : null;
    if (!slide) return;
    const goal = nearest(Number(slide.dataset.slide));
    if (Math.abs(goal - offset) > 0.3) {
      event.preventDefault();
      moveTo(goal);
    }
  }

  function onOver(event: PointerEvent) {
    if (event.pointerType !== "mouse") return;
    const over =
      event.target instanceof Element &&
      !!event.target.closest(".c3d-slide, .c3d-hold");
    if (over === hovering) return;
    hovering = over;
    wake();
  }

  function onOut(event: PointerEvent) {
    if (event.pointerType !== "mouse" || !hovering) return;
    hovering = false;
    wake();
  }

  function onLeave(event: PointerEvent) {
    if (event.pointerType !== "mouse") return;
    aimX = 0;
    aimY = 0;
    wake();
  }

  function onFocusIn(event: FocusEvent) {
    const node = event.target instanceof HTMLElement ? event.target : null;
    if (!node) return;
    let keyboard = true;
    try {
      keyboard = node.matches(":focus-visible");
    } catch {
      /* older engines: treat focus as keyboard focus */
    }
    const slide = node.closest<HTMLElement>(".c3d-slide");
    focused = keyboard && !!slide;
    if (slide && keyboard) moveTo(nearest(Number(slide.dataset.slide)));
    wake();
  }

  function onFocusOut(event: FocusEvent) {
    if (
      event.relatedTarget instanceof Node &&
      root.contains(event.relatedTarget)
    )
      return;
    focused = false;
    wake();
  }

  function onKey(event: KeyboardEvent) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    moveTo(
      (target ?? Math.round(offset)) + (event.key === "ArrowRight" ? 1 : -1),
    );
  }

  function onVisibility() {
    if (!document.hidden) wake();
  }

  const blockDrag = (event: DragEvent) => event.preventDefault();

  measure();
  render();

  const watch = new IntersectionObserver(
    (entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (visible) wake();
    },
    { rootMargin: "120px 0px" },
  );
  watch.observe(root);
  const arrive = introDone
    ? null
    : new IntersectionObserver(
        (entries) => {
          if (
            introTime !== null ||
            !entries.some((entry) => entry.isIntersecting)
          )
            return;
          introTime = 0;
          arrive?.disconnect();
          wake();
        },
        { threshold: 0.3 },
      );
  arrive?.observe(stage);
  const resize = new ResizeObserver(() => {
    measure();
    render();
  });
  resize.observe(stage);

  stage.addEventListener("pointerdown", onDown);
  stage.addEventListener("pointermove", onMove);
  stage.addEventListener("pointerup", onUp);
  stage.addEventListener("pointercancel", onUp);
  stage.addEventListener("lostpointercapture", onUp);
  stage.addEventListener("pointerleave", onLeave);
  stage.addEventListener("click", onClick, true);
  stage.addEventListener("dragstart", blockDrag);
  root.addEventListener("pointerover", onOver);
  root.addEventListener("pointerleave", onOut);
  root.addEventListener("focusin", onFocusIn);
  root.addEventListener("focusout", onFocusOut);
  root.addEventListener("keydown", onKey);
  document.addEventListener("visibilitychange", onVisibility);

  return {
    step(direction) {
      moveTo((target ?? Math.round(offset)) + direction);
    },
    setPlaying(next) {
      playing = next;
      if (next) holdUntil = 0;
      else if (target === null && !dragging)
        target = Math.round(offset + velocity * 0.4);
      wake();
    },
    dispose() {
      window.cancelAnimationFrame(raf);
      raf = 0;
      watch.disconnect();
      arrive?.disconnect();
      resize.disconnect();
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onUp);
      stage.removeEventListener("lostpointercapture", onUp);
      stage.removeEventListener("pointerleave", onLeave);
      stage.removeEventListener("click", onClick, true);
      stage.removeEventListener("dragstart", blockDrag);
      root.removeEventListener("pointerover", onOver);
      root.removeEventListener("pointerleave", onOut);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
      root.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVisibility);
      root.classList.remove("is-dragging");
      slides.forEach((slide) => slide.classList.remove("is-front"));
      captions.forEach((caption) => caption.classList.remove("is-front"));
    },
  };
}
