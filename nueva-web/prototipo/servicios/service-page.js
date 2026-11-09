const serviceId = document.documentElement.dataset.serviceId || new URLSearchParams(location.search).get('id');
const service = services.find(item => item.id === serviceId);

if (service) {
  if (!document.documentElement.dataset.serviceId) {
    const destination = new URL(service.slug + '/', location.href);
    destination.search = location.search;
    destination.searchParams.delete('id');
    destination.hash = location.hash;
    location.replace(destination.href);
  }
  document.title = service.title + ' · Órdago Films';
  document.querySelector('h1').textContent = service.title;
  const description = document.querySelector('.service-heading p');
  description.textContent = service.description;
  description.hidden = false;

  const deck = document.querySelector('.service-deck');
  const track = deck.querySelector('.service-stills');
  track.classList.toggle('service-stills-vertical', Boolean(service.vertical));
  for (let index = 1; index <= service.frames; index++) {
    const item = document.createElement('li');
    const image = serviceImage(service, index);
    image.alt = service.title + ' · Imagen ' + index;
    if (index > 1) image.loading = 'lazy';
    item.append(image);
    track.append(item);
  }
  deck.querySelector('.work-controls').hidden = service.frames < 2;
  deck.hidden = false;
}
