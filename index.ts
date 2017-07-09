const httpServer = require("http-server");
const openPort = require("openport");
import { processSourceMaps } from "./process";
import * as path from "path";
import * as meow from "meow";
import * as opn from "opn";
import * as fs from "fs";

const VIZ_PATH = "viz/build";

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

const stringifedData = JSON.stringify({
  graph: processed.graph,
  sourceFiles: processed.sourceFiles,
  bundleFileStats: [...processed.bundleFileStats],
  outputFiles: processed.outputFiles,
  groupedBundleStats: [...processed.groupedBundleStats],
  perFileStats: [...processed.perFileStats],
  sourceFileLinesGroupedByCommonBundle:
    processed.sourceFileLinesGroupedByCommonBundle
});

if (cli.flags["stdout"] || cli.flags["o"]) {
  console.log(stringifedData);
} else {
  const dataPath = `data_${Date.now()}`;
  fs.writeFileSync(path.join(__dirname, VIZ_PATH, dataPath), stringifedData);

  openPort.find((err: Error, port: number) => {
    if (err != null) {
      console.log(err);
      process.exit(1);
    }
    httpServer
      .createServer({
        root: path.join(__dirname, VIZ_PATH)
      })
      .listen(port, "0.0.0.0", () => {
        console.log(`Server running on port ${port}`);
        console.log(`Press Control+C to Quit`);
        opn(`http://localhost:${port}?file=${dataPath}`);
      });
  });
}
