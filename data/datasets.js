/*
  data/datasets.js
  -----------------
  The master list of datasets. A dataset is an optional sub-grouping
  of documents WITHIN one volume (so far only volume 2 uses them).
  To add a new dataset:
    1. Create content/datasets/dataset-NN.js (copy an existing one).
    2. Import it below.
    3. Add it to the DATASETS array below.
  A document joins a dataset the same way it joins a volume: by
  setting its own `dataset: "DS-NN"` field. Not every document has
  one — leave it `null` for documents that stand alone within their
  volume.
*/

import { DS_02 } from "../content/datasets/dataset-02.js";
import { DS_03 } from "../content/datasets/dataset-03.js";
import { DS_04 } from "../content/datasets/dataset-04.js";
import { DS_05 } from "../content/datasets/dataset-05.js";
import { DS_06 } from "../content/datasets/dataset-06.js";
import { DS_07 } from "../content/datasets/dataset-07.js";
import { DS_08 } from "../content/datasets/dataset-08.js";
import { DS_09 } from "../content/datasets/dataset-09.js";
import { DS_10 } from "../content/datasets/dataset-10.js";
import { DS_11 } from "../content/datasets/dataset-11.js";
import { DS_12 } from "../content/datasets/dataset-12.js";
import { DS_13 } from "../content/datasets/dataset-13.js";
import { DS_14 } from "../content/datasets/dataset-14.js";

export const DATASETS = [
  DS_02,
  DS_03,
  DS_04,
  DS_05,
  DS_06,
  DS_07,
  DS_08,
  DS_09,
  DS_10,
  DS_11,
  DS_12,
  DS_13,
  DS_14,
];
