import gsap from "gsap";

/** Pointer-driven touches. Fine pointers only; motion is skipped when the user asks for less. */
export function startPointer(reduced: boolean) {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return () => undefined;

  const undo = [spotlight()];
  if (!reduced) undo.push(magnets(), heroDrift(), studioTilt());
  return () => undo.forEach((stop) => stop());
}

function spotlight() {
  let frame = 0;
  let pending: PointerEvent | null = null;

  const paint = () => {
    frame = 0;
    const event = pending;
    if (!event || !(event.target instanceof Element)) return;
    const card = event.target.closest<HTMLElement>(".spot");
    if (!card) return;
    const box = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${Math.round(event.clientX - box.left)}px`);
    card.style.setProperty("--my", `${Math.round(event.clientY - box.top)}px`);
  };
  const move = (event: PointerEvent) => {
    pending = event;
    if (!frame) frame = window.requestAnimationFrame(paint);
  };

  document.addEventListener("pointermove", move, { passive: true });
  return () => {
    document.removeEventListener("pointermove", move);
    window.cancelAnimationFrame(frame);
  };
}

function magnets() {
  const stops = Array.from(document.querySelectorAll<HTMLElement>("[data-magnetic]")).map((item) => {
    const toX = gsap.quickTo(item, "x", { duration: 0.6, ease: "power3.out" });
    const toY = gsap.quickTo(item, "y", { duration: 0.6, ease: "power3.out" });
    let box: DOMRect | null = null;

    const move = (event: PointerEvent) => {
      box ??= item.getBoundingClientRect();
      toX((event.clientX - box.left - box.width / 2) * 0.3);
      toY((event.clientY - box.top - box.height / 2) * 0.4);
    };
    const leave = () => {
      box = null;
      toX(0);
      toY(0);
    };

    item.addEventListener("pointermove", move);
    item.addEventListener("pointerleave", leave);
    return () => {
      item.removeEventListener("pointermove", move);
      item.removeEventListener("pointerleave", leave);
      gsap.killTweensOf(item);
      gsap.set(item, { clearProps: "transform" });
    };
  });
  return () => stops.forEach((stop) => stop());
}

function heroDrift() {
  const figure = document.querySelector<HTMLElement>(".hero .hero-figure");
  const copy = document.querySelector<HTMLElement>(".hero .hero-copy");
  if (!figure || !copy) return () => undefined;

  gsap.set(figure, { scale: 1.05 });
  const figureX = gsap.quickTo(figure, "x", { duration: 1.4, ease: "power3.out" });
  const figureY = gsap.quickTo(figure, "y", { duration: 1.4, ease: "power3.out" });
  const copyX = gsap.quickTo(copy, "x", { duration: 1.4, ease: "power3.out" });
  const copyY = gsap.quickTo(copy, "y", { duration: 1.4, ease: "power3.out" });

  const move = (event: PointerEvent) => {
    if (window.scrollY > window.innerHeight) return;
    const nx = event.clientX / window.innerWidth - 0.5;
    const ny = event.clientY / window.innerHeight - 0.5;
    figureX(nx * -24);
    figureY(ny * -14);
    copyX(nx * 12);
    copyY(ny * 7);
  };

  window.addEventListener("pointermove", move, { passive: true });
  return () => {
    window.removeEventListener("pointermove", move);
    gsap.killTweensOf([figure, copy]);
    gsap.set([figure, copy], { clearProps: "transform" });
  };
}

function studioTilt() {
  const frame = document.querySelector<HTMLElement>(".studio-wrap");
  const card = frame?.querySelector<HTMLElement>(".studio-card");
  if (!frame || !card) return () => undefined;

  const turnX = gsap.quickTo(card, "rotationX", { duration: 0.9, ease: "power3.out" });
  const turnY = gsap.quickTo(card, "rotationY", { duration: 0.9, ease: "power3.out" });

  const move = (event: PointerEvent) => {
    const box = frame.getBoundingClientRect();
    const nx = (event.clientX - box.left) / box.width - 0.5;
    const ny = (event.clientY - box.top) / box.height - 0.5;
    turnY(nx * 14);
    turnX(ny * -10);
    card.style.setProperty("--gx", `${((nx + 0.5) * 100).toFixed(1)}%`);
    card.style.setProperty("--gy", `${((ny + 0.5) * 100).toFixed(1)}%`);
  };
  const leave = () => {
    turnX(0);
    turnY(0);
  };

  frame.addEventListener("pointermove", move);
  frame.addEventListener("pointerleave", leave);
  return () => {
    frame.removeEventListener("pointermove", move);
    frame.removeEventListener("pointerleave", leave);
    gsap.killTweensOf(card);
    gsap.set(card, { clearProps: "transform" });
  };
}
