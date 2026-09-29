"use client";

import { useEffect, useRef } from "react";
import { startStorm } from "@/lib/storm";

export function StormCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return startStorm(canvas, reduced);
  }, []);

  return <canvas id="storm" ref={ref} aria-hidden="true" />;
}
