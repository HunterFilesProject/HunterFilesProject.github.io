# Content Guide

This guide is for adding and editing documents, people, and volumes in
the archive. **You do not need to know HTML, CSS, or JavaScript
programming to use it** — you're only ever editing plain data.

If you've never edited a file like this before, the short version is:
every document is a file that looks like a form with blanks filled in
(`title: "..."`, `date: "..."`, and so on). You fill in the blanks,
save the file, and the website builds the page for you automatically.

Some pages need no content editing at all — the Dashboard, Timeline,
Keywords, and Changelog pages are all generated automatically from
whatever's already in `content/` and `data/`. See `README.md`'s
"Pages" section for what each one shows. Filling in the `status`,
`date`, and `lastUpdated` fields on individual documents (as
described below) is what keeps those pages accurate.

---

## Before you start: the one rule that matters most

**Never edit anything in the `css/`, `js/` folders, or the `.html`
files.** Everything you need to do lives in `content/` (and one small
step in `data/`). If a task seems to require editing those other
folders, stop — something's off, and it's worth asking the developer
rather than guessing.

---

## Adding a new document

1. Go to `content/documents/`.
2. Copy `_TEMPLATE.js` and rename the copy to the next unused ID. This
   archive's documents are numbered `HF<volume number>#<4-digit
   number>` — e.g. `HF1#0077` for the next document in volume 1, or
   `HF2#0101` for the next one in volume 2. (Check `data/documents.js`
   to see the highest number currently in use for that volume — or
   look inside `content/documents/` and, for volume 2, its
   `volume-2/` sub-folder.)

   Filename note: because the site loads content as native ES
   modules, a literal `#` in a *filename* breaks the import (the
   browser reads everything after `#` as a URL fragment). So the
   filename and the exported constant swap the `#` for a dash/
   underscore — `content/documents/HF1-0077.js` exporting
   `HF1_0077` — while the `id` field *inside* the file keeps the real
   `#` (`id: "HF1#0077"`). Copy this pattern exactly; `_TEMPLATE.js`
   shows it too.
