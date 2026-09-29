"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { QUESTIONS } from "@/lib/content";

type FaqListProps = {
  onSpeak: (voice: string, onEnd: () => void, onInterrupt: () => void) => void;
  onSilence: () => void;
};

export function FaqList({ onSpeak, onSilence }: FaqListProps) {
  const [open, setOpen] = useState<number | null>(null);
  const [speaking, setSpeaking] = useState<number | null>(null);
  const answers = useRef<Array<HTMLDivElement | null>>([]);

  function toggle(index: number) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const current = answers.current[index];
    if (!current) return;

    if (open === index) {
      onSilence();
      setSpeaking(null);
      if (reduced) {
        current.style.height = "0px";
        setOpen(null);
        return;
      }
      gsap.to(current, {
        height: 0,
        duration: 0.35,
        ease: "power2.inOut",
        onComplete: () => setOpen(null),
      });
      return;
    }

    if (open !== null) {
      const previous = answers.current[open];
      if (previous) {
        if (reduced) previous.style.height = "0px";
        else gsap.to(previous, { height: 0, duration: 0.28, ease: "power2.inOut" });
      }
    }

    setOpen(index);
    setSpeaking(index);
    onSpeak(
      QUESTIONS[index].voice,
      () => setSpeaking((current) => (current === index ? null : current)),
      () => setSpeaking((current) => (current === index ? null : current)),
    );
    if (reduced) {
      current.style.height = "auto";
      return;
    }
    gsap.fromTo(current, { height: 0 }, { height: "auto", duration: 0.42, ease: "power2.out" });
  }

  return (
    <div className="faq">
      {QUESTIONS.map((item, index) => (
        <div className="faq-item" key={item.q}>
          <button
            type="button"
            className={speaking === index ? "faq-q is-speaking" : "faq-q"}
            aria-expanded={open === index}
            onClick={() => toggle(index)}
          >
            {item.q}
          </button>
          <div
            className="faq-answer"
            aria-hidden={open !== index}
            ref={(node) => {
              answers.current[index] = node;
            }}
          >
            <p>{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
