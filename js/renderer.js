/*
  renderer.js
  -----------
  Turns content data objects (documents, volumes, people) into HTML.
  This is where the "context maker never writes HTML" promise is kept:
  every function here takes plain data and returns markup.

  Content mantainers should never need to edit this file.
*/

import { DOCUMENTS } from "../data/documents.js";
import { VOLUMES } from "../data/volumes.js";
import { DATASETS } from "../data/datasets.js";
import { PEOPLE } from "../data/people.js";
import { escapeHtml, buildUrl, formatDateFallback, el } from "./utils.js";

// ---------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------

const peopleById = new Map(PEOPLE.map((p) => [p.id, p]));
const volumesById = new Map(VOLUMES.map((v) => [v.id, v]));
const datasetsById = new Map(DATASETS.map((d) => [d.id, d]));
const documentsById = new Map(DOCUMENTS.map((d) => [d.id, d]));

export function getDocument(id) { return documentsById.get(id) || null; }
export function getVolume(id) { return volumesById.get(id) || null; }
export function getDataset(id) { return id ? datasetsById.get(id) || null : null; }
export function getPerson(id) { return peopleById.get(id) || null; }

export function personName(id) {
  const p = peopleById.get(id);
  if (!p) {
    console.warn(`[archive] Document references unknown person id "${id}".`);
    return id;
  }
  return p.name;
}

/** Documents belonging to a volume, in display order:
 *  explicit sortOrder first, then fall back to id, so a volume with
 *  no sortOrder values set still renders in a stable, sensible order.
 *  Includes ALL of a volume's documents regardless of dataset — use
 *  this for whole-volume counts/fallbacks, not for a dataset's own
 *  page (see documentsInDataset). */
export function documentsInVolume(volumeId) {
  return DOCUMENTS.filter((d) => d.volume === volumeId).sort((a, b) => {
    const sa = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const sb = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
    if (sa !== sb) return sa - sb;
    return a.id.localeCompare(b.id);
  });
}

/** A volume's documents that do NOT belong to any dataset — the
 *  documents a volume-with-datasets page still needs to show on
 *  their own, outside any dataset group. */
export function documentsInVolumeWithoutDataset(volumeId) {
  return documentsInVolume(volumeId).filter((d) => !d.dataset);
}

export function allVolumesSorted() {
  return [...VOLUMES].sort((a, b) => (a.number ?? 0) - (b.number ?? 0));
}

/** Datasets belonging to a volume, in number order. Returns an empty
 *  array for a volume that doesn't use datasets (e.g. volume 1) —
 *  callers should treat that as "render this volume flat". */
export function datasetsInVolume(volumeId) {
  return DATASETS.filter((ds) => ds.volume === volumeId).sort((a, b) => (a.number ?? 0) - (b.number ?? 0));
}

/** Documents belonging to a dataset, in the same sortOrder-then-id
 *  order as documentsInVolume. */
export function documentsInDataset(datasetId) {
  return DOCUMENTS.filter((d) => d.dataset === datasetId).sort((a, b) => {
    const sa = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const sb = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
    if (sa !== sb) return sa - sb;
    return a.id.localeCompare(b.id);
  });
}

export function documentCountForDataset(datasetId) {
  return DOCUMENTS.filter((d) => d.dataset === datasetId).length;
}

/** All documents referencing a given person, grouped by volume
 *  (in volume order), matching the automatic-backlink requirement:
 *  the context maker never maintains this list by hand. */
export function documentsForPerson(personId) {
  const docs = DOCUMENTS.filter((d) => (d.people || []).includes(personId));
  const byVolume = new Map();
  for (const doc of docs) {
    if (!byVolume.has(doc.volume)) byVolume.set(doc.volume, []);
    byVolume.get(doc.volume).push(doc);
  }
  return allVolumesSorted()
    .filter((v) => byVolume.has(v.id))
    .map((v) => ({ volume: v, documents: documentsInVolume(v.id).filter((d) => byVolume.get(v.id).includes(d)) }));
}

export function documentCountForVolume(volumeId) {
  return DOCUMENTS.filter((d) => d.volume === volumeId).length;
}

// ---------------------------------------------------------------------
// Context body formatting (the "markdown-lite" renderer)
// ---------------------------------------------------------------------

