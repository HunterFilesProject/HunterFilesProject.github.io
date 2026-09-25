/*
  content/volumes/volume-01.js
  -----------------------------
  A Volume defines a grouping of documents. Which documents belong to
  it is NOT listed here — each document declares its own `volume: "VOL-01"`
  field (see content/documents/). Adding a document to this volume is
  done from the document's own file, not from here.
*/

export const VOL_01 = {
  id: "VOL-01",
  number: 1,
  title: "Volume I",
  description: "Released February 2026",
};
