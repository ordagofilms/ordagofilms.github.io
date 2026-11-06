{
  const carousel = document.querySelector('.about-carousel');
  const gallery = carousel.querySelector('.about-gallery');
  const track = carousel.querySelector('.about-track');
  const cards = [
    ['eventos', 'Servicios'], ['jaen', 'Cine'], ['marca', 'Servicios'],
    ['atardecer', 'Cine'], ['experiencia', 'Servicios'], ['cine-rojo', 'Cine'],
  ];

  for (const [image, category] of cards) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.className = 'cine-card';
    link.setAttribute('aria-label', 'Ver portfolio de ' + category);
    link.href = category === 'Cine' ? 'cine/index.html' : 'servicios/index.html';
    link.innerHTML = `
      <span class="cine-card-faces">
        <span class="cine-card-front"><img alt="" loading="lazy" decoding="async" src="assets/conocenos/${image === "experiencia" ? "experiencia-v1.webp" : image + ".jpg"}"><span class="about-card-caption" aria-hidden="true">Portfolio <strong>${category}</strong></span></span>
        <span class="cine-card-info">
          <span class="cine-card-monogram" aria-hidden="true"></span>
          <strong>${category}</strong>
          <span class="cine-card-action">Ver ${category.toLowerCase()} ↗</span>
        </span>
      </span>`;
    item.append(link);
    track.append(item);
  }

  let wheelAxis;
  let lastWheel = -Infinity;

  gallery.addEventListener('wheel', event => {
    if (event.ctrlKey) return;
    const now = performance.now();

    const unit = event.deltaMode;
    const horizontal = event.deltaX || (event.shiftKey ? event.deltaY : 0);
    const vertical = event.shiftKey ? 0 : event.deltaY;
    if (!horizontal && !vertical) return;

    // Keep the initial axis through the gesture and its momentum.
    if (now - lastWheel > 150) {
      wheelAxis = Math.abs(horizontal) > Math.abs(vertical) ? 'horizontal' : 'vertical';
    }
    lastWheel = now;
    if (wheelAxis !== 'horizontal' || !event.cancelable) return;

    event.preventDefault();
    const scale = unit === 1 ? 16 : unit === 2 ? gallery.clientWidth : 1;
    gallery.scrollLeft += horizontal * scale;
  }, { passive: false });
}

const teamObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add('dealt');
    teamObserver.unobserve(entry.target);
  }
}, { threshold: .25 });
document.querySelectorAll('.team-member').forEach(member => teamObserver.observe(member));
