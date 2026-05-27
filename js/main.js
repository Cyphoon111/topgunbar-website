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
