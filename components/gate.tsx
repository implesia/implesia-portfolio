"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

const STATUSES: Array<[number, string]> = [
  [0, "Drawing the weather…"],
  [28, "No footage on this page."],
  [58, "The room is almost ready."],
  [88, "Ready."],
];

type GateProps = {
  onSound: () => void;
  onEnter: () => void;
};

export function Gate({ onSound, onEnter }: GateProps) {
  const pctRef = useRef<HTMLParagraphElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [gone, setGone] = useState(false);
  const [soundOn, setSoundOn] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const proxy = { value: 0 };
    let lastStatus = "";
    const tween = gsap.to(proxy, {
      value: 100,
      duration: reduced ? 0.35 : 3.2,
      ease: "power2.out",
      onUpdate: () => {
        const progress = Math.round(proxy.value);
        if (pctRef.current) pctRef.current.textContent = `${progress}%`;
        if (ringRef.current)
          ringRef.current.style.strokeDashoffset = String(100 - progress);
        const line = [...STATUSES].reverse().find((row) => progress >= row[0]);
        if (line && statusRef.current && line[1] !== lastStatus) {
          lastStatus = line[1];
          statusRef.current.textContent = line[1];
        }
      },
      onComplete: () => setReady(true),
    });
    return () => {
      tween.kill();
    };
  }, []);

  useLayoutEffect(() => {
    if (!ready || !actionsRef.current) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const tween = gsap.fromTo(
      actionsRef.current,
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: reduced ? 0 : 0.55, ease: "power2.out" },
    );
    return () => {
      tween.kill();
    };
  }, [ready]);

  useLayoutEffect(() => {
    if (!ready) return;
    actionsRef.current?.querySelector("button")?.focus();
  }, [ready, soundOn]);

  function turnSoundOn() {
    onSound();
    setSoundOn(true);
  }

  function enter() {
    setGone(true);
    onEnter();
  }

  return (
    <div
      id="gate"
      className={gone ? "is-gone" : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gate-title"
    >
      <p className="wordmark gate-mark" id="gate-title">
        Tushar <span>Hossen</span>
      </p>
      <div className="ring-wrap">
        <svg className="ring" viewBox="0 0 200 200" aria-hidden="true">
          <circle
            className="ring-track"
            cx="100"
            cy="100"
            r="86"
            pathLength="100"
          />
          <circle
            className="ring-ticks"
            cx="100"
            cy="100"
            r="78"
            pathLength="100"
          />
          <circle
            ref={ringRef}
            className="ring-progress"
            cx="100"
            cy="100"
            r="86"
            pathLength="100"
          />
        </svg>
        <p className="ring-pct" ref={pctRef}>
          0%
        </p>
      </div>
      <p className="gate-status" ref={statusRef}>
        Drawing the weather…
      </p>
      <p className="gate-line">
        {soundOn
          ? "The storm is on. Step in when you are ready."
          : "The room stays quiet until you ask for the storm."}
      </p>
      <div className="gate-actions" ref={actionsRef} hidden={!ready}>
        {soundOn ? (
          <button type="button" className="btn btn-solid" onClick={enter}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M4 11h12.2l-4.6-4.6L13 5l7 7-7 7-1.4-1.4L16.2 13H4z"
              />
            </svg>
            Take me in
          </button>
        ) : (
          <button type="button" className="btn btn-solid" onClick={turnSoundOn}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M4 9v6h4l5 4V5L8 9H4zm11.5 3a3.5 3.5 0 0 0-1.8-3.06v6.12A3.5 3.5 0 0 0 15.5 12z"
              />
            </svg>
            Turn on the sound
          </button>
        )}
      </div>
      <p className="gate-note">
        No video. The storm is drawn in the browser. A larger screen carries it
        best.
      </p>
    </div>
  );
}
