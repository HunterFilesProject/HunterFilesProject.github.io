# The Hunter Files Project

A contextual database for hunter files — a static, documentation-style
website for browsing and searching a collection of historical/
documentary records. No backend, database, or build step — it runs
entirely as static files, including on GitHub Pages.

If you're here to **add or edit a document**, you want
[`CONTENT_GUIDE.md`](./CONTENT_GUIDE.md) instead — it's written for
someone who doesn't need to touch any code. This README is about how
the site itself works and how to deploy it.

## How the site works

The project is split into two layers:

- **`css/`, `js/`, and the `.html` files** — the "engine." This is
  the code that turns content into pages: navigation, search,
  rendering, routing. You shouldn't need to edit this to add content.
- **`content/` and `data/`** — the project's actual content. Documents,
  volumes, datasets, and people live here as plain JavaScript objects.

Each page (`document.html`, `volume.html`, `person.html`, etc.) is a
mostly-empty HTML shell. When it loads, `js/app.js` figures out which
page it is, reads the relevant content from `data/`, and builds the
page's contents in the browser. Nothing is server-rendered — it's all
plain client-side JavaScript, no framework or build step involved.

The site defaults to dark mode for first-time visitors, regardless of
their system preference. The toggle button in the header switches
between light and dark; once someone uses it, their explicit choice
is remembered (in their own browser's `localStorage`) and always wins
over the default from then on. This is controlled entirely in
`js/navigation.js` (`effectiveTheme()`) — not something content
editors need to touch.

Because each page type is its own real `.html` file (rather than a
single-page app), the browser's back/forward buttons and history work
correctly for free — there's no client-side router to get that wrong.

Search results and deep links (`document.html?id=HF1%230001`,
`person.html?id=P-003`, `search.html?q=...`) are done via query-string
parameters rather than clean URL paths like `/documents/hf1-0001/`.
This was a deliberate choice: GitHub Pages doesn't do server-side URL
rewriting, and the usual workaround for "clean URLs" on GitHub Pages
(a redirect trick through a custom 404 page) adds real fragility for
routing that a query string already does reliably. A `document.html?id=...`
link is just as bookmarkable and shareable as a clean path.

## Running it locally

Because the content and data files are loaded as native ES modules
(`import`/`export`), you can't just double-click `index.html` and open
it as a `file://` URL — browsers block module imports from the local
filesystem for security reasons. You need a tiny local web server
(no build step, no installation of the project itself, just something
to serve static files over `http://`):

```bash
# Python (usually already installed)
cd hunter-files-project
python3 -m http.server 8000
# then open http://localhost:8000

# or, if you have Node.js installed:
npx serve .
```

This local server is only for your own convenience while
previewing changes — the live site on GitHub Pages doesn't need it or
anything like it.

## Adding or editing content

See [`CONTENT_GUIDE.md`](./CONTENT_GUIDE.md) for the full walkthrough,
written for a non-programmer. The short version:

- **Add a document:** copy `content/documents/_TEMPLATE.js`, fill it
  in, then add one import line and one array entry in
  `data/documents.js`.
- **Edit a document:** open its file under `content/documents/` and
  change the values. Nothing else needs to change.
- **Add a person:** add a `{ id, name }` entry to `content/people.js`.
- **Add a volume:** copy an existing file in `content/volumes/`, then
  add one import line and one array entry in `data/volumes.js`.
- **Add a dataset** (an optional sub-grouping of documents within one
  volume): copy an existing file in `content/datasets/`, then add one
  import line and one array entry in `data/datasets.js`.

In every case, you're only ever editing plain data — no HTML, CSS, or
the site's JavaScript.

## Updating the live site

1. Make your content changes (see above).
2. Commit and push to GitHub.
3. GitHub Pages rebuilds automatically — there's nothing to run or
   compile. Give it a minute or two after pushing.

## Deploying to GitHub Pages

1. Push this repository to GitHub.
2. In the repository's **Settings → Pages**, set the source to
   "Deploy from a branch," and pick the branch (e.g. `main`) and the
   root folder (`/`).
3. GitHub will publish the site at
   `https://<your-username>.github.io/<repo-name>/`.
4. `404.html` at the repository root is picked up automatically by
   GitHub Pages as the custom "page not found" page.

No environment variables, secrets, or build configuration are needed.

## Project structure

```text
hunter-files-project/
├── index.html, search.html, volume.html, dataset.html,
│   document.html, people.html, person.html, keywords.html,
│   keyword.html, dashboard.html, timeline.html, changelog.html,
│   about.html, 404.html                              ← page shells
├── css/            ← visual styling (engine)
├── js/             ← navigation, rendering, search, routing (engine)
├── data/           ← registries: the arrays the engine actually reads
├── content/
│   ├── documents/  ← one file per document, plus _TEMPLATE.js.
│   │                 Flat per volume by default; a volume that uses
│   │                 datasets (currently just volume 2) nests its
│   │                 files under volume-N/dataset-NN/ instead — see
│   │                 CONTENT_GUIDE.md. This nesting is cosmetic only;
│   │                 the engine only cares about data/documents.js.
│   ├── volumes/    ← one file per volume
│   ├── datasets/   ← one file per dataset (a sub-grouping of
│   │                 documents within one volume; optional per volume)
│   └── people.js   ← every person, in one file
├── assets/         ← images/icons, if you add any
├── README.md       ← this file
└── CONTENT_GUIDE.md
```

## Current state at a glance

- **Volume 1** — 76 documents (`HF1#0001`–`HF1#0076`, `HF1#0022` is
  intentionally missing), no datasets; shown as a flat list.
- **Volume 2** — 100 documents (`HF2#0001`–`HF2#0100`). `HF2#0001`
  stands alone; the other 99 are split across 13 datasets
  (`DS-02`–`DS-14`). Shown as a grouped view on the site.
- **10 people**, **175 documents**, **2 volumes**, **13 datasets** in
  total. The architecture is built to grow well past this — see
  below.
- Every document is currently marked **`status: "deprecated"`** (all
  175 are still empty stubs) and has no `lastUpdated` date set. Flip a
  document to `"active"` and give it a `lastUpdated` date once it's
  actually been reviewed and filled in — see the field table in
  `CONTENT_GUIDE.md`.

## Pages

Beyond the volume/dataset/document/person pages already covered
above, the sidebar's "Reference" section links to:

- **`people.html`** — everyone referenced across the files.
- **`keywords.html`** / **`keyword.html`** — every keyword in use,
  and (per keyword) every document tagged with it. Same index/detail
  pattern as People, but keywords have no separate registry — they're
  derived purely from documents' own `keywords` arrays.
- **`timeline.html`** — documents grouped by year, oldest first, read
  from each document's `date` field. Undated documents are counted
  but not listed individually. Empty right now, since none of the 175
  stubs have a date yet.
- **`dashboard.html`** — progress at a glance: how many documents are
  active vs. deprecated, and how many are actually "filled in" (have
  real summary/context text) vs. still blank stubs, both overall and
  broken down by volume and dataset. "Filled in" is judged by content,
  not the `status` field, since a stub can be flipped to `"active"`
  by hand before anything's actually been written.
- **`changelog.html`** — documents with a recorded `lastUpdated` date,
  most recent first. An audit trail of real content changes, not of
  site/engine changes. Empty right now, since no document has a
  `lastUpdated` date yet.

Every document page also has **Print** and **Export JSON** buttons.
Print uses a dedicated `css/print.css` stylesheet that hides site
chrome and forces plain black-on-white regardless of the active
theme; Export JSON downloads that one document's data (with volume,
dataset, and people ids resolved to their display names) as a
standalone `.json` file.

