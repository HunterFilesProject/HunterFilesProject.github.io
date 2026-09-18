/*
  data/documents.js
  -----------------
  The master list of documents. To add a new document:
    1. Copy content/documents/_TEMPLATE.js to content/documents/DOC-XXX.js
       and fill it in.
    2. Import it below.
    3. Add it to the DOCUMENTS array below.
  That's it — search, navigation, volume pages, and person backlinks
  are all generated automatically from this array. See
  CONTENT_GUIDE.md for the full walkthrough.

  New documents are usually added at the end of the array — the home
  page's "Recently added" list shows the last few entries here.
*/

import { DOC_001 } from "../content/documents/DOC-001.js";
import { DOC_002 } from "../content/documents/DOC-002.js";
import { DOC_003 } from "../content/documents/DOC-003.js";
import { DOC_004 } from "../content/documents/DOC-004.js";
import { DOC_005 } from "../content/documents/DOC-005.js";
import { DOC_006 } from "../content/documents/DOC-006.js";
import { DOC_007 } from "../content/documents/DOC-007.js";
import { DOC_008 } from "../content/documents/DOC-008.js";
import { DOC_009 } from "../content/documents/DOC-009.js";
import { DOC_010 } from "../content/documents/DOC-010.js";

export const DOCUMENTS = [
  DOC_001,
  DOC_002,
  DOC_003,
  DOC_004,
  DOC_005,
  DOC_006,
  DOC_007,
  DOC_008,
  DOC_009,
  DOC_010,
];
