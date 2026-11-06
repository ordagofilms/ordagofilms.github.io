const phoneDeckLayout = matchMedia('(max-width: 700px)');

function animateDeck(deck, track, { speed = 26.4 } = {}) {
  const toggle = deck.querySelector('[data-deck-pause]');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const hover = matchMedia('(hover: hover)');
  let paused = false;
  let visible = false;
  let frame;
  let previous;
  let position;
  let resumeAfter = 0;
  let timer;

  function sync() {
    cancelAnimationFrame(frame);
    clearTimeout(timer);
    const overflow = track.scrollWidth - track.clientWidth;
    const stacked = deck.hasAttribute('data-stack-mobile') && phoneDeckLayout.matches;
    toggle.hidden = stacked || motion.matches || overflow < 2;
    toggle.textContent = paused ? '▶' : 'Ⅱ';
    toggle.setAttribute('aria-label', paused ? 'Reanudar desplazamiento' : 'Pausar desplazamiento');
    const focus = deck.querySelector(':focus-visible');
    if (!visible || paused || toggle.hidden || document.hidden ||
        (hover.matches && track.matches(':hover')) ||
        (focus && focus !== toggle) || deck.querySelector('.work-card[aria-expanded="true"]')) return;

    const delay = resumeAfter - performance.now();
    if (delay > 0) {
      timer = setTimeout(sync, delay);
      return;
    }
    previous = undefined;
    position = track.scrollLeft;
    frame = requestAnimationFrame(tick);
  }

  function tick(now) {
    const current = track.scrollLeft;
    if (Math.abs(current - position) > 1) position = current;
    const elapsed = Math.min(now - (previous ?? now), 32);
    previous = now;
    position += elapsed * speed / 1000;
    if (Math.abs(current - position) >= .5) track.scrollLeft = position;
    frame = requestAnimationFrame(tick);
  }

  function deferMotion() {
    resumeAfter = performance.now() + 450;
    sync();
  }

  toggle.addEventListener('click', () => {
    paused = !paused;
    sync();
  });
  for (const event of ['pointerdown', 'wheel', 'touchmove']) {
    track.addEventListener(event, deferMotion, { passive: true });
  }
  for (const event of ['pointerenter', 'pointerleave']) track.addEventListener(event, sync);
  for (const event of ['focusin', 'focusout', 'click']) {
    deck.addEventListener(event, () => requestAnimationFrame(sync));
  }
  for (const button of deck.querySelectorAll('[data-deck-step], [data-direction]')) {
    button.addEventListener('click', deferMotion);
  }
  motion.addEventListener('change', sync);
  phoneDeckLayout.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  new ResizeObserver(sync).observe(track);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }).observe(track);
  sync();
}