## Scaling further

The architecture is built to keep growing past where it is today:

- Adding documents is always the same two-step process (copy a
  template, register it), whether a volume has 10 documents or
  10,000.
- All search indexing, navigation, and cross-referencing is generated
  automatically from `data/` — nothing needs manual upkeep as the
  project grows.
- Datasets exist for exactly this reason: once a volume gets large
  enough that one flat list stops being useful to browse (volume 2
  already crossed that line at 100 documents), splitting it into
  datasets keeps both the sidebar and the volume page manageable
  without changing how documents themselves work.
- **One thing worth knowing about the ID scheme:** ids are
  `HF<volume number>#<4-digit number>` (e.g. `HF1#0001`), which is
  comfortable up to `HF1#9999` per volume; past that, plain-text
  sorting of ids stops matching numeric order (`"HF1#10000"` sorts
  before `"HF1#9999"` as text, since it's shorter). If any one volume
  is ever going to pass ~9,999 documents, widen that volume's numbers
  to 5 digits before you're deep into data entry for it — it's a
  bigger job to rename ids after other documents have already linked
  to them via `relatedDocuments`.
- If the collection grows into the thousands of documents and the
  hand-rolled search in `js/search.js` starts to feel slow or its
  ranking starts to feel too simple, that file is intentionally
  isolated from the rest of the engine so it can be swapped for a
  small dependency-free search library (e.g. MiniSearch or FlexSearch)
  without touching navigation, rendering, or content.
