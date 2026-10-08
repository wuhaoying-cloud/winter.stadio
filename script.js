const home = document.querySelector('#home');
const official = document.querySelector('#official');
const winter = document.querySelector('#winter');
const winterStage = document.querySelector('#winter-stage');
const winterWorld = document.querySelector('#winter-world');
const winterPanorama = document.querySelector('.winter-panorama');
const winterProgress = document.querySelector('#winter-progress');
const pending = document.querySelector('#pending-note');
const pendingMessage = document.querySelector('#pending-message');

function showOfficial() {
  home.hidden = true;
  winter.hidden = true;
  official.hidden = false;
  pending.hidden = true;
  window.location.hash = 'official';
}

function showWinter() {
  home.hidden = true;
  official.hidden = true;
  winter.hidden = false;
  pending.hidden = true;
  window.location.hash = 'winter';
  measurePanorama();
  winterStage.focus({ preventScroll: true });
}

function showHome() {
  official.hidden = true;
  winter.hidden = true;
  home.hidden = false;
  pending.hidden = true;
  window.location.hash = 'home';
}

function showPending(page) {
  const names = { winter: 'WINTER 김민정', fans: 'Fan Archive' };
  pendingMessage.textContent = `${names[page]} 的页面等你发来对应设计后再继续。`;
  pending.hidden = false;
}

document.querySelectorAll('[data-page]').forEach(entry => {
  entry.addEventListener('click', event => {
    event.preventDefault();
    if (entry.dataset.page === 'official') showOfficial();
    else if (entry.dataset.page === 'winter') showWinter();
    else showPending(entry.dataset.page);
  });
});

document.querySelector('.official-back').addEventListener('click', showHome);
document.querySelector('.winter-back').addEventListener('click', showHome);
document.querySelector('.pending-close').addEventListener('click', () => { pending.hidden = true; });
pending.addEventListener('click', event => {
  if (event.target === pending) pending.hidden = true;
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') pending.hidden = true;
});

let maxTravel = 0;
let targetTravel = 0;
let travel = 0;
let targetY = 0;
let cameraY = 0;
let lastFrame = 0;
let lastPointerX = null;
const limit = (value, min, max) => Math.max(min, Math.min(max, value));

function measurePanorama() {
  maxTravel = Math.max(0, winterPanorama.getBoundingClientRect().width - winterStage.clientWidth);
  targetTravel = limit(targetTravel, 0, maxTravel);
}

winterPanorama.addEventListener('load', measurePanorama);
window.addEventListener('resize', measurePanorama);
if (winterPanorama.complete) measurePanorama();

winterStage.addEventListener('pointermove', event => {
  const bounds = winterStage.getBoundingClientRect();
  const y = limit((event.clientY - bounds.top) / bounds.height, 0, 1);
  // Rightward hand movement walks the view along this one flat panorama.
  if (lastPointerX !== null) {
    targetTravel = limit(targetTravel + (event.clientX - lastPointerX) * 2.2, 0, maxTravel);
  }
  lastPointerX = event.clientX;
  targetY = (0.5 - y) * 5;
});
winterStage.addEventListener('pointerleave', () => { lastPointerX = null; });

winterStage.addEventListener('wheel', event => {
  event.preventDefault();
  targetTravel = limit(targetTravel + (event.deltaX || event.deltaY) * 1.25, 0, maxTravel);
}, { passive: false });

winterStage.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'PageDown') {
    event.preventDefault();
    targetTravel = limit(targetTravel + winterStage.clientWidth * 0.4, 0, maxTravel);
  } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
    event.preventDefault();
    targetTravel = limit(targetTravel - winterStage.clientWidth * 0.4, 0, maxTravel);
  }
});

const seedField = document.querySelector('#dandelion-field');
const seedLayout = [
  [7, 76, 15, 25, -30, 0], [18, 54, 11, 22, 40, 5], [29, 89, 13, 29, -52, 11],
  [41, 68, 17, 27, 58, 3], [53, 94, 12, 24, -34, 14], [64, 49, 14, 23, 44, 8],
  [74, 82, 16, 31, -48, 17], [86, 62, 12, 26, 32, 1], [95, 91, 15, 28, -60, 9],
  [11, 36, 10, 34, 45, 19], [37, 43, 12, 30, -38, 6], [69, 28, 11, 32, 54, 12],
  [91, 37, 13, 27, -44, 21], [57, 22, 9, 36, 40, 15]
];
seedLayout.forEach(([x, y, size, duration, drift, delay]) => {
  const seed = document.createElement('span');
  seed.className = 'dandelion-seed';
  seed.style.setProperty('--seed-x', `${x}%`);
  seed.style.setProperty('--seed-y', `${y}%`);
  seed.style.setProperty('--seed-size', `${size}px`);
  seed.style.setProperty('--seed-duration', `${duration}s`);
  seed.style.setProperty('--seed-drift', `${drift}px`);
  seed.style.setProperty('--seed-delay', `${delay * -1}s`);
  seedField.append(seed);
});

function animateJourney(time) {
  const elapsed = lastFrame ? Math.min((time - lastFrame) / 1000, 0.05) : 0.016;
  lastFrame = time;
  const ease = 1 - Math.exp(-elapsed * 3.8);
  travel += (targetTravel - travel) * ease;
  cameraY += (targetY - cameraY) * ease;
  const progress = maxTravel ? travel / maxTravel : 0;
  const walkBob = Math.sin(time / 390) * (0.65 + progress * 0.55);
  const scale = 1 + progress * 0.045;
  winterWorld.style.setProperty('--camera-x', `${(-travel).toFixed(1)}px`);
  winterWorld.style.setProperty('--camera-y', `${(cameraY + walkBob).toFixed(1)}px`);
  winterWorld.style.setProperty('--camera-scale', scale.toFixed(4));
  winterProgress.textContent = String(Math.min(4, Math.floor(progress * 4) + 1)).padStart(2, '0');
  requestAnimationFrame(animateJourney);
}
requestAnimationFrame(animateJourney);

window.addEventListener('hashchange', () => {
  if (window.location.hash === '#official') {
    home.hidden = true;
    winter.hidden = true;
    official.hidden = false;
    pending.hidden = true;
  } else if (window.location.hash === '#winter') {
    showWinter();
  } else if (!window.location.hash || window.location.hash === '#home') {
    showHome();
  }
});

if (window.location.hash === '#official') {
  home.hidden = true;
  official.hidden = false;
} else if (window.location.hash === '#winter') {
  showWinter();
}
