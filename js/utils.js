/*
  utils.js
  --------
  Small, dependency-free helper functions shared across the engine.
  Nothing in this file should ever need to change to add or edit
  project content.
*/

/** Escape a string for safe insertion into HTML. Always call this
 *  BEFORE applying any of the light markdown-like formatting below,
 *  so a literal "<" typed by a content maker can never turn into a
 *  real tag. */
export function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Read a query-string parameter from the current URL. */
export function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/** Build a URL for a given page + query params, e.g.
 *  buildUrl("document.html", { id: "DOC-001" }) */
export function buildUrl(page, params = {}) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== "") usp.set(k, v);
  }
  const qs = usp.toString();
  return qs ? `${page}?${qs}` : page;
}

/** Format an ISO-ish date string (YYYY-MM-DD or partials) into a
 *  readable fallback when a document has no explicit dateDisplay. */
export function formatDateFallback(dateStr) {
  if (!dateStr) return "";
  const m = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(dateStr.trim());
  if (!m) return dateStr; // not a recognized machine format; show as-is
  const [, year, month, day] = m;
  const months = ["January","February","March","April","May","June",
    "July","August","September","October","November","December"];
  if (day && month) return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
  if (month) return `${months[parseInt(month, 10) - 1]} ${year}`;
  return year;
}

/** Debounce a function so it only runs after `wait` ms of silence. */
export function debounce(fn, wait = 150) {
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

/** Turn a display name into a URL-safe slug (used for readability in
 *  generated ids only; actual routing uses ?id= query params — see
 *  README for why clean paths were intentionally skipped). */
export function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Shallow helper: get a DOM element by id, or null. */
export function $(id) {
  return document.getElementById(id);
}

/** Create an element with attributes/children in one call. */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else if (v != null) node.setAttribute(k, v);
  }
  for (const child of [].concat(children)) {
    if (child == null) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}
