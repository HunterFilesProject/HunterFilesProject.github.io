/*
  router.js
  ---------
  This site uses plain multi-page navigation (separate .html files per
  page type) rather than a single-page app shell. That means the
  browser's own back/forward history already works correctly for free
  (Document A -> B -> C -> Back returns to B) with no framework.

  This module only handles two small things static navigation doesn't
  give you automatically:
    1. Knowing which "page type" the current HTML file is, so app.js
       can call the right renderer.
    2. Keeping the search page's query/filters reflected in the URL,
       so a search can be bookmarked or shared as a link, without
       spamming the browser history on every keystroke.
*/

export function getPageType() {
  return document.body.dataset.page || "";
}

/** Read the current search state from the URL's query string. */
export function readSearchState() {
  const usp = new URLSearchParams(window.location.search);
  return {
    q: usp.get("q") || "",
    volume: usp.get("volume") || "",
    person: usp.get("person") || "",
    keyword: usp.get("keyword") || "",
    date: usp.get("date") || "",
  };
}

/** Reflect search state into the URL without adding a new history
 *  entry per keystroke (replaceState), so the back button stays
 *  useful and a copied URL still reproduces the same search. */
export function writeSearchState(state) {
  const usp = new URLSearchParams();
  for (const key of ["q", "volume", "person", "keyword", "date"]) {
    if (state[key]) usp.set(key, state[key]);
  }
  const qs = usp.toString();
  const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  window.history.replaceState(null, "", newUrl);
}
