import { processSourceMaps } from "./process";
import * as meow from "meow";

const cli = meow(
  `
  Usage:
    bundle-buddy  <source_map_glob>

  Options:
    --verbose -v: Write verbose logging to stderr 
    --stdout -o: Write analysis to stdout
  
  Example:
    bundle-buddy my_app/dist/*.map
`,
  {
    alias: {
      o: "stdout",
      v: "verbose"
    },
    boolean: ["stdout", "verbose"]
  }
);

const processed = processSourceMaps(cli.input, {
  logLevel: cli.flags["verbose"] || cli.flags["v"] ? "verbose" : "silent"
});

if (cli.flags["stdout"] || cli.flags["o"]) {
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
}
