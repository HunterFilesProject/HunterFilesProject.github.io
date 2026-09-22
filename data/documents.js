/*
  data/documents.js
  -----------------
  The master list of documents. To add a new document:
    1. Copy content/documents/_TEMPLATE.js to content/documents/<id>.js
       and fill it in.
    2. Import it below.
    3. Add it to the DOCUMENTS array below.
  That's it — search, navigation, volume pages, and person backlinks
  are all generated automatically from this array. See
  CONTENT_GUIDE.md for the full walkthrough.

  New documents are usually added at the end of the array — the home
  page's "Recently added" list shows the last few entries here.

  ID SCHEME NOTE: ids are formatted "HF<volume number>#<4-digit
  number>", e.g. "HF1#0001" (volume 1), "HF2#0001" (volume 2). The
  filenames and JS export names swap the "#" for a "-" or "_" since a
  literal "#" in a filename would break the browser's ES module
  import resolution (it would be read as a URL fragment). The "id"
  field value itself keeps the real "#" — that's safe because the
  site only ever reads/writes it through URLSearchParams.

  FOLDER NOTE: volume 1's documents sit flat in content/documents/.
  Volume 2 documents live under content/documents/volume-2/, further
  split into content/documents/volume-2/dataset-NN/ sub-folders that
  mirror the project's own dataset groupings (see data/datasets.js
  and each document's own `dataset` field). This nesting is purely
  for human browsing on disk — the site itself only cares about the
  path given in the import statement below, not where a file lives.
*/

