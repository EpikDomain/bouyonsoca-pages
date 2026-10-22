const menu = document.querySelector('#site-menu');
const menuButton = document.querySelector('[data-menu]');
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menu.hidden = !open;
  if (open) menu.querySelector('a')?.focus();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu && !menu.hidden) {
    menu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); menuButton.focus();
  }
});
menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menu.hidden = true; menuButton.setAttribute('aria-expanded', 'false');
}));

const grid = document.querySelector('[data-artists]');
if (grid) {
  const cards = [...grid.querySelectorAll('[data-artist]')];
  const input = document.querySelector('#artist-search');
  const filters = [...document.querySelectorAll('[data-filter]')];
  let genre = 'All';
  const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  function filter(updateURL = true) {
    const query = normalize(input.value.trim()); let count = 0;
    cards.forEach(card => {
      const show = (genre === 'All' || card.dataset.genre.split(',').includes(genre)) && normalize(card.dataset.search).includes(query);
      card.hidden = !show; if (show) count++;
    });
    document.querySelector('[data-result-count]').textContent = `${String(count).padStart(2, '0')} artists`;
    document.querySelector('[data-empty]').hidden = count > 0;
    if (updateURL) {
      const url = new URL(location.href);
      genre === 'All' ? url.searchParams.delete('genre') : url.searchParams.set('genre', genre);
      input.value ? url.searchParams.set('q', input.value) : url.searchParams.delete('q');
      history.replaceState({}, '', url);
    }
  }
  filters.forEach(button => button.addEventListener('click', () => {
    genre = button.dataset.filter;
    filters.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    filter();
  }));
  input.addEventListener('input', () => filter());
  const params = new URLSearchParams(location.search);
  input.value = params.get('q') || '';
  const requested = filters.find(b => b.dataset.filter === params.get('genre'));
  if (requested) { genre = requested.dataset.filter; filters.forEach(b => b.setAttribute('aria-pressed', String(b === requested))); }
  filter(false);
  document.querySelector('[data-reset]')?.addEventListener('click', () => {
    input.value = ''; genre = 'All'; filters.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === 'All'))); filter(); input.focus();
  });
}

const motionButton = document.querySelector('[data-motion]');
let paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
try { paused = localStorage.getItem('bouyonsoca-motion') === 'off' || paused; } catch {}
function setMotion() {
  document.documentElement.classList.toggle('motion-paused', paused);
  if (motionButton) { motionButton.textContent = paused ? 'Motion: off' : 'Motion: on'; motionButton.setAttribute('aria-pressed', String(!paused)); }
}
setMotion();
motionButton?.addEventListener('click', () => { paused = !paused; setMotion(); try { localStorage.setItem('bouyonsoca-motion', paused ? 'off' : 'on'); } catch {} });

const surprise = document.querySelector('[data-surprise]');
surprise?.addEventListener('click', () => {
  const links = [...document.querySelectorAll('[data-artist] .artist-link')];
  if (links.length) location.href = links[Math.floor(Math.random() * links.length)].href;
});
// Native scrolling stays responsive: no wheel interception or frame-by-frame scroll loop.
