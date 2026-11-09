const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = path.resolve(__dirname, '../nueva-web/prototipo');
const read = file => readFileSync(path.join(source, file), 'utf8');

function browser(href, dataset = {}) {
  const nodes = new Map();
  const created = [];
  const element = () => ({
    textContent: '', hidden: false, style: {},
    classList: { add() {}, toggle() {} },
    querySelector: selector => node(selector),
    querySelectorAll: () => [node('credits'), node('description')],
    closest: () => node('page'),
    append() {}, prepend() {}, after() {}, replaceChildren() {}, addEventListener() {},
    setAttribute() {},
  });
  function node(selector) {
    if (!nodes.has(selector)) nodes.set(selector, element());
    return nodes.get(selector);
  }
  const location = new URL(href);
  const redirects = [];
  location.replace = url => redirects.push(url);
  const state = { active: true };
  const histories = [];
  const context = vm.createContext({
    URL, URLSearchParams, location,
    history: { state, replaceState: (...args) => histories.push(args) },
    document: {
      title: '', documentElement: { dataset }, hidden: false,
      querySelector: node,
      createElement() { const item = element(); created.push(item); return item; },
      addEventListener() {},
    },
    matchMedia: () => ({ matches: true, addEventListener() {} }),
    clearInterval() {}, setInterval() { throw new Error('Reduced motion must prevent slideshows'); },
  });
  return { context, redirects, histories, state, created };
}

const projects = [
  ['jaen', 'quien-se-casa-en-julio-en-jaen', '¿Quién se casa en julio en Jaén?'],
  ['tonos', 'tonos', 'Tonos'],
  ['vigilia', 'vigilia', 'Vigilia'],
  ['ana', 'ana', 'ANA'],
];
const services = [
  ['documental', 'documental', 'Documental'],
  ['entrevistas', 'entrevistas', 'Entrevistas'],
  ['corporativo', 'video-corporativo', 'Vídeo corporativo'],
  ['redes', 'redes-sociales', 'Redes sociales'],
];

for (const [section, records, data, page, template, kind] of [
  ['cine', projects, 'projects.js', 'project-page.js', 'proyecto.html', 'projectId'],
  ['servicios', services, 'services.js', 'service-page.js', 'servicio.html', 'serviceId'],
]) {
  for (const [id, slug, title] of records) {
    test(`Direct visit and reload: /${section}/${slug}/`, () => {
      const app = browser(`https://ordagofilms.com/${section}/${slug}/?id=invalid`, { [kind]: id });
      vm.runInContext(read(`${section}/${data}`) + '\n' + read(`${section}/${page}`), app.context);
      assert.equal(app.context.document.title, title + ' · Órdago Films');
      assert.deepEqual(app.redirects, []);
    });
    test(`Old ${section} link redirects ${id}, preserving query and fragment`, () => {
      const app = browser(`https://ordagofilms.com/${section}/${template}?id=${id}&utm_source=shared#detalle`);
      vm.runInContext(read(`${section}/${data}`) + '\n' + read(`${section}/${page}`), app.context);
      assert.deepEqual(app.redirects, [`https://ordagofilms.com/${section}/${slug}/?utm_source=shared#detalle`]);
    });
  }
}

test('Explicit index.html addresses become directory URLs without losing state or fragments', () => {
  for (const pathname of ['/index.html', '/cine/index.html', '/servicios/index.html', '/cine/tonos/index.html']) {
    const app = browser(`https://ordagofilms.com${pathname}?source=old#portfolio`);
    vm.runInContext(read('routes.js'), app.context);
    assert.equal(app.histories.length, 1);
    assert.equal(app.histories[0][0], app.state);
    assert.equal(app.histories[0][2], `https://ordagofilms.com${pathname.replace('index.html', '')}?source=old#portfolio`);
  }
  const app = browser('https://ordagofilms.com/cine/tonos/');
  vm.runInContext(read('routes.js'), app.context);
  assert.deepEqual(app.histories, []);
});

test('All three coproduction credits appear in the requested order', () => {
  const expected = {
    jaen: 'Anna Caritg · Órdago Films · EYDDOS',
    tonos: 'Garo Films · Skyeangel Productions · CANADA · La Mala Fama · Órdago Films',
    vigilia: 'Aparat Films · PuroCuento Films · La Palomitera · Sunflower Pictures · Órdago Films',
  };
  for (const [id, credit] of Object.entries(expected)) {
    const app = browser('https://ordagofilms.com/cine/example/', { projectId: id });
    vm.runInContext(read('cine/projects.js') + '\n' + read('cine/project-page.js'), app.context);
    assert.ok(app.created.some(item => item.textContent === 'Una coproducción de ' + credit));
  }
});
