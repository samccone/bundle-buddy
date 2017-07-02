import * as sourceMap from "source-map";
import * as fs from "fs";
import * as path from "path";
import { buildGraph } from "./graph_builder";
import {
  SourceFiles,
  LineHitMap,
  SourceTrack,
  FileDetail,
  SourceToBundles
} from "./types";
import {
  hashToFileAndLineNumber,
  sourceMapToLineHits,
  hashBundlesToKey,
  getOriginalFileNameFromSourceName
} from "./utils";

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
      const sourceLines = sourceMapConsumer.sourceContentFor(info.source).split("\n"); 
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

export function processSourceMaps(outputFiles: string[]) {
  // Mapping from Source Files to Bundle files
  const sourceToBundles: SourceToBundles = {};
  const lineHitMap: LineHitMap = new Map();
  const sourceFiles: SourceFiles = {};
  const bundleToSources = new Map<
    string,
    {
      [srcFile: string]: {
        inBundleCount: number;
        containedInBundles: string[];
        count: number;
      };
    }
  >();
  const sourceFileGroups = new Map<string, { [key: number]: FileDetail }>();
  const sourceFileToGrouped = new Map<
    string,
    { [key: string]: { count: number; files: number } }
  >();

  // Calculate a source line to bundle mapping hash
  for (const sourceMap of outputFiles) {
    const hitInfo = extractHitInto(sourceFiles, sourceMap);
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

    if (!sourceFileGroups.has(details.fileName)) {
      sourceFileGroups.set(details.fileName, {});
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

    sourceFileGroups.get(details.fileName)![details.lineNumber] = {
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

  return {
    graph: buildGraph(sourceFileToGrouped, bundleToSources, sourceToBundles),
    sourceFiles,
    // Bundle  to source file line use
    bundleFileStats: bundleToSources,
    outputFiles: outputFiles.map(f => path.basename(f)),
    groupedBundleStats: sourceFileToGrouped,
    stats: sourceFileGroups
  };
}
