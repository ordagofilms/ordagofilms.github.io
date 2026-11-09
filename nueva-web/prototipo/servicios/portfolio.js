const serviceTrack = document.querySelector('.services-portfolio .cine-track');

for (const service of services) {
  const item = document.createElement('li');
  const link = document.createElement('a');
  link.className = 'cine-card service-card';
  link.href = service.slug + '/';
  link.setAttribute('aria-label', 'Ver ' + service.title);
  link.innerHTML = `
    <span class="cine-card-faces">
      <span class="cine-card-front"><span class="service-card-title"></span></span>
      <span class="cine-card-info"><span class="cine-card-monogram" aria-hidden="true"></span><strong></strong><span class="cine-card-action">Ver servicio ↗</span></span>
    </span>`;
  link.querySelector('.cine-card-front').prepend(serviceImage(service));
  link.querySelector('.service-card-title').textContent = service.title;
  link.querySelector('strong').textContent = service.title;
  item.append(link);
  serviceTrack.append(item);
}
