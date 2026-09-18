# Document Archive

A static, documentation-style archive website for browsing and searching
a collection of historical/documentary records. No backend, database,
or build step — it runs entirely as static files, including on GitHub
Pages.

If you're here to **add or edit a document**, you want
[`CONTENT_GUIDE.md`](./CONTENT_GUIDE.md) instead — it's written for
someone who doesn't need to touch any code. This README is about how
the site itself works and how to deploy it.

## How the site works

The project is split into two layers:

- **`css/`, `js/`, and the `.html` files** — the "engine." This is
  the code that turns content into pages: navigation, search,
  rendering, routing. You shouldn't need to edit this to add content.
- **`content/` and `data/`** — the archive's actual content. Documents,
  volumes, and people live here as plain JavaScript objects.

Each page (`document.html`, `volume.html`, `person.html`, etc.) is a
mostly-empty HTML shell. When it loads, `js/app.js` figures out which
page it is, reads the relevant content from `data/`, and builds the
page's contents in the browser. Nothing is server-rendered — it's all
plain client-side JavaScript, no framework or build step involved.

Because each page type is its own real `.html` file (rather than a
single-page app), the browser's back/forward buttons and history work
correctly for free — there's no client-side router to get that wrong.

Search results and deep links (`document.html?id=DOC-001`,
`person.html?id=P-003`, `search.html?q=...`) are done via query-string
parameters rather than clean URL paths like `/documents/doc-001/`.
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
cd document-archive
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
document-archive/
├── index.html, search.html, volume.html, document.html,
│   people.html, person.html, about.html, 404.html   ← page shells
├── css/            ← visual styling (engine)
├── js/             ← navigation, rendering, search, routing (engine)
├── data/           ← registries: the arrays the engine actually reads
├── content/
│   ├── documents/  ← one file per document, plus _TEMPLATE.js
│   ├── volumes/    ← one file per volume
│   └── people.js   ← every person, in one file
├── assets/         ← images/icons, if you add any
├── README.md       ← this file
└── CONTENT_GUIDE.md
```

## Scaling beyond the test dataset

The test dataset ships with 3 volumes, 10 documents, and 5 people to
demonstrate every feature (search, filtering, person backlinks,
related documents, previous/next navigation, light markdown
formatting). The architecture is built to grow from there:

- Adding documents is always the same two-step process (copy a
  template, register it), whether you have 10 documents or 10,000.
- All search indexing, navigation, and cross-referencing is generated
  automatically from `data/` — nothing needs manual upkeep as the
  archive grows.
- **One thing worth deciding early if you expect to pass ~900
  documents:** IDs in this dataset use 3 digits (`DOC-001`). That's
  comfortable up to `DOC-999`; past that, plain-text sorting of IDs
  stops matching numeric order (`"DOC-1000"` sorts before `"DOC-999"`
  as text). If you expect to grow into the thousands, switch to a
  wider zero-padded format (`DOC-00001`) before you're deep into data
  entry — it's a bigger job to rename IDs after other documents have
  already linked to them via `relatedDocuments`.
- If the archive grows into the thousands of documents and the
  hand-rolled search in `js/search.js` starts to feel slow or its
  ranking starts to feel too simple, that file is intentionally
  isolated from the rest of the engine so it can be swapped for a
  small dependency-free search library (e.g. MiniSearch or FlexSearch)
  without touching navigation, rendering, or content.
