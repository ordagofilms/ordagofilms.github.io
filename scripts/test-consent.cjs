const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const script = readFileSync(path.join(__dirname, '../nueva-web/prototipo/consent.js'), 'utf8');
const key = 'ordago.consent.v1';
const now = Date.UTC(2026, 10, 17);

function browser(stored, hostname = 'ordagofilms.com', pathname = '/') {
  const elements = [];
  const loaded = [];
  const events = {};
  const timers = [];
  const cookies = new Map([['_ga', 'one'], ['_ga_G9HX6EF6HY', 'two'], ['essential', 'keep']]);
  const storage = new Map(stored === undefined ? [] : [[key, stored]]);
  let reloads = 0;
  function element() {
    return {
      dataset: {}, hidden: false, checked: false, isConnected: true, attributes: {}, listeners: {},
      setAttribute(name, value) { this.attributes[name] = value; },
      addEventListener(name, handler) { this.listeners[name] = handler; },
      focus() {}, remove() { this.isConnected = false; },
      querySelector(selector) { this.children ||= {}; return this.children[selector] ||= element(); },
    };
  }
  const settings = element();
  settings.dataset.cookiePolicy = '/cookies/';
  const document = {
    referrer: 'https://example.org/path?private=data', activeElement: settings,
    querySelector: () => settings, querySelectorAll: () => [settings],
    createElement(tag) { const node = element(); node.tag = tag; elements.push(node); return node; },
    head: { append(node) { loaded.push(node); } }, body: { append() {} },
  };
  Object.defineProperty(document, 'cookie', {
    get: () => [...cookies].map(([name, value]) => name + '=' + value).join('; '),
    set: text => { if (text.includes('Max-Age=0')) cookies.delete(text.split('=')[0]); },
  });
  const window = { addEventListener: (name, handler) => { events[name] = handler; } };
  const context = vm.createContext({
    window, document, URL,
    Date: class extends Date { static now() { return now; } },
    location: { hostname, pathname, origin: 'https://' + hostname, reload: () => { reloads++; } },
    localStorage: { getItem: name => storage.get(name), setItem: (name, value) => storage.set(name, value) },
    setTimeout: (handler, delay) => { timers.push({ handler, delay }); return timers.length; }, clearTimeout() {},
  });
  vm.runInContext(script, context);
  function choose(action, checked = false) {
    const panel = elements.filter(node => node.tag === 'section' && node.isConnected).at(-1);
    panel.querySelector('#cookie-analytics').checked = checked;
    const target = { dataset: { consent: action }, closest() { return this; }, setAttribute() {} };
    panel.listeners.click({ target });
  }
  return { context, window, elements, loaded, storage, cookies, settings, timers, events, choose, reloads: () => reloads };
}

test('First visit and malformed, future or expired preferences never load Analytics', () => {
  for (const stored of [undefined, '{bad', JSON.stringify({ version: 1, analytics: true, updatedAt: now + 1 }), JSON.stringify({ version: 1, analytics: true, updatedAt: now - 181 * 86400000 })]) {
    const app = browser(stored);
    assert.equal(app.loaded.length, 0);
    assert.equal(app.window['ga-disable-G-G9HX6EF6HY'], true);
    assert.equal(app.cookies.has('_ga'), false);
    assert.equal(app.cookies.get('essential'), 'keep');
  }
});

test('Accepting loads one tag with denied advertising and sanitized page URLs', () => {
  const app = browser();
  app.choose('accept');
  assert.equal(app.loaded.length, 1);
  assert.equal(app.loaded[0].src, 'https://www.googletagmanager.com/gtag/js?id=G-G9HX6EF6HY');
  assert.equal(JSON.parse(app.storage.get(key)).analytics, true);
  const entries = app.window.dataLayer.map(value => Array.from(value));
  const config = entries.find(value => value[0] === 'config')[2];
  assert.equal(config.page_location, 'https://ordagofilms.com/');
  assert.equal(config.page_referrer, 'https://example.org');
  assert.equal(config.cookie_expires, 15552000);
  assert.equal(config.allow_google_signals, false);
  assert.equal(entries[0][2].ad_user_data, 'denied');
  assert.ok(app.timers.every(timer => timer.delay <= 2147483647));
});

test('Reject and save with an unchecked analytics option keep the tag blocked', () => {
  for (const action of ['reject', 'save']) {
    const app = browser(); app.choose(action);
    assert.equal(app.loaded.length, 0);
    assert.equal(JSON.parse(app.storage.get(key)).analytics, false);
  }
});

test('Existing consent is applied and can be withdrawn from the footer', () => {
  const app = browser(JSON.stringify({ version: 1, analytics: true, updatedAt: now - 1000 }));
  assert.equal(app.loaded.length, 1);
  app.settings.listeners.click();
  app.choose('reject');
  assert.equal(app.window['ga-disable-G-G9HX6EF6HY'], true);
  assert.equal(app.cookies.has('_ga'), false);
  assert.equal(app.reloads(), 1);
});

test('Cross-tab withdrawal disables an already loaded tag', () => {
  const app = browser(JSON.stringify({ version: 1, analytics: true, updatedAt: now }));
  app.storage.set(key, JSON.stringify({ version: 1, analytics: false, updatedAt: now }));
  app.events.storage({ key });
  assert.equal(app.window['ga-disable-G-G9HX6EF6HY'], true);
  assert.equal(app.reloads(), 1);
});

test('Local previews and the content editor never send production analytics', () => {
  const stored = JSON.stringify({ version: 1, analytics: true, updatedAt: now });
  for (const [host, pathname] of [['localhost', '/'], ['ordagofilms.com', '/vista-previa/'], ['ordagofilms.com', '/web-anterior/'], ['ordagofilms.com', '/gestor/']]) {
    assert.equal(browser(stored, host, pathname).loaded.length, 0);
  }
});
