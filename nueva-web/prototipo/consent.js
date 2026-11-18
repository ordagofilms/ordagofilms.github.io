(() => {
  'use strict';
  const measurementId = 'G-G9HX6EF6HY';
  const storageKey = 'ordago.consent.v1';
  const duration = 180 * 24 * 60 * 60 * 1000;
  const disabledKey = 'ga-disable-' + measurementId;
  const settings = document.querySelector('[data-cookie-policy]');
  const policyUrl = settings?.dataset.cookiePolicy || '/cookies/';
  let consent;
  let loaded = false;
  let panel;
  let returnFocus;
  let expiryTimer;

  window[disabledKey] = true;
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag('consent', 'default', {
    analytics_storage: 'denied', ad_storage: 'denied',
    ad_user_data: 'denied', ad_personalization: 'denied',
  });

  function readConsent() {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey));
      if (value?.version === 1 && typeof value.analytics === 'boolean' &&
          Number.isFinite(value.updatedAt) && value.updatedAt <= Date.now() &&
          Date.now() - value.updatedAt < duration) return value;
    } catch { /* Browsing remains available when storage is blocked. */ }
  }

  function clearAnalyticsCookies() {
    const names = document.cookie.split(';').map(cookie => cookie.split('=')[0].trim())
      .filter(name => /^_ga(?:_|$)|^_gid$|^_gat(?:_|$)/.test(name));
    const parts = location.hostname.split('.');
    const domains = ['', ...parts.map((_, index) => parts.slice(index).join('.'))];
    const pathParts = location.pathname.split('/').filter(Boolean);
    const paths = ['/', ...pathParts.map((_, index) => '/' + pathParts.slice(0, index + 1).join('/'))];
    for (const name of names) for (const domain of domains) for (const path of paths) {
      document.cookie = name + '=; Max-Age=0; Path=' + path + (domain ? '; Domain=' + domain : '') + '; SameSite=Lax';
    }
  }

  function applyConsent() {
    clearTimeout(expiryTimer);
    const accepted = consent?.analytics === true;
    window[disabledKey] = !accepted;
    gtag('consent', 'update', { analytics_storage: accepted ? 'granted' : 'denied' });
    if (!accepted) clearAnalyticsCookies();
    // Keep development, preview and content-management visits out of production data.
    const production = ['ordagofilms.com', 'www.ordagofilms.com'].includes(location.hostname)
      && !location.pathname.startsWith('/vista-previa/')
      && !location.pathname.startsWith('/web-anterior/')
      && !location.pathname.startsWith('/gestor/');
    if (accepted && production && !loaded) {
      loaded = true;
      gtag('js', new Date());
      gtag('config', measurementId, {
        allow_google_signals: false, allow_ad_personalization_signals: false,
        cookie_expires: 15552000, cookie_update: false, cookie_flags: 'SameSite=Lax;Secure',
        // Query strings can contain personal information or email drafts.
        page_location: location.origin + location.pathname,
        page_referrer: document.referrer ? new URL(document.referrer).origin : '',
      });
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
      document.head.append(script);
    }
    if (consent) {
      expiryTimer = setTimeout(() => {
        if (Date.now() - consent.updatedAt < duration) { applyConsent(); return; }
        consent = undefined;
        applyConsent();
        openPanel(false);
      }, Math.min(2147000000, Math.max(1, duration - (Date.now() - consent.updatedAt))));
    }
  }

  function closePanel() {
    panel?.remove();
    panel = undefined;
    if (returnFocus?.isConnected) returnFocus.focus();
    returnFocus = undefined;
  }

  function save(analytics) {
    const wasLoaded = loaded;
    consent = { version: 1, analytics, updatedAt: Date.now() };
    try { localStorage.setItem(storageKey, JSON.stringify(consent)); } catch { /* Apply for this page. */ }
    applyConsent();
    closePanel();
    // Remove the already-loaded third-party library when consent is withdrawn.
    if (!analytics && wasLoaded) location.reload();
  }

  function openPanel(focus = true) {
    if (panel) { if (focus) panel.querySelector('button').focus(); return; }
    if (focus) returnFocus = document.activeElement;
    panel = document.createElement('section');
    panel.className = 'consent-panel';
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', 'Preferencias de cookies');
    panel.innerHTML = `<h2>Tu privacidad</h2>
      <p>Usamos almacenamiento técnico para recordar tu elección. Si aceptas, utilizaremos Google Analytics para medir las visitas y mejorar la web. Puedes rechazar la analítica y seguir navegando.</p>
      <p><a href="${policyUrl}">Consultar la política de cookies</a>. Puedes cambiar tu elección desde el pie de página.</p>
      <div class="consent-actions">
        <button type="button" data-consent="reject">Rechazar analítica</button>
        <button type="button" data-consent="accept">Aceptar analítica</button>
        <button type="button" data-consent="configure" aria-expanded="false" aria-controls="cookie-options">Configurar</button>
      </div>
      <fieldset id="cookie-options" hidden><legend>Preferencias</legend>
        <label for="cookie-necessary"><input type="checkbox" id="cookie-necessary" checked disabled> Almacenamiento técnico necesario</label>
        <label for="cookie-analytics"><input type="checkbox" id="cookie-analytics"> Analítica de Google Analytics</label>
        <div class="consent-actions"><button type="button" data-consent="save">Guardar preferencias</button></div>
      </fieldset>`;
    panel.querySelector('#cookie-analytics').checked = consent?.analytics === true;
    panel.addEventListener('click', event => {
      const action = event.target.closest('[data-consent]')?.dataset.consent;
      if (action === 'accept') save(true);
      if (action === 'reject') save(false);
      if (action === 'save') save(panel.querySelector('#cookie-analytics').checked);
      if (action === 'configure') {
        panel.querySelector('#cookie-options').hidden = false;
        event.target.setAttribute('aria-expanded', 'true');
        panel.querySelector('#cookie-analytics').focus();
      }
    });
    document.body.append(panel);
    if (focus) panel.querySelector('button').focus();
  }

  for (const button of document.querySelectorAll('[data-cookie-settings]')) {
    button.hidden = false;
    button.addEventListener('click', () => openPanel());
  }
  window.addEventListener('storage', event => {
    if (event.key !== storageKey && event.key !== null) return;
    const wasLoaded = loaded;
    consent = readConsent();
    applyConsent();
    closePanel();
    if (!consent) openPanel(false);
    if (!consent?.analytics && wasLoaded) location.reload();
  });
  consent = readConsent();
  applyConsent();
  if (!consent) openPanel(false);
})();
