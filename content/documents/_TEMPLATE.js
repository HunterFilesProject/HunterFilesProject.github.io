/*
  DOCUMENT ENTRY GUIDE
  ====================
  Copy this file, rename it to the next unused id, and fill in the
  fields below. See CONTENT_GUIDE.md for the full walkthrough.

  id
    Unique ID, formatted "HF<volume number>#<4-digit number>", e.g.
    "HF1#0001" for volume 1, "HF2#0001" for volume 2. Never reuse an
    id, even for a document that gets deleted later, and never reuse
    a number just because an earlier one is missing/skipped.

    Filename note: because this site loads content as native ES
    modules, a literal "#" in a *filename* would break the import
    (the browser reads everything after "#" as a URL fragment, not
    part of the path). So the id value itself keeps the real "#"
    (e.g. id: "HF1#0001"), but the filename and the exported constant
    swap it for a dash/underscore instead: content/documents/HF1-0001.js
    exporting `HF1_0001`. Match that pattern for any new document.

  volume
    The id of the volume this document belongs to, e.g. "VOL-01".
    This is the ONLY place a document's volume membership is set —
    volume files do not list their own documents.

  dataset
    Optional. The id of a dataset (a sub-grouping of documents within
    one volume — see content/datasets/), e.g. "DS-02". Use `null` if
    this document doesn't belong to a dataset (either because its
    volume has none, or because it stands alone within a volume that
    does). Like `volume`, this is the ONLY place the membership is
    set — a dataset file never lists its own documents. A dataset's
    own `volume` field must match this document's `volume`.

  sortOrder
    Optional. A number controlling this document's position within
    its volume (lower numbers come first). If you leave every
    document in a volume without a sortOrder, they'll display in id
    order, which is usually fine. Only set this if you need a
    specific reading order.

  title
    The document's display title. Required.

  status
    Required. Either "active" (current, relevant information) or
    "deprecated" (not being kept up to date). New/unfilled stubs
    should generally start as "deprecated" until someone has actually
    reviewed and entered real content — flip it to "active" at that
    point. Shown as a small badge on the document page and in
    document lists.

  date
    Optional. Machine-readable date, as "YYYY-MM-DD", "YYYY-MM", or
    just "YYYY" if that's all that's known. Used for sorting/filtering.

  dateDisplay
    Optional. A human-readable version of the date, e.g. "June 14, 1954".
    If you leave this blank but fill in `date`, a reasonable display
    version is generated automatically — you only need dateDisplay for
    an approximate or non-standard date like "Early summer, 1954".

  roughTime
    Optional. An approximate time of day, e.g. "Morning", "Evening".

  location
    Optional. A place name associated with the document.

  people
    Optional. An array of person ids from content/people.js, e.g.
    ["P-002", "P-001"]. Add a new entry to people.js first if the
    person doesn't have an id yet — don't type their name here.

  keywords
    Optional but recommended. An array of search terms, e.g.
    ["Florida", "property", "family"].

  summary
    A one- or two-sentence description, shown in lists and search
    results. Recommended for every document.

  context
    The full contextual write-up. Plain text is fine — blank lines
    become paragraph breaks automatically. You can also use:
      # A heading
      **bold text**
      - a bullet list
      - like this
      > a blockquoted note
    Do not use any other HTML or markdown — it won't be understood
    and will show up as literal text.

  relatedDocuments
    Optional. An array of other document ids this one relates to,
    e.g. ["HF1#0005", "HF1#0006"]. These become clickable links
    automatically. If you reference a document id that doesn't exist,
    the site will skip it and print a warning in the browser console
    (during development) rather than showing a broken link.

  sourceUrl
    Optional. A link to the original source file/image, if one is
    hosted somewhere. Leave this out entirely if there isn't one.

  lastUpdated
    Optional but recommended. The date you last made a real content
    change to this document (not just touched the file), as
    "YYYY-MM-DD". Use `null` if it's never actually been updated.
    Shown at the bottom of the document page. This is maintained by
    hand — update it yourself whenever you edit a document's content;
    nothing sets it automatically.
*/

export const DOC_TEMPLATE = {
  id: "HF1#XXXX",
  volume: "VOL-01",
  dataset: null,
  sortOrder: null,
  title: "",
  status: "deprecated",
  date: "",
  dateDisplay: "",
  roughTime: "",
  location: "",
  people: [],
  keywords: [],
  summary: "",
  context: `

`,
  relatedDocuments: [],
  lastUpdated: null,
};
