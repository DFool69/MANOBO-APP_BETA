# Manobo Tribe — Interactive Presentation

A faithful reconstruction of the source Canva presentation as a
screen-by-screen interactive web app.

**Current source: `v1_.pdf` (23 pages).** This revised the artwork on
every menu/section screen and restructured how Learn works — see
"What changed in v1_.pdf" below. The original 25-page PDF's structure
(per-category carousel, no ending screen) is no longer what's built;
this README describes the current, updated app.

## What changed in v1_.pdf

- **All menu-screen artwork was replaced** (landing, opening
  narration, Manobo Tribe title, family photo, Play/Learn fork) with a
  new moonlit/jungle art style. Button hit-areas were re-measured
  against the new art.
- **The Learn section was restructured.** The old version had a
  carousel of four section title screens (History and Culture → Art
  and Crafts → Religion and Beliefs → Literatures) each with their own
  Next/Previous/Start. The new deck instead has **one Learn hub**
  (`learn-hub`) showing all four as scrolls, plus a Return button back
  to the Play/Learn fork. Clicking Literatures goes straight into the
  story; the other three still have no built-out content behind them
  (see below), so they still open the same kind of placeholder screen.
- **A new closing screen was added.** The story no longer loops back
  into Learn — the last panel now leads to a new "THE END" screen with
  a Return button. I sent that Return to the Learn hub (rather than
  the story title or the very first landing screen), on the
  assumption that "return" means back to where you picked Literatures
  from, not a full restart — tell me if you'd rather it went
  somewhere else.
