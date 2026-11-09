const gallery = document.querySelector('.cine-gallery');

const track = gallery.querySelector('.cine-track');
for (const project of projects) {
  const item = document.createElement('li');
  const link = document.createElement('a');
  link.className = 'cine-card';
  link.href = project.slug + '/';
  const faces = document.createElement('span');
  faces.className = 'cine-card-faces';
  const front = document.createElement('span');
  front.className = 'cine-card-front';
  front.append(projectPoster(project));
  faces.append(front);
  link.append(faces);

  const overlay = document.createElement('span');
  overlay.className = 'cine-card-info';
  const title = document.createElement('strong');
  title.textContent = project.title;
  const monogram = document.createElement('span');
  monogram.className = 'cine-card-monogram';
  monogram.setAttribute('aria-hidden', 'true');
  overlay.append(monogram, title);
  if (project.year) {
    const year = document.createElement('span');
    year.textContent = project.year;
    overlay.append(year);
  }
  const action = document.createElement('span');
  action.className = 'cine-card-action';
  action.textContent = 'Más información ↗';
  overlay.append(action);
  faces.append(overlay);
  item.append(link);
  track.append(item);
}

const surpriseText = 'es la quinta vez que pasas por aquí, ¿seguro que no quieres ver alguno de los cortos?';
const surprise = document.createElement('li');
surprise.innerHTML = `
  <button type="button" class="cine-card cine-ace" aria-label="Girar carta sorpresa" aria-pressed="false">
    <span class="cine-card-faces">
      <span class="cine-card-front cine-ace-back" aria-hidden="true">
        <span class="cine-card-monogram"></span>
      </span>
      <span class="cine-card-info cine-ace-face" aria-hidden="true">
        <img class="cine-ace-symbol" src="../assets/cine/o-ordago.png" alt="">
        <span class="cine-ace-caption">${surpriseText}</span>
      </span>
    </span>
  </button>`;

track.addEventListener('click', event => {
  const ace = event.target.closest('.cine-ace');
  if (!ace) return;
  const revealed = ace.getAttribute('aria-pressed') !== 'true';
  ace.setAttribute('aria-pressed', String(revealed));
  ace.setAttribute('aria-label', revealed ? 'As de Órdago. ' + surpriseText : 'Girar carta sorpresa');
});

