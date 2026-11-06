const hero = document.querySelector('.hero');
const reel = document.querySelector('.reel');
const reelButtons = [...document.querySelectorAll('[data-reel]')];
const phoneHero = matchMedia('(max-width: 700px)');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const phoneAutoplay = Boolean(reel.dataset.mobileSrc);
const phoneReel = reelButtons[Math.floor(Math.random() * reelButtons.length)];
const defaultReel = reel.getAttribute('src');
let activeButton = null;
let hoverTimer;
let heroVisible = false;
let previewRequest = 0;

function cancelHover() {
  clearTimeout(hoverTimer);
}

function preview(button, background = false) {
  const request = ++previewRequest;
  activeButton = button;
  reelButtons.forEach(item => {
    item.classList.toggle('reel-active', !background && item === button);
    if (item instanceof HTMLButtonElement) item.setAttribute('aria-pressed', String(item === button));
  });
  if (!background) hero.classList.toggle('playing', Boolean(button));
  if (!button) {
    reel.pause();
    return;
  }
  const source = background
    ? button.dataset.reelMobileSrc || button.dataset.reelSrc || reel.dataset.mobileSrc || defaultReel
    : button.dataset.reelSrc || defaultReel;
  if (reel.getAttribute('src') !== source) reel.src = source;
  reel.play().then(() => {
    if (request === previewRequest && background) {
      hero.classList.add('playing');
    }
  }).catch(() => {
    if (request === previewRequest) preview(null);
  });
}

function syncPhoneReel() {
  if (!phoneHero.matches || !heroVisible || document.hidden || reduceMotion.matches) {
    preview(null);
    return;
  }
  preview(phoneReel, true);
}

if (phoneAutoplay) {
  phoneHero.addEventListener('change', () => {
    cancelHover();
    syncPhoneReel();
  });
  reduceMotion.addEventListener('change', syncPhoneReel);
  document.addEventListener('visibilitychange', () => {
    if (phoneHero.matches) syncPhoneReel();
  });
}

for (const button of reelButtons) {
  button.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse' || reduceMotion.matches || (phoneAutoplay && phoneHero.matches)) return;
    cancelHover();
    hoverTimer = setTimeout(() => preview(button), 150);
  });
  button.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'mouse' || (phoneAutoplay && phoneHero.matches)) return;
    cancelHover();
    if (activeButton === button) preview(null);
  });
  button.addEventListener('click', event => {
    if (button instanceof HTMLAnchorElement) return;
    cancelHover();
    if (event.pointerType === 'mouse' && !reduceMotion.matches) {
      preview(button);
      return;
    }
    preview(activeButton === button ? null : button);
  });
}

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  cancelHover();
  if (phoneAutoplay && phoneHero.matches) return;
  if (activeButton) preview(null);
});
new IntersectionObserver(([entry]) => {
  heroVisible = entry.isIntersecting;
  if (phoneAutoplay && phoneHero.matches) {
    syncPhoneReel();
    return;
  }
  if (entry.isIntersecting) return;
  cancelHover();
  preview(null);
}).observe(hero);

const trigger = document.querySelector('.contact-trigger');
trigger.addEventListener('click', () => {
  cancelHover();
  if (phoneAutoplay && phoneHero.matches) return;
  preview(null);
});

const about = document.querySelector('#conocenos');
const aboutLink = document.querySelector('.about-link');
const brand = document.querySelector('.brand');
let scrollAnimation;
let brandFrame;
let brandProgress;
let brandVelocity = 0;
let lastBrandFrame;

function queueBrandUpdate() {
  brandFrame ??= requestAnimationFrame(updateBrand);
}

function updateBrand(now) {
  brandFrame = undefined;
  if (phoneHero.matches && trigger.matches('.contact-search')) {
    trigger.inert = false;
    aboutLink.inert = false;
    brandProgress = undefined;
    brandVelocity = 0;
    lastBrandFrame = undefined;
    return;
  }
  const distance = Math.max(0, window.scrollY);
  const height = hero.offsetHeight;
  const progress = Math.min(distance / (height * 0.5), 1);
  const contactExit = Math.min(distance / (height * 0.24), 1);

  const elapsed = Math.min((now - (lastBrandFrame ?? now)) / 1000, 1 / 30);
  lastBrandFrame = now;
  brandProgress ??= progress;

  if (reduceMotion.matches) {
    brandProgress = progress;
    brandVelocity = 0;
  } else {
    // Limit the lag on large jumps, then let the logo settle with a small overshoot.
    const lag = Math.min(Math.max(brandProgress - progress, -0.055), 0.055);
    brandVelocity += (-650 * lag - 22 * brandVelocity) * elapsed;
    brandProgress = progress + lag + brandVelocity * elapsed;

    if (Math.abs(brandProgress - progress) > 0.0003 || Math.abs(brandVelocity) > 0.005) {
      queueBrandUpdate();
    } else {
      brandProgress = progress;
      brandVelocity = 0;
    }
  }

  hero.style.setProperty('--brand-progress', brandProgress);

  const logoBottom = brand.getBoundingClientRect().bottom;
  const linkHeight = aboutLink.offsetHeight;
  const linkTop = hero.getBoundingClientRect().top + aboutLink.offsetTop - linkHeight / 2;
  const gap = 16;
  const aboutExit = Math.min(Math.max((logoBottom + gap - linkTop) / linkHeight, 0), 1);
  hero.style.setProperty('--contact-exit', contactExit);
  hero.style.setProperty('--about-exit', aboutExit);
  trigger.inert = contactExit === 1;
  aboutLink.inert = aboutExit === 1;
}

window.addEventListener('scroll', queueBrandUpdate, { passive: true });
window.addEventListener('resize', queueBrandUpdate);
reduceMotion.addEventListener('change', queueBrandUpdate);
queueBrandUpdate();

function stopScroll() {
  cancelAnimationFrame(scrollAnimation);
}

window.addEventListener('wheel', stopScroll, { passive: true });
window.addEventListener('touchstart', stopScroll, { passive: true });
window.addEventListener('keydown', stopScroll);

function scrollToHomeSection(event, section) {
  if (reduceMotion.matches || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  stopScroll();
  const start = window.scrollY;
  const target = Math.min(start + section.getBoundingClientRect().top, document.documentElement.scrollHeight - window.innerHeight);
  const startedAt = performance.now();
  const duration = 500;

  function step(now) {
    const progress = Math.min((now - startedAt) / duration, 1);
    const eased = progress * progress * (3 - 2 * progress);
    window.scrollTo({ top: start + (target - start) * eased, behavior: 'instant' });
    if (progress < 1) {
      scrollAnimation = requestAnimationFrame(step);
      return;
    }
    const hash = '#' + section.id;
    if (location.hash !== hash) history.pushState(null, '', hash);
    section.scrollIntoView({ block: 'start', behavior: 'instant' });
    section.focus({ preventScroll: true });
  }

  scrollAnimation = requestAnimationFrame(step);
}

aboutLink.addEventListener('click', event => scrollToHomeSection(event, about));
if (trigger instanceof HTMLAnchorElement) {
  const contact = document.querySelector(trigger.hash);
  trigger.addEventListener('click', event => scrollToHomeSection(event, contact));
}
