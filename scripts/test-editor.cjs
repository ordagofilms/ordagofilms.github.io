const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = path.join(__dirname, '../nueva-web/prototipo');

async function editor() {
  const downloads = [];
  const blobs = [];
  class Node {
    constructor(tag = 'div') { this.tag = tag; this.children = []; this.value = ''; this.listeners = {}; }
    append(...nodes) { this.children.push(...nodes); }
    replaceChildren(...nodes) { this.children = nodes; }
    get lastElementChild() { return this.children.at(-1); }
    focus() { this.focused = true; }
    click() { downloads.push(this); }
    addEventListener(type, handler) { this.listeners[type] = handler; }
    querySelector(tag) { return this.walk().find(node => node.tag === tag); }
    walk() { return this.children.flatMap(node => node instanceof Node ? [node, ...node.walk()] : []); }
    dataset = {};
  }
  const nodes = new Map(['content-editor','editor-status','editor-fields','article-fields','add-article','import-content'].map(id => [id, new Node()]));
  nodes.get('content-editor').append(nodes.get('editor-fields'), nodes.get('article-fields'));
  const content = JSON.parse(readFileSync(path.join(source, 'site-content.json'), 'utf8'));
  const context = vm.createContext({
    document: { currentScript: { src: 'https://example.test/editor.js' }, querySelector: selector => nodes.get(selector.slice(1)), createElement: tag => new Node(tag), createTextNode: text => text },
    location: { href: 'https://example.test/gestor/' },
    URL: class extends URL { static createObjectURL(blob) { blobs.push(blob); return 'blob:test'; } static revokeObjectURL() {} },
    Blob,
    FormData: class { constructor(form) { this.entries = new Map(form.walk().filter(node => node.name).map(node => [node.name, node.value])); } get(name) { return this.entries.get(name); } },
    fetch: async () => ({ ok: true, json: async () => content }),
  });
  vm.runInContext(readFileSync(path.join(source, 'editor.js'), 'utf8'), context);
  await new Promise(setImmediate);
  const form = nodes.get('content-editor');
  return { nodes, downloads, blobs, form, control: name => form.walk().find(node => node.name === name), submit: () => form.listeners.submit({ preventDefault() {} }) };
}

test('Editing content and creating an English page exports the complete publishable file', async () => {
  const app = await editor();
  app.control('home.heading').value = 'Nuevo encabezado';
  app.nodes.get('add-article').listeners.click();
  for (const [name, value] of Object.entries({ title: 'Our films', slug: 'our-films', language: 'en', description: 'Our audiovisual work.', body: 'First paragraph.\n\nSecond paragraph.' })) {
    app.control('article.0.' + name).value = value;
  }
  app.submit();
  assert.equal(app.downloads.length, 1);
  assert.equal(app.downloads[0].download, 'site-content.json');
  const data = JSON.parse(await app.blobs[0].text());
  assert.equal(data.pages.home.heading, 'Nuevo encabezado');
  assert.equal(data.articles[0].language, 'en');
  assert.equal(data.articles[0].slug, 'our-films');
  assert.equal(data.company.taxId, 'B21846167');
  assert.match(app.nodes.get('editor-status').textContent, /Archivo preparado/);
});

test('Unsafe article paths are rejected before producing a download', async () => {
  const app = await editor();
  app.nodes.get('add-article').listeners.click();
  for (const [name, value] of Object.entries({ title: 'Test', slug: '../outside', language: 'es', description: 'Test', body: 'Test' })) app.control('article.0.' + name).value = value;
  app.submit();
  assert.equal(app.downloads.length, 0);
  assert.match(app.nodes.get('editor-status').textContent, /dirección/);
});