- **The story panels themselves (the Juan narrative, 15 panels) are
  unchanged** — same art, same captions, just re-exported from the new
  PDF at the same size/quality convention as before. One thing carried
  over as-is from your source: the last panel's caption has a
  duplicated clause ("living kid forced to eat scraps and sleep
  beneath a dining table, was now" appears twice) — I left it exactly
  as written in `v1_.pdf` rather than silently editing your text; say
  the word if you'd like it cleaned up.
- **Every screen now shares one 16:9 (2000×1125) aspect ratio.** The
  previous deck's story panels used a taller ~1.83:1 crop; this
  revision's story pages are the same 16:9 as everything else, so
  `screens.js` now uses a single ratio for the whole app instead of
  two.

## Running it

No build step, no dependencies, no install. Open `index.html` directly
in a browser, or serve the folder statically:

```bash
cd manobo-app
python3 -m http.server 8000
# then open http://localhost:8000
```

Keep the `assets/` folder alongside `index.html` — the app references
images with relative paths.

## Why plain HTML/CSS/JS instead of React + Vite

The brief asked for React/TypeScript/Vite. This sandbox has no network
access, so `npm install` / `vite build` cannot run here, and I can't hand
you a project that I haven't been able to install or build myself. Instead
this is a small, dependency-free, data-driven app: `js/screens.js` is the
centralized screen config (the same role a Vite/React `data/screens.ts`
would play — every screen is data, navigation always goes through
`goTo(id)`, nothing is hardcoded per-component), and `js/app.js` is the
state machine and renderer. If you do want this ported into a real
React/Vite project, I can restructure it into components once you're able
to `npm install` on your own machine — the screen data would carry over
almost unchanged.

## How screens map to the source PDF (v1_.pdf, 23 pages)

- **Pages 1, 3–8** (landing, opening narration, Manobo Tribe title,
  family photo, Play/Learn fork, and the Learn hub) each already have
  their buttons — START, OPTIONS, NEXT, PLAY, LEARN, the four Learn
  scrolls, RETURN — drawn directly into the Canva artwork. Rather than
  redraw them, the app uses the exact page image as the background and
  overlays an invisible, clickable hit-area on top of each printed
  button, positioned by percentage. Colors, typography, borders, and
  composition are therefore pixel-identical to the source — nothing was
  redesigned.
- **Page 2** (Options) is *not* used as a background image, even though
  the source draws one — see "Audio" and the Options screen note below;
  that screen is a fully custom panel instead.
- **Pages 8–22** are the "Itulon: Moka-Atag Ki Juan" (The Story of Juan)
  story panels (title panel + 14 story panels), extracted directly from
  the PDF at their original quality (resized/recompressed for web
  delivery — see below). These panels have **no navigation drawn into
  them at all** in the source file, so the app adds one small,
  consistent Previous/Next control pair plus a page counter, styled to
  match the deck's palette. This is the one piece of UI chrome that
  isn't literally copied from the source, because the source doesn't
  have any for these panels.
- **Page 23** is the new "THE END" closing screen, used as-is with its
  printed Return button wired up.
- Text captions on the story panels are baked into the images themselves,
  so no story text was retyped or re-authored — you're seeing the
  original panels.

## Ambiguities I resolved without asking (and why)

1. **PLAY leads nowhere in the source.** The Play/Learn fork has a
   working PLAY emblem, but no PLAY content exists anywhere in the PDF.
   Rather than invent a minigame, PLAY opens a plain placeholder screen
   that says so plainly and offers a Back button. Tell me what Play
   should be and I'll build it.
2. **The History and Culture / Art and Crafts / Religion and Beliefs
   scrolls on the Learn hub lead nowhere in the source.** Only
   Literatures has 15 panels of actual content behind it; the other
   three are just scrolls on the hub with no page of their own. Their
   buttons open the same kind of plain placeholder, rather than
   fabricated historical, cultural, or religious content (the brief is
   explicit that this must not be invented).
3. **The new "THE END" screen's Return button** goes back to the Learn
   hub rather than the landing screen or the story's title panel —
   see "What changed in v1_.pdf" above for the reasoning.
4. **The Options screen has no visible Back control in the source
   artwork**, in either revision of the deck. I added a small
   "◀ Back" button in the same visual language, since without it
   Options would be a dead end.

## Audio

No background music file was supplied. The Options screen (a fully
custom panel — see below) has a working volume slider and mute toggle
that persist via `localStorage`, and `<audio id="bg-audio">` in
`index.html` is wired to that state — but it has no `<source>`, so
nothing plays yet. Drop a file at `assets/audio/theme.mp3` (or similar)
and add:

```html
<source src="assets/audio/theme.mp3" type="audio/mpeg" />
```

inside the `<audio>` tag and it will respect the volume/mute controls
immediately, no other code changes needed.

**Story narration:** each story panel (`story-00` … `story-14`) is
already wired to auto-play a matching narration file at
`assets/audio/narration/story-00.mp3` … `story-14.mp3` — a small
narration toggle button appears on the story screen once its file
loads successfully, and stays hidden otherwise. No files are supplied
yet; drop mp3s in at those exact names and narration starts working
immediately, no code changes needed.

**Options screen:** per an earlier request, this screen deliberately
does *not* use the source artwork's background image (`page-02.jpg`,
still present in `assets/images/` for reference) — the printed slider
in that art didn't line up cleanly with a real interactive control. It's
a custom-styled panel instead (see `buildOptionsControls()` in
`js/app.js`), themed to match rather than copied from the deck.

## Image assets

`assets/images/` contains every background, extracted directly from the
PDF and re-encoded as JPEG at ~1280px wide (quality 80–82) to keep the
app a reasonable download size (~6 MB total vs. ~48 MB in the source
PDF). If you have the original, higher-resolution PNGs from Canva, drop
them in at the same filenames and they'll be used as-is — nothing else
needs to change.

## Accessibility

- Every hotspot is a real `<button>` with an `aria-label`, reachable and
  operable by keyboard (Tab, Enter/Space).
- Arrow keys move Next/Previous on menu and story screens; Escape backs
  out of Options.
- Each screen's `alt` text describes the artwork for screen readers.
- A polite live region announces the new screen on every navigation.
- Transitions respect `prefers-reduced-motion`.

## Known limitations / not yet done

- Not tested across real browsers/devices in this sandbox (no ability to
  launch a GUI browser here) — please sanity-check on your target
  devices, especially the button hit-area alignment on very narrow or
  very wide windows.
- The Canva link in the brief wasn't reachable from this sandbox (no
  network access), so this reconstruction is based entirely on the
  supplied PDF.
