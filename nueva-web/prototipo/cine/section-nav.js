const cineLayout = document.querySelector('.cine-layout');
const cineSidebar = document.querySelector('.cine-sidebar');
const sectionLinks = [...cineSidebar.querySelectorAll('nav a')];
const cineSections = sectionLinks.map(link => document.querySelector(link.hash));
const sectionMotion = matchMedia('(prefers-reduced-motion: reduce)');
let sectionFrame;
let currentSection = -1;

function updateCurrentSection() {
  sectionFrame = undefined;
  const marker = window.innerHeight * .45;
  let nextSection = 0;
  cineSections.forEach((section, index) => {
    if (section.getBoundingClientRect().top <= marker) nextSection = index;
  });
  const scrollEnd = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollEnd > 0 && window.scrollY >= scrollEnd - 2) {
    nextSection = cineSections.length - 1;
  }
  if (currentSection === nextSection) return;
  sectionLinks[currentSection]?.removeAttribute('aria-current');
  sectionLinks[nextSection].setAttribute('aria-current', 'location');
  currentSection = nextSection;
}

window.addEventListener('scroll', () => {
  sectionFrame ??= requestAnimationFrame(updateCurrentSection);
}, { passive: true });
sectionLinks.forEach((link, index) => {
  link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    const section = cineSections[index];
    section.focus({ preventScroll: true });
    section.scrollIntoView({ block: 'start', behavior: sectionMotion.matches ? 'instant' : 'smooth' });
  });
  cineSections[index].tabIndex = -1;
});
new ResizeObserver(() => {
  cineLayout.style.setProperty('--cine-header-height', cineSidebar.offsetHeight + 'px');
  sectionFrame ??= requestAnimationFrame(updateCurrentSection);
}).observe(cineSidebar);
updateCurrentSection();
