const hero = document.querySelector('.hero');
const reel = document.querySelector('.reel');
const reelButtons = [...document.querySelectorAll('[data-reel]')];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
let activeButton = null;
let hoverTimer;

function cancelHover() {
  clearTimeout(hoverTimer);
}

function preview(button) {
  activeButton = button;
  reelButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  hero.classList.toggle('playing', Boolean(button));
  if (!button) {
    reel.pause();
    return;
  }
  reel.play().catch(() => {
    if (activeButton === button) preview(null);
  });
}

for (const button of reelButtons) {
  button.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse' || reduceMotion.matches) return;
    cancelHover();
    hoverTimer = setTimeout(() => preview(button), 150);
  });
  button.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'mouse') return;
    cancelHover();
    if (activeButton === button) preview(null);
  });
  button.addEventListener('click', event => {
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
  if (activeButton) preview(null);
});
new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting) return;
  cancelHover();
  preview(null);
}).observe(hero);

const trigger = document.querySelector('.contact-trigger');
const dialog = document.querySelector('#contacto');
const form = document.querySelector('#contact-form');
const review = document.querySelector('#review');
const reviewTitle = document.querySelector('#review-title');
const email = document.querySelector('#email');

trigger.addEventListener('click', () => {
  cancelHover();
  preview(null);
  dialog.showModal();
  trigger.setAttribute('aria-expanded', 'true');
});
dialog.querySelector('.close').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => {
  trigger.setAttribute('aria-expanded', 'false');
  trigger.focus();
});

form.addEventListener('submit', event => {
  event.preventDefault();
  const fields = new FormData(form);
  const entries = [
    ['Proyecto', fields.get('proyecto').trim()],
    ['Qué necesitas', fields.get('necesidades').trim()],
    ['Nombre', fields.get('nombre').trim()],
    ['Correo', fields.get('correo').trim()],
    ['Teléfono', fields.get('telefono').trim()],
  ].filter(([, value]) => value);
  const summary = review.querySelector('dl');
  summary.replaceChildren();
  for (const [label, value] of entries) {
    const term = document.createElement('dt');
    const description = document.createElement('dd');
    term.textContent = label;
    description.textContent = value;
    summary.append(term, description);
  }
  const body = entries.map(([label, value]) => label + ': ' + value).join('\n\n');
  email.href = 'mailto:info@ordagofilms.com?subject=Nuevo%20proyecto%20para%20%C3%93rdago&body=' + encodeURIComponent(body);
  form.hidden = true;
  review.hidden = false;
  reviewTitle.focus();
});

document.querySelector('#edit').addEventListener('click', () => {
  review.hidden = true;
  form.hidden = false;
  form.elements.proyecto.focus();
});

const about = document.querySelector('#conocenos');
const aboutLink = document.querySelector('.about-link');
const brand = document.querySelector('.brand');
let scrollAnimation;

function updateBrand() {
  const distance = Math.max(0, window.scrollY);
  const height = hero.offsetHeight;
  const progress = Math.min(distance / (height * 0.5), 1);
  const contactExit = Math.min(distance / (height * 0.24), 1);

  hero.style.setProperty('--brand-progress', progress);

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

window.addEventListener('scroll', updateBrand, { passive: true });
window.addEventListener('resize', updateBrand);
updateBrand();

function stopScroll() {
  cancelAnimationFrame(scrollAnimation);
}

window.addEventListener('wheel', stopScroll, { passive: true });
window.addEventListener('touchstart', stopScroll, { passive: true });
window.addEventListener('keydown', stopScroll);

aboutLink.addEventListener('click', event => {
  if (reduceMotion.matches || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  stopScroll();
  const start = window.scrollY;
  const target = Math.min(start + about.getBoundingClientRect().top, document.documentElement.scrollHeight - window.innerHeight);
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
    if (location.hash !== '#conocenos') history.pushState(null, '', '#conocenos');
    about.focus({ preventScroll: true });
  }

  scrollAnimation = requestAnimationFrame(step);
});
