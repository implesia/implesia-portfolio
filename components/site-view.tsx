"use client";

import { Fragment, type ReactNode } from "react";
import {
  CLIENTS,
  CONTACT,
  HABITS,
  IMPLESIA,
  TUSHAR,
  PRACTICE,
  STEPS,
  STUDIO_PAGES,
  TALLY,
  WORK,
  type WorkItem,
} from "@/lib/content";
import { useDhakaTime } from "@/lib/use-dhaka-time";
import { Carousel3D } from "@/components/carousel-3d";
import { ContactDoor } from "@/components/contact-door";
import { DepthCanvas } from "@/components/depth-canvas";
import { FaqList } from "@/components/faq-list";
import { HeroFigure } from "@/components/hero-figure";

type SiteViewProps = {
  onSpeak: (voice: string, onEnd: () => void, onInterrupt: () => void) => void;
  onSilence: () => void;
};

type Service = (typeof PRACTICE)[number];

const outside = { target: "_blank", rel: "noopener noreferrer" } as const;

export function SiteView({ onSpeak, onSilence }: SiteViewProps) {
  return (
    <>
      <header className="nav">
        <a className="wordmark" href={TUSHAR.home} {...outside}>
          Tushar <span>Hossen</span>
        </a>
        <nav aria-label="Sections">
          <a href="#letter">Letter</a>
          <a href="#practice">Services</a>
          <a href="#work">Work</a>
          <a href="#process">Process</a>
          <a href="#ask">Ask</a>
          <a href="#contact">Contact</a>
          <a className="nav-site" href={IMPLESIA.home} {...outside}>
            <span className="nav-dot" aria-hidden="true" />
            implesia.com
          </a>
        </nav>
        <span className="nav-progress" aria-hidden="true" />
      </header>

      <main id="top">
        <section className="hero">
          <HeroFigure />
          <div className="hero-copy">
            <p className="eyebrow line">
              Founder &amp; CEO ·{" "}
              <a href={IMPLESIA.home} {...outside}>
                Implesia IT
              </a>{" "}
              · Dhaka
            </p>
            <h1 className="line" tabIndex={-1}>
              Built to <em>hold.</em>
            </h1>
            <p className="lede line">
              Web platforms, mobile apps, cloud, and the systems a business runs
              on.
            </p>
            <div className="hero-cta line">
              <a
                className="btn btn-solid"
                data-magnetic
                href={IMPLESIA.home}
                {...outside}
              >
                Visit implesia.com
                <Arrow />
              </a>
              <a className="btn btn-ghost" data-magnetic href="#work">
                See the work
              </a>
            </div>
          </div>
        </section>

        <div className="lower">
          <DepthCanvas />
          <Ribbons />

          <section className="chapter" id="letter">
            <p className="index line">01 — A letter</p>
            <h2 className="line">
              This is not a <em>pitch.</em>
            </h2>
            <div className="letter">
              <p className="line">
                <Ink text="Implesia IT is a software company in Dhaka. We take the work an IT company is trusted with, and we ship it so a team can run it." />
              </p>
              <p className="line">
                <Ink text="Web platforms. Mobile applications. SaaS and cloud. Design. Commerce, automation, and AI. ERP, CRM, learning, and hospital systems, when the business needs its own." />
              </p>
              <p className="line">
                <Ink text="From Mirpur, we work with teams who want a clear scope, a system they can operate, and delivery that still holds after launch." />
              </p>
              <p className="sign line">
                —{" "}
                <a href={TUSHAR.home} {...outside}>
                  Tushar
                </a>
              </p>
              <p className="ps line">
                P.S. The studio keeps its door open at{" "}
                <a href={IMPLESIA.home} {...outside}>
                  implesia.com
                </a>
              </p>
            </div>
          </section>

          <section
            className="chapter stage"
            id="field"
            aria-label="A three-dimensional field drawn in the browser"
          >
            <p className="index line">— The field</p>
            <h2 className="line">
              The room has <em>depth.</em>
            </h2>
            <p className="chapter-note line">
              A structure drawn in the browser. It turns as you move.
            </p>
          </section>

          <section className="chapter" id="practice">
            <p className="index line">02 — Services</p>
            <h2 className="line">
              What an IT company <em>ships.</em>
            </h2>
            <p className="chapter-note line">
              The same desk also covers digital marketing, content, and video
              when a launch needs to be seen.
            </p>
            <div className="line">
              <Carousel3D
                label="Services"
                variant="orbit"
                items={PRACTICE}
                speed={0.16}
                hint="Drag to spin the orbit · point at a card to hold it"
                touchHint="Swipe to spin the orbit · tap a card to bring it forward"
                slideLabel={(item) => item.title}
                renderFace={(item) => <ServiceCard item={item} />}
                renderCaption={(item) => <ServiceCaption item={item} />}
                centerpiece={<OrbitFigure />}
                backdrop={<OrbitGhosts />}
              />
            </div>
            <p className="go-row line">
              <a className="go" href={IMPLESIA.services} {...outside}>
                Every service on implesia.com
                <Arrow />
              </a>
            </p>
          </section>

          <section className="chapter chapter-bleed" id="work">
            <p className="index line">03 — Selected delivery</p>
            <h2 className="line">
              Already in the <em>world.</em>
            </h2>
            <p className="chapter-note line">
              Published work from Implesia IT. Each one is a service we still
              deliver.
            </p>
            <div className="line">
              <Carousel3D
                label="Selected work"
                variant="wall"
                items={WORK}
                speed={0.16}
                hint="Drag the wall · press a card to bring it forward"
                touchHint="Swipe the wall · tap a card to bring it forward"
                slideLabel={(item) => item.title}
                renderFace={(item) => <WallCard item={item} />}
              />
            </div>

            <div className="bleed-pad">
              <ul className="tally line">
                {TALLY.map((item) => (
                  <li className="spot" key={item.label}>
                    <p className="tally-value">
                      <span aria-hidden="true">
                        {item.count ? (
                          <span data-count={item.value}>{item.value}</span>
                        ) : (
                          item.value
                        )}
                        {item.suffix}
                      </span>
                      <span className="sr-only">
                        {item.value}
                        {item.suffix}
                      </span>
                    </p>
                    <p className="tally-label">{item.label}</p>
                    <p className="tally-note">{item.note}</p>
                  </li>
                ))}
              </ul>

              <p className="index clients-title line">Built for</p>
              <ul className="clients">
                {CLIENTS.map((client) => (
                  <li className="client spot line" key={client.name}>
                    <p className="client-where">{client.where}</p>
                    <h3>{client.name}</h3>
                    <p>{client.body}</p>
                    <ul className="chips">
                      {client.work.map((work) => (
                        <li key={work}>{work}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>

              <p className="go-row line">
                <a className="go" href={IMPLESIA.portfolio} {...outside}>
                  All 12+ projects on implesia.com
                  <Arrow />
                </a>
              </p>
            </div>
          </section>

          <section className="chapter" id="process">
            <p className="index line">04 — Process</p>
            <h2 className="line">
              Nothing ships in the <em>dark.</em>
            </h2>
            <p className="chapter-note line">
              Discovery, design, build, scale. The method Implesia IT runs on
              every engagement.
            </p>
            <div className="steps">
              <span className="steps-rail" aria-hidden="true">
                <span className="steps-fill" />
              </span>
              <ol>
                {STEPS.map((step) => (
                  <li className="step spot line" key={step.index}>
                    <span className="step-no" aria-hidden="true">
                      {step.index}
                    </span>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </li>
                ))}
              </ol>
            </div>
            <p className="go-row line">
              <a className="go" href={IMPLESIA.home} {...outside}>
                The method on implesia.com
                <Arrow />
              </a>
            </p>
          </section>

          <section className="chapter ask" id="ask">
            <p className="index line">05 — Ask plainly</p>
            <h2 className="ask-title line">
              Ask the <em>Architect.</em>
            </h2>
            <p className="ask-sub line">Press a question. He will answer.</p>
            <FaqList onSpeak={onSpeak} onSilence={onSilence} />
          </section>

          <section className="chapter close" id="contact">
            <p className="index line">06 — The door</p>
            <h2 className="line">
              Tell us what must <em>hold.</em>
            </h2>
            <p className="lede tight line">
              A free discovery call is enough to start.
            </p>
            <ContactDoor />
            <p className="direct line">
              <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
              <a href={`tel:${CONTACT.phone}`}>{CONTACT.phoneLabel}</a>
              <a href={CONTACT.whatsapp} {...outside}>
                WhatsApp
              </a>
              <a href={CONTACT.linkedin} {...outside}>
                LinkedIn
              </a>
              <a href={IMPLESIA.contact} {...outside}>
                implesia.com/contact
              </a>
            </p>
            <p className="place line">{`${CONTACT.place}, Bangladesh · NDA available on request`}</p>
          </section>

          <section
            className="chapter studio"
            id="studio"
            aria-labelledby="studio-title"
          >
            <p className="index line">— The studio</p>
            <div className="studio-panel spot line">
              <span className="studio-grid" aria-hidden="true" />
              <p className="studio-bar">
                <span className="studio-name">
                  <span className="studio-dot" aria-hidden="true" />
                  Implesia IT Ltd
                </span>
                <span>
                  <span className="studio-place">{CONTACT.place} · </span>
                  <DhakaTime /> GMT+6
                </span>
              </p>
              <div className="studio-center">
                <h2 className="studio-word" id="studio-title">
                  <span className="sr-only">Implesia IT</span>
                  <span aria-hidden="true">
                    {[..."Implesia"].map((letter, index) => (
                      <span className="line" key={index}>
                        {letter}
                      </span>
                    ))}
                  </span>
                </h2>
                <span className="studio-rail" aria-hidden="true" />
                <p className="studio-line line">{IMPLESIA.tagline}</p>
                <div className="studio-cta line">
                  <a
                    className="btn btn-solid"
                    data-magnetic
                    href={IMPLESIA.home}
                    {...outside}
                  >
                    Visit implesia.com
                    <Arrow />
                  </a>
                </div>
              </div>
              <ul className="studio-pages">
                {STUDIO_PAGES.map((page, index) => (
                  <li key={page.title}>
                    <a className="studio-page" href={page.href} {...outside}>
                      <span className="studio-page-no" aria-hidden="true">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="studio-page-title">{page.title}</span>
                      <span className="studio-page-note">{page.note}</span>
                      <span className="studio-go" aria-hidden="true">
                        <Arrow />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <footer className="colophon">
            <p>
              <a href={TUSHAR.home} {...outside}>
                Tushar Hossen
              </a>{" "}
              ·{" "}
              <a href={IMPLESIA.home} {...outside}>
                Implesia IT Ltd
              </a>{" "}
              · {CONTACT.place}
            </p>
            <p>
              Next.js · GSAP · Storm, lightning, and 3D drawn in the browser.
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}

function Arrow() {
  return (
    <svg
      className="arrow"
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" />
    </svg>
  );
}

function DhakaTime() {
  const time = useDhakaTime();
  const [hours, minutes] = time ? time.split(":") : ["--", "--"];
  return (
    <time className="studio-time" dateTime={time || undefined}>
      {hours}
      <span className="studio-colon">:</span>
      {minutes}
    </time>
  );
}

function Ink({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, index) => (
        <Fragment key={index}>
          <span className="w">{word}</span>
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}

function Ribbons() {
  const brand = [
    "Implesia IT",
    IMPLESIA.tagline.replace(/\.$/, ""),
    "implesia.com",
  ];
  return (
    <div className="ribbons" aria-hidden="true">
      <div className="ribbon-set">
        <div className="ribbon ribbon-b">
          <div className="ribbon-track">
            {[0, 1].map((copy) =>
              [0, 1, 2].map((round) =>
                brand.map((text) => (
                  <span key={`${copy}-${round}-${text}`}>{text}</span>
                )),
              ),
            )}
          </div>
        </div>
        <div className="ribbon ribbon-a">
          <div className="ribbon-track">
            {[0, 1].map((copy) =>
              HABITS.map((text) => <span key={`${copy}-${text}`}>{text}</span>),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrbitFigure() {
  return (
    <div className="orbit-figure">
      <img
        src="/services-figure.webp"
        alt=""
        width={736}
        height={1050}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
      <span className="orbit-core" />
    </div>
  );
}

function OrbitGhosts() {
  return (
    <>
      {WORK.map((item) => (
        <span className="ghost" key={item.title}>
          <img
            src={item.image}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        </span>
      ))}
    </>
  );
}

function ServiceCard({ item }: { item: Service }) {
  return (
    <article className="polaroid">
      <div className="polaroid-shot" aria-hidden="true">
        <svg className="polaroid-art" viewBox="0 0 64 64" focusable="false">
          {SERVICE_ART[item.index] ?? SERVICE_ART["08"]}
        </svg>
        <span className="polaroid-no">{item.index}</span>
        <span className="polaroid-mark">implesia.com</span>
      </div>
      <h3 className="polaroid-title">{item.title}</h3>
      <div className="sr-only">
        <p>{item.body}</p>
        <ul>
          {item.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function ServiceCaption({ item }: { item: Service }) {
  return (
    <>
      <p className="caption-title">
        <span>{item.index}</span>
        {item.title}
      </p>
      <p className="caption-body">{item.body}</p>
      <ul className="chips">
        {item.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
    </>
  );
}

const SERVICE_ART: Record<string, ReactNode> = {
  "01": (
    <>
      <rect x="7" y="11" width="50" height="40" rx="4" />
      <path d="M7 20h50M12.5 15.5h.01M17 15.5h.01M21.5 15.5h.01" />
      <rect className="hot" x="13" y="25" width="22" height="13" rx="1.5" />
      <path d="M41 26h10M41 31h8M41 36h10M13 44h38" />
    </>
  ),
  "02": (
    <>
      <rect x="19" y="6" width="26" height="52" rx="5" />
      <path d="M29 11h6M28 52h8M25 38h14M25 43h9" />
      <rect x="24.5" y="17" width="6.5" height="6.5" rx="1.5" />
      <rect className="hot" x="33" y="17" width="6.5" height="6.5" rx="1.5" />
      <rect x="24.5" y="25.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="33" y="25.5" width="6.5" height="6.5" rx="1.5" />
      <path className="hot" d="M50 22a9 9 0 0 1 0 12M54 18a15 15 0 0 1 0 20" />
    </>
  ),
  "03": (
    <>
      <path d="M19 38h26a8 8 0 0 0 0-16 11 11 0 0 0-21-2 9.5 9.5 0 0 0-5 18Z" />
      <path d="M24 38v7M32 38v11M40 38v7" />
      <circle cx="24" cy="47.5" r="2.5" />
      <circle className="hot" cx="32" cy="51.5" r="2.5" />
      <circle cx="40" cy="47.5" r="2.5" />
    </>
  ),
  "04": (
    <>
      <path d="M8 15V9h6M50 9h6v6M56 49v6h-6M14 55H8v-6" />
      <path className="hot" d="M15 44C25 20 39 44 49 20" />
      <path d="M15 44 25 20M49 20 39 44" />
      <rect x="12.5" y="41.5" width="5" height="5" />
      <rect x="46.5" y="17.5" width="5" height="5" />
      <circle cx="25" cy="20" r="1.8" />
      <circle cx="39" cy="44" r="1.8" />
    </>
  ),
  "05": (
    <>
      <path d="M9 19c0-2.8 4.9-5 11-5s11 2.2 11 5-4.9 5-11 5-11-2.2-11-5Z" />
      <path d="M9 19v24c0 2.8 4.9 5 11 5s11-2.2 11-5V19M9 31c0 2.8 4.9 5 11 5s11-2.2 11-5" />
      <path d="M39 48h18M43 48V36M53 48V31" />
      <path className="hot" d="M48 48V24" />
    </>
  ),
  "06": (
    <>
      <path d="M13 24h38l-3.5 31h-31Z" />
      <path d="M24 24v-5a8 8 0 0 1 16 0v5" />
      <path className="hot" d="M34 30 28.5 41h7L30 51" />
    </>
  ),
  "07": (
    <>
      <path
        className="hot"
        d="M30 10c1.8 10.4 7.6 16.2 18 18-10.4 1.8-16.2 7.6-18 18-1.8-10.4-7.6-16.2-18-18 10.4-1.8 16.2-7.6 18-18Z"
      />
      <path d="M48 40c.8 4.2 2.8 6.2 7 7-4.2.8-6.2 2.8-7 7-.8-4.2-2.8-6.2-7-7 4.2-.8 6.2-2.8 7-7Z" />
      <path d="M15.6 49.6 20.8 53.8" />
      <circle cx="14" cy="48" r="2.2" />
      <circle cx="22" cy="55" r="1.6" />
    </>
  ),
  "08": (
    <>
      <path d="M22 21 11 32l11 11M42 21l11 11-11 11" />
      <path className="hot" d="M36 16 28 48" />
    </>
  ),
};

function WallCard({ item }: { item: WorkItem }) {
  const body = (
    <>
      <img src={item.image} alt="" draggable={false} />
      <span className="wall-shade" aria-hidden="true" />
      <div className="wall-copy">
        <span className="meta">
          {item.year} · {item.kind}
        </span>
        <h3>{item.title}</h3>
        <p>{item.body}</p>
        <span className="stack">{item.stack}</span>
      </div>
      {item.href ? (
        <span className="wall-open" aria-hidden="true">
          Visit
          <Arrow />
        </span>
      ) : null}
    </>
  );
  return item.href ? (
    <a className="wall-card" href={item.href} draggable={false} {...outside}>
      {body}
    </a>
  ) : (
    <div className="wall-card">{body}</div>
  );
}
