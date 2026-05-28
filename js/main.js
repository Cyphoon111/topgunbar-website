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

// ===== Motorcycle flyby with engine sound =====
window.addEventListener('load', () => {
  const bike = document.getElementById('motorcycleFlyby');
  const targetText = document.querySelector('.hero-history');
  if (!bike) return;

  // Preload engine sound
  const engineSound = new Audio('sounds/motorcycle.mp3');
  engineSound.preload = 'auto';
  engineSound.volume = 0;
  engineSound.load();

  // Preload fist-pump frame so the swap is instant (no flicker)
  const fistImg = new Image();
  fistImg.src = 'images/motorcycle-fist.png';

  // Unlock audio on FIRST user gesture so the autoplay policy is satisfied
  // by the time the bike fires
  let audioUnlocked = false;
  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    // Play silently for a tick, then pause — this satisfies the gesture requirement
    engineSound.muted = true;
    const p = engineSound.play();
    if (p !== undefined) {
      p.then(() => {
        engineSound.pause();
        engineSound.currentTime = 0;
        engineSound.muted = false;
      }).catch(() => {
        engineSound.muted = false;
      });
    }
  }
  // Listen for any user interaction
  ['click', 'touchstart', 'keydown', 'scroll', 'mousemove', 'pointerdown'].forEach(evt => {
    window.addEventListener(evt, unlockAudio, { once: true, passive: true, capture: true });
  });

  // Position bike vertically aligned with the "Great Balls of Fire" line
  function positionBike() {
    if (!targetText) return;
    const rect = targetText.getBoundingClientRect();
    const targetY = rect.top + rect.height / 2;
    const bikeHeight = bike.offsetHeight || 280;
    bike.style.top = (targetY - bikeHeight / 2) + 'px';
  }
  positionBike();
  window.addEventListener('resize', positionBike);

  // Doppler-style volume envelope: quiet → loud → quiet over the 2s flyby
  function fadeVolume() {
    const targetMax = 0.7;
    const totalDuration = 2000;
    const steps = 40;
    const stepInterval = totalDuration / steps;
    let i = 0;
    const id = setInterval(() => {
      const t = i / steps;
      const env = 1 - Math.abs(t - 0.5) * 2; // triangular envelope, peak at t=0.5
      engineSound.volume = Math.max(0, Math.min(1, env * targetMax));
      i++;
      if (i > steps) clearInterval(id);
    }, stepInterval);
  }

  setTimeout(() => {
    positionBike();
    bike.classList.add('driving');

    // Fist-pump frame swap: bike crosses center at t=1.0s (linear 2s animation).
    // Show fist-pump from t=0.85s to t=1.20s, then back to riding pose.
    const originalSrc = bike.getAttribute('src');
    const fistSrc = 'images/motorcycle-fist.png';
    setTimeout(() => { bike.setAttribute('src', fistSrc); }, 850);
    setTimeout(() => { bike.setAttribute('src', originalSrc); }, 1200);

    // Reset & play
    try {
      engineSound.currentTime = 0;
      engineSound.volume = 0.7; // immediate audible volume; fade overlay starts at 0 then rises
      engineSound.muted = false;
    } catch (e) {}

    const playPromise = engineSound.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        fadeVolume();
      }).catch((err) => {
        console.warn('Audio blocked — user must interact with page first.', err);
      });
    } else {
      fadeVolume();
    }

    bike.addEventListener('animationend', () => {
      bike.style.display = 'none';
      setTimeout(() => {
        engineSound.pause();
        engineSound.currentTime = 0;
      }, 400);
    }, { once: true });
  }, 3000);
});
