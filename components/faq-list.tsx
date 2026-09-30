"use client";

import {
  Fragment,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { QUESTIONS, WORK } from "@/lib/content";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { voiceLevel } from "@/lib/voice";

type FaqListProps = {
  onSpeak: (voice: string, onEnd: () => void, onInterrupt: () => void) => void;
  onSilence: () => void;
};

/**
 * One seat per question, in ring radii from the ring's centre. x is the card's inner edge, so a
 * longer question grows outward, away from the figure; y is the card's middle. The right arc sits
 * a little higher than the left.
 */
const SEATS = [
  { x: -0.56, y: -0.8, tilt: -3 },
  { x: -0.9, y: -0.46, tilt: 4.5 },
  { x: -1.02, y: 0.03, tilt: -3 },
  { x: -0.9, y: 0.47, tilt: 5 },
  { x: -0.54, y: 0.82, tilt: -3 },
  { x: 0.44, y: -0.86, tilt: 3 },
  { x: 0.84, y: -0.53, tilt: -3 },
  { x: 0.99, y: -0.07, tilt: 2 },
  { x: 0.88, y: 0.42, tilt: -2.5 },
  { x: 0.52, y: 0.76, tilt: 3.5 },
] as const;

/** The dial: 72 ticks on the ring, a longer one every 30 degrees. */
const TICKS = Array.from({ length: 72 }, (_, i) => {
  const angle = (i / 72) * Math.PI * 2;
  const inner = i % 6 === 0 ? 92.5 : 95.6;
  const x = Math.cos(angle);
  const y = Math.sin(angle);
  return `M${(x * 98).toFixed(2)} ${(y * 98).toFixed(2)}L${(x * inner).toFixed(2)} ${(y * inner).toFixed(2)}`;
}).join("");

/** Beads on an inner orbit, one for each question. */
const BEADS = QUESTIONS.map((_, i) => {
  const angle = (i / QUESTIONS.length) * Math.PI * 2 - Math.PI / 2;
  return { x: (Math.cos(angle) * 82).toFixed(2), y: (Math.sin(angle) * 82).toFixed(2) };
});

const GHOSTS = [...WORK, ...WORK.slice(0, 2)].map((item) => item.image);

const noSubscribe = () => () => undefined;

export function FaqList({ onSpeak, onSilence }: FaqListProps) {
  const id = useId();
  const reduced = useReducedMotion();
  const hydrated = useSyncExternalStore(noSubscribe, () => true, () => false);
  const stageRef = useRef<HTMLDivElement>(null);
  const figureRef = useRef<HTMLDivElement>(null);
  const answers = useRef<Array<HTMLDivElement | null>>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [speaking, setSpeaking] = useState<number | null>(null);
  const [arrived, setArrived] = useState(false);

  function press(index: number) {
    if (open === index) {
      onSilence();
      setOpen(null);
      setSpeaking(null);
      return;
    }
    const done = () => setSpeaking((current) => (current === index ? null : current));
    setOpen(index);
    setSpeaking(index);
    onSpeak(QUESTIONS[index].voice, done, done);
    // Under 900px the answer grows in place, so wait for it to finish opening before measuring.
    window.setTimeout(() => {
      const answer = answers.current[index];
      if (answer?.classList.contains("is-open")) answer.scrollIntoView({ block: "nearest" });
    }, reduced ? 0 : 480);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Escape" || open === null) return;
    event.stopPropagation();
    press(open);
  }

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const watch = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setArrived(true);
        watch.disconnect();
      },
      { threshold: 0.25 },
    );
    watch.observe(stage);
    return () => watch.disconnect();
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const section = stage?.closest("section");
    if (!stage || !section || reduced) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let frame = 0;
    let x = 0;
    let y = 0;
    const paint = () => {
      frame = 0;
      stage.style.setProperty("--px", x.toFixed(3));
      stage.style.setProperty("--py", y.toFixed(3));
    };
    const queue = () => {
      if (!frame) frame = window.requestAnimationFrame(paint);
    };
    const move = (event: PointerEvent) => {
      const box = stage.getBoundingClientRect();
      x = Math.max(-1, Math.min(1, ((event.clientX - box.left) / box.width) * 2 - 1));
      y = Math.max(-1, Math.min(1, ((event.clientY - box.top) / box.height) * 2 - 1));
      queue();
    };
    const leave = () => {
      x = 0;
      y = 0;
      queue();
    };

    section.addEventListener("pointermove", move);
    section.addEventListener("pointerleave", leave);
    return () => {
      section.removeEventListener("pointermove", move);
      section.removeEventListener("pointerleave", leave);
      window.cancelAnimationFrame(frame);
      stage.style.removeProperty("--px");
      stage.style.removeProperty("--py");
    };
  }, [reduced]);

  useEffect(() => {
    const figure = figureRef.current;
    if (speaking === null || reduced || !figure) return;

    let frame = 0;
    let level = 0;
    const follow = () => {
      const target = voiceLevel();
      level += (target - level) * (target > level ? 0.5 : 0.1);
      figure.style.setProperty("--level", level.toFixed(3));
      frame = window.requestAnimationFrame(follow);
    };
    frame = window.requestAnimationFrame(follow);
    return () => {
      window.cancelAnimationFrame(frame);
      figure.style.removeProperty("--level");
    };
  }, [speaking, reduced]);

  const stageClass = [
    "ask-stage",
    hydrated && "is-armed",
    arrived && "is-arrived",
    open !== null && "is-open",
    speaking !== null && "is-speaking",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={stageRef} className={stageClass} onKeyDown={onKeyDown}>
      <div className="ask-scene" aria-hidden="true">
        <div className="ask-ghosts">
          {GHOSTS.map((src, index) => (
            <span className="ask-ghost" key={index}>
              <img src={src} alt="" loading="lazy" decoding="async" draggable={false} />
            </span>
          ))}
        </div>
        <div className="ask-ring">
          <svg className="ask-dial" viewBox="-100 -100 200 200" focusable="false">
            <circle className="ask-dial-line" r="98" pathLength={100} transform="rotate(-90)" />
            <path className="ask-dial-ticks" d={TICKS} />
          </svg>
          <svg className="ask-beads" viewBox="-100 -100 200 200" focusable="false">
            <defs>
              <radialGradient id="ask-bead-glow">
                <stop offset="0" stopColor="#ff7358" stopOpacity="0.95" />
                <stop offset="0.3" stopColor="#ff4631" stopOpacity="0.5" />
                <stop offset="1" stopColor="#ff4631" stopOpacity="0" />
              </radialGradient>
            </defs>
            {BEADS.map((bead, index) => (
              <g key={index}>
                <circle cx={bead.x} cy={bead.y} r="4" fill="url(#ask-bead-glow)" />
                <circle className="ask-bead" cx={bead.x} cy={bead.y} r="1.15" />
              </g>
            ))}
          </svg>
        </div>
        <div className="ask-figure" ref={figureRef}>
          <img src="/faq-figure.webp" alt="" width={864} height={918} loading="lazy" decoding="async" draggable={false} />
          <span className="ask-heart" />
          <span className="ask-orb" />
          <span className="ask-voice" />
        </div>
      </div>

      {QUESTIONS.map((item, index) => {
        const seat = SEATS[index];
        const style = { "--x": seat.x, "--y": seat.y, "--tilt": `${seat.tilt}deg`, "--i": index } as CSSProperties;
        const isOpen = open === index;
        return (
          <Fragment key={item.q}>
            <button
              type="button"
              id={`${id}-q${index}`}
              className={speaking === index ? "ask-card is-speaking" : "ask-card"}
              data-side={seat.x < 0 ? "left" : "right"}
              style={style}
              aria-expanded={isOpen}
              aria-controls={`${id}-a${index}`}
              onClick={() => press(index)}
            >
              <span className="ask-float">
                <span className="ask-face">
                  <span className="ask-play" aria-hidden="true">
                    <svg viewBox="0 0 12 12" focusable="false">
                      <path d="M3.6 2.1v7.8L10.2 6z" />
                    </svg>
                    <span className="ask-eq">
                      <i />
                      <i />
                      <i />
                    </span>
                  </span>
                  <span className="ask-text">{item.q}</span>
                </span>
              </span>
            </button>
            <div
              id={`${id}-a${index}`}
              ref={(node) => {
                answers.current[index] = node;
              }}
              className={isOpen ? "ask-answer is-open" : "ask-answer"}
              role="region"
              aria-labelledby={`${id}-q${index}`}
            >
              <div className="ask-answer-body">
                <p className="ask-answer-q">{item.q}</p>
                <p className="ask-answer-a">{item.a}</p>
              </div>
            </div>
          </Fragment>
        );
      })}

      <p className="ask-hint" aria-hidden="true">
        The answer is spoken aloud and written here.
      </p>
    </div>
  );
}
