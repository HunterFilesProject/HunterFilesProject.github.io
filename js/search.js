/*
  search.js
  ---------
  The whole search system lives in this one file, isolated from the
  rest of the engine so it can be swapped for a more advanced
  client-side search library later (see section 36 of the spec /
  CONTENT_GUIDE.md) without touching navigation, rendering, or content.

  Ranking priority (highest to lowest, never shown to the user as a
  number — see spec section 37):
    1. Exact title match
    2. Exact person match
    3. Exact phrase match in the context body
    4. Keyword match
    5. Partial text match anywhere in the indexed content
*/

import { DOCUMENTS } from "../data/documents.js";
import { VOLUMES } from "../data/volumes.js";
import { PEOPLE } from "../data/people.js";
import { getVolume, getPerson, stripLightMarkup } from "./renderer.js";
import { escapeHtml, buildUrl, formatDateFallback, debounce, el } from "./utils.js";
import { readSearchState, writeSearchState } from "./router.js";

// ---------------------------------------------------------------------
// Index construction (built once, at page load)
// ---------------------------------------------------------------------

function dateTextFor(doc) {
  const d = doc.dateDisplay || formatDateFallback(doc.date);
  return d || "";
}

function buildIndexEntry(doc) {
  const volume = getVolume(doc.volume);
  const peopleNames = (doc.people || []).map((id) => getPerson(id)?.name || id);
  const plainContext = stripLightMarkup(doc.context || "");
  const dateText = dateTextFor(doc);

  const allFieldsLower = [
    doc.id,
    doc.title,
    volume ? volume.title : doc.volume,
    dateText,
    doc.roughTime,
    doc.location,
    ...peopleNames,
    ...(doc.keywords || []),
    doc.summary,
    plainContext,
  ]
    .filter(Boolean)
    .join(" \n ")
    .toLowerCase();

  return {
    doc,
    volume,
    peopleNames,
    plainContext,
    dateText,
    titleLower: (doc.title || "").toLowerCase(),
    summaryLower: (doc.summary || "").toLowerCase(),
    plainContextLower: plainContext.toLowerCase(),
    locationLower: (doc.location || "").toLowerCase(),
    volumeTitleLower: (volume ? volume.title : doc.volume || "").toLowerCase(),
    keywordsLower: (doc.keywords || []).map((k) => k.toLowerCase()),
    peopleNamesLower: peopleNames.map((n) => n.toLowerCase()),
    allFieldsLower,
  };
}

let INDEX = null;
function getIndex() {
  if (!INDEX) INDEX = DOCUMENTS.map(buildIndexEntry);
  return INDEX;
}

// ---------------------------------------------------------------------
// Query parsing
// ---------------------------------------------------------------------

/** Split a query into quoted phrases and loose words, all lowercased.
 *  "Jane Doe #3" Florida  ->  ["jane doe #3", "florida"] */
function parseTerms(query) {
  const terms = [];
  const withoutPhrases = query.replace(/"([^"]+)"/g, (_, phrase) => {
    const t = phrase.trim().toLowerCase();
    if (t) terms.push(t);
    return " ";
  });
  for (const word of withoutPhrases.split(/\s+/)) {
    const w = word.trim().toLowerCase();
    if (w) terms.push(w);
  }
  return terms;
}

// ---------------------------------------------------------------------
// Matching + ranking
// ---------------------------------------------------------------------

function scoreEntry(entry, terms, fullQueryLower) {
  if (terms.length === 0) return 0;

  // Every term must appear somewhere (AND semantics) or the document
  // is not a match at all.
  for (const term of terms) {
    if (!entry.allFieldsLower.includes(term)) return -1;
  }

  let score = 0;

  // Whole-query exact-match bonuses (priority 1-4 from the spec).
  if (entry.titleLower === fullQueryLower) score += 1000; // 1. exact title match
  else if (entry.titleLower.includes(fullQueryLower)) score += 150;

  if (entry.peopleNamesLower.includes(fullQueryLower)) score += 500; // 2. exact person match
  if (entry.plainContextLower.includes(fullQueryLower)) score += 250; // 3. exact phrase in context
  if (entry.keywordsLower.includes(fullQueryLower)) score += 180; // 4. keyword match

  // Per-term partial-match scoring (priority 5), so multi-word AND
  // queries still rank sensibly relative to each other.
  for (const term of terms) {
    if (entry.titleLower.includes(term)) score += 30;
    if (entry.peopleNamesLower.some((n) => n.includes(term))) score += 20;
    if (entry.keywordsLower.some((k) => k.includes(term))) score += 15;
    if (entry.plainContextLower.includes(term)) score += 8;
    if (entry.summaryLower.includes(term)) score += 6;
    if (entry.locationLower.includes(term)) score += 5;
    if (entry.volumeTitleLower.includes(term)) score += 3;
  }

  return score;
}

