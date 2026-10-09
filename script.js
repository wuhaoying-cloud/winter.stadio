const home = document.querySelector('#home');
const official = document.querySelector('#official');
const winter = document.querySelector('#winter');
const winterStage = document.querySelector('#winter-stage');
const winterCanvas = document.querySelector('#winter-canvas');
const winterProgress = document.querySelector('#winter-progress');
const pending = document.querySelector('#pending-note');
const pendingMessage = document.querySelector('#pending-message');
const context = winterCanvas.getContext('2d');

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
  resizeCanvas();
  pending.hidden = true;
  targetTravel = 0;
  travel = 0;
  targetY = 0;
  cameraY = 0;
  lastPointerX = null;
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

const background = new Image();
background.src = 'winter-background.webp';
const mirrorData = [
  { x: 560, z: 0, w: 720, sprite: 'winter-mirror-01.png', hole: [167, 253, 118, 138] },
  { x: 1620, z: 700, w: 520, sprite: 'winter-mirror-02.png', hole: [150, 176, 50, 82] },
  { x: 2680, z: 1400, w: 700, sprite: 'winter-mirror-03.png', hole: [228, 294, 112, 160] },
  { x: 3740, z: 2100, w: 540, sprite: 'winter-mirror-04.png', hole: [174, 256, 84, 128] }
];
const mirrorImages = mirrorData.map(mirror => {
  const image = new Image();
  image.src = mirror.sprite;
  return image;
});

let viewWidth = 0;
let viewHeight = 0;
let sceneScale = 1;
let sceneOffsetX = 0;
let sceneOffsetY = 0;
let maxTravel = 2940;
let targetTravel = 0;
let travel = 0;
let targetY = 0;
let cameraY = 0;
let lastFrame = 0;
let lastPointerX = null;
const limit = (value, min, max) => Math.max(min, Math.min(max, value));

function resizeCanvas() {
  const bounds = winterStage.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  viewWidth = bounds.width;
  viewHeight = bounds.height;
  winterCanvas.width = Math.round(viewWidth * dpr);
  winterCanvas.height = Math.round(viewHeight * dpr);
  winterCanvas.style.width = `${viewWidth}px`;
  winterCanvas.style.height = `${viewHeight}px`;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  sceneScale = Math.min(viewWidth / 1920, viewHeight / 1080);
  sceneOffsetX = (viewWidth - 1920 * sceneScale) / 2;
  sceneOffsetY = (viewHeight - 1080 * sceneScale) / 2;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

winterStage.addEventListener('pointermove', event => {
  const bounds = winterStage.getBoundingClientRect();
  const y = limit((event.clientY - bounds.top) / bounds.height, 0, 1);
  if (lastPointerX !== null) {
    targetTravel = limit(targetTravel + (event.clientX - lastPointerX) * 0.9, 0, maxTravel);
  }
  lastPointerX = event.clientX;
  targetY = (0.5 - y) * 14;
});
winterStage.addEventListener('pointerleave', () => { lastPointerX = null; });
winterStage.addEventListener('wheel', event => {
  event.preventDefault();
  targetTravel = limit(targetTravel + (event.deltaX || event.deltaY) * 1.15, 0, maxTravel);
}, { passive: false });
winterStage.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'PageDown') {
    event.preventDefault();
    targetTravel = limit(targetTravel + 360, 0, maxTravel);
  } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
    event.preventDefault();
    targetTravel = limit(targetTravel - 360, 0, maxTravel);
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

function drawBackground(cameraX, cameraZ) {
  context.fillStyle = '#f5d8eb';
  context.fillRect(0, 0, viewWidth, viewHeight);
  if (!background.complete || !background.naturalWidth) return;
  const tileWidth = viewHeight * background.naturalWidth / background.naturalHeight;
  const offset = ((cameraX * 0.24 + cameraZ * 0.12) * sceneScale) % (tileWidth * 2);
  const firstX = -offset;
  const firstIndex = Math.floor((cameraX * 0.24 + cameraZ * 0.12) * sceneScale / tileWidth);
  for (let i = 0; firstX + i * tileWidth < viewWidth + tileWidth; i++) {
    const x = firstX + i * tileWidth;
    if ((firstIndex + i) % 2) {
      context.save();
      context.translate(x + tileWidth, 0);
      context.scale(-1, 1);
      context.drawImage(background, 0, 0, tileWidth, viewHeight);
      context.restore();
    } else {
      context.drawImage(background, x, 0, tileWidth, viewHeight);
    }
  }
}

