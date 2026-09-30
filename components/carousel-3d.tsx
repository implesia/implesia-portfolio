"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  startCarousel,
  type CarouselHandle,
  type CarouselVariant,
} from "@/lib/carousel";
import { useReducedMotion } from "@/lib/use-reduced-motion";

type Carousel3DProps<T> = {
  label: string;
  variant: CarouselVariant;
  items: readonly T[];
  /** Slides per second while it turns on its own. */
  speed: number;
  hint: string;
  touchHint: string;
  slideLabel: (item: T) => string;
  renderFace: (item: T) => ReactNode;
  /** Stands in the middle of the stage; the orbit passes in front of it and behind it. */
  centerpiece?: ReactNode;
  /** Decorative layer behind every slide. */
  backdrop?: ReactNode;
  /** Visual caption for the front slide. Slides must carry the same text for assistive tech. */
  renderCaption?: (item: T) => ReactNode;
};

export function Carousel3D<T>({
  label,
  variant,
  items,
  speed,
  hint,
  touchHint,
  slideLabel,
  renderFace,
  centerpiece,
  backdrop,
  renderCaption,
}: Carousel3DProps<T>) {
  const root = useRef<HTMLDivElement>(null);
  const handle = useRef<CarouselHandle | null>(null);
  const reduced = useReducedMotion();
  const [choice, setChoice] = useState<boolean | null>(null);
  const playing = choice ?? !reduced;
  const playingRef = useRef(playing);
  const count = items.length;

  useEffect(() => {
    playingRef.current = playing;
    handle.current?.setPlaying(playing);
  }, [playing]);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const carousel = startCarousel(node, {
      variant,
      speed,
      reduced,
      playing: playingRef.current,
    });
    handle.current = carousel;
    return () => {
      carousel.dispose();
      handle.current = null;
    };
  }, [variant, speed, reduced]);

  return (
    <div
      ref={root}
      className={`c3d c3d-${variant}`}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      style={{ "--count": count } as CSSProperties}
    >
      <div className="c3d-stage">
        {backdrop ? (
          <div className="c3d-backdrop" aria-hidden="true">
            {backdrop}
          </div>
        ) : null}
        {centerpiece ? (
          <div className="c3d-center" aria-hidden="true">
            {centerpiece}
          </div>
        ) : null}
        <div className="c3d-track">
          {items.map((item, index) => (
            <div
              key={index}
              className="c3d-slide"
              data-slide={index}
              role="group"
              aria-roledescription="slide"
              aria-label={`${slideLabel(item)}, ${index + 1} of ${count}`}
              style={
                {
                  "--i": index,
                  "--p": index > count / 2 ? index - count : index,
                } as CSSProperties
              }
            >
              <div className="c3d-face">
                {renderFace(item)}
                <span className="c3d-shade" aria-hidden="true" />
              </div>
            </div>
          ))}
        </div>
      </div>
      {renderCaption ? (
        <div className="c3d-captions c3d-hold" aria-hidden="true">
          {items.map((item, index) => (
            <div key={index} className="c3d-caption" data-slide={index}>
              {renderCaption(item)}
            </div>
          ))}
        </div>
      ) : null}
      <div className="c3d-bar">
        <button
          type="button"
          className="c3d-btn"
          aria-label="Previous slide"
          onClick={() => handle.current?.step(-1)}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="M10 3.5 5.5 8l4.5 4.5" />
          </svg>
        </button>
        <button
          type="button"
          className="c3d-btn c3d-toggle"
          aria-label={playing ? "Pause rotation" : "Resume rotation"}
          onClick={() => setChoice(!playing)}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            {playing ? (
              <path d="M6 4v8M10 4v8" />
            ) : (
              <path d="M5.5 3.8v8.4L12 8z" className="fill" />
            )}
          </svg>
        </button>
        <p className="c3d-count" aria-hidden="true">
          <b className="c3d-now">01</b> / {String(count).padStart(2, "0")}
        </p>
        <button
          type="button"
          className="c3d-btn"
          aria-label="Next slide"
          onClick={() => handle.current?.step(1)}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="M6 3.5 10.5 8 6 12.5" />
          </svg>
        </button>
      </div>
      <div className="c3d-meter" aria-hidden="true">
        <span />
        <span />
      </div>
      <p className="c3d-hint">
        <span className="c3d-hint-fine">{hint}</span>
        <span className="c3d-hint-touch">{touchHint}</span>
      </p>
    </div>
  );
}
