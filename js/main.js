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

// Motorcycle flyby — drive across the "Great Balls of Fire" line, 3s after page load, 2s trip
window.addEventListener('load', () => {
  const bike = document.getElementById('motorcycleFlyby');
  const targetText = document.querySelector('.hero-history');
  if (!bike) return;

  // Preload the engine sound
  const engineSound = new Audio('sounds/motorcycle.mp3');
  engineSound.preload = 'auto';
  engineSound.volume = 0.0; // start silent for smooth fade-in

  // Position the bike vertically aligned with the "Great Balls of Fire" line
  function positionBike() {
    if (!targetText) return;
    const rect = targetText.getBoundingClientRect();
    const targetY = rect.top + rect.height / 2; // vertical center of the text line
    const bikeHeight = bike.offsetHeight || 280;
    bike.style.top = (targetY - bikeHeight / 2) + 'px';
  }
  positionBike();
  window.addEventListener('resize', positionBike);

  // Fade volume helper (Doppler-like: ramp up as it approaches center, ramp down as it passes)
  function fadeVolume() {
    const targetMax = 0.6;
    const totalDuration = 2000; // matches CSS animation
    const steps = 40;
    const stepInterval = totalDuration / steps;
    let i = 0;
    const id = setInterval(() => {
      const t = i / steps; // 0 → 1
      // triangular envelope: peak at t=0.5
      const env = 1 - Math.abs(t - 0.5) * 2;
      engineSound.volume = Math.max(0, Math.min(1, env * targetMax));
      i++;
      if (i > steps) clearInterval(id);
    }, stepInterval);
  }

  setTimeout(() => {
    positionBike(); // re-position right before launch in case layout shifted
    bike.classList.add('driving');
    // Play engine sound — modern browsers require user gesture for audio,
    // but autoplay is usually allowed on first navigation if muted/low volume
    const playPromise = engineSound.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        fadeVolume();
      }).catch(() => {
        // Audio blocked by browser autoplay policy — fail silently
      });
    } else {
      fadeVolume();
    }
    bike.addEventListener('animationend', () => {
      bike.style.display = 'none';
      // stop the audio after the bike leaves screen
      setTimeout(() => {
        engineSound.pause();
        engineSound.currentTime = 0;
      }, 500);
    }, { once: true });
  }, 3000);
});
