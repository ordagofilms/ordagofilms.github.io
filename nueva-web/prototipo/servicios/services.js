const services = [
  { id: 'documental', title: 'Documental', description: 'Historias reales contadas a través de sus protagonistas, sus espacios y los detalles que les dan contexto.', frames: 1, coverImage: 'trantran-7-10.jpg' },
  { id: 'entrevistas', title: 'Entrevistas', description: 'Preparamos la puesta en escena, la iluminación y el sonido para que la conversación y la persona que tienes delante lleven el peso de la pieza.', frames: 3, coverImage: 'ledln-7-10.jpg' },
  { id: 'corporativo', title: 'Vídeo corporativo', description: 'Mostramos qué hace tu organización, cómo trabaja y quién hay detrás, con imágenes de sus equipos, espacios y procesos.', frames: 3, coverImage: 'gala-aetc-7-10.jpg' },
  { id: 'redes', title: 'Redes sociales', description: 'Creamos piezas pensadas para verse en el móvil, con encuadres verticales y versiones ajustadas a cada canal.', frames: 5, vertical: true, cover: 2 },
];

function serviceImage(service, number) {
  const image = document.createElement('img');
  const coverImage = number === undefined ? service.coverImage : null;
  number ??= service.cover ?? 1;
  image.src = coverImage
    ? '../assets/servicios/' + coverImage
    : service.id === 'redes' && number === 2
    ? '../assets/servicios/lucera.webp'
    : '../assets/servicios/' + service.id + '-' + number + '.webp';
  image.alt = '';
  image.decoding = 'async';
  return image;
}
