// ===== TOP GUN BAR — INTERACTIVITY =====

// Mobile nav toggle
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');
if (toggle && links) {
  toggle.addEventListener('click', () => links.classList.toggle('open'));
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => links.classList.remove('open'));
  });
}

// Auto year in footer
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();

// ===== Motorcycle flyby with engine sound + fist-pump arm overlay =====
window.addEventListener('load', () => {
  const wrapper = document.getElementById('motorcycleFlyby');
  if (!wrapper) return;

  const targetText = document.querySelector('.hero-history');

  // Preload engine sound
  const engineSound = new Audio('sounds/motorcycle.mp3');
  engineSound.preload = 'auto';
  engineSound.volume = 0;
  engineSound.load();

  // Unlock audio on first user gesture
  let audioUnlocked = false;
  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    engineSound.muted = true;
    const p = engineSound.play();
    if (p !== undefined) {
      p.then(() => {
        engineSound.pause();
        engineSound.currentTime = 0;
        engineSound.muted = false;
      }).catch(() => { engineSound.muted = false; });
    }
  }
  ['click', 'touchstart', 'keydown', 'scroll', 'mousemove', 'pointerdown'].forEach(evt => {
    window.addEventListener(evt, unlockAudio, { once: true, passive: true, capture: true });
  });

  // Position bike vertically aligned with the "Great Balls of Fire" line
  function positionBike() {
    if (!targetText) return;
    const rect = targetText.getBoundingClientRect();
    const targetY = rect.top + rect.height / 2;
    const wrapperHeight = wrapper.offsetHeight || 280;
    wrapper.style.top = (targetY - wrapperHeight / 2) + 'px';
  }
  positionBike();
  window.addEventListener('resize', positionBike);

  // Engine volume envelope
  function fadeVolume() {
    const targetMax = 0.7;
    const totalDuration = 2000;
    const steps = 40;
    const stepInterval = totalDuration / steps;
    let i = 0;
    const id = setInterval(() => {
      const t = i / steps;
      const env = 1 - Math.abs(t - 0.5) * 2;
      engineSound.volume = Math.max(0, Math.min(1, env * targetMax));
      i++;
      if (i > steps) clearInterval(id);
    }, stepInterval);
  }

  setTimeout(() => {
    positionBike();
    wrapper.classList.add('driving');

    // Trigger the fist-pump animation via a class — the arm element animates with CSS
    // Pump starts at t=0.7s (bike about to reach center), peaks at t=1.0s, returns by t=1.4s
    setTimeout(() => { wrapper.classList.add('pumping'); }, 700);
    setTimeout(() => { wrapper.classList.remove('pumping'); }, 1400);

    // Play engine sound
    try {
      engineSound.currentTime = 0;
      engineSound.volume = 0.7;
      engineSound.muted = false;
    } catch (e) {}
    const playPromise = engineSound.play();
    if (playPromise !== undefined) {
      playPromise.then(() => fadeVolume()).catch(err => {
        console.warn('Audio blocked — user must interact first.', err);
      });
    } else {
      fadeVolume();
    }

    wrapper.addEventListener('animationend', () => {
      wrapper.style.display = 'none';
      setTimeout(() => {
        engineSound.pause();
        engineSound.currentTime = 0;
      }, 400);
    }, { once: true });
  }, 3000);
});

/* ---------------------------------------------------------------
 * Collage full-screen lightbox
 *
 * Behavior:
 *  - Click (or Enter/Space) on the collage  -> open full-screen overlay
 *    with smooth fade + zoom-in transition.
 *  - Click anywhere on the overlay (or the X button, or press Escape,
 *    or use browser Back) -> close overlay and return to home page
 *    in its previous scroll position.
 *  - Uses history.pushState so the browser Back button is a natural way
 *    to close the lightbox without breaking history (we pop our own
 *    state, never the user's).
 *  - Locks body scroll while open; restores scrollbar gutter so the
 *    page doesn't jump.
 *  - Fully keyboard accessible and respects prefers-reduced-motion.
 * --------------------------------------------------------------- */
(function initCollageLightbox() {
  const trigger  = document.getElementById('collageShowcase');
  const lightbox = document.getElementById('collageLightbox');
  const closeBtn = document.getElementById('collageLightboxClose');
  if (!trigger || !lightbox) return;

  const HISTORY_FLAG = 'collage-lightbox';
  let isOpen = false;
  let lastFocus = null;

  function lockBodyScroll() {
    // Compensate for vertical scrollbar so layout doesn't jump on desktop
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty('--scrollbar-comp', sbw + 'px');
    document.body.classList.add('collage-lightbox-open');
  }
  function unlockBodyScroll() {
    document.body.classList.remove('collage-lightbox-open');
    document.documentElement.style.removeProperty('--scrollbar-comp');
  }

  function openLightbox() {
    if (isOpen) return;
    isOpen = true;
    lastFocus = document.activeElement;
    lockBodyScroll();
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    // Focus the close button so Escape / Enter work and screen readers announce it
    setTimeout(() => { try { closeBtn && closeBtn.focus({ preventScroll: true }); } catch (e) {} }, 50);
    // Push a history entry so the user's Back button closes the lightbox
    // (without leaving the page). We tag the state so popstate knows it's ours.
    try {
      history.pushState({ [HISTORY_FLAG]: true }, '', '#collage');
    } catch (e) { /* ignore if history API unavailable */ }
  }

  function closeLightbox(opts) {
    if (!isOpen) return;
    isOpen = false;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    unlockBodyScroll();
    // Restore focus to the trigger for keyboard users
    try { lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true }); } catch (e) {}
    // If we were closed by something OTHER than the browser Back button,
    // pop our pushed history entry so we don't pollute history.
    if (!opts || !opts.fromPopState) {
      const st = history.state;
      if (st && st[HISTORY_FLAG]) {
        try { history.back(); } catch (e) {}
      }
    }
  }

  // --- Event wiring ---
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    openLightbox();
  });
  // Keyboard activation (Enter / Space) since the trigger is a role="button"
  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      openLightbox();
    }
  });

  // Click anywhere on the overlay closes it (image included — that's the spec)
  lightbox.addEventListener('click', () => {
    closeLightbox();
  });
  // The close button stops propagation isn't needed because the overlay also closes,
  // but we still want explicit handling for screen readers / keyboard users:
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeLightbox();
    });
  }

  // Escape key closes
  document.addEventListener('keydown', (e) => {
    if (isOpen && (e.key === 'Escape' || e.key === 'Esc')) {
      e.preventDefault();
      closeLightbox();
    }
  });

  // Browser Back button: if we pushed our state, close without re-popping
  window.addEventListener('popstate', () => {
    if (isOpen) closeLightbox({ fromPopState: true });
  });

  // If the page loads with #collage in the URL (e.g. shared link), open it
  if (window.location.hash === '#collage') {
    // Defer so layout/styles are ready
    requestAnimationFrame(() => openLightbox());
  }
})();