// ---------------------------------------------------------------------
// Snippets + highlighting
// ---------------------------------------------------------------------

function findAnchor(entry, terms, fullQueryLower) {
  if (fullQueryLower && entry.plainContextLower.includes(fullQueryLower)) return fullQueryLower;
  for (const term of terms) {
    if (entry.plainContextLower.includes(term)) return term;
  }
  return null;
}

function buildSnippet(entry, terms, fullQueryLower) {
  const plain = entry.plainContext;
  if (!plain) {
    const fallback = entry.doc.summary || "";
    return escapeHtml(fallback);
  }

  const anchor = findAnchor(entry, terms, fullQueryLower);
  let windowStart = 0;
  let windowEnd = Math.min(plain.length, 160);

  if (anchor) {
    const idx = plain.toLowerCase().indexOf(anchor);
    if (idx >= 0) {
      windowStart = Math.max(0, idx - 60);
      windowEnd = Math.min(plain.length, idx + anchor.length + 90);
    }
  }

  const prefix = windowStart > 0 ? "…" : "";
  const suffix = windowEnd < plain.length ? "…" : "";
  const raw = plain.slice(windowStart, windowEnd).trim();
  const escaped = escapeHtml(raw);

  return prefix + highlightTerms(escaped, [...(fullQueryLower ? [fullQueryLower] : []), ...terms]) + suffix;
}

function highlightTerms(escapedText, terms) {
  const unique = [...new Set(terms.map((t) => t.trim()).filter(Boolean))];
  if (unique.length === 0) return escapedText;

  const patterns = unique
    .map((t) => escapeHtml(t))
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .sort((a, b) => b.length - a.length);

  const re = new RegExp(`(${patterns.join("|")})`, "ig");
  return escapedText.replace(re, '<mark class="search-highlight">$1</mark>');
}

// ---------------------------------------------------------------------
// Public search function
// ---------------------------------------------------------------------

/** Run a search + filter pass. Returns an array of {entry, score}
 *  sorted best-first. `filters` = { volume, person, keyword, date } */
export function runSearch(query, filters = {}) {
  const index = getIndex();
  const terms = parseTerms(query || "");
  const fullQueryLower = (query || "").trim().toLowerCase();

  let candidates = index.filter((entry) => {
    if (filters.volume && entry.doc.volume !== filters.volume) return false;
    if (filters.person && !(entry.doc.people || []).includes(filters.person)) return false;
    if (filters.keyword && !entry.keywordsLower.includes(filters.keyword.toLowerCase())) return false;
    if (filters.date && entry.dateText !== filters.date) return false;
    return true;
  });

  if (terms.length === 0) {
    // No text query: browsing by filter (or nothing at all). Order
    // by volume, then in-volume sort order, for a natural reading order.
    const volNumber = new Map(VOLUMES.map((v) => [v.id, v.number ?? 0]));
    candidates.sort((a, b) => {
      const va = volNumber.get(a.doc.volume) ?? 0;
      const vb = volNumber.get(b.doc.volume) ?? 0;
      if (va !== vb) return va - vb;
      const sa = a.doc.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const sb = b.doc.sortOrder ?? Number.MAX_SAFE_INTEGER;
      return sa - sb;
    });
    return candidates.map((entry) => ({ entry, score: 0 }));
  }

  const scored = candidates
    .map((entry) => ({ entry, score: scoreEntry(entry, terms, fullQueryLower) }))
    .filter((r) => r.score >= 0)
    .sort((a, b) => b.score - a.score || a.entry.titleLower.localeCompare(b.entry.titleLower));

  return scored;
}