// Repeat the sequence on both sides so the scroll can wrap between identical views.
const originals = [...track.children];
let posterEdges = [];
if (originals.length > 1) {
  let cycleWidth = 0;
  let copiesBefore = 0;
  let wrappedDistance = 0;
  let surpriseShown = false;
  let surpriseDirection;
  let surpriseStep = 0;
  let layoutWidth = -1;

  function removeSurprise() {
    const isBeforeViewport = surprise.getBoundingClientRect().right <= gallery.getBoundingClientRect().left;
    const scrollLeft = gallery.scrollLeft;
    surprise.remove();
    if (isBeforeViewport) gallery.scrollLeft = scrollLeft - surpriseStep;
    rememberPosterEdges();
  }

  function repeatProjects() {
    const width = gallery.clientWidth;
    if (width === layoutWidth && phoneDeckLayout.matches === (cycleWidth === 0)) return;
    layoutWidth = width;
    if (surprise.isConnected) removeSurprise();
    const previousWidth = cycleWidth;
    const offset = previousWidth ? (gallery.scrollLeft - copiesBefore * previousWidth) / previousWidth : 0;
    for (const copy of track.querySelectorAll(':scope > [data-deck-copy]')) copy.remove();
    if (phoneDeckLayout.matches) {
      cycleWidth = 0;
      gallery.scrollLeft = 0;
      return;
    }
    const gap = parseFloat(getComputedStyle(track).columnGap);
    cycleWidth = originals.at(-1).getBoundingClientRect().right
      - originals[0].getBoundingClientRect().left + gap;
    copiesBefore = Math.ceil(width / cycleWidth) + 3;

    const clone = item => {
      const copy = item.cloneNode(true);
      copy.setAttribute('data-deck-copy', '');
      copy.setAttribute('aria-hidden', 'true');
      copy.querySelector('a').tabIndex = -1;
      return copy;
    };
    for (let index = 0; index < copiesBefore; index++) {
      track.prepend(...originals.map(clone));
      track.append(...originals.map(clone));
    }
    if (previousWidth) wrappedDistance *= cycleWidth / previousWidth;
    gallery.scrollLeft = copiesBefore * cycleWidth + offset * cycleWidth;
    rememberPosterEdges();
    updatePosterFade();
  }

  repeatProjects();
  new ResizeObserver(repeatProjects).observe(gallery);
  phoneDeckLayout.addEventListener('change', repeatProjects);

  gallery.addEventListener('scroll', () => {
    if (!cycleWidth) return;
    const start = copiesBefore * cycleWidth;
    const offset = gallery.scrollLeft - start;
    const distance = wrappedDistance + offset;
    if (!surpriseShown && Math.abs(distance) >= 5 * cycleWidth - 2) {
      const viewport = gallery.getBoundingClientRect();
      const cards = [...track.children];
      const forward = distance > 0;
      const neighbor = forward
        ? cards.find(item => item.getBoundingClientRect().left >= viewport.right)
        : cards.findLast(item => item.getBoundingClientRect().right <= viewport.left);
      if (neighbor) {
        const scrollLeft = gallery.scrollLeft;
        surpriseStep = cycleWidth / originals.length;
        surpriseDirection = forward ? 1 : -1;
        if (forward) neighbor.before(surprise);
        else {
          neighbor.after(surprise);
          gallery.scrollLeft = scrollLeft + surpriseStep;
        }
        surpriseShown = true;
        rememberPosterEdges();
        return;
      }
    }

    if (surprise.isConnected) {
      const viewport = gallery.getBoundingClientRect();
      const card = surprise.getBoundingClientRect();
      const passed = surpriseDirection > 0 ? card.right <= viewport.left : card.left >= viewport.right;
      if (passed) removeSurprise();
      return;
    }

    if (Math.abs(offset) >= 1.5 * cycleWidth) {
      const cycles = Math.trunc(offset / cycleWidth);
      const beforeWrap = gallery.scrollLeft;
      gallery.scrollLeft = beforeWrap - cycles * cycleWidth;
      // Count the distance Safari actually moved, including pixel rounding.
      wrappedDistance += beforeWrap - gallery.scrollLeft;
    }
  }, { passive: true });
}

function rememberPosterEdges() {
  const origin = gallery.getBoundingClientRect().left - gallery.scrollLeft;
  posterEdges = [...track.children].map(card => ({
    card, right: card.getBoundingClientRect().right - origin,
  }));
}

function updatePosterFade() {
  if (phoneDeckLayout.matches) return;
  const left = gallery.scrollLeft;
  for (const { card, right } of posterEdges) {
    const opacity = Math.min(Math.max((right - left) / 100, 0), 1).toFixed(2);
    if (card.style.getPropertyValue('--poster-opacity') !== opacity) {
      card.style.setProperty('--poster-opacity', opacity);
    }
  }
}

gallery.addEventListener('scroll', updatePosterFade, { passive: true });
const carouselReducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
for (const button of document.querySelectorAll('.cine-controls [data-direction]')) {
  button.disabled = originals.length < 2;
  button.addEventListener('click', () => {
    const step = track.children[1].getBoundingClientRect().left - track.children[0].getBoundingClientRect().left;
    const inset = parseFloat(getComputedStyle(track).paddingLeft);
    const origin = track.firstElementChild.getBoundingClientRect().left
      - gallery.getBoundingClientRect().left + gallery.scrollLeft - inset;
    const index = (gallery.scrollLeft - origin) / step;
    const direction = Number(button.dataset.direction);
    const next = direction > 0 ? Math.floor(index + .01) + 1 : Math.ceil(index - .01) - 1;
    gallery.scrollTo({ left: origin + next * step, behavior: carouselReducedMotion.matches ? 'instant' : 'smooth' });
  });
}

animateDeck(gallery.closest('.cine-carousel'), gallery);
