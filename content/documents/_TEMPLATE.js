/*
  DOCUMENT ENTRY GUIDE
  ====================
  Copy this file, rename it to the next DOC-### id, and fill in the
  fields below. See CONTENT_GUIDE.md for the full walkthrough.

  id
    Unique ID, formatted "DOC-XXX". Never reuse an id, even for a
    document that gets deleted later.

  volume
    The id of the volume this document belongs to, e.g. "VOL-01".
    This is the ONLY place a document's volume membership is set —
    volume files do not list their own documents.

  sortOrder
    Optional. A number controlling this document's position within
    its volume (lower numbers come first). If you leave every
    document in a volume without a sortOrder, they'll display in id
    order, which is usually fine. Only set this if you need a
    specific reading order.

  title
    The document's display title. Required.

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
    e.g. ["DOC-005", "DOC-006"]. These become clickable links
    automatically. If you reference a document id that doesn't exist,
    the site will skip it and print a warning in the browser console
    (during development) rather than showing a broken link.

  sourceUrl
    Optional. A link to the original source file/image, if one is
    hosted somewhere. Leave this out entirely if there isn't one.
*/

export const DOC_TEMPLATE = {
  id: "DOC-XXX",
  volume: "VOL-01",
  sortOrder: null,
  title: "",
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
};
