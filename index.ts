import { processSourceMaps } from "./process";
import { launchServer, launchServerStandalone } from "./server";
import { makeStandaloneFile } from "./standalone";
import {
  formatProcessedSourceMaps,
  getWritePathForSerializedData,
  VIZ_PATH,
  STANDALONE_PATH
} from "./utils";
import * as meow from "meow";
import * as globby from "globby";
import * as fs from "fs-extra";
import * as path from "path";

const cli = meow(
  `
  Usage:
    bundle-buddy  <source_map_glob>

  Options:
    --verbose -v: Write verbose logging to stderr
    --stdout -o: Write analysis to stdout
    --demo: View a demo bundle

  Example:
    bundle-buddy my_app/dist/*.map
`,
  {
    alias: {
      o: "stdout",
      v: "verbose"
    },
    boolean: ["stdout", "verbose", "demo", "standalone-bundle"]
  }
);

if (cli.input.length === 0 && !cli.flags["demo"]) {
  cli.showHelp();
  process.exit(2);
}

if (cli.flags["demo"]) {
  launchServer("demo.json");
} else {
  const bundleSourceMaps = globby.sync(cli.input);

  const processed = processSourceMaps(bundleSourceMaps, {
    logLevel: cli.flags["verbose"] || cli.flags["v"] ? "verbose" : "silent"
  });
  const stringifedData = formatProcessedSourceMaps(processed);

  if (cli.flags["stdout"] || cli.flags["o"]) {
    console.log(stringifedData);
  } else if (cli.flags["standaloneBundle"]) {
    // Clear previous standalone folder and create new folder from current build
    const standaloneFolder = path.join(__dirname, STANDALONE_PATH);
    const buildFolder = path.join(__dirname, VIZ_PATH);
    fs.removeSync(standaloneFolder);
    fs.copySync(buildFolder, standaloneFolder);
    // Inject graph data into the standaloneFolder
    makeStandaloneFile(stringifedData);
    // Launch server using the standaloneFolder
    launchServerStandalone();
  } else {
    const dataPath = `data_${Date.now()}`;
    const writePath = getWritePathForSerializedData(dataPath);

    fs.writeFileSync(writePath, stringifedData);

    launchServer(dataPath);
  }
}
