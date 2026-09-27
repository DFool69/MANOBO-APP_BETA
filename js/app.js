/**
 * app.js — presentation shell.
 *
 * Renders one screen at a time from SCREENS (screens.js), keyed by
 * `currentScreen`. Navigation always goes through goTo(id); no component
 * hardcodes a destination outside the data file.
 */

(function () {
  "use strict";

  const stage = document.getElementById("stage");
  const frame = document.getElementById("frame");
  const img = document.getElementById("screen-image");
  const hotspots = document.getElementById("hotspots");
  const liveRegion = document.getElementById("sr-live");
  const appEl = document.getElementById("app");
  const fullscreenBtn = document.getElementById("btn-fullscreen");
  const homeBtn = document.getElementById("btn-home");
  const muteBtn = document.getElementById("btn-mute");

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** @type {string} */
  let currentScreen = null;
  let optionsReturnTo = "landing";

  // ---- Audio state (UI + persistence only; no music file is supplied
  // in the source, so no audio actually plays — see README.md) --------
  const audioEl = document.getElementById("bg-audio");
  const VOLUME_KEY = "manobo-app:volume";
  const MUTED_KEY = "manobo-app:muted";
  let volume = clamp(parseFloat(localStorage.getItem(VOLUME_KEY) ?? "0.6"), 0, 1);
  let muted = localStorage.getItem(MUTED_KEY) === "true";
  let lastVolume = volume > 0 ? volume : 0.6;

  // Inline speaker icons for the options-screen mute toggle (no image asset).
  const ICON_UNMUTED =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round"><polygon points="3 9 7 9 12 4 12 20 7 15 3 15" ' +
    'fill="currentColor" stroke="none"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/>' +
    '<path d="M18 5.5a9 9 0 0 1 0 13"/></svg>';
  const ICON_MUTED =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round"><polygon points="3 9 7 9 12 4 12 20 7 15 3 15" ' +
    'fill="currentColor" stroke="none"/><line x1="16" y1="9" x2="22" y2="15"/>' +
    '<line x1="22" y1="9" x2="16" y2="15"/></svg>';

  // ---- Story narration (per-panel <audio>; no files supplied yet — see
  // assets/audio/narration/README.txt) ---------------------------------
  const narrationAudio = document.getElementById("narration-audio");
  let narrationToken = 0; // invalidates stale async callbacks after navigation

  narrationAudio.addEventListener("play", updateNarrationButton);
  narrationAudio.addEventListener("pause", updateNarrationButton);
  narrationAudio.addEventListener("ended", updateNarrationButton);

  function clamp(n, lo, hi) {
    return Math.min(hi, Math.max(lo, n));
  }

  function updateNarrationButton() {
    const btn = document.getElementById("narration-toggle");
    if (!btn || btn.hidden) return;
    const playing = !narrationAudio.paused && !narrationAudio.ended;
    btn.textContent = playing ? "\u23F8" : "\u25B6";
    btn.setAttribute("aria-pressed", String(playing));
    btn.setAttribute("aria-label", playing ? "Pause narration" : "Play narration");
  }

  // Loads and auto-plays the given story screen's narration file, if any
  // exists. Silently hides the toggle button when the file is missing —
  // e.g. before narration audio has been supplied — so the app never
  // errors out over an absent asset.
  function startNarration(screen) {
    const token = ++narrationToken;
    const btn = document.getElementById("narration-toggle");
    if (!btn || !screen.narration) return;

    btn.hidden = true;
    narrationAudio.pause();
    narrationAudio.currentTime = 0;

    const onError = () => {
      if (token !== narrationToken) return;
      btn.hidden = true;
    };
    const onCanPlay = () => {
      if (token !== narrationToken) return;
      narrationAudio.removeEventListener("error", onError);
      btn.hidden = false;
      narrationAudio.volume = volume;
      narrationAudio.muted = muted || volume === 0;
      narrationAudio.play().catch(() => {
        // Autoplay blocked (rare, given navigation was a user gesture) —
        // leave it paused; the visible toggle lets the user start it.
      });
      updateNarrationButton();
    };

    narrationAudio.addEventListener("error", onError, { once: true });
    narrationAudio.addEventListener("canplaythrough", onCanPlay, { once: true });
    narrationAudio.src = screen.narration;
    narrationAudio.load();
  }

  function stopNarration() {
    narrationToken++; // invalidate any in-flight load/error callbacks
    narrationAudio.pause();
    narrationAudio.removeAttribute("src");
    narrationAudio.load();
  }

  function applyAudioState() {
    const isMuted = muted || volume === 0;

    audioEl.volume = volume;
    audioEl.muted = isMuted;
    if (narrationAudio.src) narrationAudio.muted = isMuted;
    if (narrationAudio.src) narrationAudio.volume = volume;
    localStorage.setItem(VOLUME_KEY, String(volume));
    localStorage.setItem(MUTED_KEY, String(muted));

    muteBtn.setAttribute("aria-pressed", String(isMuted));
    muteBtn.textContent = isMuted ? "\u{1F507}" : "\u{1F50A}";
    muteBtn.setAttribute("aria-label", isMuted ? "Unmute" : "Mute");

    const toggle = document.getElementById("opt-mute-toggle");
    const slider = document.getElementById("opt-volume-slider");
    const valueLabel = document.getElementById("opt-volume-value");
    if (toggle) {
      toggle.innerHTML = isMuted ? ICON_MUTED : ICON_UNMUTED;
      toggle.setAttribute("aria-pressed", String(isMuted));
      toggle.setAttribute("aria-label", isMuted ? "Unmute" : "Mute");
    }
    if (slider) {
      slider.value = String(volume);
      const pct = Math.round(volume * 100);
      slider.style.background =
        "linear-gradient(to right, var(--accent-red) " + pct + "%, var(--brown-mid) " + pct + "%)";
    }
    if (valueLabel) valueLabel.textContent = Math.round(volume * 100) + "%";
  }

  muteBtn.addEventListener("click", () => {
    muted = !muted;
    applyAudioState();
  });

  // ---------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------
  function render(id, opts) {
    const screen = SCREENS[id];
    if (!screen) {
      console.error("Unknown screen id:", id);
      return;
    }
    const direction = (opts && opts.direction) || "none";

    frame.style.aspectRatio = String(screen.ratio);
    hotspots.innerHTML = "";
    hotspots.className = "";

    const doSwap = () => {
      if (screen.type === "options") {
        img.removeAttribute("src");
        img.alt = "";
        buildOptionsControls();
      } else if (screen.type === "placeholder") {
        img.removeAttribute("src");
        img.alt = "";
        buildPlaceholder(screen);
      } else {
      img.src = screen.image;
      img.alt = screen.alt || "";

      // Remove any previous smoke animation
      document.querySelectorAll(".opening-smoke").forEach(el => el.remove());

      // Add moving smoke effect only on the opening screen
      if (screen.id === "opening") {
      const smoke = document.createElement("div");
      smoke.className = "opening-smoke";
      smoke.setAttribute("aria-hidden", "true");

      frame.appendChild(smoke);
      }

  if (screen.type === "menu") buildMenuButtons(screen);
  if (screen.type === "story") buildStoryNav(screen);
    }
      currentScreen = id;
      announce(screen.alt || screen.heading || id);
      updateHomeVisibility();
      syncHash(id);
    };

    if (prefersReducedMotion) {
      doSwap();
      return;
    }

    frame.classList.add("is-transitioning");
    frame.addEventListener(
      "transitionend",
      function handler() {
        frame.removeEventListener("transitionend", handler);
        doSwap();
        requestAnimationFrame(() => frame.classList.remove("is-transitioning"));
      },
      { once: true }
    );
    // Fallback in case transitionend doesn't fire (e.g. display:none ancestor)
    setTimeout(() => {
      if (frame.classList.contains("is-transitioning")) {
        frame.classList.remove("is-transitioning");
      }
    }, 400);
  }

  function announce(text) {
    liveRegion.textContent = text;
  }

  function updateHomeVisibility() {
    homeBtn.hidden = currentScreen === "landing";
  }

  function syncHash(id) {
    if (history.replaceState) {
      history.replaceState(null, "", "#" + id);
    } else {
      location.hash = id;
    }
  }

  // ---------------------------------------------------------------
  // Menu screens: buttons positioned to match printed artwork
  // ---------------------------------------------------------------
  function buildMenuButtons(screen) {
    (screen.buttons || []).forEach((btn) => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "hotspot";
      el.style.left = btn.x + "%";
      el.style.top = btn.y + "%";
      el.style.width = btn.w + "%";
      el.style.height = btn.h + "%";
      el.setAttribute("aria-label", btn.label);
      el.addEventListener("click", () => {
        if (btn.target === "options") optionsReturnTo = currentScreen;
        goTo(btn.target);
      });
      hotspots.appendChild(el);
    });
  }

  // ---------------------------------------------------------------
  // Story screens: consistent added Prev/Next chrome (none baked into
  // the source artwork for these panels — see screens.js comment)
  // ---------------------------------------------------------------
  function buildStoryNav(screen) {
    hotspots.className = "story-chrome";

    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "story-nav story-nav--prev";
    prevBtn.setAttribute("aria-label", screen.isFirst ? "Back to Literatures menu" : "Previous");
    prevBtn.innerHTML = "&#8592;";
    prevBtn.addEventListener("click", () => goTo(screen.prev));

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "story-nav story-nav--next";
    nextBtn.setAttribute("aria-label", screen.isLast ? "Finish and return to menu" : "Next");
    nextBtn.innerHTML = screen.isLast ? "Finish &#10003;" : "Next &#8594;";
    nextBtn.addEventListener("click", () => goTo(screen.next));

    const counter = document.createElement("div");
    counter.className = "story-counter";
    counter.textContent = screen.index + 1 + " / " + screen.total;

    hotspots.appendChild(prevBtn);
    hotspots.appendChild(counter);
    hotspots.appendChild(nextBtn);
  }

  // ---------------------------------------------------------------
  // Options screen: no background image — a custom panel with a
  // mute-toggle icon and an interactive volume slider, styled to
  // match the app's theme instead of overlaying drawn artwork.
  // ---------------------------------------------------------------
  function buildOptionsControls() {
    hotspots.className = "options-chrome";

    const card = document.createElement("div");
    card.className = "options-card";

    const heading = document.createElement("h2");
    heading.textContent = "Options";

    const row = document.createElement("div");
    row.className = "options-volume-row";

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.id = "opt-mute-toggle";
    toggle.className = "opt-mute-toggle";
    toggle.addEventListener("click", () => {
      if (muted || volume === 0) {
        muted = false;
        if (volume === 0) volume = lastVolume;
      } else {
        lastVolume = volume;
        muted = true;
      }
      applyAudioState();
    });

    const slider = document.createElement("input");
    slider.type = "range";
    slider.id = "opt-volume-slider";
    slider.className = "opt-volume-slider";
    slider.min = "0";
    slider.max = "1";
    slider.step = "0.01";
    slider.value = String(volume);
    slider.setAttribute("aria-label", "Volume");
    slider.addEventListener("input", () => {
      volume = parseFloat(slider.value);
      if (volume > 0) {
        muted = false;
        lastVolume = volume;
      }
      applyAudioState();
    });

    const valueLabel = document.createElement("span");
    valueLabel.id = "opt-volume-value";
    valueLabel.className = "options-volume-value";

    row.appendChild(toggle);
    row.appendChild(slider);
    row.appendChild(valueLabel);

    const backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "options-back";
    backBtn.textContent = "\u25C0 Back";
    backBtn.addEventListener("click", () => goTo(optionsReturnTo));

    card.appendChild(heading);
    card.appendChild(row);
    card.appendChild(backBtn);
    hotspots.appendChild(card);

    applyAudioState();
  }

  // ---------------------------------------------------------------
  // Placeholder screens (no source content — see screens.js comment)
  // ---------------------------------------------------------------
  function buildPlaceholder(screen) {
    hotspots.className = "placeholder-chrome";
    const card = document.createElement("div");
    card.className = "placeholder-card";

    const h = document.createElement("h2");
    h.textContent = screen.heading;
    const p = document.createElement("p");
    p.textContent = screen.message;
    const back = document.createElement("button");
    back.type = "button";
    back.className = "placeholder-back";
    back.textContent = "\u25C0 Back";
    back.addEventListener("click", () => goTo(screen.returnTo));

    card.appendChild(h);
    card.appendChild(p);
    card.appendChild(back);
    hotspots.appendChild(card);
  }

  // ---------------------------------------------------------------
  // Navigation entry point
  // ---------------------------------------------------------------
  function goTo(id) {
    if (!SCREENS[id]) {
      console.error("goTo: unknown screen", id);
      return;
    }
    render(id);
  }

  // ---------------------------------------------------------------
  // Global chrome: home, fullscreen, keyboard
  // ---------------------------------------------------------------
  homeBtn.addEventListener("click", () => goTo(START_SCREEN));

  fullscreenBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      appEl.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.();
    }
  });
  document.addEventListener("fullscreenchange", () => {
    fullscreenBtn.setAttribute("aria-pressed", String(!!document.fullscreenElement));
    fullscreenBtn.textContent = document.fullscreenElement ? "\u{2924}" : "\u{2922}";
  });

  document.addEventListener("keydown", (e) => {
    const screen = SCREENS[currentScreen];
    if (!screen) return;
    if (e.key === "Escape" && screen.type === "options") {
      goTo(optionsReturnTo);
      return;
    }
    if (screen.type === "story") {
      if (e.key === "ArrowRight" || e.key === " ") goTo(screen.next);
      if (e.key === "ArrowLeft") goTo(screen.prev);
    }
    if (screen.type === "menu") {
      const next = (screen.buttons || []).find((b) => b.label === "Next");
      const prev = (screen.buttons || []).find((b) => b.label === "Previous");
      if (e.key === "ArrowRight" && next) goTo(next.target);
      if (e.key === "ArrowLeft" && prev) goTo(prev.target);
    }
  });

  // ---------------------------------------------------------------
  // Boot: honor #hash deep link if valid, else start screen
  // ---------------------------------------------------------------
  const initialId = location.hash.replace("#", "");
  render(SCREENS[initialId] ? initialId : START_SCREEN);
  applyAudioState();
})();
