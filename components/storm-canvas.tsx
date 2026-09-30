"use client";

import { useEffect, useRef } from "react";
import { startStorm } from "@/lib/storm";

export function StormCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const lightRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const light = lightRef.current;
    if (!canvas || !light) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return startStorm(canvas, light, reduced);
  }, []);

  return (
    <>
      <canvas id="storm" ref={ref} aria-hidden="true" />
      <canvas id="lightning" ref={lightRef} aria-hidden="true" />
    </>
  );
}
