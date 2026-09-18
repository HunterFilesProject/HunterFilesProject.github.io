/*
  data/volumes.js
  ---------------
  The master list of volumes. To add a new volume:
    1. Create content/volumes/volume-0N.js (copy an existing one).
    2. Import it below.
    3. Add it to the VOLUMES array below.
  That's it — every page that lists volumes reads from this array.
*/

import { VOL_01 } from "../content/volumes/volume-01.js";
import { VOL_02 } from "../content/volumes/volume-02.js";
import { VOL_03 } from "../content/volumes/volume-03.js";

export const VOLUMES = [
  VOL_01,
  VOL_02,
  VOL_03,
];
