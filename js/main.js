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

// Motorcycle flyby — drive across screen right-to-left, 3s after page load, 2s trip
window.addEventListener('load', () => {
  const bike = document.getElementById('motorcycleFlyby');
  if (!bike) return;
  setTimeout(() => {
    bike.classList.add('driving');
    // Hide it after the animation finishes so it doesn't sit invisibly on top of clicks
    bike.addEventListener('animationend', () => {
      bike.style.display = 'none';
    }, { once: true });
  }, 3000);
});
