const home = document.querySelector('#home');
const official = document.querySelector('#official');
const winter = document.querySelector('#winter');
const winterStage = document.querySelector('#winter-stage');
const winterWorld = document.querySelector('#winter-world');
const winterProgress = document.querySelector('#winter-progress');
const winterPanels = [...winterWorld.querySelectorAll('.winter-panel')];
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

const panelStep = 1300;
const firstPanelDepth = 520;
const finalPanelDepth = panelStep * 3;
const maxTravel = finalPanelDepth;
let targetZ = 0;
let cameraZ = 0;
let targetX = 0;
let cameraX = 0;
let targetY = 0;
let cameraY = 0;
let targetYaw = 0;
let yaw = 0;
let targetPitch = 0;
let pitch = 0;
let lastPointer = null;

function limit(value, min, max) { return Math.max(min, Math.min(max, value)); }

winterStage.addEventListener('pointermove', event => {
  const bounds = winterStage.getBoundingClientRect();
  const x = limit((event.clientX - bounds.left) / bounds.width, 0, 1);
  const y = limit((event.clientY - bounds.top) / bounds.height, 0, 1);
  targetX = (0.5 - x) * 96;
  targetY = (0.5 - y) * 68;
  targetYaw = (x - 0.5) * 7;
  targetPitch = (0.5 - y) * 4.5;
  const pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  if (lastPointer) {
    // Every cursor sweep moves the camera deeper into the passage; horizontal motion also steers.
    targetZ = limit(targetZ + Math.hypot(pointer.x - lastPointer.x, pointer.y - lastPointer.y) * 1.25, 0, maxTravel);
  }
  lastPointer = pointer;
});

winterStage.addEventListener('wheel', event => {
  event.preventDefault();
  targetZ = limit(targetZ + event.deltaY * 1.2, 0, maxTravel);
}, { passive: false });

winterStage.addEventListener('keydown', event => {
  if (event.key === 'ArrowUp' || event.key === 'PageDown') {
    event.preventDefault();
    targetZ = limit(targetZ + panelStep * 0.32, 0, maxTravel);
  } else if (event.key === 'ArrowDown' || event.key === 'PageUp') {
    event.preventDefault();
    targetZ = limit(targetZ - panelStep * 0.32, 0, maxTravel);
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

let lastFrame = 0;
function animateJourney(time) {
  const elapsed = lastFrame ? Math.min((time - lastFrame) / 1000, 0.05) : 0.016;
  lastFrame = time;
  const ease = 1 - Math.exp(-elapsed * 4.6);
  cameraZ += (targetZ - cameraZ) * ease;
  cameraX += (targetX - cameraX) * ease;
  cameraY += (targetY - cameraY) * ease;
  yaw += (targetYaw - yaw) * ease;
  pitch += (targetPitch - pitch) * ease;
  winterWorld.style.setProperty('--camera-z', `${cameraZ.toFixed(1)}px`);
  winterWorld.style.setProperty('--camera-x', `${cameraX.toFixed(1)}px`);
  winterWorld.style.setProperty('--camera-y', `${cameraY.toFixed(1)}px`);
  winterWorld.style.setProperty('--camera-yaw', `${yaw.toFixed(2)}deg`);
  winterWorld.style.setProperty('--camera-pitch', `${pitch.toFixed(2)}deg`);
  winterPanels.forEach((panel, index) => {
    const panelDepth = firstPanelDepth + panelStep * index;
    panel.style.visibility = cameraZ > panelDepth + 200 ? 'hidden' : 'visible';
  });
  const currentPanel = cameraZ < panelStep ? 1
    : cameraZ < panelStep * 2 ? 2
      : cameraZ < finalPanelDepth ? 3 : 4;
  winterProgress.textContent = String(currentPanel).padStart(2, '0');
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
