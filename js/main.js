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

  setTimeout(() => {
    positionBike(); // re-position right before launch in case layout shifted
    bike.classList.add('driving');
    bike.addEventListener('animationend', () => {
      bike.style.display = 'none';
    }, { once: true });
  }, 3000);
});
