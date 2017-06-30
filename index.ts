import * as sourceMap from "source-map";
import * as fs from "fs";
import * as path from "path";
import { buildGraph } from "./graph_builder";

const WEBPACK_MATCHER = /\/\/ WEBPACK FOOTER \/\/\n\/\/\s+(.*)/m;
const HASH_SPLITTER = "||||";

type SourceToBundles = { [source: string]: Set<string> };

interface FileDetail {
  sourceFile: string;
  sourceLine: number;
  inBundles: string[];
}

interface InUseColumns {
  generatedLine: number;
  generatedColumn: number;
}

interface InUseLine {
  line: number;
  columns: {
    [key: number]: InUseColumns[];
  };
  lineHits: number;
}

interface SourceTrack {
  sourceName: string;
  inUse: {
    [key: number]: InUseLine;
  };
}

const sourceToBundles: SourceToBundles = {};

/**
 * Since the sourcemap file name does not always === the real file name
 * we need to do some cleanup work (specifically for webpack).
 */
function getOriginalFileNameFromSourceName(
  sourceName: string,
  sourceMapConsumer: sourceMap.SourceMapConsumer
): string {
  const contents = sourceMapConsumer.sourceContentFor(sourceName);
  // https://twitter.com/samccone/status/878773452169027588
  const match = WEBPACK_MATCHER.exec(contents);
  if (match && match[1]) {
    return match[1];
  }

  return sourceName;
}

function sourceMapToLineHits(hitTracks: Map<string, SourceTrack>) {
  const sourceToLineMapping = new Set<string>();

  for (const fileName of hitTracks.keys()) {
    Object.keys(hitTracks.get(fileName)!.inUse).forEach(lineNumber => {
      sourceToLineMapping.add(hashFileLineNumber(fileName, lineNumber));
    });
  }

  return sourceToLineMapping;
}

function extractHitInto(sourcePath: string) {
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
      sourceFiles[realFilePath] = {
        sourceLines: sourceMapConsumer.sourceContentFor(info.source).split("\n")
          .length
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

function hashFileLineNumber(fileName: string, lineNumber: number | string) {
  return `${fileName}${HASH_SPLITTER}${lineNumber}`;
}

function hashToFileAndLineNumber(hash: string) {
  return {
    fileName: hash.split(HASH_SPLITTER)[0],
    lineNumber: parseInt(hash.split(HASH_SPLITTER)[1], 10)
  };
}

function hashBundlesToKey(files: string[]) {
  return Array.from(files).sort().join(HASH_SPLITTER);
}

const lineHitMap = new Map<
  string,
  {
    from: string[];
    count: number;
  }
>();

const outputFiles = process.argv.slice(2);
const sourceFiles: { [key: string]: { sourceLines: number } } = {};

for (const sourceMap of outputFiles) {
  const hitInfo = extractHitInto(sourceMap);
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

const bundleToSources = new Map<
  string,
  {
    [srcFile: string]: {
      inBundleCount: number;
      count: number;
    };
  }
>();

const sourceFileGroups = new Map<string, { [key: number]: FileDetail }>();
const sourceFileToGrouped = new Map<
  string,
  { [key: string]: { count: number; files: number } }
>();

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
        count: 0
      };
    }

    bundleToSources.get(bundle)![details.fileName]!.count++;
  }

  const prevBundleCount = (sourceFileToGrouped.get(details.fileName)![
    hashBundlesToKey(match.from)
  ] || { count: 0 })!.count;

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

console.log(
  JSON.stringify(
    {
      graph: buildGraph(sourceFileToGrouped, bundleToSources, sourceToBundles),
      sourceFiles,
      // Bundle  to source file line use
      bundleFileStats: [...bundleToSources],
      outputFiles: outputFiles.map(f => path.basename(f)),
      groupedBundleStats: [...sourceFileToGrouped],
      stats: [...sourceFileGroups]
    },
    null,
    2
  )
);
