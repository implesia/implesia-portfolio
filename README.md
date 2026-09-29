# Tushar Hossen — Implesia IT

Cinematic personal portfolio for Tushar Hossen, Founder and CEO of Implesia IT, Dhaka. One full-width page: a loading gate, a storm drawn in the browser, spoken lines, and the studio’s published work.

The site does not ship a video, a music file, or a third-party soundtrack. Weather, thunder, and the room tone are synthesized in the browser. The spoken voice is a set of original WAV clips.

## Stack

| Piece | Choice | Version |
| --- | --- | --- |
| Framework | Next.js (App Router, Turbopack in dev) | 16.3.7 |
| UI | React | 19.3.0 |
| Language | TypeScript, `strict` | 5.9 |
| Animation | GSAP + ScrollTrigger | 3.15.0 |
| Package manager | Bun | lockfile: `bun.lock` |
| Styling | Global CSS. No Tailwind, no CSS-in-JS | — |
| Fonts | `next/font/google` | Outfit, Cormorant Garamond, Cinzel, UnifrakturMaguntia |
| Storm picture | Canvas 2D, `requestAnimationFrame` | — |
| Storm sound | Web Audio API | — |
| Spoken voice | WAV clips, played through Web Audio | generated with Kokoro `am_onyx` |
| Images | PNG in `public/` | hero + six project stills |

Kokoro is not a runtime dependency. It was used once, offline, to render the files in `public/voice/`. The site only fetches and plays those files.

## Run

```bash
bun install
bun run dev
```

Dev server: [http://localhost:3010](http://localhost:3010).

```bash
bun run build
bun run start
```

`start` also listens on port 3010.

Open the site as `localhost`, not `127.0.0.1`. Next’s dev server blocks cross-origin client scripts otherwise, and the gate never leaves 0%. `next.config.ts` allows `127.0.0.1` as a dev origin, but `localhost` is the reliable URL.

## What the page does

1. **Gate.** A progress ring runs from 0 to 100 with GSAP. Then two choices: turn the storm on, or enter in silence. Until that choice, `html` has the class `gated`, so the page underneath stays hidden.
2. **Storm.** A full-viewport canvas draws clouds and lightning. Lightning emits a flash event. The audio engine turns that flash into thunder.
3. **Voice.** With the storm on, short lines play one after another. Each line starts slow and finishes faster. The pace is baked into the WAV (Kokoro `speed` per phrase), not done by speeding up playback, so the pitch stays stable. A short, dark delay sits behind the dry voice. While a line plays, the storm bed ducks. Pressing a question stops the lines, speaks that answer, then resumes the lines if the storm is still on.
4. **Page.** After the gate: hero, letter, practice, work, questions, contact. Chapter titles reveal with ScrollTrigger. `prefers-reduced-motion` skips those tweens.

There is no subtitle track. Question text stays on the page as the written answer.

## Project layout

```
app/
  layout.tsx          fonts, metadata, gated html
  page.tsx            renders Experience
  globals.css         the whole visual system
  icon.svg
components/
  experience.tsx      gate, storm, sound toggle, voice loop
  gate.tsx            progress ring and enter buttons
  storm-canvas.tsx    canvas mount
  site-view.tsx       hero, letter, practice, work, contact
  faq-list.tsx        questions
  hear-button.tsx     side control, after enter
lib/
  content.ts          copy, work items, question text, voice paths
  storm.ts            cloud and lightning loop
  flash.ts            lightning → thunder
  audio.ts            drones, wind, heartbeat, thunder
  voice.ts            WAV playback, duck-friendly mix
public/
  hero-figure.png
  work-*.png          one still per project
  voice/              10 storm lines + 5 answers
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
- FAQ answers: height animated open and closed.

`ScrollTrigger` is reverted when the experience unmounts.

### CSS

One file, `app/globals.css`. Full-bleed layout: the hero and the work gallery run to the viewport edges. The work grid is two columns; the first card spans the row. Below 800px the grid becomes one column.

Custom properties carry the four font families. The fixed side button sits mid-right on desktop and moves to the corner on small screens.

### Fonts

Loaded with `next/font/google`, so the files are self-hosted at build time and exposed as CSS variables:

| Variable | Face | Use |
| --- | --- | --- |
| `--font-sans` | Outfit 300–500 | UI, body |
| `--font-serif` | Cormorant Garamond 500/600, italic | letter, captions, long lines |
| `--font-mark` | Cinzel 500/700 | small labels, the ring percentage |
| `--font-display` | UnifrakturMaguntia 400 | the blackletter headline |

### Canvas storm

`lib/storm.ts` paints on a 2D canvas. Device pixel ratio is capped at 1.5. Cloud sprites are drawn offscreen and faded with a radial mask so the edges are not hard rectangles. Lightning is a polyline plus a full-frame flash. Each flash calls `emitFlash()`, and `lib/audio.ts` subscribes for thunder.

`prefers-reduced-motion` still draws the scene, with less motion.

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
- `public/voice/faq-01.wav` … `faq-05.wav` — the five answers

Each clip is two or three phrases. The first phrase is rendered slowly (`speed` about `0.66`). The last phrase is rendered faster (about `1.28`). Silence is trimmed and the phrases are crossfaded, with a shorter gap as the line speeds up. Paths in `lib/content.ts` carry `?v=pace` so a replaced file is not served from an old browser cache. Next ignores the query string and still serves `public/voice/`.

Kokoro, ONNX Runtime, and the render script are not part of this app. Replacing a line means rendering a new WAV into `public/voice/` and keeping the same filename.

### Images

Original stills, not pulled from another site:

- `public/hero-figure.png` — full-bleed figure, arms raised, machines under the hands, headline over the lower third
- `public/work-gulf.png`, `work-academy.png`, `work-telemedicine.png`, `work-lms.png`, `work-babygrow.png`, `work-ota.png` — the work gallery

The first work card is full width. The rest sit in the grid. Cards that have a public URL link out; the others are articles.

### Contact

The form does not post to a server. Submit builds a `mailto:` link to `implesiaitltd@gmail.com`. WhatsApp and LinkedIn are plain links in `lib/content.ts`.

## Content

Copy and links live in `lib/content.ts`: practice areas, six shipped products (Gulf Franchise, Flyger Academy, Telemedicine, Arong LMS, Baby Grow, Flyger OTA), five questions, and contact details. Change words there. If a spoken line should match a new sentence, replace the WAV as well.

## Browser notes

- Sound starts only after a click (`Turn on the storm`, or the side button).
- Two `AudioContext`s: one for the storm, one for speech.
- `prefers-reduced-motion: reduce` skips GSAP reveals and the FAQ height tween. Sound and the canvas still run.
