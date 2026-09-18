/*
  validate.js
  -----------
  Sanity-checks the content dataset and prints results to the browser
  console. Runs only when CONFIG.developmentMode is true (see app.js).
  Never blocks the site from loading — a mistake in one document
  should never take down the whole archive.
*/

import { DOCUMENTS } from "../data/documents.js";
import { VOLUMES } from "../data/volumes.js";
import { PEOPLE } from "../data/people.js";

function isMalformedDate(dateStr) {
  if (!dateStr) return false;
  return !/^\d{4}(-\d{2}(-\d{2})?)?$/.test(dateStr.trim());
}

/** Very light "did you maybe create a duplicate person" check:
 *  flags names that are identical once punctuation/spacing/case
 *  differences are ignored, e.g. "Jane Doe #3" vs "Jane Doe#3". */
function normalizeForSimilarity(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function runValidation() {
  const warnings = [];
  const errors = [];

  const volumeIds = new Set(VOLUMES.map((v) => v.id));
  const personIds = new Set(PEOPLE.map((p) => p.id));
  const documentIds = new Set(DOCUMENTS.map((d) => d.id));

  // Duplicate document IDs
  const seenDocIds = new Map();
  for (const d of DOCUMENTS) {
    seenDocIds.set(d.id, (seenDocIds.get(d.id) || 0) + 1);
  }
  for (const [id, count] of seenDocIds) {
    if (count > 1) errors.push(`Duplicate document ID "${id}" appears ${count} times.`);
  }

  // Duplicate person IDs
  const seenPersonIds = new Map();
  for (const p of PEOPLE) {
    seenPersonIds.set(p.id, (seenPersonIds.get(p.id) || 0) + 1);
  }
  for (const [id, count] of seenPersonIds) {
    if (count > 1) errors.push(`Duplicate person ID "${id}" appears ${count} times.`);
  }

  // Near-duplicate person names (possible accidental duplicate entries)
  const bySimilarity = new Map();
  for (const p of PEOPLE) {
    const key = normalizeForSimilarity(p.name);
    if (!bySimilarity.has(key)) bySimilarity.set(key, []);
    bySimilarity.get(key).push(p);
  }
  for (const group of bySimilarity.values()) {
    if (group.length > 1) {
      warnings.push(`People entries look like the same person: ${group.map((p) => `${p.name} (${p.id})`).join(", ")}.`);
    }
  }

  for (const d of DOCUMENTS) {
    if (!d.id) errors.push(`A document is missing an "id" field.`);
    if (!d.title || !d.title.trim()) errors.push(`Document "${d.id || "?"}" has an empty title.`);
    if (!d.volume) errors.push(`Document "${d.id}" is missing a "volume" field.`);
    else if (!volumeIds.has(d.volume)) warnings.push(`Document "${d.id}" references missing volume "${d.volume}".`);

    if (isMalformedDate(d.date)) warnings.push(`Document "${d.id}" has a malformed date: "${d.date}". Expected YYYY-MM-DD, YYYY-MM, or YYYY.`);

    for (const pid of d.people || []) {
      if (!personIds.has(pid)) warnings.push(`Document "${d.id}" references missing person "${pid}".`);
    }

    for (const rid of d.relatedDocuments || []) {
      if (!documentIds.has(rid)) warnings.push(`Document "${d.id}" references missing document "${rid}".`);
    }

    const keywords = d.keywords || [];
    const seenKeywords = new Set();
    for (const kw of keywords) {
      const norm = kw.trim().toLowerCase();
      if (seenKeywords.has(norm)) warnings.push(`Document "${d.id}" has a duplicate keyword: "${kw}".`);
      seenKeywords.add(norm);
    }
  }

  for (const v of VOLUMES) {
    if (!v.id) errors.push(`A volume is missing an "id" field.`);
    if (!v.title || !v.title.trim()) errors.push(`Volume "${v.id || "?"}" has an empty title.`);
  }

  // ---- Print results ----
  console.groupCollapsed(
    `%cARCHIVE VALIDATION%c — ${DOCUMENTS.length} documents, ${VOLUMES.length} volumes, ${PEOPLE.length} people`,
    "font-weight: bold;",
    "font-weight: normal;"
  );

  if (errors.length === 0 && warnings.length === 0) {
    console.log("%c✓ No issues found.", "color: #2e7d32;");
  }
  if (warnings.length) {
    console.groupCollapsed(`⚠ ${warnings.length} warning${warnings.length === 1 ? "" : "s"}`);
    warnings.forEach((w) => console.warn(w));
    console.groupEnd();
  }
  if (errors.length) {
    console.groupCollapsed(`✗ ${errors.length} error${errors.length === 1 ? "" : "s"}`);
    errors.forEach((e) => console.error(e));
    console.groupEnd();
  }
  console.groupEnd();

  return { warnings, errors };
}
