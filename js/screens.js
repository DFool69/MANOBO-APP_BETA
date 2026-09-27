/**
 * screens.js — centralized presentation configuration.
 *
 * Reflects the updated source deck (v1_.pdf, 23 pages). Navigation
 * elsewhere in the app references screen IDs, never hardcoded markup.
 *
 * Every page in this revision shares one 2000x1125 (16:9) aspect ratio —
 * including the story panels, which used a taller ~1.83:1 crop in the
 * previous deck — so a single ratio constant now covers every image
 * screen.
 *
 * button rects are percentages (0-100) of the image's own box, matching
 * the position of the PRINTED button/label already baked into that page's
 * artwork. We are not drawing new buttons on top of the art — we're
 * wiring up the ones already drawn there.
 */

const RATIO_MENU = 2000 / 1125;
const RATIO_STORY = RATIO_MENU;

const SCREENS = {
  // ---------------------------------------------------------------
  // Landing
  // ---------------------------------------------------------------
  landing: {
    id: "landing",
    type: "menu",
    image: "assets/images/page-01.jpg",
    ratio: RATIO_MENU,
    alt: "Title screen with a moonlit thatched Manobo hut and two banners reading START and OPTIONS.",
    buttons: [
      { x: 66.5, y: 31.5, w: 25, h: 19, target: "opening", label: "Start" },
      { x: 67, y: 56, w: 25, h: 19, target: "options", label: "Options" },
    ],
  },

  // ---------------------------------------------------------------
  // Options (fully custom panel — no background image; see app.js
  // buildOptionsControls())
  // ---------------------------------------------------------------
  options: {
    id: "options",
    type: "options",
    ratio: RATIO_MENU,
    alt: "Options screen with a mute toggle and an interactive volume slider.",
    returnTo: "landing", // overridden at runtime with the screen that opened it
  },

  // ---------------------------------------------------------------
  // Opening narrative + Manobo Tribe intro
  // ---------------------------------------------------------------
  opening: {
    id: "opening",
    type: "menu",
    image: "assets/images/page-03.jpg",
    ratio: RATIO_MENU,
    alt: "Opening narration over a misty jungle scene: The gongs of Mount Apo grow silent, traveler...",
    buttons: [{ x: 89.5, y: 81.5, w: 9.5, h: 17, target: "manobo-title", label: "Next" }],
  },
  "manobo-title": {
    id: "manobo-title",
    type: "menu",
    image: "assets/images/page-04.jpg",
    ratio: RATIO_MENU,
    alt: "Section title: Manobo Tribe, over a moonlit palm canopy.",
    buttons: [{ x: 89.5, y: 81.5, w: 9.5, h: 17, target: "manobo-photo", label: "Next" }],
  },
  "manobo-photo": {
    id: "manobo-photo",
    type: "menu",
    image: "assets/images/page-05.jpg",
    ratio: RATIO_MENU,
    alt: "Photograph of an Ata-Manobo family in traditional attire. Source: National Commission on Indigenous Peoples.",
    buttons: [{ x: 89.5, y: 81.5, w: 9.5, h: 17, target: "play-learn", label: "Next" }],
  },

  // ---------------------------------------------------------------
  // Play / Learn fork
  // ---------------------------------------------------------------
  "play-learn": {
    id: "play-learn",
    type: "menu",
    image: "assets/images/page-06.jpg",
    ratio: RATIO_MENU,
    alt: "Choice screen split by a torn page: an ornate PLAY emblem on the left, LEARN on the right.",
    buttons: [
      { x: 15, y: 38, w: 23, h: 46, target: "placeholder-play", label: "Play" },
      { x: 62, y: 38, w: 23, h: 46, target: "learn-hub", label: "Learn" },
    ],
  },

  // ---------------------------------------------------------------
  // Learn hub: one screen with four scrolls (History & Culture, Art
  // and Crafts, Religion and Beliefs, Literatures) and a Return
  // button. Replaces the previous per-category carousel — this
  // revision of the deck only draws one hub screen, not four
  // separate section title pages.
  // ---------------------------------------------------------------
  "learn-hub": {
    id: "learn-hub",
    type: "menu",
    image: "assets/images/page-07.jpg",
    ratio: RATIO_MENU,
    alt: "Learn hub with four scrolls: History and Culture, Art and Crafts, Religion and Beliefs, and Literatures.",
    buttons: [
      { x: 10, y: 12, w: 35, h: 30, target: "placeholder-history", label: "History and Culture" },
      { x: 55, y: 12, w: 35, h: 30, target: "placeholder-art", label: "Art and Crafts" },
      { x: 10, y: 50, w: 35, h: 32, target: "placeholder-religion", label: "Religion and Beliefs" },
      { x: 55, y: 50, w: 35, h: 32, target: "story-00", label: "Literatures" },
      { x: 89.5, y: 81.5, w: 9.5, h: 17, target: "play-learn", label: "Return" },
    ],
  },

  // ---------------------------------------------------------------
  // Placeholder screens.
  //
  // The source PDF only contains built-out narrative content for the
  // Literatures section (the Juan story). PLAY, and the History &
  // Culture / Art and Crafts / Religion and Beliefs scrolls on the
  // Learn hub, have no destination content in the supplied source.
  // Per "no invented content," these lead to a plain, clearly-labeled
  // placeholder rather than fabricated facts or a fabricated game.
  // ---------------------------------------------------------------
  "placeholder-play": {
    id: "placeholder-play",
    type: "placeholder",
    heading: "Play",
    message:
      "The source presentation doesn't include built-out Play content yet — only a PLAY emblem on the menu screen. This screen is a placeholder so the button isn't dead; tell me what the Play experience should contain and I'll build it.",
    returnTo: "play-learn",
  },
  "placeholder-history": {
    id: "placeholder-history",
    type: "placeholder",
    heading: "History and Culture",
    message:
      "The Learn hub includes a scroll for History and Culture, but no further slides for this section — only the Literatures section has full story content. This screen is a placeholder until that content is supplied.",
    returnTo: "learn-hub",
  },
  "placeholder-art": {
    id: "placeholder-art",
    type: "placeholder",
    heading: "Art and Crafts",
    message:
      "The Learn hub includes a scroll for Art and Crafts, but no further slides for this section — only the Literatures section has full story content. This screen is a placeholder until that content is supplied.",
    returnTo: "learn-hub",
  },
  "placeholder-religion": {
    id: "placeholder-religion",
    type: "placeholder",
    heading: "Religion and Beliefs",
    message:
      "The Learn hub includes a scroll for Religion and Beliefs, but no further slides for this section — only the Literatures section has full story content. This screen is a placeholder until that content is supplied.",
    returnTo: "learn-hub",
  },

  // ---------------------------------------------------------------
  // Closing screen — new in this revision. The story no longer loops
  // back into the Learn hub; the last panel now leads here.
  // ---------------------------------------------------------------
  "the-end": {
    id: "the-end",
    type: "menu",
    image: "assets/images/the-end.jpg",
    ratio: RATIO_MENU,
    alt: "Closing illustration of Juan and Dona Maria's wedding feast at sunset, captioned THE END.",
    buttons: [{ x: 87, y: 83, w: 10, h: 15, target: "learn-hub", label: "Return" }],
  },
};

