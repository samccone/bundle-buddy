import * as sourceMap from "source-map";
import * as fs from "fs";
import * as path from "path";
import { buildGraph } from "./graph_builder";
import {
  SourceFiles,
  LineHitMap,
  SourceTrack,
  SourceToBundles,
  LogLevels,
  BundleToSources,
  SourceFileLinesGroupedByCommonBundle,
  PerFileStats,
  SourceFileToGrouped,
  SourceMapProcessorResults
} from "./types";
import {
  Logger,
  hashToFileAndLineNumber,
  sourceMapToLineHits,
  hashBundlesToKey,
  getOriginalFileNameFromSourceName
} from "./utils";

/*
 * Generates a mapping from source files to grouped lines by common bundle use. 
 */
function generateGroupedFileStats(fileStats: PerFileStats) {
  const ret: SourceFileLinesGroupedByCommonBundle = {};

  for (const sourceFileName of fileStats.keys()) {
    if (ret[sourceFileName] === undefined) {
      ret[sourceFileName] = {};
    }

    for (const lineNumber of Object.keys(fileStats.get(sourceFileName))) {
      const lineNumberInt = parseInt(lineNumber, 10);
      const lineInfo = fileStats.get(sourceFileName)![lineNumberInt];

      if (
        ret[sourceFileName][hashBundlesToKey(lineInfo.inBundles)] === undefined
      ) {
        ret[sourceFileName][hashBundlesToKey(lineInfo.inBundles)] = {
          lines: [],
          bundles: lineInfo.inBundles,
          sourceName: sourceFileName
        };
      }

      ret[sourceFileName][hashBundlesToKey(lineInfo.inBundles)].lines.push(
        lineNumberInt
      );
    }
  }

  return ret;
}

function doBundlesHaveDuplication(bundleToSources: BundleToSources) {
  for (let bundle of bundleToSources.values()) {
    for (let sourceFileName of Object.keys(bundle)) {
      if (bundle[sourceFileName].inBundleCount > 1) {
        return true;
      }
    }
  }

  return false;
}

function extractHitInto(sourceFiles: SourceFiles, sourcePath: string) {
  const map = fs.readFileSync(path.resolve(sourcePath), "utf-8");
  const sourceMapConsumer = new sourceMap.SourceMapConsumer(map);
  sourceMapConsumer.computeColumnSpans();

  const usedSourceInfo = new Map<string, SourceTrack>();

  sourceMapConsumer.eachMapping(info => {
    // sometimes source is null, which is strange... skip it for now.
    if (info.source === null) {
      return;
    }

    const realFilePath = getOriginalFileNameFromSourceName(
      info.source,
      sourceMapConsumer
    );

    // If this is the first time we are seeing the file, setup the tracking object.
    if (!usedSourceInfo.has(realFilePath)) {
      const sourceLines = sourceMapConsumer
        .sourceContentFor(info.source)
        .split("\n");
      sourceFiles[realFilePath] = {
        sourceLines: sourceLines.length,
        source: sourceLines
      };

      usedSourceInfo.set(realFilePath, {
        sourceName: realFilePath,
        inUse: {}
      });
    }

    const prev = usedSourceInfo.get(realFilePath)!.inUse[info.originalLine] || {
      line: info.originalLine,
      columns: {},
      lineHits: 1
    };

    if (prev.columns[info.originalColumn] === undefined) {
      prev.columns[info.originalColumn] = [];
    }

    prev.columns[info.originalColumn].push({
      generatedColumn: info.generatedColumn,
      generatedLine: info.generatedLine
    });
    usedSourceInfo.get(realFilePath)!.inUse[info.originalLine] = prev;
  });

  return usedSourceInfo;
}

