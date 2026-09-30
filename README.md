# Tushar Hossen — Implesia IT

Cinematic personal portfolio for Tushar Hossen, Founder and CEO of Implesia IT, Dhaka. One full-width page: a loading gate, a storm drawn in the browser, spoken lines, service cards that orbit a figure, a curved 3D wall of the studio’s published work, a seated figure who answers ten questions aloud, and links back to [implesia.com](https://implesia.com/) throughout.

The site does not ship a video, a music file, or a third-party soundtrack. Weather, thunder, and the room tone are synthesized in the browser. The spoken voice is a set of original WAV clips.

## Stack

| Piece           | Choice                                 | Version                                                |
| --------------- | -------------------------------------- | ------------------------------------------------------ |
| Framework       | Next.js (App Router, Turbopack in dev) | 16.3.7                                                 |
| UI              | React                                  | 19.3.0                                                 |
| Language        | TypeScript, `strict`                   | 5.9                                                    |
| Animation       | GSAP + ScrollTrigger                   | 3.15.0                                                 |
| Package manager | Bun                                    | lockfile: `bun.lock`                                   |
| Styling         | Global CSS. No Tailwind, no CSS-in-JS  | —                                                      |
| Fonts           | `next/font/google`                     | Outfit, Cormorant Garamond, Cinzel, UnifrakturMaguntia |
| Storm picture   | Canvas 2D, `requestAnimationFrame`     | —                                                      |
| Storm sound     | Web Audio API                          | —                                                      |
| Spoken voice    | WAV clips, played through Web Audio    | generated with Kokoro `am_onyx`                        |
| Images          | PNG and WebP in `public/`              | hero, services and Ask figures, six project stills     |
| Hosting         | Cloudflare Workers static assets       | static export, Wrangler 4.144                          |

Kokoro is not a runtime dependency. It was used once, offline, to render the files in `public/voice/`. The site only fetches and plays those files.

## Run

```bash
bun install
bun run dev
```

Dev server: [http://localhost:3010](http://localhost:3010).

```bash
bun run build      # static export to out/
bun run start      # serves out/ in the Workers runtime at http://localhost:8787
```

`bun run preview` does both. `next start` is not used: it does not work with a static export. Deploying is covered in [Deploy on Cloudflare](#deploy-on-cloudflare).

Open the site as `localhost`, not `127.0.0.1`. Next’s dev server blocks cross-origin client scripts otherwise, and the gate never leaves 0%. `next.config.ts` allows `127.0.0.1` as a dev origin, but `localhost` is the reliable URL.

## What the page does

1. **Gate.** A progress ring runs from 0 to 100 with GSAP. Then two choices: turn the storm on, or enter in silence. Until that choice, `html` has the class `gated`, so the page underneath stays hidden.
2. **Storm.** A full-viewport canvas draws clouds and lightning. Lightning emits a flash event. The audio engine turns that flash into thunder.
3. **Voice.** With the storm on, short lines play one after another. Each line starts slow and finishes faster. The pace is baked into the WAV (Kokoro `speed` per phrase), not done by speeding up playback, so the pitch stays stable. A short, dark delay sits behind the dry voice. While a line plays, the storm bed ducks. Pressing a question stops the lines, speaks that answer, then resumes the lines if the storm is still on.
4. **Page.** After the gate, in order:
   - **Hero.** Headline, then “Visit implesia.com” and “See the work”.
   - **Ribbons.** Two crossing 3D tapes: the engineering habits on one, “Implesia IT · implesia.com” on the other.
   - **Letter.** Its words ink in as you scroll.
   - **Depth field.**
   - **Services.** Eight polaroid cards orbit a figure: in front of him, around both sides, and behind his shoulders. The front card’s details show underneath.
   - **Work.** A curved 3D wall of six projects, three figures from implesia.com, and the named clients.
   - **Process.** Four steps on a rail that fills as you scroll.
   - **Ask.** “Ask the Architect.” Ten question cards sit on an arc around a seated figure holding a red orb. Pressing one speaks the answer and writes it under him.
   - **Contact.**
   - **Studio card.** A tilting card that links to implesia.com.

   Chapter titles reveal with ScrollTrigger. `prefers-reduced-motion` skips those tweens.

There is no subtitle track. Each answer is written on the page while it is spoken.

## Project layout

```
app/
  layout.tsx          fonts, metadata, gated html
  page.tsx            renders Experience, plus the questions as FAQPage structured data
  not-found.tsx       the 404 page (out/404.html)
  globals.css         the whole visual system
  icon.svg
components/
  experience.tsx      gate, storm, sound toggle, voice loop, scroll effects
  gate.tsx            progress ring and enter buttons
  storm-canvas.tsx    storm and lightning canvases
  site-view.tsx       every section of the page
  carousel-3d.tsx     3D slider markup and controls
  hero-figure.tsx     hero image canvas
  depth-canvas.tsx    wireframe field behind the lower page
  faq-list.tsx        the Ask stage: dial, seated figure, ten question cards, answers
  hear-button.tsx     side control, after enter
lib/
  content.ts          copy, implesia.com links, work items, question text, voice paths
  carousel.ts         3D slider engine: orbit and wall, cruise, spring, drag, keys
  pointer.ts          spotlight, magnetic buttons, hero drift, studio tilt
  use-reduced-motion.ts  prefers-reduced-motion as a React hook
  depth.ts            wireframe field
  storm.ts            cloud and lightning loop
  flash.ts            lightning → thunder
  audio.ts            drones, wind, heartbeat, thunder
  voice.ts            WAV playback, duck-friendly mix, live level for the orb
public/
  _headers            Cloudflare response headers, copied into out/
  hero-figure.png
  services-figure.webp  the figure the service cards orbit
  faq-figure.webp     the seated figure in Ask
  work-*.png          one still per project
  voice/              faq-01 … faq-10, the ten answers
next.config.ts        output: "export"
wrangler.jsonc        Cloudflare Worker: assets from out/, no script
```

`@/*` maps to the project root (`tsconfig.json`).

## Technologies, in detail

### Next.js 16 and React 19

App Router. `app/page.tsx` is a server component that renders one client island, `Experience`. Almost everything after that is `"use client"` because GSAP, canvas, and Web Audio need the browser.

`reactStrictMode` is on. `agentRules` is off so Next does not regenerate agent instruction files.

Metadata title: “Tushar Hossen — Implesia IT”.

### TypeScript

`strict: true`. Path alias `@/*`. JSX runtime is `react-jsx`. Work items are a plain `WorkItem` type. `WORK` is not `as const`, so optional fields such as `href` stay optional instead of collapsing into a union that drops them.

### GSAP 3.15 and ScrollTrigger

Registered once in `experience.tsx`.

- Gate ring: progress 0–100.
- Hero lines: fade and rise when the gate opens.
- Each `.chapter`: the same reveal when the section hits about 78% of the viewport, `once: true`.
- Nav: a 1px line under the bar, scrubbed from the top of the page to the bottom.
- Letter: every word is its own span. Opacity scrubs from 0.14 to 1 as the letter crosses the viewport.
- Ribbons: the pair tilts from 28° to −16° on X while it passes.
- Process: a `--fill` custom property on `.steps` drives the rail. Each step gets `is-lit` when the fill reaches it.
- Figures: counted values run up from 0 once, when they enter.

`ScrollTrigger` is reverted when the experience unmounts.

### 3D sliders

`components/carousel-3d.tsx` renders the markup and the controls. `lib/carousel.ts` runs one `requestAnimationFrame` loop per slider and writes the transforms itself, so React does not re-render per frame.

There are two shapes:

- **Orbit (services).** Eight polaroid cards circle a figure on a tilted ring. See below.
- **Wall (work).** Six project stills on a concave curve. The track stays put and each slide is placed along the curve. The slide at the wrap point fades out, so nothing jumps.

The orbit does not rely on the browser’s 3D sorting, because the cards must pass both behind and in front of a flat image. The engine projects each card itself:

- **Layout.** Taken from the figure’s box. The centre of the ring sits at 35% of his height, so the front card crosses his hands and the back of the ring passes behind his shoulders. The side distance is capped by the stage width.
- **Depth.** Scale is 1 at the front, 2/3 at the sides and 1/2 at the back. Cards turn up to 28° outward at the sides. Far cards darken and blur a little.
- **Behind and in front.** Each card’s `z-index` lands on one side or the other of the figure’s `100`, so the track must stay flat: no transform, no `z-index`, no `preserve-3d`. The swap happens at depth 0.3, near the widest point of the ring, where a card is clear of his silhouette, so it never pops.
- **Life.** Each card floats and keeps a slight tilt of its own. The ring swirls in the first time the stage is on screen. With a mouse, the ring yaws and the figure shifts against the pointer. The figure breathes and his core pulses in CSS.
- **Caption.** The front card’s number, text and tags show under the stage. The caption is `aria-hidden`. Each slide carries the same text in a visually hidden block for assistive technology.

Motion:

- **Position.** A continuous number measured in slides.
- **Cruising.** The orbit and the wall both turn at 0.16 slides per second. Speed eases in over 1.2 s and out over 0.4 s, and time is measured in seconds, so the speed is the same at 60 Hz and 120 Hz.
- **Manual moves.** Previous/next, arrow keys, clicking a side card and releasing a drag all use a critically damped spring. The chosen slide then holds for 2.6 s before cruising resumes.
- **Pause.** Settles on the nearest slide.

Input:

- **Drag.** Uses pointer capture after 7px of horizontal movement. A mostly vertical swipe is left to the page, so scrolling still works. On touch, moving the capture to the stage makes the card under the finger fire `lostpointercapture`. That event bubbles, so the engine ignores it unless the stage itself lost the capture.
- **Fling.** Speed comes from the last 90ms of the drag. The click that ends a drag is swallowed.
- **Clicking a side card** brings it to the front instead of following its link. Only the front work card opens its project.
- **Holding.** A mouse over a card, or over the orbit’s caption, holds the slider, and so does keyboard focus inside a slide. Focus on the controls does not, so Resume works from the keyboard.

Cost: the loop stops when the slider is off screen (`IntersectionObserver`), when the tab is hidden, and when nothing is moving. A frame that would write the same transforms is skipped.

Accessibility follows the WAI-ARIA carousel pattern. Each slider is a `region` with `aria-roledescription="carousel"`. Slides are labelled groups (“Web platforms, 1 of 8”), and there is a pause/resume button. With reduced motion both sliders start paused, and the visitor can still resume them.

### Ask stage

`components/faq-list.tsx`. A seated figure holds a red orb inside a thin red dial. Ten question cards sit on two arcs around him, five a side, the right arc a little higher.

- **Seats.** `SEATS` gives each card a position in ring radii from the dial’s centre and a small tilt. `x` is the card’s inner edge, so a longer question grows outward, away from him. Everything is sized from one variable, `--ring`, so the stage scales as a unit.
- **Dial.** 72 ticks with a longer one every 30°, and ten glowing beads on an inner orbit. The ticks and the beads turn slowly in opposite directions. Each is its own SVG, rotated as a whole, so the browser composites the turn instead of repainting.
- **Pressing a card** speaks its answer through `onSpeak`, the same path the old list used. The card straightens and glows, and its play icon becomes an equaliser. Pressing it again, or Escape, stops the voice and closes the answer.
- **The orb follows the voice.** `voiceLevel()` in `lib/voice.ts` reads an analyser placed before the listener’s volume, so the glow tracks the words, not the slider.
- **Answers.** Each answer follows its card in the markup, as a `region` controlled by the card’s `aria-expanded`. From 900px up they share one slot under the figure. Below that the cards stack under the figure and the answer opens in place. If the answer lands off screen, the page scrolls just enough to show it.
- **Life.** The cards bob, and on arrival they fly out from behind him while the dial draws itself. With a mouse, the ghosts, the dial, the figure and the cards shift by different amounts against the pointer. The wireframe field steps aside while this section holds the middle of the screen.
- **Reduced motion.** No entrance, bobbing, turning or parallax. The equaliser stands still and the orb glows steadily while he speaks.

### Pointer effects

`lib/pointer.ts` runs only on devices with a fine pointer that can hover:

- A soft red spotlight follows the pointer over cards marked `.spot`, through `--mx` and `--my`.
- Buttons with `data-magnetic` lean toward the pointer (`gsap.quickTo`).
- The hero image and copy drift slightly against the pointer while the hero is on screen.
- The studio card tilts in 3D, with a glare that follows the pointer.

With reduced motion only the spotlight stays.

### CSS

One file, `app/globals.css`. Full-bleed layout: the hero, the ribbons, and both sliders run to the viewport edges. `.lower` has `overflow-x: clip`, so the sliders’ side cards and the 130vw ribbons never widen the page on a phone. `clip` is used rather than `hidden` because it does not create a scroll container or change margin collapsing.

The ribbons are CSS marquees: two identical copies in a track that moves by −50%, one loop every 70 s and 95 s, paused on hover.

Custom properties carry the four font families. The fixed side button sits mid-right on desktop and moves to the corner on small screens.

### Fonts

Loaded with `next/font/google`, so the files are self-hosted at build time and exposed as CSS variables:

| Variable         | Face                               | Use                               |
| ---------------- | ---------------------------------- | --------------------------------- |
| `--font-sans`    | Outfit 300–500                     | UI, body                          |
| `--font-serif`   | Cormorant Garamond 500/600, italic | letter, captions, long lines      |
| `--font-mark`    | Cinzel 500/700                     | small labels, the ring percentage |
| `--font-display` | UnifrakturMaguntia 400             | the blackletter headline          |

### Canvas storm

`lib/storm.ts` paints on a 2D canvas. Device pixel ratio is capped at 1.5. Cloud sprites are drawn offscreen and faded with a radial mask so the edges are not hard rectangles.

Lightning has its own transparent canvas, `#lightning`, above the page content with `mix-blend-mode: screen`, so a strike also lights the hero image and the work images. It stays under the nav, the sound control and the gate. Each strike runs a short leader down from the sky, one main stroke, sometimes one restrike, then an exponential fade: the bolt stays visible for about 0.7–0.8 s, the sky glow a little longer, and the layer clears after about 1.3–1.4 s. Timing is in milliseconds, so it looks the same at 60 Hz and 120 Hz. The bolt (glow, body, core) is painted once per strike into a sprite, and each frame only fades it. Each strike calls `emitFlash()` from `lib/flash.ts`.

`prefers-reduced-motion` still draws the scene, with less motion and no lightning.

### Storm audio

`StormAudio` in `lib/audio.ts` builds a graph inside one `AudioContext`, started synchronously inside the click so the browser allows sound.

- Low drones (sine, triangle, a filtered saw)
- Brown-ish wind and a bandpass air layer
- A slow tremolo
- A compressor on the master
- A heartbeat thump
- A noise burst plus a falling sine for thunder, triggered by lightning
- An opening hit, so the room is audible the moment the button is pressed

`duck(level)` ramps the master gain. Speech ducks the bed to about `0.18` and restores `0.9` between lines.

Nothing here is an audio file.

### Voice

`lib/voice.ts` fetches a WAV, decodes it, and plays it on a second `AudioContext` so speech is not crushed by the storm compressor.

The dry path is a highpass, a light high shelf, and a compressor, so diction stays forward. A lowpassed delay (about 46ms and 132ms) adds a short dark tail. Playback rate stays at `1`. Speed lives in the file.

Clips, generated offline with [Kokoro](https://github.com/hexgrad/kokoro) 82M, voice `am_onyx`, quantized ONNX, 24 kHz, 16-bit PCM:

- `public/voice/line-01.wav` … `line-10.wav` — the lines that loop with the storm
- `public/voice/faq-01.wav` … `faq-10.wav` — the ten answers. The number is the order they were recorded in, not their seat. `lib/content.ts` pairs each question with its file.

Each clip is two or three phrases. The first phrase is rendered slowly (`speed` about `0.66`). The last phrase is rendered faster (about `1.28`). Silence is trimmed and the phrases are crossfaded, with a shorter gap as the line speeds up. Paths in `lib/content.ts` carry `?v=pace` so a replaced file is not served from an old browser cache. Next ignores the query string and still serves `public/voice/`.

Kokoro, ONNX Runtime, and the render script are not part of this app. Replacing a line means rendering a new WAV into `public/voice/` and keeping the same filename.

### Images

Original stills, not pulled from another site:

- `public/hero-figure.png` — full-bleed figure, arms raised, machines under the hands, headline over the lower third
- `public/services-figure.webp` — the figure the service cards orbit. It was generated with the hero figure as the reference, on a green background, then keyed to transparency. 736×1050, WebP with alpha. The bottom of the coat fades out through a CSS mask.
- `public/faq-figure.webp` — the same man seated cross-legged with a red orb in his hands, for Ask. Generated the same way as the services figure. 864×918, WebP with alpha. The orb sits at 50.2% across and 70.7% down, and the chest core at 40.5% down; the CSS glows are placed on those points.
- `public/work-gulf.png`, `work-academy.png`, `work-telemedicine.png`, `work-lms.png`, `work-babygrow.png`, `work-ota.png` — the cards on the work wall, also used as the faint tiles behind the orbit and behind Ask

Cards that have a public URL link out, and the front one shows “Visit”. The others are plain cards.

### Contact

The form does not post to a server. Submit builds a `mailto:` link to `implesiaitltd@gmail.com`. WhatsApp and LinkedIn are plain links in `lib/content.ts`.

## Content

Copy and links live in `lib/content.ts`:

- `IMPLESIA`: the implesia.com links and tagline.
- Practice areas, each with tags.
- Six shipped products: Gulf Franchise, Flyger Academy, Telemedicine, Arong LMS, Baby Grow, Flyger OTA.
- `TALLY`, `CLIENTS`, `STEPS`, and `HABITS`.
- Ten questions, in seat order (the first five are the left arc), and contact details.

Change words there. If a spoken line should match a new sentence, replace the WAV as well.

Company facts come from implesia.com: 12+ live projects, 8+ industry verticals, two-week sprints, the three named clients, the four-step process, the free discovery call, and NDAs on request. Some of that site’s content is left out on purpose: its placeholder partner logos and testimonials, its speed and uptime figures, and its pricing.

## Deploy on Cloudflare

The site is a static export. `next build` writes plain files to `out/` (`output: "export"` in `next.config.ts`), and Cloudflare serves them as [Workers static assets](https://developers.cloudflare.com/workers/static-assets/). `wrangler.jsonc` has no `main`, so there is no Worker script: every request is answered from assets and none is billed as a Worker invocation.

- `wrangler.jsonc` — Worker name `implesia-portfolio`, files from `./out`, and unknown URLs get `404.html` with a real 404 status. The workers.dev address and per-version preview URLs are on.
- `public/_headers` — copied into `out/` by the build and applied by Cloudflare:
  - security headers on every response;
  - a year of `immutable` caching for `/_next/static/*`, whose file names are hashed;
  - one day, then background revalidation, for images, voices, and audio;
  - HTML revalidates on every visit, so a deploy shows at once.
- `app/not-found.tsx` — the 404 page.

The site is live at <https://implesia-portfolio.implesiaitltd.workers.dev>, on the Implesia Cloudflare account. To deploy from a machine:

```bash
bunx wrangler login   # once per machine; opens the browser to sign in to Cloudflare
bun run deploy        # next build, then wrangler deploy
```

- `bun run deploy:dry` checks the build and the config without uploading.
- `bun run preview` serves the production build locally in the Workers runtime, at <http://localhost:8787>.
- `bunx wrangler rollback` puts an earlier version back. `bunx wrangler versions list` shows the version IDs.

Deploy on every push instead, with Workers Builds. The Worker already exists, so connect it rather than importing the repository as a new one:

1. Cloudflare dashboard → Workers & Pages → `implesia-portfolio` → Settings → Build → Connect → `implesia/implesia-portfolio`, branch `main`.
2. Build command: `bun run build`. Deploy command: `npx wrangler deploy`, the default.
3. The Worker name must match `name` in `wrangler.jsonc`, or the build fails.

Custom domain: open the Worker → Settings → Domains & Routes → Add → Custom domain. The domain’s DNS must be on Cloudflare. Alternatively, add `"routes": [{ "pattern": "your.domain", "custom_domain": true }]` to `wrangler.jsonc`. If the site should then answer only on that domain, set `workers_dev` to `false`.

Limits that matter here:

- 25 MiB per file. The largest, `story.wav`, is 6.9 MB.
- 20,000 files per version on the free plan. The export is under 100.

Browsers keep images and audio for a day. After replacing a voice file, bump its `?v=` key in `lib/content.ts`. Give a replaced image a new file name if the change must show at once.

A static export cannot run code on the server. Server actions, route handlers that read the request, middleware, and ISR all fail the build. `next/image` would also need `images: { unoptimized: true }`; the site uses plain `<img>` today. If the site ever needs any of these, move to a Next.js adapter for Workers. Cloudflare currently recommends vinext, which is in beta; OpenNext is the established alternative.

## Browser notes

- Sound starts only after a click (`Turn on the storm`, or the side button).
- Two `AudioContext`s: one for the storm, one for speech.
- `prefers-reduced-motion: reduce` skips GSAP reveals and the Ask stage’s entrance. Both sliders start paused, the orbit appears without its swirl, the services figure and the cards hold still, the ribbons stand still, the process shows fully lit, and pointer drift and tilt are off. Sound and the canvas still run.
- The sliders and the hero image stop drawing while they are off screen or the tab is in the background.
