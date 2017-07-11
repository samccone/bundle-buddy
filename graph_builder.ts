import { Node } from "./types";
import { Logger } from "./utils";

function sumLines(obj: { [key: string]: { count: number } }) {
  return Object.keys(obj).map(k => obj[k]!.count).reduce((p, c) => {
    return p + c;
  }, 0);
}

function buildLinks(
  groupedOutputFiles: Map<
    string,
    {
      [srcFile: string]: {
        inBundleCount: number;
        count: number;
      };
    }
  >,
  logger: Logger
) {
  logger.info("Building graph links between bundles.");
  const ret: { source: string; target: string; strength: number }[] = [];

  for (const bundleName of groupedOutputFiles.keys()) {
    const sourceFiles = Object.keys(groupedOutputFiles.get(bundleName));
    for (const sourcePath of sourceFiles) {
      ret.push({
        source: sourcePath,
        target: bundleName,
        strength: groupedOutputFiles.get(bundleName)![sourcePath]!.count
      });
    }
  }

  return ret;
}

export function buildGraph(
  groupedSourceFiles: Map<
    string,
    { [key: string]: { count: number; files: number } }
  >,
  groupedOutputFiles: Map<
    string,
    {
      [srcFile: string]: {
        inBundleCount: number;
        count: number;
      };
    }
  >,
  sourceToBundles: { [sourceName: string]: Set<string> },
  logger: Logger
) {
  const nodes: Node[] = [];

  logger.info("Building graph between bundles.");

  // build input nodes
  for (const sourceFileName of groupedSourceFiles.keys()) {
    nodes.push({
      id: sourceFileName,
      type: "input",
      size: sumLines(groupedSourceFiles.get(sourceFileName)!),
      inBundleFiles: Array.from(sourceToBundles[sourceFileName]!)
    });
  }

  // build output nodes
  for (const outputFileName of groupedOutputFiles.keys()) {
    nodes.push({
      id: outputFileName,
      type: "output",
      size: sumLines(groupedOutputFiles.get(outputFileName)!)
    });
  }

  return {
    nodes,
    links: buildLinks(groupedOutputFiles, logger)
  };
}