export function processSourceMaps(
  bundleSourceMaps: string[],
  opts: { logLevel: LogLevels } = { logLevel: "silent" }
): SourceMapProcessorResults {
  opts.logLevel = opts.logLevel || "silent";

  const logger = new Logger(opts);

  // Mapping from Source Files to Bundle files
  const sourceToBundles: SourceToBundles = {};
  const lineHitMap: LineHitMap = new Map();
  const sourceFiles: SourceFiles = {};
  const bundleToSources: BundleToSources = new Map();

  const perFileStats: PerFileStats = new Map();
  const sourceFileToGrouped: SourceFileToGrouped = new Map();

  if (bundleSourceMaps.length === 0) {
    logger.error("Fatal Error: no source maps passed :(");
    process.exit(1);
  }

  // Calculate a source line to bundle mapping hash
  for (const sourceMap of bundleSourceMaps) {
    logger.info(`Processing ${sourceMap}`);
    let hitInfo: Map<string, SourceTrack>;

    try {
      hitInfo = extractHitInto(sourceFiles, sourceMap);
    } catch (e) {
      logger.error(`Error processing ${sourceMap}, ${e}`);
      continue;
    }

    const bundleHits = sourceMapToLineHits(hitInfo);

    for (let hit of bundleHits) {
      if (lineHitMap.get(hit) === undefined) {
        lineHitMap.set(hit, {
          from: [],
          count: 0
        });
      }

      lineHitMap.get(hit)!.from.push(path.basename(sourceMap));
      lineHitMap.get(hit)!.count++;
    }
  }

  for (const lineHash of lineHitMap.keys()) {
    const match = lineHitMap.get(lineHash)!;
    const details = hashToFileAndLineNumber(lineHash);

    if (!perFileStats.has(details.fileName)) {
      perFileStats.set(details.fileName, {});
    }

    if (!sourceFileToGrouped.has(details.fileName)) {
      sourceFileToGrouped.set(details.fileName, {});
    }

    for (const bundle of match.from) {
      const bundleStats = bundleToSources.get(bundle);

      if (!bundleStats) {
        bundleToSources.set(bundle, {});
      }

      const bundleFileStats = bundleToSources.get(bundle)![details.fileName];

      if (!bundleFileStats) {
        bundleToSources.get(bundle)![details.fileName] = {
          inBundleCount: Array.from(match.from).length,
          containedInBundles: Array.from(match.from),
          count: 0
        };
      }

      bundleToSources.get(bundle)![details.fileName]!.count++;
    }

    const prevBundleCount = (sourceFileToGrouped.get(details.fileName)![
      hashBundlesToKey(match.from)
    ] || {
      count: 0
    })!.count;

    sourceFileToGrouped.get(details.fileName)![hashBundlesToKey(match.from)] = {
      count: prevBundleCount + 1,
      files: match.from.length
    };

    perFileStats.get(details.fileName)![details.lineNumber] = {
      sourceFile: details.fileName,
      sourceLine: details.lineNumber,
      inBundles: Array.from(match.from)
    };

    if (!sourceToBundles[details.fileName]) {
      sourceToBundles[details.fileName] = new Set(Array.from(match.from));
    } else {
      sourceToBundles[details.fileName] = new Set(
        Array.from(match.from).concat(
          Array.from(sourceToBundles[details.fileName])
        )
      );
    }
  }

  if (Array.from(lineHitMap.keys()).length === 0) {
    logger.error("No bundle source maps were processed.");
    process.exit(1);
  }

  if (!doBundlesHaveDuplication(bundleToSources)) {
    logger.success("No bundle duplication detected 📯.");
    process.exit(1);
  }

  return {
    graph: buildGraph(
      sourceFileToGrouped,
      bundleToSources,
      sourceToBundles,
      logger
    ),
    sourceFiles,
    perFileStats,
    sourceFileLinesGroupedByCommonBundle: generateGroupedFileStats(
      perFileStats
    ),
    // Bundle to source file line use
    bundleFileStats: bundleToSources,
    outputFiles: bundleSourceMaps.map(f => path.basename(f)),
    groupedBundleStats: sourceFileToGrouped
  };
}