import { HF1_0001 } from "../content/documents/HF1-0001.js";
import { HF1_0002 } from "../content/documents/HF1-0002.js";
import { HF1_0003 } from "../content/documents/HF1-0003.js";
import { HF1_0004 } from "../content/documents/HF1-0004.js";
import { HF1_0005 } from "../content/documents/HF1-0005.js";
import { HF1_0006 } from "../content/documents/HF1-0006.js";
import { HF1_0007 } from "../content/documents/HF1-0007.js";
import { HF1_0008 } from "../content/documents/HF1-0008.js";
import { HF1_0009 } from "../content/documents/HF1-0009.js";
import { HF1_0010 } from "../content/documents/HF1-0010.js";
import { HF1_0011 } from "../content/documents/HF1-0011.js";
import { HF1_0012 } from "../content/documents/HF1-0012.js";
import { HF1_0013 } from "../content/documents/HF1-0013.js";
import { HF1_0014 } from "../content/documents/HF1-0014.js";
import { HF1_0015 } from "../content/documents/HF1-0015.js";
import { HF1_0016 } from "../content/documents/HF1-0016.js";
import { HF1_0017 } from "../content/documents/HF1-0017.js";
import { HF1_0018 } from "../content/documents/HF1-0018.js";
import { HF1_0019 } from "../content/documents/HF1-0019.js";
import { HF1_0020 } from "../content/documents/HF1-0020.js";
import { HF1_0021 } from "../content/documents/HF1-0021.js";
import { HF1_0023 } from "../content/documents/HF1-0023.js";
import { HF1_0024 } from "../content/documents/HF1-0024.js";
import { HF1_0025 } from "../content/documents/HF1-0025.js";
import { HF1_0026 } from "../content/documents/HF1-0026.js";
import { HF1_0027 } from "../content/documents/HF1-0027.js";
import { HF1_0028 } from "../content/documents/HF1-0028.js";
import { HF1_0029 } from "../content/documents/HF1-0029.js";
import { HF1_0030 } from "../content/documents/HF1-0030.js";
import { HF1_0031 } from "../content/documents/HF1-0031.js";
import { HF1_0032 } from "../content/documents/HF1-0032.js";
import { HF1_0033 } from "../content/documents/HF1-0033.js";
import { HF1_0034 } from "../content/documents/HF1-0034.js";
import { HF1_0035 } from "../content/documents/HF1-0035.js";
import { HF1_0036 } from "../content/documents/HF1-0036.js";
import { HF1_0037 } from "../content/documents/HF1-0037.js";
import { HF1_0038 } from "../content/documents/HF1-0038.js";
import { HF1_0039 } from "../content/documents/HF1-0039.js";
import { HF1_0040 } from "../content/documents/HF1-0040.js";
import { HF1_0041 } from "../content/documents/HF1-0041.js";
import { HF1_0042 } from "../content/documents/HF1-0042.js";
import { HF1_0043 } from "../content/documents/HF1-0043.js";
import { HF1_0044 } from "../content/documents/HF1-0044.js";
import { HF1_0045 } from "../content/documents/HF1-0045.js";
import { HF1_0046 } from "../content/documents/HF1-0046.js";
import { HF1_0047 } from "../content/documents/HF1-0047.js";
import { HF1_0048 } from "../content/documents/HF1-0048.js";
import { HF1_0049 } from "../content/documents/HF1-0049.js";
import { HF1_0050 } from "../content/documents/HF1-0050.js";
import { HF1_0051 } from "../content/documents/HF1-0051.js";
import { HF1_0052 } from "../content/documents/HF1-0052.js";
import { HF1_0053 } from "../content/documents/HF1-0053.js";
import { HF1_0054 } from "../content/documents/HF1-0054.js";
import { HF1_0055 } from "../content/documents/HF1-0055.js";
import { HF1_0056 } from "../content/documents/HF1-0056.js";
import { HF1_0057 } from "../content/documents/HF1-0057.js";
import { HF1_0058 } from "../content/documents/HF1-0058.js";
import { HF1_0059 } from "../content/documents/HF1-0059.js";
import { HF1_0060 } from "../content/documents/HF1-0060.js";
import { HF1_0061 } from "../content/documents/HF1-0061.js";
import { HF1_0062 } from "../content/documents/HF1-0062.js";
import { HF1_0063 } from "../content/documents/HF1-0063.js";
import { HF1_0064 } from "../content/documents/HF1-0064.js";
import { HF1_0065 } from "../content/documents/HF1-0065.js";
import { HF1_0066 } from "../content/documents/HF1-0066.js";
import { HF1_0067 } from "../content/documents/HF1-0067.js";
import { HF1_0068 } from "../content/documents/HF1-0068.js";
import { HF1_0069 } from "../content/documents/HF1-0069.js";
import { HF1_0070 } from "../content/documents/HF1-0070.js";
import { HF1_0071 } from "../content/documents/HF1-0071.js";
import { HF1_0072 } from "../content/documents/HF1-0072.js";
import { HF1_0073 } from "../content/documents/HF1-0073.js";
import { HF1_0074 } from "../content/documents/HF1-0074.js";
import { HF1_0075 } from "../content/documents/HF1-0075.js";
import { HF1_0076 } from "../content/documents/HF1-0076.js";
import { HF2_0001 } from "../content/documents/volume-2/HF2-0001.js";
import { HF2_0002 } from "../content/documents/volume-2/dataset-02/HF2-0002.js";
import { HF2_0004 } from "../content/documents/volume-2/dataset-02/HF2-0004.js";
import { HF2_0005 } from "../content/documents/volume-2/dataset-02/HF2-0005.js";
import { HF2_0007 } from "../content/documents/volume-2/dataset-02/HF2-0007.js";
import { HF2_0008 } from "../content/documents/volume-2/dataset-02/HF2-0008.js";
import { HF2_0009 } from "../content/documents/volume-2/dataset-02/HF2-0009.js";
import { HF2_0010 } from "../content/documents/volume-2/dataset-02/HF2-0010.js";
import { HF2_0011 } from "../content/documents/volume-2/dataset-02/HF2-0011.js";
import { HF2_0013 } from "../content/documents/volume-2/dataset-03/HF2-0013.js";
import { HF2_0014 } from "../content/documents/volume-2/dataset-03/HF2-0014.js";
import { HF2_0015 } from "../content/documents/volume-2/dataset-03/HF2-0015.js";
import { HF2_0003 } from "../content/documents/volume-2/dataset-04/HF2-0003.js";
import { HF2_0016 } from "../content/documents/volume-2/dataset-04/HF2-0016.js";
import { HF2_0017 } from "../content/documents/volume-2/dataset-04/HF2-0017.js";
import { HF2_0019 } from "../content/documents/volume-2/dataset-04/HF2-0019.js";
import { HF2_0020 } from "../content/documents/volume-2/dataset-04/HF2-0020.js";
import { HF2_0021 } from "../content/documents/volume-2/dataset-04/HF2-0021.js";
import { HF2_0022 } from "../content/documents/volume-2/dataset-04/HF2-0022.js";
import { HF2_0023 } from "../content/documents/volume-2/dataset-04/HF2-0023.js";
import { HF2_0024 } from "../content/documents/volume-2/dataset-04/HF2-0024.js";
import { HF2_0025 } from "../content/documents/volume-2/dataset-04/HF2-0025.js";
import { HF2_0026 } from "../content/documents/volume-2/dataset-04/HF2-0026.js";
import { HF2_0027 } from "../content/documents/volume-2/dataset-04/HF2-0027.js";
import { HF2_0028 } from "../content/documents/volume-2/dataset-04/HF2-0028.js";
import { HF2_0029 } from "../content/documents/volume-2/dataset-04/HF2-0029.js";
import { HF2_0030 } from "../content/documents/volume-2/dataset-05/HF2-0030.js";
import { HF2_0031 } from "../content/documents/volume-2/dataset-05/HF2-0031.js";
import { HF2_0032 } from "../content/documents/volume-2/dataset-05/HF2-0032.js";
import { HF2_0033 } from "../content/documents/volume-2/dataset-05/HF2-0033.js";
import { HF2_0034 } from "../content/documents/volume-2/dataset-05/HF2-0034.js";
import { HF2_0035 } from "../content/documents/volume-2/dataset-05/HF2-0035.js";
import { HF2_0036 } from "../content/documents/volume-2/dataset-05/HF2-0036.js";
import { HF2_0037 } from "../content/documents/volume-2/dataset-05/HF2-0037.js";
import { HF2_0038 } from "../content/documents/volume-2/dataset-05/HF2-0038.js";
import { HF2_0039 } from "../content/documents/volume-2/dataset-05/HF2-0039.js";
import { HF2_0040 } from "../content/documents/volume-2/dataset-06/HF2-0040.js";
import { HF2_0041 } from "../content/documents/volume-2/dataset-06/HF2-0041.js";
import { HF2_0042 } from "../content/documents/volume-2/dataset-06/HF2-0042.js";
import { HF2_0043 } from "../content/documents/volume-2/dataset-06/HF2-0043.js";
import { HF2_0044 } from "../content/documents/volume-2/dataset-06/HF2-0044.js";
import { HF2_0045 } from "../content/documents/volume-2/dataset-07/HF2-0045.js";
import { HF2_0046 } from "../content/documents/volume-2/dataset-07/HF2-0046.js";
import { HF2_0047 } from "../content/documents/volume-2/dataset-07/HF2-0047.js";
import { HF2_0048 } from "../content/documents/volume-2/dataset-07/HF2-0048.js";
import { HF2_0049 } from "../content/documents/volume-2/dataset-07/HF2-0049.js";
import { HF2_0050 } from "../content/documents/volume-2/dataset-07/HF2-0050.js";
import { HF2_0051 } from "../content/documents/volume-2/dataset-07/HF2-0051.js";
import { HF2_0052 } from "../content/documents/volume-2/dataset-07/HF2-0052.js";
import { HF2_0053 } from "../content/documents/volume-2/dataset-07/HF2-0053.js";
import { HF2_0054 } from "../content/documents/volume-2/dataset-07/HF2-0054.js";
import { HF2_0055 } from "../content/documents/volume-2/dataset-07/HF2-0055.js";
import { HF2_0056 } from "../content/documents/volume-2/dataset-07/HF2-0056.js";
import { HF2_0099 } from "../content/documents/volume-2/dataset-07/HF2-0099.js";
import { HF2_0057 } from "../content/documents/volume-2/dataset-08/HF2-0057.js";
import { HF2_0058 } from "../content/documents/volume-2/dataset-08/HF2-0058.js";
import { HF2_0059 } from "../content/documents/volume-2/dataset-08/HF2-0059.js";
import { HF2_0060 } from "../content/documents/volume-2/dataset-08/HF2-0060.js";
import { HF2_0061 } from "../content/documents/volume-2/dataset-08/HF2-0061.js";
import { HF2_0062 } from "../content/documents/volume-2/dataset-08/HF2-0062.js";
import { HF2_0063 } from "../content/documents/volume-2/dataset-08/HF2-0063.js";
import { HF2_0064 } from "../content/documents/volume-2/dataset-08/HF2-0064.js";
import { HF2_0065 } from "../content/documents/volume-2/dataset-08/HF2-0065.js";
import { HF2_0066 } from "../content/documents/volume-2/dataset-08/HF2-0066.js";
import { HF2_0067 } from "../content/documents/volume-2/dataset-09/HF2-0067.js";
import { HF2_0068 } from "../content/documents/volume-2/dataset-09/HF2-0068.js";
import { HF2_0069 } from "../content/documents/volume-2/dataset-09/HF2-0069.js";
import { HF2_0070 } from "../content/documents/volume-2/dataset-09/HF2-0070.js";
import { HF2_0071 } from "../content/documents/volume-2/dataset-09/HF2-0071.js";
import { HF2_0072 } from "../content/documents/volume-2/dataset-09/HF2-0072.js";
import { HF2_0073 } from "../content/documents/volume-2/dataset-09/HF2-0073.js";
import { HF2_0012 } from "../content/documents/volume-2/dataset-10/HF2-0012.js";
import { HF2_0018 } from "../content/documents/volume-2/dataset-10/HF2-0018.js";
import { HF2_0074 } from "../content/documents/volume-2/dataset-10/HF2-0074.js";
import { HF2_0075 } from "../content/documents/volume-2/dataset-10/HF2-0075.js";
import { HF2_0076 } from "../content/documents/volume-2/dataset-10/HF2-0076.js";
import { HF2_0006 } from "../content/documents/volume-2/dataset-11/HF2-0006.js";
import { HF2_0077 } from "../content/documents/volume-2/dataset-11/HF2-0077.js";
import { HF2_0078 } from "../content/documents/volume-2/dataset-11/HF2-0078.js";
import { HF2_0079 } from "../content/documents/volume-2/dataset-12/HF2-0079.js";
import { HF2_0080 } from "../content/documents/volume-2/dataset-12/HF2-0080.js";
import { HF2_0085 } from "../content/documents/volume-2/dataset-12/HF2-0085.js";
import { HF2_0086 } from "../content/documents/volume-2/dataset-12/HF2-0086.js";
import { HF2_0087 } from "../content/documents/volume-2/dataset-12/HF2-0087.js";
import { HF2_0088 } from "../content/documents/volume-2/dataset-12/HF2-0088.js";
import { HF2_0089 } from "../content/documents/volume-2/dataset-12/HF2-0089.js";
import { HF2_0090 } from "../content/documents/volume-2/dataset-12/HF2-0090.js";
import { HF2_0091 } from "../content/documents/volume-2/dataset-12/HF2-0091.js";
import { HF2_0092 } from "../content/documents/volume-2/dataset-12/HF2-0092.js";
import { HF2_0093 } from "../content/documents/volume-2/dataset-12/HF2-0093.js";
import { HF2_0094 } from "../content/documents/volume-2/dataset-13/HF2-0094.js";
import { HF2_0095 } from "../content/documents/volume-2/dataset-13/HF2-0095.js";
import { HF2_0096 } from "../content/documents/volume-2/dataset-13/HF2-0096.js";
import { HF2_0097 } from "../content/documents/volume-2/dataset-13/HF2-0097.js";
import { HF2_0098 } from "../content/documents/volume-2/dataset-13/HF2-0098.js";
import { HF2_0100 } from "../content/documents/volume-2/dataset-13/HF2-0100.js";
import { HF2_0081 } from "../content/documents/volume-2/dataset-14/HF2-0081.js";
import { HF2_0082 } from "../content/documents/volume-2/dataset-14/HF2-0082.js";
import { HF2_0083 } from "../content/documents/volume-2/dataset-14/HF2-0083.js";
import { HF2_0084 } from "../content/documents/volume-2/dataset-14/HF2-0084.js";

