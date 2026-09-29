"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { StormAudio } from "@/lib/audio";
import { STORM_LINES } from "@/lib/content";
import { speakFile, stopVoice } from "@/lib/voice";
import { Gate } from "@/components/gate";
import { HearButton } from "@/components/hear-button";
import { SiteView } from "@/components/site-view";
import { StormCanvas } from "@/components/storm-canvas";

gsap.registerPlugin(ScrollTrigger);

export function Experience() {
  const audio = useRef<StormAudio | null>(null);
  const soundRef = useRef(false);
  const loopRef = useRef(0);
  const lineRef = useRef(0);
  const [entered, setEntered] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [showGate, setShowGate] = useState(true);

  function armStorm() {
    const id = ++loopRef.current;
    const run = () => {
      if (id !== loopRef.current || !soundRef.current) return;
      const line = STORM_LINES[lineRef.current % STORM_LINES.length];
      lineRef.current += 1;
      audio.current?.duck(0.18);
      speakFile(line, {
        onEnd: () => {
          if (id !== loopRef.current) return;
          audio.current?.duck(0.9);
          window.setTimeout(run, 1100);
        },
      });
    };
    run();
  }

  function ask(voice: string, onEnd: () => void, onInterrupt: () => void) {
    loopRef.current += 1;
    if (soundRef.current) audio.current?.duck(0.18);
    speakFile(voice, {
      onInterrupt,
      onEnd: () => {
        if (soundRef.current) audio.current?.duck(0.9);
        onEnd();
        if (soundRef.current) window.setTimeout(armStorm, 1100);
      },
    });
  }

  function hush() {
    loopRef.current += 1;
    stopVoice();
    if (!soundRef.current) return;
    audio.current?.duck(0.9);
    window.setTimeout(() => {
      if (soundRef.current) armStorm();
    }, 500);
  }

  useEffect(() => {
    audio.current = new StormAudio();
    return () => audio.current?.stop();
  }, []);

  useLayoutEffect(() => {
    if (!entered) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.documentElement.classList.remove("gated");

    if (reduced) {
      ScrollTrigger.refresh();
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(".line", { autoAlpha: 0, y: 28 });
      gsap.to(".hero .line", {
        autoAlpha: 1,
        y: 0,
        duration: 1.15,
        stagger: 0.14,
        ease: "power3.out",
        delay: 0.08,
        onComplete: () => {
          document.querySelector<HTMLElement>(".hero h1")?.focus();
        },
      });
      gsap.utils.toArray<HTMLElement>(".chapter").forEach((section) => {
        const lines = section.querySelectorAll(".line");
        gsap.to(lines, {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            once: true,
          },
        });
      });
    });

    return () => ctx.revert();
  }, [entered]);

  function setSound(on: boolean) {
    soundRef.current = on;
    setSoundOn(on);
    document.body.classList.toggle("sound-on", on);
    if (!on) {
      loopRef.current += 1;
      stopVoice();
      audio.current?.duck(0.9);
      return;
    }
    armStorm();
  }

  useEffect(() => {
    if (!showGate) return;
    const gate = document.getElementById("gate");
    if (!gate || !entered) return;
    const done = () => setShowGate(false);
    gate.addEventListener("transitionend", done, { once: true });
    const fallback = window.setTimeout(done, 900);
    return () => {
      gate.removeEventListener("transitionend", done);
      window.clearTimeout(fallback);
    };
  }, [entered, showGate]);

  function enter(withSound: boolean) {
    if (!audio.current) audio.current = new StormAudio();
    setEntered(true);
    if (!withSound) {
      setSound(false);
      return;
    }
    try {
      audio.current.start();
      setSound(true);
    } catch {
      audio.current.stop();
      setSound(false);
    }
  }

  function toggleSound() {
    if (!audio.current) audio.current = new StormAudio();
    const engine = audio.current;
    try {
      if (engine.on) engine.stop();
      else engine.start();
    } catch {
      engine.stop();
    }
    setSound(engine.on);
  }

  return (
    <>
      <StormCanvas />
      <div className="vignette" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      {showGate ? <Gate onEnter={enter} /> : null}
      <SiteView onSpeak={ask} onSilence={hush} />
      {entered ? <HearButton soundOn={soundOn} onToggle={toggleSound} /> : null}
    </>
  );
}
