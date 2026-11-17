(() => {
  'use strict';
  const form = document.querySelector('#content-editor');
  const status = document.querySelector('#editor-status');
  const fields = document.querySelector('#editor-fields');
  const articles = document.querySelector('#article-fields');
  const scriptUrl = document.currentScript?.src || new URL('../editor.js', location.href).href;
  const contentUrl = new URL('site-content.json', scriptUrl);
  let content;
  let downloadUrl;
  const pageNames = { home: 'Inicio', cine: 'Cine', servicios: 'Servicios' };
  const fieldNames = { title: 'Título para buscadores', description: 'Descripción para buscadores', heading: 'Encabezado principal', intro1: 'Primer párrafo', intro2: 'Segundo párrafo' };

  function field(parent, label, value, name, multiline = false) {
    const wrapper = document.createElement('label');
    const control = document.createElement(multiline ? 'textarea' : 'input');
    control.name = name;
    control.id = 'editor-' + name.replaceAll('.', '-');
    wrapper.htmlFor = control.id;
    wrapper.append(document.createTextNode(label));
    control.value = value || '';
    control.required = true;
    wrapper.append(control);
    parent.append(wrapper);
    return control;
  }

  function render() {
    fields.replaceChildren();
    articles.replaceChildren();
    for (const [key, name] of Object.entries(pageNames)) {
      const group = document.createElement('fieldset');
      const legend = document.createElement('legend');
      legend.textContent = name;
      group.append(legend);
      for (const [property, label] of Object.entries(fieldNames)) {
        field(group, label, content.pages[key][property], key + '.' + property, ['intro1', 'intro2', 'description'].includes(property));
      }
      fields.append(group);
    }
    content.articles.forEach((article, index) => renderArticle(article, index));
  }

  function renderArticle(article, index) {
    const group = document.createElement('fieldset');
    group.dataset.article = index;
    const legend = document.createElement('legend');
    legend.textContent = 'Página ' + (index + 1);
    group.append(legend);
    field(group, 'Título', article.title, 'article.' + index + '.title');
    const slug = field(group, 'Dirección (minúsculas, números y guiones)', article.slug, 'article.' + index + '.slug');
    slug.pattern = '[a-z0-9]+(-[a-z0-9]+)*';
    const label = document.createElement('label');
    label.textContent = 'Idioma';
    const language = document.createElement('select');
    language.name = 'article.' + index + '.language';
    language.id = 'editor-article-' + index + '-language';
    label.htmlFor = language.id;
    for (const [value, text] of [['es', 'Español'], ['en', 'English']]) {
      const option = document.createElement('option'); option.value = value; option.textContent = text; language.append(option);
    }
    language.value = article.language;
    label.append(language); group.append(label);
    field(group, 'Descripción para buscadores', article.description, 'article.' + index + '.description', true);
    field(group, 'Contenido', article.body, 'article.' + index + '.body', true);
    const remove = document.createElement('button');
    remove.type = 'button'; remove.textContent = 'Quitar esta página';
    remove.addEventListener('click', () => { collect(); content.articles.splice(index, 1); render(); status.textContent = 'Página retirada del borrador. Publica el archivo para aplicar los cambios.'; });
    group.append(remove);
    articles.append(group);
  }

  function collect() {
    const values = new FormData(form);
    for (const key of Object.keys(pageNames)) for (const property of Object.keys(fieldNames)) {
      content.pages[key][property] = String(values.get(key + '.' + property) || '').trim();
    }
    for (let index = 0; index < content.articles.length; index++) {
      for (const property of ['title', 'slug', 'language', 'description', 'body']) {
        content.articles[index][property] = String(values.get('article.' + index + '.' + property) || '').trim();
      }
    }
  }

  function validate(value) {
    if (value?.version !== 1 || !value.company || !value.pages) throw new Error('El archivo no tiene el formato esperado.');
    for (const key of Object.keys(pageNames)) for (const property of Object.keys(fieldNames)) {
      if (typeof value.pages[key]?.[property] !== 'string') throw new Error('Faltan textos de las páginas principales.');
    }
    if (!Array.isArray(value.articles)) value.articles = [];
    const routes = new Set();
    for (const article of value.articles) {
      if (!['es', 'en'].includes(article.language) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)) throw new Error('Revisa el idioma y la dirección de las páginas adicionales.');
      const route = article.language + '/' + article.slug;
      if (routes.has(route)) throw new Error('Hay dos páginas con la misma dirección e idioma.');
      routes.add(route);
      for (const key of ['title', 'description', 'body']) if (typeof article[key] !== 'string' || !article[key].trim()) throw new Error('Completa los textos de las páginas adicionales.');
    }
    return value;
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!content) return;
    try {
      collect(); validate(content);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      downloadUrl = URL.createObjectURL(new Blob([JSON.stringify(content, null, 2) + '\n'], { type: 'application/json' }));
      const link = document.createElement('a'); link.href = downloadUrl; link.download = 'site-content.json'; link.click();
      status.textContent = 'Archivo preparado. Sustituye site-content.json en GitHub y confirma el cambio para publicarlo.';
    } catch (error) { status.textContent = error.message; }
  });
  document.querySelector('#add-article').addEventListener('click', () => {
    if (!content) return;
    collect(); content.articles.push({ title: '', slug: '', language: 'es', description: '', body: '' }); render();
    articles.lastElementChild.querySelector('input').focus();
  });
  document.querySelector('#import-content').addEventListener('change', async event => {
    const file = event.target.files[0]; if (!file) return;
    try { content = validate(JSON.parse(await file.text())); render(); status.textContent = 'Borrador cargado. Todavía no se ha publicado.'; }
    catch (error) { status.textContent = error.message; }
  });
  fetch(contentUrl).then(response => {
    if (!response.ok) throw new Error('No se pudieron cargar los contenidos.');
    return response.json();
  }).then(value => { content = validate(value); render(); status.textContent = 'Contenidos cargados. Los cambios permanecen en esta página hasta que descargues y publiques el archivo.'; })
    .catch(error => { status.textContent = error.message; });
})();