3. Open your new file and fill in the fields. Here's what each one
   means (this same guide is also written as comments at the top of
   `_TEMPLATE.js`, so it's always close at hand):

   | Field | Required? | What it is |
   |---|---|---|
   | `id` | Yes | Must match the filename (see the filename note above), e.g. `"HF1#0077"`. Never reuse an id, even for a deleted document. |
   | `volume` | Yes | Which volume this belongs to, e.g. `"VOL-01"`. This is the only place you set a document's volume — you don't need to edit anything in `content/volumes/`. |
   | `dataset` | No | Which dataset this belongs to, e.g. `"DS-02"` (see "Adding a new dataset" below). Use `null` if this document doesn't belong to one. A dataset is always inside one volume, and this document's `volume` must match that dataset's own `volume`. |
   | `sortOrder` | No | A number controlling order within the volume. Leave it out if you don't need a specific order. |
   | `title` | Yes | The document's title. |
   | `status` | Yes | Either `"active"` (current, relevant information) or `"deprecated"` (not being kept up to date). New stubs should generally start `"deprecated"` until someone has actually reviewed and filled them in. Shown as a small badge on the document page and in document lists. |
   | `date` | No | Machine-readable: `"1954-06-14"`, `"1954-06"`, or just `"1954"`. |
   | `dateDisplay` | No | Only needed if the date is unusual, e.g. `"Early summer, 1954"`. Otherwise leave blank — a readable version is generated from `date` automatically. |
   | `roughTime` | No | e.g. `"Morning"`, `"Evening"`. |
   | `location` | No | e.g. `"Florida"`. |
   | `people` | No | A list of person **IDs** (not names!) — see "Referencing people" below. |
   | `keywords` | No | A list of search terms, e.g. `["Florida", "property"]`. |
   | `summary` | Recommended | One or two sentences, shown in lists and search results. |
   | `context` | Recommended | The full write-up — see "Writing the context field" below. |
   | `relatedDocuments` | No | A list of other document **IDs** — see "Referencing other documents" below. |
   | `sourceUrl` | No | A link to an original scanned file/image, if one exists online. Leave the whole line out if there isn't one. |
   | `lastUpdated` | Recommended | The date you last made a real content change to this document, as `"YYYY-MM-DD"`, or `null` if it's never actually been updated. Shown at the bottom of the document page. **This is maintained by hand** — update it yourself whenever you edit a document's content; nothing sets it automatically. |

4. **Folder organization (optional, cosmetic only):** where the file
   physically lives inside `content/documents/` doesn't matter to the
   site — only the import path you write in `data/documents.js` in
   step 6 does. Volume 1's documents sit flat in `content/documents/`.
   Volume 2's sit under `content/documents/volume-2/`, further split
   into `dataset-NN/` sub-folders that mirror its datasets (see
   "Adding a new dataset" below) — purely so they're easier to browse
   on disk. Follow whichever pattern the volume you're adding to
   already uses.
5. Save the file.
6. Open `data/documents.js`. Add one import line and one line in the
   list, following the existing pattern:

   ```javascript
   import { HF1_0077 } from "../content/documents/HF1-0077.js";
   // ...
   export const DOCUMENTS = [
     HF1_0001,
     // ...
     HF1_0076,
     HF1_0077,
   ];
   ```

   This step is intentionally manual (rather than automatic) so it's
   always clear, just by reading this one file, exactly which
   documents are live on the site.

7. Commit and push to GitHub. The site updates automatically — see
   the main `README.md` for details.

New documents are usually added at the *end* of the list in
`data/documents.js` — the home page's "Recently added" section shows
whatever is listed last.

---

## Editing an existing document

Open its file in `content/documents/`, change whichever fields need
updating, and save. You don't need to touch `data/documents.js` at all
for an edit — that file only changes when you add or remove a
document entirely.

---

## Adding a new person

Open `content/people.js`. Add a new line:

```javascript
{ id: "P-006", name: "Someone's Name" },
```

Use the next unused `P-###` id. Then reference that id (not the name)
in any document's `people` field.

**Before adding a new person, check whether they already exist** —
scan the list in `content/people.js` for a name close to the one
you're about to add. This avoids the exact problem person IDs are
meant to solve: the same person accidentally being entered under two
different spellings ("Jane Doe #3" and "Jane Doe#3") and treated as
two different people on the site. The site's built-in validation (see
"Troubleshooting" below) will also flag likely duplicates for you.

---

## Adding a new volume

1. Go to `content/volumes/`, copy an existing file (e.g.
   `volume-03.js`), and rename it, e.g. `volume-04.js`.
2. Edit its `id`, `number`, `title`, and `description`.
3. Open `data/volumes.js` and add one import line and one array entry,
   the same way you did for a document.

You do **not** list a volume's documents anywhere in the volume file
itself — a document joins a volume by setting its own `volume: "VOL-04"`
field. The volume's page and document count are generated automatically.

---

## Adding a new dataset

A dataset is an optional sub-grouping of documents *within* one
volume — used when a volume is large enough that browsing it as one
flat list stops being useful. Not every volume needs datasets; a
volume with none (like volume 1) is simply shown as a flat list, same
as before.

1. Go to `content/datasets/`, copy an existing file (e.g.
   `dataset-14.js`), and rename it, e.g. `dataset-15.js`.
2. Edit its `id` (e.g. `"DS-15"`), `volume` (which volume it belongs
   to), `number`, `title`, and `description`.
3. Open `data/datasets.js` and add one import line and one array
   entry, the same way you did for a volume.

You do **not** list a dataset's documents anywhere in the dataset file
itself — a document joins a dataset the same way it joins a volume: by
setting its own `dataset: "DS-15"` field (see the document field table
above). A document's `volume` must match its dataset's `volume`; the
site's built-in checker will warn you if they don't line up.