/** Strip the light markup down to plain text, for search indexing
 *  and snippet generation (never shown directly as HTML). */
export function stripLightMarkup(raw) {
  if (!raw) return "";
  return raw
    .split("\n")
    .map((line) => line.trim().replace(/^#{1,3}\s+/, "").replace(/^[-*]\s+/, "").replace(/^>\s?/, ""))
    .join(" ")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** Convert a context field's plain text (with a small, controlled set
 *  of markdown-like conventions) into safe HTML.
 *
 *  IMPORTANT ORDER: the block-level syntax ("# ", "- ", "> ") is
 *  detected on the RAW, unescaped text first, and only the leftover
 *  leaf content is passed through escapeHtml() right before it goes
 *  into a tag. Escaping the whole block up front would turn a literal
 *  ">" into "&gt;" before the blockquote check ever saw it — the
 *  structure has to be read off the real text, and only the content
 *  inside it gets escaped. A stray "<" or "&" typed by a content
 *  maker still can never become a real tag, because every leaf value
 *  is escaped individually before it's inserted — see spec section 50. */
export function formatContext(raw) {
  if (!raw) return "";
  const trimmed = raw.replace(/\r\n/g, "\n").trim();
  if (!trimmed) return "";

  // Split into blocks on one-or-more blank lines.
  const blocks = trimmed.split(/\n\s*\n+/).map((b) => b.trim()).filter(Boolean);

  const html = blocks.map((block) => {
    const lines = block.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length === 0) return "";

    // Heading: a single line starting with 1-3 "#"
    const headingMatch = /^(#{1,3})\s+(.*)$/.exec(lines[0]);
    if (lines.length === 1 && headingMatch) {
      const level = Math.min(headingMatch[1].length + 2, 4); // "#" -> h3, "##"/"###" -> h4
      return `<h${level}>${inlineFormat(escapeHtml(headingMatch[2]))}</h${level}>`;
    }

    // Unordered list: every line starts with "- " or "* "
    if (lines.every((l) => /^[-*]\s+/.test(l))) {
      const items = lines.map((l) => `<li>${inlineFormat(escapeHtml(l.replace(/^[-*]\s+/, "")))}</li>`).join("");
      return `<ul>${items}</ul>`;
    }

    // Blockquote: every line starts with "> "
    if (lines.every((l) => /^>\s?/.test(l))) {
      const text = lines.map((l) => inlineFormat(escapeHtml(l.replace(/^>\s?/, "")))).join("<br>");
      return `<blockquote>${text}</blockquote>`;
    }

    // Otherwise: a paragraph. Join wrapped lines with a space.
    return `<p>${inlineFormat(escapeHtml(lines.join(" ")))}</p>`;
  });

  return html.join("\n");
}

/** Inline formatting applied within a block: currently just **bold**.
 *  Always call this AFTER escapeHtml() on the same text (see above),
 *  so it's operating on already-safe content. */
function inlineFormat(text) {
  return text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

// ---------------------------------------------------------------------
// Shared markup fragments
// ---------------------------------------------------------------------

export function renderBreadcrumb(parts) {
  const nav = el("nav", { class: "breadcrumb", "aria-label": "Breadcrumb" });
  parts.forEach((part, i) => {
    if (i > 0) nav.append(el("span", { class: "sep", "aria-hidden": "true" }, "/"));
    if (part.href && i < parts.length - 1) {
      nav.append(el("a", { href: part.href }, part.label));
    } else {
      nav.append(el("span", { "aria-current": "page" }, part.label));
    }
  });
  return nav;
}

export function renderPeopleChips(peopleIds) {
  if (!peopleIds || peopleIds.length === 0) return null;
  const ul = el("ul", { class: "chip-list" });
  for (const pid of peopleIds) {
    const person = getPerson(pid);
    const label = person ? person.name : pid;
    ul.append(el("li", {}, el("a", { class: "chip chip--accent", href: buildUrl("person.html", { id: pid }) }, label)));
  }
  return ul;
}

export function renderKeywordChips(keywords) {
  if (!keywords || keywords.length === 0) return null;
  const ul = el("ul", { class: "chip-list" });
  for (const kw of keywords) {
    ul.append(el("li", {}, el("a", { class: "chip", href: buildUrl("keyword.html", { kw }) }, kw)));
  }
  return ul;
}

export function renderRelatedDocuments(ids) {
  if (!ids || ids.length === 0) return null;
  const grid = el("div", { class: "related-grid" });
  for (const id of ids) {
    const doc = getDocument(id);
    if (!doc) {
      console.warn(`[archive] Related document reference "${id}" does not exist and was skipped.`);
      continue;
    }
    grid.append(
      el("a", { class: "related-card", href: buildUrl("document.html", { id: doc.id }) }, [
        el("span", { class: "related-title" }, doc.title),
        el("br"),
        el("span", { class: "related-meta" }, `${doc.id} · ${getVolume(doc.volume)?.title || doc.volume}`),
      ])
    );
  }
  return grid.childElementCount ? grid : null;
}

export function renderStatusBadge(status) {
  const known = status === "active" || status === "deprecated";
  const label = known ? (status === "active" ? "Active" : "Deprecated") : "Status unknown";
  return el("span", { class: `status-badge status-${known ? status : "unknown"}` }, label);
}

function docMetaLine(doc) {
  const parts = [];
  const dateText = doc.dateDisplay || formatDateFallback(doc.date);
  if (dateText) parts.push(doc.roughTime ? `${dateText} (${doc.roughTime})` : dateText);
  else if (doc.roughTime) parts.push(doc.roughTime);
  if (doc.location) parts.push(doc.location);
  const vol = getVolume(doc.volume);
  parts.push(vol ? vol.title : doc.volume);
  const ds = getDataset(doc.dataset);
  if (ds) parts.push(ds.title);
  return parts;
}

// ---------------------------------------------------------------------
// Page renderers
// ---------------------------------------------------------------------

export function renderNotFound(container, { title, message, backHref = "index.html", backLabel = "Return to the archive" }) {
  container.replaceChildren(
    el("div", { class: "empty-state" }, [
      el("h2", {}, title),
      el("p", {}, message),
      el("p", {}, el("a", { href: backHref }, backLabel)),
    ])
  );
}

export function renderHomePage(container) {
  const volumes = allVolumesSorted();
  const totalDocs = DOCUMENTS.length;

  const hero = el("div", { class: "home-hero" }, [
    el("h1", {}, "Document Archive"),
    el("p", {}, "A searchable collection of contextual records."),
  ]);

  const searchBox = el("form", { class: "search-page-box", role: "search", action: "search.html" }, [
    el("label", { for: "home-search-input", class: "visually-hidden" }, "Search the archive"),
    el("input", { id: "home-search-input", type: "search", name: "q", placeholder: "Search the archive…" }),
  ]);

  const stats = el("div", { class: "stat-row" }, [
    el("div", {}, [el("span", { class: "stat-value" }, String(totalDocs)), el("span", { class: "stat-label" }, "Documents")]),
    el("div", {}, [el("span", { class: "stat-value" }, String(volumes.length)), el("span", { class: "stat-label" }, "Volumes")]),
    el("div", {}, [el("span", { class: "stat-value" }, String(DATASETS.length)), el("span", { class: "stat-label" }, "Datasets")]),
    el("div", {}, [el("span", { class: "stat-value" }, String(PEOPLE.length)), el("span", { class: "stat-label" }, "People")]),
  ]);

  const volumesHeading = el("div", { class: "section-heading" }, [
    el("h2", { id: "volumes-section" }, "Browse volumes"),
    el("a", { href: "people.html" }, "Browse people →"),
  ]);
  const volumeGrid = el("div", { class: "volume-grid" });
  for (const v of volumes) {
    const count = documentCountForVolume(v.id);
    volumeGrid.append(
      el("a", { class: "volume-row", href: buildUrl("volume.html", { id: v.id }) }, [
        el("span", { class: "volume-row-title" }, v.title),
        el("span", { class: "volume-row-count" }, `${count} document${count === 1 ? "" : "s"}`),
      ])
    );
  }

  const recentHeading = el("h2", {}, "Recently added");
  const recentList = el("ul", { class: "recent-list" });
  const recent = DOCUMENTS.slice(-5).reverse();
  for (const doc of recent) {
    recentList.append(
      el("li", {}, [
        el("a", { class: "recent-title", href: buildUrl("document.html", { id: doc.id }) }, doc.title),
        el("br"),
        el("span", { class: "recent-meta" }, docMetaLine(doc).join(" — ")),
      ])
    );
  }

  container.replaceChildren(hero, searchBox, stats, volumesHeading, volumeGrid, recentHeading, recentList);
}

export function renderVolumePage(container, volumeId) {
  const volume = getVolume(volumeId);
  if (!volume) {
    renderNotFound(container, {
      title: "Volume not found",
      message: `No volume was found with the id "${volumeId ?? ""}".`,
    });
    return;
  }

  const breadcrumb = renderBreadcrumb([{ label: "Home", href: "index.html" }, { label: volume.title }]);

  const header = el("div", { class: "doc-header" }, [
    el("span", { class: "id-tag" }, volume.id),
    el("h1", {}, volume.title),
  ]);

  const description = volume.description ? el("p", { class: "volume-description" }, volume.description) : null;

  const datasets = datasetsInVolume(volume.id);

  if (datasets.length === 0) {
    // Flat volume: no dataset sub-grouping, list every document directly.
    const list = renderDocTable(documentsInVolume(volume.id));
    container.replaceChildren(breadcrumb, header, description, list);
    return;
  }

  // Grouped volume: show any standalone (no-dataset) documents first,
  // then each dataset as a browsable group.
  const sections = [];

  const standalone = documentsInVolumeWithoutDataset(volume.id);
  if (standalone.length > 0) {
    sections.push(
      el("div", { class: "section-block" }, [
        el("h2", {}, "Not part of a dataset"),
        renderDocTable(standalone),
      ])
    );
  }

  const datasetsHeading = el("h2", {}, "Datasets");
  const datasetGrid = el("div", { class: "volume-grid" });
  for (const ds of datasets) {
    const count = documentCountForDataset(ds.id);
    datasetGrid.append(
      el("a", { class: "volume-row", href: buildUrl("dataset.html", { id: ds.id }) }, [
        el("span", { class: "volume-row-title" }, ds.title),
        el("span", { class: "volume-row-count" }, `${count} document${count === 1 ? "" : "s"}`),
      ])
    );
  }
  sections.push(el("div", { class: "section-block" }, [datasetsHeading, datasetGrid]));

  container.replaceChildren(breadcrumb, header, description, ...sections);
}

function renderDocTable(docs) {
  const list = el("ul", { class: "volume-doc-table" });
  for (const doc of docs) {
    list.append(
      el("li", {}, el("a", { href: buildUrl("document.html", { id: doc.id }) }, [
        el("span", { class: "vdt-left" }, [
          el("span", { class: "vdt-title" }, doc.title),
          renderStatusBadge(doc.status),
        ]),
        el("span", { class: "vdt-meta" }, doc.id),
      ]))
    );
  }
  return list;
}

export function renderDatasetPage(container, datasetId) {
  const dataset = getDataset(datasetId);
  if (!dataset) {
    renderNotFound(container, {
      title: "Dataset not found",
      message: `No dataset was found with the id "${datasetId ?? ""}".`,
    });
    return;
  }

  const volume = getVolume(dataset.volume);
  const docs = documentsInDataset(dataset.id);
  const breadcrumb = renderBreadcrumb([
    { label: "Home", href: "index.html" },
    { label: volume ? volume.title : dataset.volume, href: volume ? buildUrl("volume.html", { id: volume.id }) : null },
    { label: dataset.title },
  ]);

  const header = el("div", { class: "doc-header" }, [
    el("span", { class: "id-tag" }, dataset.id),
    el("h1", {}, dataset.title),
  ]);

  const description = dataset.description ? el("p", { class: "volume-description" }, dataset.description) : null;

  const list = renderDocTable(docs);

  container.replaceChildren(breadcrumb, header, description, list);
}

export function renderDocumentPage(container, docId) {
  const doc = getDocument(docId);
  if (!doc) {
    renderNotFound(container, {
      title: "Document not found",
      message: `The requested document ("${docId ?? ""}") could not be found.`,
    });
    return;
  }

  const volume = getVolume(doc.volume);
  const dataset = getDataset(doc.dataset);
  const crumbParts = [
    { label: "Home", href: "index.html" },
    { label: volume ? volume.title : doc.volume, href: volume ? buildUrl("volume.html", { id: volume.id }) : null },
  ];
  if (dataset) crumbParts.push({ label: dataset.title, href: buildUrl("dataset.html", { id: dataset.id }) });
  crumbParts.push({ label: doc.title });
  const breadcrumb = renderBreadcrumb(crumbParts);

  const header = el("div", { class: "doc-header" }, [
    el("span", { class: "id-tag" }, doc.id),
    renderStatusBadge(doc.status),
    el("h1", {}, doc.title),
    el("div", { class: "doc-meta-row" }, docMetaLine(doc).map((t) => el("span", {}, t))),
  ]);

  const actions = el("div", { class: "doc-actions" }, [
    el("button", { type: "button", class: "doc-action-btn", onclick: () => window.print() }, "Print"),
    el("button", { type: "button", class: "doc-action-btn", onclick: () => exportDocumentAsJson(doc) }, "Export JSON"),
  ]);

  const sections = [];

  if (doc.summary) {
    sections.push(
      el("div", { class: "section-block" }, [el("h2", {}, "Summary"), el("p", {}, doc.summary)])
    );
  }

  if (doc.context) {
    const body = el("div", { class: "context-body", html: formatContext(doc.context) });
    sections.push(el("div", { class: "section-block" }, [el("h2", {}, "Context"), body]));
  }

  const peopleChips = renderPeopleChips(doc.people);
  if (peopleChips) sections.push(el("div", { class: "section-block" }, [el("h2", {}, "People / entities"), peopleChips]));

  const keywordChips = renderKeywordChips(doc.keywords);
  if (keywordChips) sections.push(el("div", { class: "section-block" }, [el("h2", {}, "Keywords"), keywordChips]));

  const related = renderRelatedDocuments(doc.relatedDocuments);
  if (related) sections.push(el("div", { class: "section-block" }, [el("h2", {}, "Related documents"), related]));

  if (doc.sourceUrl) {
    sections.push(
      el("div", { class: "section-block" }, [
        el("h2", {}, "Source"),
        el("p", {}, el("a", { href: doc.sourceUrl }, "View original source")),
      ])
    );
  }

  const pager = buildPager(doc);

  const lastUpdatedText = doc.lastUpdated ? formatDateFallback(doc.lastUpdated) : "Not recorded yet";
  const footer = el("footer", { class: "doc-footer" }, [
    el("span", { class: "doc-footer-label" }, "Last updated: "),
    el("span", {}, lastUpdatedText),
  ]);

  container.replaceChildren(breadcrumb, header, actions, ...sections, pager, footer);
}

function exportDocumentAsJson(doc) {
  const volume = getVolume(doc.volume);
  const dataset = getDataset(doc.dataset);
  const people = (doc.people || []).map((id) => {
    const p = getPerson(id);
    return { id, name: p ? p.name : null };
  });

  const enriched = {
    ...doc,
    volumeTitle: volume ? volume.title : null,
    datasetTitle: dataset ? dataset.title : null,
    people,
  };

  const blob = new Blob([JSON.stringify(enriched, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${doc.id.replace(/#/g, "-")}.json`;
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function buildPager(doc) {
  const siblings = doc.dataset ? documentsInDataset(doc.dataset) : documentsInVolume(doc.volume);
  const idx = siblings.findIndex((d) => d.id === doc.id);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;

  const pager = el("div", { class: "doc-pager" });
  if (prev) {
    pager.append(
      el("a", { href: buildUrl("document.html", { id: prev.id }) }, [
        el("span", { class: "pager-label" }, "← Previous"),
        prev.title,
      ])
    );
  } else {
    pager.append(el("span", { class: "pager-spacer" }));
  }
  if (next) {
    pager.append(
      el("a", { class: "pager-next", href: buildUrl("document.html", { id: next.id }) }, [
        el("span", { class: "pager-label" }, "Next →"),
        next.title,
      ])
    );
  } else {
    pager.append(el("span", { class: "pager-spacer" }));
  }
  return pager;
}

export function renderPeopleIndexPage(container) {
  const breadcrumb = renderBreadcrumb([{ label: "Home", href: "index.html" }, { label: "People" }]);
  const header = el("h1", {}, "People");
  const list = el("div", { class: "people-index" });

  const sorted = [...PEOPLE].sort((a, b) => a.name.localeCompare(b.name));
  for (const person of sorted) {
    const count = DOCUMENTS.filter((d) => (d.people || []).includes(person.id)).length;
    list.append(
      el("a", { class: "person-row", href: buildUrl("person.html", { id: person.id }) }, [
        el("span", {}, person.name),
        el("span", { class: "person-count" }, `${count} document${count === 1 ? "" : "s"}`),
      ])
    );
  }

  container.replaceChildren(breadcrumb, header, list);
}

export function renderPersonPage(container, personId) {
  const person = getPerson(personId);
  if (!person) {
    renderNotFound(container, {
      title: "Person not found",
      message: `No person was found with the id "${personId ?? ""}".`,
      backHref: "people.html",
      backLabel: "Return to people index",
    });
    return;
  }

  const groups = documentsForPerson(person.id);
  const total = groups.reduce((sum, g) => sum + g.documents.length, 0);

  const breadcrumb = renderBreadcrumb([
    { label: "Home", href: "index.html" },
    { label: "People", href: "people.html" },
    { label: person.name },
  ]);
  const header = el("div", { class: "doc-header" }, [
    el("span", { class: "id-tag" }, person.id),
    el("h1", {}, person.name),
    el("p", { class: "meta-line" }, `Referenced in ${total} document${total === 1 ? "" : "s"}`),
  ]);

  const groupsEl = el("div", {});
  for (const g of groups) {
    const list = el("ul", { class: "person-doc-list" });
    for (const doc of g.documents) {
      list.append(el("li", {}, el("a", { href: buildUrl("document.html", { id: doc.id }) }, doc.title)));
    }
    groupsEl.append(el("div", { class: "person-volume-group" }, [el("h3", {}, g.volume.title), list]));
  }

  container.replaceChildren(breadcrumb, header, groupsEl);
}

// ---------------------------------------------------------------------
// Keywords (mirrors the People index/detail pattern above, but keyed
// on a free-text keyword string rather than a person id — keywords
// have no separate registry, they're derived purely from documents'
// own `keywords` arrays)
// ---------------------------------------------------------------------

export function documentsForKeyword(keyword) {
  const docs = DOCUMENTS.filter((d) => (d.keywords || []).includes(keyword));
  const byVolume = new Map();
  for (const doc of docs) {
    if (!byVolume.has(doc.volume)) byVolume.set(doc.volume, []);
    byVolume.get(doc.volume).push(doc);
  }
  return allVolumesSorted()
    .filter((v) => byVolume.has(v.id))
    .map((v) => ({ volume: v, documents: documentsInVolume(v.id).filter((d) => byVolume.get(v.id).includes(d)) }));
}

export function allKeywordsSorted() {
  const counts = new Map();
  for (const doc of DOCUMENTS) {
    for (const kw of doc.keywords || []) counts.set(kw, (counts.get(kw) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([keyword, count]) => ({ keyword, count }));
}

export function renderKeywordsIndexPage(container) {
  const breadcrumb = renderBreadcrumb([{ label: "Home", href: "index.html" }, { label: "Keywords" }]);
  const header = el("h1", {}, "Keywords");

  const keywords = allKeywordsSorted();
  if (keywords.length === 0) {
    container.replaceChildren(breadcrumb, header, el("p", { class: "empty-state" }, "No documents have been tagged with keywords yet."));
    return;
  }

  const list = el("div", { class: "people-index" });
  for (const { keyword, count } of keywords) {
    list.append(
      el("a", { class: "person-row", href: buildUrl("keyword.html", { kw: keyword }) }, [
        el("span", {}, keyword),
        el("span", { class: "person-count" }, `${count} document${count === 1 ? "" : "s"}`),
      ])
    );
  }

  container.replaceChildren(breadcrumb, header, list);
}

export function renderKeywordPage(container, keyword) {
  const groups = keyword ? documentsForKeyword(keyword) : [];
  const total = groups.reduce((sum, g) => sum + g.documents.length, 0);

  if (!keyword || total === 0) {
    renderNotFound(container, {
      title: "Keyword not found",
      message: keyword ? `No documents are tagged with "${keyword}".` : "No keyword was given.",
      backHref: "keywords.html",
      backLabel: "Return to keyword index",
    });
    return;
  }

  const breadcrumb = renderBreadcrumb([
    { label: "Home", href: "index.html" },
    { label: "Keywords", href: "keywords.html" },
    { label: keyword },
  ]);
  const header = el("div", { class: "doc-header" }, [
    el("h1", {}, keyword),
    el("p", { class: "meta-line" }, `Tagged on ${total} document${total === 1 ? "" : "s"}`),
  ]);

  const groupsEl = el("div", {});
  for (const g of groups) {
    const list = el("ul", { class: "person-doc-list" });
    for (const doc of g.documents) {
      list.append(el("li", {}, el("a", { href: buildUrl("document.html", { id: doc.id }) }, doc.title)));
    }
    groupsEl.append(el("div", { class: "person-volume-group" }, [el("h3", {}, g.volume.title), list]));
  }

  container.replaceChildren(breadcrumb, header, groupsEl);
}

// ---------------------------------------------------------------------
// Dashboard: progress at a glance, overall and broken down by volume
// and dataset. "Filled in" means a document has some real summary or
// context text — a coarser but more honest signal of progress than
// the status field alone, since a stub can be manually flipped to
// "active" without anyone having actually written anything yet.
// ---------------------------------------------------------------------

function isFilledIn(doc) {
  return Boolean((doc.summary && doc.summary.trim()) || (doc.context && doc.context.trim()));
}

function computeProgressStats(docs) {
  const total = docs.length;
  const active = docs.filter((d) => d.status === "active").length;
  const deprecated = docs.filter((d) => d.status === "deprecated").length;
  const filled = docs.filter(isFilledIn).length;
  return { total, active, deprecated, filled, empty: total - filled };
}

function renderProgressBar(value, total, label) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  const bar = el("div", { class: "progress-bar" }, el("div", { class: "progress-bar-fill", style: `width: ${pct}%` }));
  return label ? el("div", {}, [bar, el("p", { class: "progress-bar-label" }, label)]) : bar;
}

function renderDashboardRow({ title, href, stats }) {
  const pct = stats.total ? Math.round((stats.filled / stats.total) * 100) : 0;
  return el("a", { class: "dashboard-row", href }, [
    el("div", { class: "dashboard-row-head" }, [
      el("span", { class: "dashboard-row-title" }, title),
      el("span", { class: "dashboard-row-count" }, `${stats.filled}/${stats.total} filled in (${pct}%) · ${stats.active} active`),
    ]),
    renderProgressBar(stats.filled, stats.total),
  ]);
}

export function renderDashboardPage(container) {
  const breadcrumb = renderBreadcrumb([{ label: "Home", href: "index.html" }, { label: "Dashboard" }]);
  const header = el("h1", {}, "Dashboard");

  const overall = computeProgressStats(DOCUMENTS);
  const overallPct = overall.total ? Math.round((overall.filled / overall.total) * 100) : 0;

  const overallStats = el("div", { class: "stat-row" }, [
    el("div", {}, [el("span", { class: "stat-value" }, String(overall.total)), el("span", { class: "stat-label" }, "Documents")]),
    el("div", {}, [el("span", { class: "stat-value" }, String(overall.active)), el("span", { class: "stat-label" }, "Active")]),
    el("div", {}, [el("span", { class: "stat-value" }, String(overall.deprecated)), el("span", { class: "stat-label" }, "Deprecated")]),
    el("div", {}, [el("span", { class: "stat-value" }, String(overall.filled)), el("span", { class: "stat-label" }, "Filled in")]),
  ]);

  const overallSection = el("div", { class: "section-block" }, [
    overallStats,
    renderProgressBar(overall.filled, overall.total, `${overallPct}% of the archive is filled in`),
  ]);

  const volumeRows = el("div", { class: "dashboard-rows" });
  for (const volume of allVolumesSorted()) {
    const stats = computeProgressStats(documentsInVolume(volume.id));
    volumeRows.append(renderDashboardRow({ title: volume.title, href: buildUrl("volume.html", { id: volume.id }), stats }));
  }
  const volumeSection = el("div", { class: "section-block" }, [el("h2", {}, "By volume"), volumeRows]);

  const sections = [overallSection, volumeSection];

  const datasetRows = el("div", { class: "dashboard-rows" });
  let anyDatasets = false;
  for (const volume of allVolumesSorted()) {
    for (const ds of datasetsInVolume(volume.id)) {
      anyDatasets = true;
      const stats = computeProgressStats(documentsInDataset(ds.id));
      datasetRows.append(
        renderDashboardRow({ title: `${volume.title} — ${ds.title}`, href: buildUrl("dataset.html", { id: ds.id }), stats })
      );
    }
  }
  if (anyDatasets) sections.push(el("div", { class: "section-block" }, [el("h2", {}, "By dataset"), datasetRows]));

  container.replaceChildren(breadcrumb, header, ...sections);
}

// ---------------------------------------------------------------------
// Timeline: documents grouped by year (extracted from the `date`
// field), oldest first. Documents with no date are counted but not
// shown individually, since they have nothing to place on a timeline.
// ---------------------------------------------------------------------

function yearOf(doc) {
  const m = /^(\d{4})/.exec(doc.date || "");
  return m ? m[1] : null;
}

export function renderTimelinePage(container) {
  const breadcrumb = renderBreadcrumb([{ label: "Home", href: "index.html" }, { label: "Timeline" }]);
  const header = el("h1", {}, "Timeline");

  const byYear = new Map();
  let undatedCount = 0;
  for (const doc of DOCUMENTS) {
    const y = yearOf(doc);
    if (y) {
      if (!byYear.has(y)) byYear.set(y, []);
      byYear.get(y).push(doc);
    } else {
      undatedCount++;
    }
  }

  const years = [...byYear.keys()].sort();

  if (years.length === 0) {
    const empty = el(
      "p",
      { class: "empty-state" },
      `None of the ${DOCUMENTS.length} documents have a date recorded yet. Once a document has a "date" field, it'll appear here automatically, grouped by year.`
    );
    container.replaceChildren(breadcrumb, header, empty);
    return;
  }

  const sections = [];
  for (const year of years) {
    const docs = byYear.get(year).sort((a, b) => (a.date || "").localeCompare(b.date || "") || a.id.localeCompare(b.id));
    sections.push(el("div", { class: "section-block" }, [el("h2", {}, year), renderDocTable(docs)]));
  }

  if (undatedCount > 0) {
    sections.push(
      el("p", { class: "volume-description" }, `${undatedCount} more document${undatedCount === 1 ? "" : "s"} have no date recorded and aren't shown above.`)
    );
  }

  container.replaceChildren(breadcrumb, header, ...sections);
}

// ---------------------------------------------------------------------
// Changelog: documents with a recorded lastUpdated date, most recent
// first — an audit trail of real content changes across the archive.
// ---------------------------------------------------------------------

export function renderChangelogPage(container) {
  const breadcrumb = renderBreadcrumb([{ label: "Home", href: "index.html" }, { label: "Changelog" }]);
  const header = el("h1", {}, "Changelog");

  const updated = DOCUMENTS.filter((d) => d.lastUpdated).sort((a, b) => (b.lastUpdated || "").localeCompare(a.lastUpdated || ""));
  const neverUpdated = DOCUMENTS.length - updated.length;

  const summary = el(
    "p",
    { class: "volume-description" },
    `${updated.length} of ${DOCUMENTS.length} documents have a recorded update. ${neverUpdated} have never been updated.`
  );

  if (updated.length === 0) {
    container.replaceChildren(breadcrumb, header, summary);
    return;
  }

  const list = el("ul", { class: "volume-doc-table" });
  for (const doc of updated) {
    const vol = getVolume(doc.volume);
    const ds = getDataset(doc.dataset);
    const context = [vol ? vol.title : doc.volume, ds ? ds.title : null].filter(Boolean).join(" · ");
    list.append(
      el(
        "li",
        {},
        el("a", { href: buildUrl("document.html", { id: doc.id }) }, [
          el("span", { class: "vdt-left" }, [el("span", { class: "vdt-title" }, doc.title), renderStatusBadge(doc.status)]),
          el("span", { class: "vdt-meta" }, `${formatDateFallback(doc.lastUpdated)} · ${context}`),
        ])
      )
    );
  }

  container.replaceChildren(breadcrumb, header, summary, list);
}
