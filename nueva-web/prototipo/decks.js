const deckMotion = matchMedia('(prefers-reduced-motion: reduce)');

for (const card of document.querySelectorAll('[data-flip]')) {
  card.addEventListener('click', () => {
    card.setAttribute('aria-pressed', String(card.getAttribute('aria-pressed') !== 'true'));
  });
}

for (const deck of document.querySelectorAll('[data-deck]')) {
  const track = deck.querySelector('[data-deck-track]');
  const clientDeck = deck.classList.contains('client-deck');
  for (const button of deck.querySelectorAll('[data-deck-step]')) {
    button.addEventListener('click', () => {
      const items = track.querySelector(':scope > ul') ?? track;
      const first = items.firstElementChild;
      const second = first?.nextElementSibling;
      if (!second) return;
      const step = Math.abs(second.offsetLeft - first.offsetLeft);
      track.scrollBy({ left: step * Number(button.dataset.deckStep), behavior: deckMotion.matches ? 'instant' : 'smooth' });
    });
  }

  const panel = deck.querySelector('.work-detail');
  const items = track.querySelector(':scope > ul') ?? track;
  const originals = [...items.children];
  const cards = originals.filter(item => item.matches('.work-card'));
  if (panel) {
    track.addEventListener('click', event => {
      const card = event.target.closest('.work-card');
      if (!card) return;
      const key = card.dataset.workKey;
      const open = card.getAttribute('aria-expanded') === 'true';
      for (const item of track.querySelectorAll('.work-card')) {
        item.setAttribute('aria-expanded', String(!open && item.dataset.workKey === key));
      }
      panel.hidden = open;
      if (open) return;

      panel.querySelector('h3').textContent = card.textContent.trim();
      panel.querySelector('p').textContent = card.dataset.description;
      panel.querySelector('img').src = card.querySelector('img').src;
      if (panel.getBoundingClientRect().bottom > window.innerHeight) {
        panel.scrollIntoView({ block: 'nearest', behavior: deckMotion.matches ? 'instant' : 'smooth' });
      }
    });
  }
  cards.forEach((card, index) => {
    card.dataset.workKey = index;
    card.style.setProperty('--work-angle', index % 2 ? '3deg' : '-3deg');
  });
  if (originals.length < 2) continue;

  let cycle = 0;
  let start = 0;
  let logos = [];
  let layoutWidth = -1;

  function updateLogoEdges() {
    if (!clientDeck || phoneDeckLayout.matches) return;
    const left = track.scrollLeft;
    const right = left + layoutWidth;
    const fadeWidth = Math.min(100, layoutWidth * .12);
    if (!fadeWidth) return;
    for (const { logo, center, halfWidth } of logos) {
      // Fade before the image and its blur reach the scroll container's clip.
      const distance = Math.min(center - left, right - center) - halfWidth - 16;
      const visibility = Math.max(0, Math.min(1, distance / fadeWidth));
      const opacity = (visibility * visibility * (3 - 2 * visibility)).toFixed(3);
      if (logo.style.getPropertyValue('--logo-visibility') !== opacity) {
        logo.style.setProperty('--logo-visibility', opacity);
      }
    }
  }

  function repeat() {
    const width = track.clientWidth;
    const stacked = deck.hasAttribute('data-stack-mobile') && phoneDeckLayout.matches;
    if (width === layoutWidth && stacked === (cycle === 0)) return;
    layoutWidth = width;
    const offset = cycle ? (track.scrollLeft - start) / cycle : 0;
    for (const copy of items.querySelectorAll(':scope > [data-deck-copy]')) copy.remove();
    if (stacked) {
      cycle = 0;
      track.scrollLeft = 0;
      return;
    }
    const gap = parseFloat(getComputedStyle(items).columnGap) || 0;
    cycle = originals.at(-1).offsetLeft - originals[0].offsetLeft + originals.at(-1).offsetWidth + gap;
    if (!cycle) return;

    const copies = Math.ceil(width / cycle) + 1;
    const clone = item => {
      const copy = item.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      copy.setAttribute('data-deck-copy', '');
      for (const control of [copy, ...copy.querySelectorAll('a, button')]) {
        if (control.matches('a, button')) control.tabIndex = -1;
      }
      return copy;
    };
    for (let index = 0; index < copies; index++) {
      items.prepend(...originals.map(clone));
      items.append(...originals.map(clone));
    }
    const nextCycle = originals.at(-1).nextElementSibling;
    cycle = nextCycle.getBoundingClientRect().left - originals[0].getBoundingClientRect().left;
    start = copies * cycle;
    track.scrollLeft = start + (offset % 1) * cycle;
    if (clientDeck) {
      const origin = track.getBoundingClientRect().left - track.scrollLeft;
      logos = [...items.querySelectorAll('img')].map(logo => {
        const { left, right } = logo.getBoundingClientRect();
        return { logo, center: (left + right) / 2 - origin, halfWidth: (right - left) / 2 };
      });
      updateLogoEdges();
    }
  }

  repeat();
  new ResizeObserver(repeat).observe(track);
  phoneDeckLayout.addEventListener('change', repeat);
  track.addEventListener('scroll', () => {
    const offset = track.scrollLeft - start;
    if (cycle && !track.querySelector(':focus-visible') && Math.abs(offset) >= cycle * 1.5) {
      track.scrollLeft = start + offset % cycle;
    }
    updateLogoEdges();
  }, { passive: true });
  animateDeck(deck, track, { speed: clientDeck ? 41.8 : 26.4 });
}