Once a volume has at least one dataset, its volume page automatically
switches from a flat document list to a grouped view: any documents
in that volume with no dataset are listed first, followed by a card
for each dataset (linking to that dataset's own page). The sidebar
does the same — a volume with datasets shows them as a second,
independently-collapsible level, nested under the volume.

---

## Referencing people

Always use the person's **ID**, never their name, in a document's
`people` field:

```javascript
people: ["P-002", "P-001"],
```

The website looks up the name from `content/people.js` and displays
it — and links to that person's page — automatically.

## Referencing other documents

Same idea, using document IDs in `relatedDocuments`:

```javascript
relatedDocuments: ["HF1#0005", "HF1#0006"],
```

If you reference a document ID that doesn't exist (a typo, or a
document that hasn't been added yet), the site won't show a broken
link — it just quietly skips that reference and prints a note in the
browser's developer console, which the site's built-in checker also
surfaces (see "Troubleshooting").

---

## Writing the `context` field

Plain text works as-is. **Blank lines become paragraph breaks** —
you don't need to write any HTML:

```javascript
context: `
This is the first paragraph.

This is the second paragraph.
`,
```

A small set of extra formatting is also understood:

```text
# A heading

**bold text**

- a bullet point
- another bullet point

> a quoted or reconstructed note
```

That's the complete list — headings (`#`), bold (`**text**`), bullet
lists (`-`), and blockquotes (`>`). Anything else you type (other
symbols, HTML tags) will just show up as plain text on the page rather
than being turned into formatting, so there's no risk of accidentally
breaking the page's layout.

**One thing to know:** because `#`, `-`, and `>` at the very start of
a line are treated as formatting, a paragraph that genuinely needs to
start with one of those characters (e.g. a line beginning "> 50% of
respondents...") will be misread as a quote. If that happens, just
add a word before it, or a space, so the line doesn't start with the
symbol.

---

## Updating the live site

Once your changes are saved and committed to GitHub, the site rebuilds
and republishes on its own — there's no button to press or command to
run. Allow a minute or two after pushing.

---

## Troubleshooting

**I want to check my work before pushing to GitHub.** Open the site
locally (see `README.md` for how) and open your browser's developer
console (usually F12, or right-click → Inspect → Console). Every page
load prints an "ARCHIVE VALIDATION" report there, listing:

- Duplicate document, person, or dataset IDs
- A document pointing at a volume, dataset, person, or related
  document that doesn't exist
- A document whose dataset belongs to a different volume than the
  document itself
- Likely duplicate people (similar names under different IDs)
- Malformed dates (including `lastUpdated`)
- Missing titles
- Missing or invalid `status` values (must be `"active"` or `"deprecated"`)
- Duplicate keywords within one document

This report only appears in the browser console — visitors to the
live site never see it, and a mistake in one document never breaks
the rest of the site.

**A document isn't showing up on the site at all.** Almost always
means it was never added to `data/documents.js` — check for both the
import line and the array entry.

**A document isn't showing up under the right dataset.** Check the
document's own `dataset` field — that's the only place the membership
is set. Also check the browser console: if the dataset id has a typo,
the checker will warn that the document "references missing dataset".

**A person's name shows up as their ID instead (like "P-006") on a
document page.** Means that ID isn't in `content/people.js` — check
for a typo in the ID, or that the person was actually added.

**A related document link is missing even though I added it.** Check
the browser console for a warning — it'll name the exact missing ID.

**I get an error and the page won't load at all.** This usually means
a typo broke the JavaScript syntax of a content file — a missing
comma, an unmatched quote mark, or a stray backtick. Compare your file
closely against `_TEMPLATE.js` or another existing document. If you're
stuck, it's worth asking the developer to take a look rather than
guessing further — a syntax error is the one category of mistake that
can affect the whole site rather than just one document.
