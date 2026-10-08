const home = document.querySelector('#home');
const official = document.querySelector('#official');
const pending = document.querySelector('#pending-note');
const pendingMessage = document.querySelector('#pending-message');

function showOfficial() {
  home.hidden = true;
  official.hidden = false;
  pending.hidden = true;
  window.location.hash = 'official';
}

function showHome() {
  official.hidden = true;
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
    else showPending(entry.dataset.page);
  });
});

document.querySelector('.official-back').addEventListener('click', showHome);
document.querySelector('.pending-close').addEventListener('click', () => { pending.hidden = true; });
pending.addEventListener('click', event => {
  if (event.target === pending) pending.hidden = true;
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') pending.hidden = true;
});

window.addEventListener('hashchange', () => {
  if (window.location.hash === '#official') {
    home.hidden = true;
    official.hidden = false;
    pending.hidden = true;
  } else if (!window.location.hash || window.location.hash === '#home') {
    showHome();
  }
});

if (window.location.hash === '#official') {
  home.hidden = true;
  official.hidden = false;
}
