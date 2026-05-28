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
