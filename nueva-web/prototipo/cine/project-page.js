const id = document.documentElement.dataset.projectId || new URLSearchParams(location.search).get('id');
const project = projects.find(item => item.id === id);

if (project) {
  if (!document.documentElement.dataset.projectId) {
    const destination = new URL(project.slug + '/', location.href);
    destination.search = location.search;
    destination.searchParams.delete('id');
    destination.hash = location.hash;
    location.replace(destination.href);
  }
  const assets = '../assets/cine/';
  const detail = document.querySelector('.project-detail');
  const heading = detail.querySelector('h1');
  const [credits, description] = detail.querySelectorAll('p');
  document.title = project.title + ' · Órdago Films';
  heading.textContent = project.title;
  const poster = projectPoster(project);
  poster.alt = 'Cartel de ' + project.title;

  const page = detail.closest('.project-page');
  page.classList.add('project-immersive');
  if (project.titleArt) {
    const title = document.createElement('img');
    title.src = assets + project.titleArt;
    title.alt = project.title;
    heading.replaceChildren(title);
  }

  if (project.frames) {
    const backdrop = document.createElement('div');
    backdrop.className = 'project-background';
    backdrop.setAttribute('aria-hidden', 'true');
    page.prepend(backdrop);
    const layers = [document.createElement('img'), document.createElement('img')];
    for (const image of layers) {
      image.alt = '';
      backdrop.append(image);
    }

    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let currentLayer = 0;
    let currentFrame = 0;
    let loading = false;
    layers[0].src = assets + project.frames[0];
    layers[0].classList.add('visible');
    const toggle = document.querySelector('.project-motion');
    let paused = false;
    let slideshow;
    const updateSlideshow = () => {
      clearInterval(slideshow);
      toggle.hidden = motion.matches || project.frames.length < 2;
      toggle.textContent = paused ? 'Reanudar fondo' : 'Pausar fondo';
      if (toggle.hidden || paused || document.hidden) return;
      slideshow = setInterval(async () => {
        if (loading) return;
        loading = true;
        const nextLayer = 1 - currentLayer;
        const nextFrame = (currentFrame + 1) % project.frames.length;
        const next = layers[nextLayer];
        next.src = assets + project.frames[nextFrame];
        try {
          await next.decode();
          if (motion.matches || paused || document.hidden) return;
          next.classList.add('visible');
          layers[currentLayer].classList.remove('visible');
          currentLayer = nextLayer;
          currentFrame = nextFrame;
        } catch {
          // Keep the current frame visible if the next image cannot be loaded.
        } finally {
          loading = false;
        }
      }, 6500);
    };
    toggle.addEventListener('click', () => {
      paused = !paused;
      updateSlideshow();
    });
    motion.addEventListener('change', updateSlideshow);
    document.addEventListener('visibilitychange', updateSlideshow);
    updateSlideshow();
  }

  if (project.teaserStill) {
    const still = document.createElement('img');
    still.className = 'project-still';
    still.src = assets + project.teaserStill;
    still.alt = 'Fotograma de ' + project.title;
    still.decoding = 'async';
    detail.append(still);
  } else {
    detail.append(poster);
  }

  const metadata = [project.year, project.duration, project.genre, project.directors && 'Dirección: ' + project.directors].filter(Boolean);
  if (metadata.length) {
    credits.textContent = metadata.join(' · ');
    credits.hidden = false;
  }
  if (project.producers) {
    const producers = document.createElement('p');
    producers.textContent = 'Una coproducción de ' + project.producers;
    credits.after(producers);
  }
  if (project.description) {
    description.textContent = project.description;
    description.hidden = false;
  }
}
