import { transform } from "../resolve/process";
import { getDirectories } from "../bundle/Bundle";

import edges from "../test-process/edges.json";
import sizes from "../test-process/sizes.json";
import names from "../test-process/names.json";

// Run the real import pipeline over the checked-in sample project, so the
// stories stay in step with the component props instead of drifting from a
// hand-captured snapshot.
export const processed = transform(edges, sizes, names);

export const { directories, directoryColors } = getDirectories(
  processed.rollups,
);