export const DOCUMENTS = [
  HF1_0001,
  HF1_0002,
  HF1_0003,
  HF1_0004,
  HF1_0005,
  HF1_0006,
  HF1_0007,
  HF1_0008,
  HF1_0009,
  HF1_0010,
  HF1_0011,
  HF1_0012,
  HF1_0013,
  HF1_0014,
  HF1_0015,
  HF1_0016,
  HF1_0017,
  HF1_0018,
  HF1_0019,
  HF1_0020,
  HF1_0021,
  HF1_0023,
  HF1_0024,
  HF1_0025,
  HF1_0026,
  HF1_0027,
  HF1_0028,
  HF1_0029,
  HF1_0030,
  HF1_0031,
  HF1_0032,
  HF1_0033,
  HF1_0034,
  HF1_0035,
  HF1_0036,
  HF1_0037,
  HF1_0038,
  HF1_0039,
  HF1_0040,
  HF1_0041,
  HF1_0042,
  HF1_0043,
  HF1_0044,
  HF1_0045,
  HF1_0046,
  HF1_0047,
  HF1_0048,
  HF1_0049,
  HF1_0050,
  HF1_0051,
  HF1_0052,
  HF1_0053,
  HF1_0054,
  HF1_0055,
  HF1_0056,
  HF1_0057,
  HF1_0058,
  HF1_0059,
  HF1_0060,
  HF1_0061,
  HF1_0062,
  HF1_0063,
  HF1_0064,
  HF1_0065,
  HF1_0066,
  HF1_0067,
  HF1_0068,
  HF1_0069,
  HF1_0070,
  HF1_0071,
  HF1_0072,
  HF1_0073,
  HF1_0074,
  HF1_0075,
  HF1_0076,
  HF2_0001,
  HF2_0002,
  HF2_0004,
  HF2_0005,
  HF2_0007,
  HF2_0008,
  HF2_0009,
  HF2_0010,
  HF2_0011,
  HF2_0013,
  HF2_0014,
  HF2_0015,
  HF2_0003,
  HF2_0016,
  HF2_0017,
  HF2_0019,
  HF2_0020,
  HF2_0021,
  HF2_0022,
  HF2_0023,
  HF2_0024,
  HF2_0025,
  HF2_0026,
  HF2_0027,
  HF2_0028,
  HF2_0029,
  HF2_0030,
  HF2_0031,
  HF2_0032,
  HF2_0033,
  HF2_0034,
  HF2_0035,
  HF2_0036,
  HF2_0037,
  HF2_0038,
  HF2_0039,
  HF2_0040,
  HF2_0041,
  HF2_0042,
  HF2_0043,
  HF2_0044,
  HF2_0045,
  HF2_0046,
  HF2_0047,
  HF2_0048,
  HF2_0049,
  HF2_0050,
  HF2_0051,
  HF2_0052,
  HF2_0053,
  HF2_0054,
  HF2_0055,
  HF2_0056,
  HF2_0099,
  HF2_0057,
  HF2_0058,
  HF2_0059,
  HF2_0060,
  HF2_0061,
  HF2_0062,
  HF2_0063,
  HF2_0064,
  HF2_0065,
  HF2_0066,
  HF2_0067,
  HF2_0068,
  HF2_0069,
  HF2_0070,
  HF2_0071,
  HF2_0072,
  HF2_0073,
  HF2_0012,
  HF2_0018,
  HF2_0074,
  HF2_0075,
  HF2_0076,
  HF2_0006,
  HF2_0077,
  HF2_0078,
  HF2_0079,
  HF2_0080,
  HF2_0085,
  HF2_0086,
  HF2_0087,
  HF2_0088,
  HF2_0089,
  HF2_0090,
  HF2_0091,
  HF2_0092,
  HF2_0093,
  HF2_0094,
  HF2_0095,
  HF2_0096,
  HF2_0097,
  HF2_0098,
  HF2_0100,
  HF2_0081,
  HF2_0082,
  HF2_0083,
  HF2_0084,
];
