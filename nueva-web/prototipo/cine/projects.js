const projects = [
  {
    id: 'jaen', title: '¿Quién se casa en julio en Jaén?', poster: 'jaen.jpg',
    titleArt: 'jaen-titulo.svg', year: 2026, duration: '15 min', genre: 'Comedia',
    directors: 'Ana Caritg', producers: 'Órdago Films',
    frames: ['jaen-frame.webp', 'jaen-detalle.webp'], teaserStill: 'jaen-teaser.webp',
  },
  {
    id: 'tonos', title: 'Tonos', poster: 'tonos.jpg', titleArt: 'tonos-titulo.webp',
    directors: 'Coro Benavent', year: 2026, duration: '15 min', genre: 'Drama',
    frames: ['tonos-frame.webp', 'tonos-detalle.webp', 'tonos-fondo.webp'],
    teaserStill: 'tonos-teaser.webp', producers: 'Órdago Films · La Mala Fama · SkyAngel Productions',
  },
  {
    id: 'vigilia', title: 'Vigilia', poster: 'vigilia-v3.webp', titleArt: 'vigilia-titulo.svg',
    directors: 'Ivan Dimitrov', year: 2026, duration: '15 min', genre: 'Drama histórico',
    producers: 'Órdago Films · Aparat Films',
    frames: ['vigilia-frame.webp', 'vigilia-detalle.webp'], teaserStill: 'vigilia-detalle.webp',
  },
  { id: 'ana', title: 'ANA', poster: 'ana-ordago.jpg', directors: 'Andrés Gese y Mario Martín' },
];

function projectPoster(project) {
  const image = document.createElement('img');
  image.src = '../assets/cine/' + project.poster;
  image.alt = '';
  image.loading = 'lazy';
  image.decoding = 'async';
  return image;
}
