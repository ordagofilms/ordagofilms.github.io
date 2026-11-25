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
  const frameNumbers = Array.isArray(service.frames)
    ? service.frames
    : Array.from({ length: service.frames }, (_, index) => index + 1);
  for (const [index, number] of frameNumbers.entries()) {
    const item = document.createElement('li');
    const image = serviceImage(service, number);
    image.alt = service.title + ' · Imagen ' + (index + 1);
    if (index > 0) image.loading = 'lazy';
    item.append(image);
    track.append(item);
  }
  deck.querySelector('.work-controls').hidden = frameNumbers.length < 2;
  deck.hidden = false;
}
