"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { StormAudio } from "@/lib/audio";
import { STORM_LINES } from "@/lib/content";
import { startPointer } from "@/lib/pointer";
import { setVoiceLevel, speakFile, stopVoice } from "@/lib/voice";
import { Gate } from "@/components/gate";
import { HearButton } from "@/components/hear-button";
import { SiteView } from "@/components/site-view";
import { StormCanvas } from "@/components/storm-canvas";

gsap.registerPlugin(ScrollTrigger);

export function Experience() {
  const audio = useRef<StormAudio | null>(null);
  const soundRef = useRef(false);
  const loopRef = useRef(0);
  const [entered, setEntered] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [level, setLevel] = useState(0.82);
  const [showGate, setShowGate] = useState(true);

  function armStorm() {
    const id = ++loopRef.current;
    if (!soundRef.current) return;
    audio.current?.duck(true);
    speakFile(STORM_LINES[0], {
      fade: 0.55,
      onEnd: () => {
        if (id !== loopRef.current) return;
        audio.current?.duck(false);
      },
    });
  }

  function ask(voice: string, onEnd: () => void, onInterrupt: () => void) {
    loopRef.current += 1;
    audio.current?.duck(true);
    speakFile(voice, {
      onInterrupt,
      onEnd: () => {
        audio.current?.duck(false);
        onEnd();
      },
    });
  }

  function hush() {
    loopRef.current += 1;
    stopVoice();
    audio.current?.duck(false);
  }

  useEffect(() => {
    audio.current = new StormAudio();
    return () => audio.current?.stop();
  }, []);

  useEffect(
    () =>
      startPointer(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
    [],
  );

  useLayoutEffect(() => {
    if (!entered) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    document.documentElement.classList.remove("gated");

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".chapter").forEach((section) => {
        ScrollTrigger.create({
          trigger: section,
          start: "top 55%",
          end: "bottom 40%",
          onToggle: (self) => {
            section.classList.toggle("is-live", self.isActive);
            document
              .querySelector<HTMLAnchorElement>(`.nav a[href="#${section.id}"]`)
              ?.classList.toggle("is-here", self.isActive);
          },
        });
      });

      gsap.to(".nav-progress", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: reduced ? true : 0.3 },
      });

      if (reduced) return;

      gsap.set(".line", { autoAlpha: 0, y: 28 });
      gsap.to(".hero .line", {
        autoAlpha: 1,
        y: 0,
        duration: 1.15,
        stagger: 0.14,
        ease: "power3.out",
        delay: 0.08,
        onComplete: () => {
          document
            .querySelector<HTMLElement>(".hero h1")
            ?.focus({ preventScroll: true });
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

      gsap.fromTo(
        ".letter .w",
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.05,
          scrollTrigger: {
            trigger: ".letter",
            start: "top 82%",
            end: "bottom 58%",
            scrub: 0.6,
          },
        },
      );

      // On a phone the 3D tilt clips the tape and slides it under the hear control.
      // Keep the ribbons flat there; the desktop pitch still scrubs with the scroll.
      gsap.matchMedia().add("(min-width: 700px)", () => {
        gsap.fromTo(
          ".ribbon-set",
          { rotationX: 28 },
          {
            rotationX: -16,
            ease: "none",
            scrollTrigger: {
              trigger: ".ribbons",
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          },
        );
      });

      const steps = gsap.utils.toArray<HTMLElement>(".step");
      let rail: ReturnType<typeof gsap.fromTo> | null = null;
      rail = gsap.fromTo(
        ".steps",
        { "--fill": 0 },
        {
          "--fill": 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".steps",
            start: "top 72%",
            end: "bottom 62%",
            scrub: 0.5,
          },
          onUpdate: () => {
            if (!rail) return;
            const progress = rail.progress();
            steps.forEach((step, index) => {
              step.classList.toggle(
                "is-lit",
                progress >=
                  (index / Math.max(1, steps.length - 1)) * 0.96 + 0.02,
              );
            });
          },
        },
      );

      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((node) => {
        const end = Number(node.dataset.count) || 0;
        const tally = { value: 0 };
        node.textContent = "0";
        gsap.to(tally, {
          value: end,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: { trigger: node, start: "top 90%", once: true },
          onUpdate: () => {
            node.textContent = String(Math.round(tally.value));
          },
        });
      });
    });

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [entered]);

  function setSound(on: boolean) {
    soundRef.current = on;
    setSoundOn(on);
    document.body.classList.toggle("sound-on", on);
    if (!on) {
      loopRef.current += 1;
      stopVoice(true);
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

  function beginBed() {
    if (!audio.current) audio.current = new StormAudio();
    try {
      audio.current.start();
      audio.current.duck(false);
      soundRef.current = true;
      setSoundOn(true);
      document.body.classList.add("sound-on");
    } catch {
      audio.current.stop();
      soundRef.current = false;
      setSoundOn(false);
      document.body.classList.remove("sound-on");
    }
  }

  function enter() {
    setEntered(true);
    if (!soundRef.current) return;
    armStorm();
  }

  function changeLevel(value: number) {
    setLevel(value);
    audio.current?.setLevel(value);
    setVoiceLevel(value);
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
      {showGate ? <Gate onSound={beginBed} onEnter={enter} /> : null}
      <SiteView onSpeak={ask} onSilence={hush} />
      {entered ? (
        <HearButton
          soundOn={soundOn}
          level={level}
          onToggle={toggleSound}
          onLevel={changeLevel}
        />
      ) : null}
    </>
  );
}