// ---------------------------------------------------------------------
// Filter option lists (generated from data — never hand-maintained)
// ---------------------------------------------------------------------

function populateSelect(select, options, placeholder) {
  select.replaceChildren(el("option", { value: "" }, placeholder));
  for (const opt of options) {
    select.append(el("option", { value: opt.value }, opt.label));
  }
}

function buildFilterOptions() {
  const volumes = [...VOLUMES].sort((a, b) => (a.number ?? 0) - (b.number ?? 0)).map((v) => ({ value: v.id, label: v.title }));
  const people = [...PEOPLE].sort((a, b) => a.name.localeCompare(b.name)).map((p) => ({ value: p.id, label: p.name }));
  const keywordSet = new Set();
  DOCUMENTS.forEach((d) => (d.keywords || []).forEach((k) => keywordSet.add(k)));
  const keywords = [...keywordSet].sort((a, b) => a.localeCompare(b)).map((k) => ({ value: k, label: k }));
  const dateSet = new Set();
  DOCUMENTS.forEach((d) => {
    const t = dateTextFor(d);
    if (t) dateSet.add(t);
  });
  const dates = [...dateSet].sort().map((d) => ({ value: d, label: d }));
  return { volumes, people, keywords, dates };
}

// ---------------------------------------------------------------------
// Page wiring (search.html)
// ---------------------------------------------------------------------

export function initSearchPage() {
  const input = document.getElementById("search-input");
  const volumeSelect = document.getElementById("filter-volume");
  const personSelect = document.getElementById("filter-person");
  const keywordSelect = document.getElementById("filter-keyword");
  const dateSelect = document.getElementById("filter-date");
  const metaLine = document.getElementById("search-meta-line");
  const resultsList = document.getElementById("search-results");

  const options = buildFilterOptions();
  populateSelect(volumeSelect, options.volumes, "All volumes");
  populateSelect(personSelect, options.people, "All people");
  populateSelect(keywordSelect, options.keywords, "All keywords");
  populateSelect(dateSelect, options.dates, "All dates");

  const initial = readSearchState();
  input.value = initial.q;
  volumeSelect.value = initial.volume;
  personSelect.value = initial.person;
  keywordSelect.value = initial.keyword;
  dateSelect.value = initial.date;

  function currentFilters() {
    return {
      volume: volumeSelect.value,
      person: personSelect.value,
      keyword: keywordSelect.value,
      date: dateSelect.value,
    };
  }

  function render() {
    const query = input.value.trim();
    const filters = currentFilters();
    writeSearchState({ q: query, ...filters });

    const filtersActive = Object.values(filters).some(Boolean);
    if (!query && !filtersActive) {
      metaLine.textContent = "";
      resultsList.replaceChildren();
      document.getElementById("search-empty-state").hidden = false;
      return;
    }
    document.getElementById("search-empty-state").hidden = true;

    const results = runSearch(query, filters);

    metaLine.textContent = query
      ? `${results.length} result${results.length === 1 ? "" : "s"} for "${query}"`
      : `${results.length} document${results.length === 1 ? "" : "s"} matching filters`;

    const terms = query ? query.replace(/"/g, "").split(/\s+/).filter(Boolean) : [];
    const fullQueryLower = query.toLowerCase();

    resultsList.replaceChildren(
      ...results.map(({ entry }) => {
        const doc = entry.doc;
        const snippetHtml = query ? buildSnippet(entry, terms.map((t) => t.toLowerCase()), fullQueryLower) : escapeHtml(doc.summary || "");
        return el("li", { class: "result-item" }, [
          el("a", { class: "result-title", href: buildUrl("document.html", { id: doc.id }) }, doc.title),
          el("div", { class: "result-meta" }, [doc.id, entry.volume ? entry.volume.title : doc.volume, entry.dateText].filter(Boolean).join(" · ")),
          el("div", { class: "result-snippet", html: snippetHtml }),
        ]);
      })
    );

    if (results.length === 0) {
      resultsList.replaceChildren(el("li", { class: "search-empty" }, "No documents matched your search."));
    }
  }

  const debouncedRender = debounce(render, 150);
  input.addEventListener("input", debouncedRender);
  [volumeSelect, personSelect, keywordSelect, dateSelect].forEach((s) => s.addEventListener("change", render));

  render();
}
