import { processSourceMaps } from "./process";
import { launchServer } from "./server";
import {
  formatProcessedSourceMaps,
  getWritePathForSerializedData,
  VIZ_PATH
} from "./utils";
import * as meow from "meow";
import * as fs from "fs";

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
    boolean: ["stdout", "verbose", "demo"]
  }
);

if (cli.input.length === 0 && !cli.flags["demo"]) {
  cli.showHelp();
  process.exit(2);
}

if (cli.flags["demo"]) {
  launchServer("demo.json", VIZ_PATH);
} else {
  const processed = processSourceMaps(cli.input, {
    logLevel: cli.flags["verbose"] || cli.flags["v"] ? "verbose" : "silent"
  });

  const stringifedData = formatProcessedSourceMaps(processed);

  if (cli.flags["stdout"] || cli.flags["o"]) {
    console.log(stringifedData);
  } else {
    const dataPath = `data_${Date.now()}`;
    const writePath = getWritePathForSerializedData(dataPath);

    fs.writeFileSync(writePath, stringifedData);

    launchServer(dataPath, VIZ_PATH);
  }
}
