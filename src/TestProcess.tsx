import React from "react";
import { transform } from "./resolve/process";

import edges from "./test-process/edges.json";
import sizes from "./test-process/sizes.json";
import names from "./test-process/names.json";

export default function TestProcess() {
  transform(edges, sizes, names);

  return <div>Test Process Route</div>;
}
