// Keep direct visits to an old index.html URL on the same page, with a clean address.
(() => {
  const url = new URL(location.href);
  if (url.pathname.endsWith('/index.html')) {
    url.pathname = url.pathname.slice(0, -'index.html'.length);
    history.replaceState(history.state, '', url.href);
  }
})();
