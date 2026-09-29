"use client";

import { FormEvent, useState } from "react";
import { CONTACT, PRACTICE, WORK, type WorkItem } from "@/lib/content";
import { DepthCanvas } from "@/components/depth-canvas";
import { HeroFigure } from "@/components/hero-figure";
import { FaqList } from "@/components/faq-list";

type SiteViewProps = {
  onSpeak: (voice: string, onEnd: () => void, onInterrupt: () => void) => void;
  onSilence: () => void;
};

export function SiteView({ onSpeak, onSilence }: SiteViewProps) {
  const [hint, setHint] = useState("Opens your email app. Nothing is stored on this page.");

  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();
    const body = `${message}\n\n— ${name}\n${email}`;
    const href = `mailto:${CONTACT.email}?subject=${encodeURIComponent("A note from the portfolio")}&body=${encodeURIComponent(body)}`;
    setHint("Opening your email app…");
    window.location.href = href;
  }

  return (
    <>
      <header className="nav">
        <a className="wordmark" href="#top">
          Tushar <span>Hossen</span>
        </a>
        <nav aria-label="Sections">
          <a href="#letter">Letter</a>
          <a href="#work">Work</a>
          <a href="#ask">Ask</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main id="top">
      <section className="hero">
        <HeroFigure />
        <div className="hero-copy">
          <p className="eyebrow line">Founder &amp; CEO · Implesia IT · Dhaka</p>
          <h1 className="line" tabIndex={-1}>
            Built to <em>hold.</em>
          </h1>
          <p className="lede line">Software for when the stakes are real. Not a demo that impresses for a day.</p>
        </div>
      </section>

        <div className="lower">
        <DepthCanvas />
        <section className="chapter" id="letter">
          <p className="index line">01 — A letter</p>
          <h2 className="line">
            This is not a <em>pitch.</em>
          </h2>
          <div className="letter">
            <p className="line">
              We did not start Implesia IT to ship more software. We started it to ship software people can trust
              when the stakes are real.
            </p>
            <p className="line">
              Every platform carries someone’s revenue, reputation, or operational continuity. Architecture,
              security, and maintainability are not polish. They are the product.
            </p>
            <p className="line">
              From Dhaka, the studio works with teams who expect senior judgment, clear communication, and delivery
              that still performs years after launch.
            </p>
            <p className="sign line">— Tushar</p>
          </div>
        </section>

        <section className="chapter stage" id="field" aria-label="A three-dimensional field drawn in the browser">
          <p className="index line">— The field</p>
          <h2 className="line">
            The room has <em>depth.</em>
          </h2>
          <p className="chapter-note line">A structure drawn in the browser. It turns as you move.</p>
        </section>

        <section className="chapter" id="practice">
          <p className="index line">02 — The practice</p>
          <h2 className="line">
            One studio. <em>Serious</em> systems.
          </h2>
          <ul className="practice">
            {PRACTICE.map((item) => (
              <li className="line" key={item.index}>
                <span>{item.index}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="chapter chapter-bleed" id="work">
          <p className="index line">03 — Selected delivery</p>
          <h2 className="line">
            Already in the <em>world.</em>
          </h2>
          <p className="chapter-note line">
            Work from Implesia IT, the studio I founded. Names and scopes are the ones we publish.
          </p>
          <ol className="works">
            {WORK.map((item) => (
              <li className="line" key={item.title}>
                {item.href ? (
                  <a className="work-card" href={item.href} target="_blank" rel="noopener noreferrer">
                    <WorkBody item={item} />
                  </a>
                ) : (
                  <article className="work-card">
                    <WorkBody item={item} />
                  </article>
                )}
              </li>
            ))}
          </ol>
        </section>

        <section className="chapter" id="ask">
          <p className="index line">04 — Ask plainly</p>
          <h2 className="line">
            Press a question. <em>Hear</em> the answer.
          </h2>
          <p className="chapter-note line">A low voice answers. The words stay on the page.</p>
          <FaqList onSpeak={onSpeak} onSilence={onSilence} />
        </section>

        <section className="chapter close" id="contact">
          <p className="index line">05 — The door</p>
          <h2 className="line">
            If it must not fail <em>quietly.</em>
          </h2>
          <p className="lede tight line">I would be glad to talk.</p>
          <form className="note line" onSubmit={send}>
            <label>
              Name
              <input name="name" type="text" required autoComplete="name" />
            </label>
            <label>
              Email
              <input name="email" type="email" required autoComplete="email" />
            </label>
            <label>
              What is at stake
              <textarea name="message" rows={4} required />
            </label>
            <button type="submit" className="btn btn-solid">
              Send a note
            </button>
            <p className="form-hint">{hint}</p>
          </form>
          <p className="direct line">
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
            <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </p>
        </section>

      <footer className="colophon">
        <p>Tushar Hossen · Implesia IT Ltd · Dhaka</p>
        <p>Next.js · GSAP · Storm and a 3D field drawn in the browser.</p>
      </footer>
        </div>
      </main>
    </>
  );
}

function WorkBody({ item }: { item: WorkItem }) {
  return (
    <>
      <img src={item.image} alt="" />
      <span className="work-shade" aria-hidden="true" />
      <div className="work-copy">
        <span className="meta">
          {item.year} · {item.kind}
        </span>
        <h3>{item.title}</h3>
        <p>{item.body}</p>
        <span className="stack">{item.stack}</span>
      </div>
    </>
  );
}