// ---------------------------------------------------------------
// Literatures story: "Itulon: Moka-Atag Ki Juan" (The Story of Juan)
// by Datu Omelis P Agod — 15 panels total. These panels carry no
// baked-in navigation in the source artwork, so the app overlays one
// small, consistent Previous/Next control pair.
// ---------------------------------------------------------------
const STORY_PANEL_COUNT = 15;
for (let i = 0; i < STORY_PANEL_COUNT; i++) {
  const id = `story-${String(i).padStart(2, "0")}`;
  const prev = i === 0 ? "learn-hub" : `story-${String(i - 1).padStart(2, "0")}`;
  const next = i === STORY_PANEL_COUNT - 1 ? "the-end" : `story-${String(i + 1).padStart(2, "0")}`;
  SCREENS[id] = {
    id,
    type: "story",
    image: `assets/images/story-${String(i).padStart(2, "0")}.jpg`,
    narration: `assets/audio/narration/story-${String(i).padStart(2, "0")}.mp3`,
    ratio: RATIO_STORY,
    alt:
      i === 0
        ? "Story title panel: Itulon, Moka-Atag Ki Juan (The Story of Juan), by Datu Omelis P Agod."
        : `Story panel ${i} of 14 from The Story of Juan.`,
    section: "Literatures",
    index: i,
    total: STORY_PANEL_COUNT,
    prev,
    next,
    isFirst: i === 0,
    isLast: i === STORY_PANEL_COUNT - 1,
  };
}

const START_SCREEN = "landing";
