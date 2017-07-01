import { processSourceMaps } from "./process";

const files = process.argv.slice(2);
const processed = processSourceMaps(files);

console.log(
  JSON.stringify({
    graph: processed.graph,
    sourceFiles: processed.sourceFiles,
    bundleFileStats: [...processed.bundleFileStats],
    outputFiles: processed.outputFiles,
    groupedBundleStats: [...processed.groupedBundleStats],
    stats: [...processed.stats]
  })
);