function drawMirror(mirror, image, cameraX, cameraZ, bob) {
  if (!image.complete || !image.naturalWidth) return;
  const depth = mirror.z - cameraZ;
  if (depth < -520) return;
  const focalLength = 1120;
  const perspective = limit(focalLength / (focalLength + depth), 0.48, 1.72);
  const x = 960 + (mirror.x - cameraX) * perspective;
  const y = 540 + ((mirror.y ?? 540) - 540 - bob) * perspective;
  const width = mirror.w * perspective * sceneScale;
  const height = width * image.naturalHeight / image.naturalWidth;
  const left = sceneOffsetX + x * sceneScale - width / 2;
  const top = sceneOffsetY + y * sceneScale - height / 2;
  const unit = width / image.naturalWidth;
  const [holeX, holeY, holeRX, holeRY] = mirror.hole;
  const glassX = left + holeX * unit;
  const glassY = top + holeY * unit;
  const glassRX = holeRX * unit;
  const glassRY = holeRY * unit;

  context.save();
  context.beginPath();
  context.ellipse(glassX, glassY, glassRX, glassRY, 0, 0, Math.PI * 2);
  context.clip();
  const glass = context.createLinearGradient(glassX - glassRX, glassY - glassRY, glassX + glassRX, glassY + glassRY);
  glass.addColorStop(0, 'rgba(249,239,249,.94)');
  glass.addColorStop(.48, 'rgba(226,211,239,.91)');
  glass.addColorStop(1, 'rgba(213,197,230,.94)');
  context.fillStyle = glass;
  context.fillRect(glassX - glassRX, glassY - glassRY, glassRX * 2, glassRY * 2);
  const haze = limit(.08 + (depth + 100) / 1500 * .56, .06, .62);
  const fog = context.createRadialGradient(glassX - glassRX * .2, glassY - glassRY * .28, 2, glassX, glassY, Math.max(glassRX, glassRY) * 1.3);
  fog.addColorStop(0, `rgba(255,255,255,${haze * .78})`);
  fog.addColorStop(.55, `rgba(255,250,255,${haze * .42})`);
  fog.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = fog;
  context.fillRect(glassX - glassRX, glassY - glassRY, glassRX * 2, glassRY * 2);
  context.restore();

  context.drawImage(image, left, top, width, height);
}

function projectPoint(x, y, z, cameraX, cameraZ, bob) {
  const depth = z - cameraZ;
  const perspective = limit(1120 / (1120 + depth), 0.48, 1.72);
  return {
    x: sceneOffsetX + (960 + (x - cameraX) * perspective) * sceneScale,
    y: sceneOffsetY + (540 + (y - 540 - bob) * perspective) * sceneScale,
    perspective
  };
}

function drawVines(cameraX, cameraZ, bob, time) {
  const sway = Math.sin(time / 1500) * 12 * sceneScale;
  for (let i = 0; i < mirrorData.length - 1; i++) {
    const first = mirrorData[i];
    const second = mirrorData[i + 1];
    if (first.z - cameraZ < -360 && second.z - cameraZ < -360) continue;
    const a = projectPoint(first.x + first.w * .34, 625, first.z, cameraX, cameraZ, bob);
    const b = projectPoint(second.x - second.w * .34, 605, second.z, cameraX, cameraZ, bob);
    const span = b.x - a.x;
    if (Math.max(a.x, b.x) < -120 || Math.min(a.x, b.x) > viewWidth + 120) continue;
    const c1 = { x: a.x + span * .34, y: a.y + 54 * a.perspective * sceneScale + sway };
    const c2 = { x: b.x - span * .34, y: b.y - 62 * b.perspective * sceneScale + sway };

    context.save();
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.beginPath();
    context.moveTo(a.x, a.y);
    context.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, b.x, b.y);
    context.strokeStyle = 'rgba(174, 153, 235, .58)';
    context.lineWidth = Math.max(1.3, (a.perspective + b.perspective) * 2.1 * sceneScale);
    context.shadowColor = 'rgba(200, 185, 255, .66)';
    context.shadowBlur = 12 * sceneScale;
    context.stroke();
    context.shadowBlur = 0;
    context.strokeStyle = 'rgba(226, 215, 255, .78)';
    context.lineWidth = Math.max(.7, (a.perspective + b.perspective) * .8 * sceneScale);
    context.stroke();

    for (const t of [.24, .43, .63, .81]) {
      const u = 1 - t;
      const x = u ** 3 * a.x + 3 * u ** 2 * t * c1.x + 3 * u * t ** 2 * c2.x + t ** 3 * b.x;
      const y = u ** 3 * a.y + 3 * u ** 2 * t * c1.y + 3 * u * t ** 2 * c2.y + t ** 3 * b.y;
      const side = t < .4 || t > .7 ? -1 : 1;
      context.save();
      context.translate(x, y);
      context.rotate(side * .58 + Math.sin(time / 1100 + t * 9) * .06);
      context.beginPath();
      context.ellipse(0, 0, 8 * sceneScale, 3.1 * sceneScale, 0, 0, Math.PI * 2);
      context.fillStyle = 'rgba(193, 176, 239, .56)';
      context.fill();
      context.restore();
    }
    context.restore();
  }
}

function animateJourney(time) {
  const elapsed = lastFrame ? Math.min((time - lastFrame) / 1000, 0.05) : 0.016;
  lastFrame = time;
  const ease = 1 - Math.exp(-elapsed * 4.6);
  travel += (targetTravel - travel) * ease;
  cameraY += (targetY - cameraY) * ease;
  const progress = travel / maxTravel;
  const cameraX = 800 + travel;
  const cameraZ = travel * .66;
  const bob = Math.sin(time / 230) * (2 + progress * 6) + cameraY;
  drawBackground(cameraX, cameraZ);
  drawVines(cameraX, cameraZ, bob, time);
  mirrorData.forEach((mirror, index) => drawMirror(mirror, mirrorImages[index], cameraX, cameraZ, bob));
  const stageNumber = travel < 410 ? 1 : travel < 1350 ? 2 : travel < 2410 ? 3 : 4;
  winterProgress.textContent = String(stageNumber).padStart(2, '0');
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
