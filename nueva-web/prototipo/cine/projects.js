const projects = [
  {
    id: 'jaen', slug: 'quien-se-casa-en-julio-en-jaen', title: '¿Quién se casa en julio en Jaén?', poster: 'jaen.jpg',
    titleArt: 'jaen-titulo.svg', year: 2026, duration: '15 min', genre: 'Comedia',
    cast: 'Alba Tojeiro, Delia Postigo',
    directors: 'Anna Caritg', producers: 'Anna Caritg · Órdago Films · EYDDOS',
    frames: ['jaen-frame.webp', 'jaen-detalle.webp'], teaserStill: 'jaen-teaser.webp',
  },
  {
    id: 'tonos', slug: 'tonos', title: 'Tonos', poster: 'tonos.jpg', titleArt: 'tonos-titulo.webp',
    cast: 'Julio Peña, Coro Benavent, Adriana Cabrera, Sergio García',
    directors: 'Coro Benavent', year: 2026, duration: '15 min', genre: 'Comedia dramática',
    frames: ['tonos-frame.webp', 'tonos-detalle.webp', 'tonos-fondo.webp'],
    teaserStill: 'tonos-teaser.webp', producers: 'Garo Films · Skyeangel Productions · CANADA · La Mala Fama · Órdago Films',
  },
  {
    id: 'vigilia', slug: 'vigilia', title: 'Vigilia', poster: 'vigilia-v3.webp', titleArt: 'vigilia-titulo.svg',
    cast: 'José Luis Hijón, Milo Taboada, Lidia Moreno',
    directors: 'Ivan Dimitrov', year: 2026, duration: '15 min', genre: 'Thriller - drama de época - terror',
    producers: 'Aparat Films · PuroCuento Films · La Palomitera · Sunflower Pictures · Órdago Films',
    frames: ['vigilia-frame.webp', 'vigilia-detalle.webp'], teaserStill: 'vigilia-detalle.webp',
  },
  {
    id: 'ana', slug: 'ana', title: 'ANA', poster: 'ana-ordago.jpg', year: 2025, genre: 'Documental',
    directors: 'Andrés Gese y Mario Martín',
    description: 'Ana Robisco es una joven de 24 años que trabaja de au pair en Italia. Después de una adolescencia difícil, le ha surgido la oportunidad de mandar su mensaje a través de la música.',
    frames: ['ana-fondo.jpg'],
  },
];

function projectPoster(project) {
  const image = document.createElement('img');
  image.src = '../assets/cine/' + project.poster;
  image.alt = '';
  image.loading = 'lazy';
  image.decoding = 'async';
  return image;
}
