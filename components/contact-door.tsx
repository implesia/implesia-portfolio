"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type FocusEvent,
  type FormEvent,
} from "react";
import { CONTACT } from "@/lib/content";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * How far the door stands open, in degrees: untouched, once the form has focus, with a full note, and
 * sent. The camera sees the leaf edge-on near 58 degrees, so a full note stops well short of that and
 * a sent one swings past it to show the lit inner face.
 */
const AJAR = 7;
const LEAN = 5;
const FULL = 40;
const SENT = 98;

/** Dust in the light, spread by fixed irrational steps so the server and the browser place it alike. */
const MOTES = Array.from({ length: 14 }, (_, i) => {
  const a = (i * 0.618034 + 0.1) % 1;
  const b = (i * 0.414214 + 0.3) % 1;
  const c = (i * 0.732051 + 0.6) % 1;
  return {
    "--x": `${(0.5 + a * 5.5).toFixed(2)}rem`,
    "--y": `${(-7 + b * 15).toFixed(2)}rem`,
    "--z": `${(2.5 + c * 6.5).toFixed(2)}rem`,
    "--t": `${(6 + c * 5).toFixed(2)}s`,
    "--d": `${(-i * 0.85).toFixed(2)}s`,
  } as CSSProperties;
});

const noSubscribe = () => () => undefined;

/** 0 to 1: a name, a valid address, and a message of about 80 characters. */
function measure(form: HTMLFormElement) {
  const value = (name: string) =>
    (
      form.elements.namedItem(name) as
        | HTMLInputElement
        | HTMLTextAreaElement
        | null
    )?.value.trim() ?? "";
  const email = form.elements.namedItem("email") as HTMLInputElement | null;
  const named = value("name").length >= 2 ? 1 : 0;
  const reachable = email?.value && email.validity.valid ? 1 : 0;
  const written = Math.min(1, value("message").length / 80);
  return {
    progress: named * 0.25 + reachable * 0.3 + written * 0.45,
    ready: form.checkValidity(),
  };
}

export function ContactDoor() {
  const reduced = useReducedMotion();
  const hydrated = useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );
  const doorRef = useRef<HTMLDivElement>(null);
  const [hint, setHint] = useState(
    "Opens your email app. Nothing is stored on this page.",
  );
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [focused, setFocused] = useState(false);
  const [sent, setSent] = useState(false);
  const [arrived, setArrived] = useState(false);

  function update(event: FormEvent<HTMLFormElement>) {
    const next = measure(event.currentTarget);
    setProgress(next.progress);
    setReady(next.ready);
    setSent(false);
  }

  function leave(event: FocusEvent<HTMLFormElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null))
      setFocused(false);
  }

  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();
    const body = `${message}\n\n— ${name}\n${email}`;
    const href = `mailto:${CONTACT.email}?subject=${encodeURIComponent("A note from the portfolio")}&body=${encodeURIComponent(body)}`;
    setSent(true);
    setHint("Opening your email app…");
    window.location.href = href;
  }

  useEffect(() => {
    const door = doorRef.current;
    if (!door) return;
    const watch = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setArrived(true);
        watch.disconnect();
      },
      { threshold: 0.35 },
    );
    watch.observe(door);
    return () => watch.disconnect();
  }, []);

  useEffect(() => {
    const door = doorRef.current;
    const section = door?.closest("section");
    if (!door || !section || reduced) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches)
      return;

    let frame = 0;
    let x = 0;
    let y = 0;
    const paint = () => {
      frame = 0;
      door.style.setProperty("--px", x.toFixed(3));
      door.style.setProperty("--py", y.toFixed(3));
    };
    const queue = () => {
      if (!frame) frame = window.requestAnimationFrame(paint);
    };
    const move = (event: PointerEvent) => {
      const box = door.getBoundingClientRect();
      x = Math.max(
        -1,
        Math.min(1, ((event.clientX - box.left) / box.width) * 2 - 1),
      );
      y = Math.max(
        -1,
        Math.min(1, ((event.clientY - box.top) / box.height) * 2 - 1),
      );
      queue();
    };
    const leaveSection = () => {
      x = 0;
      y = 0;
      queue();
    };

    section.addEventListener("pointermove", move);
    section.addEventListener("pointerleave", leaveSection);
    return () => {
      section.removeEventListener("pointermove", move);
      section.removeEventListener("pointerleave", leaveSection);
      window.cancelAnimationFrame(frame);
      door.style.removeProperty("--px");
      door.style.removeProperty("--py");
    };
  }, [reduced]);

  const angle = !arrived
    ? 0
    : sent
      ? SENT
      : AJAR +
        (focused || progress > 0 ? LEAN : 0) +
        progress * (FULL - AJAR - LEAN);
  const doorClass = [
    "door line",
    hydrated && "is-armed",
    arrived && "is-arrived",
    ready && "is-ready",
    sent && "is-sent",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="contact-grid">
      <form
        className="contact-card line"
        onSubmit={send}
        onInput={update}
        onFocus={() => setFocused(true)}
        onBlur={leave}
      >
        <p className="contact-bar">
          <span className="contact-new">
            <span className="contact-dot" aria-hidden="true" />
            New note
          </span>
          <span className="contact-to">To {CONTACT.email}</span>
        </p>
        <div className="contact-fields">
          <label className="field">
            <span className="field-label">Name</span>
            <input name="name" type="text" required autoComplete="name" />
          </label>
          <label className="field">
            <span className="field-label">Email</span>
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label className="field field-wide">
            <span className="field-label">What you need</span>
            <textarea name="message" rows={5} required />
          </label>
        </div>
        <div className="contact-send">
          <button type="submit" className="btn btn-solid" data-magnetic>
            Send a note
          </button>
          <p className="form-hint" aria-live="polite">
            {hint}
          </p>
        </div>
      </form>

      <div
        className={doorClass}
        ref={doorRef}
        style={{ "--angle": `${angle.toFixed(1)}deg` } as CSSProperties}
      >
        <div className="door-scene" aria-hidden="true">
          <div className="door-rig">
            <div className="door-floor">
              <span className="door-grid" />
              <span className="door-shadow" />
            </div>
            <div className="door-spill">
              <i />
            </div>
            <span className="door-halo" />
            <span className="door-light" />
            <span className="door-part door-reveal" />
            <span className="door-part door-sill" />
            <span className="door-part door-riser" />
            <span className="door-part door-post door-post-l" />
            <span className="door-part door-post door-post-r" />
            <span className="door-part door-head" />
            <span className="door-part door-side" />
            <span className="door-part door-top" />
            <span className="door-rim" />
            <div className="door-leaf">
              <span className="door-leaf-front">
                <span className="door-plate">
                  Implesia IT
                  <small>Mirpur 10 · Dhaka</small>
                </span>
                <span className="door-handle" />
              </span>
              <span className="door-leaf-back" />
              <span className="door-leaf-edge" />
              <span className="door-leaf-top" />
            </div>
            <div className="door-motes">
              {MOTES.map((mote, index) => (
                <i key={index} style={mote} />
              ))}
            </div>
          </div>
        </div>
        <p className="door-caption">The studio keeps its door open.</p>
      </div>
    </div>
  );
}
