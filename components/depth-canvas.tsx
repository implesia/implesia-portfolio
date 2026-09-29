"use client";

import { useEffect, useRef } from "react";
import { startDepth } from "@/lib/depth";

export function DepthCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return startDepth(canvas, reduced);
  }, []);

  return <canvas id="depth" ref={ref} aria-hidden="true" />;
}
