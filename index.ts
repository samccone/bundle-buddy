import * as sourceMap from "source-map";
import * as fs from "fs";
import * as path from "path";

const WEBPACK_MATCHER = /\/\/ WEBPACK FOOTER \/\/\n\/\/\s+(.*)/gm;
const HASH_SPLITTER = "||||";

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
  sourceContent?: string;
  sourceName: string;
  totalLines: number;
  linesInUse?: number;
  inUse: {
    [key: number]: InUseLine;
  };
}

const getOriginalFilePathMemoizeMap = new Map<string, string>();

/**
 * Since the sourcemap file name does not always === the real file name
 * we need to do some cleanup work (specifically for webpack).
 */
function getOriginalFileNameFromSourceName(
  sourceName: string,
  sourceMapConsumer: sourceMap.SourceMapConsumer
): string {
  if (getOriginalFilePathMemoizeMap.has(sourceName)) {
    return getOriginalFilePathMemoizeMap.get(sourceName)!;
  }

  const contents = sourceMapConsumer.sourceContentFor(sourceName);
  // https://twitter.com/samccone/status/878773452169027588
  const match = WEBPACK_MATCHER.exec(contents);
  let ret = "";

  if (match) {
    ret = match[1];
  }

  ret = sourceName;

  getOriginalFilePathMemoizeMap.set(sourceName, ret);
  return ret;
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
    const realFilePath = getOriginalFileNameFromSourceName(
      info.source,
      sourceMapConsumer
    );

    // If this is the first time we are seeing the file, setup the tracking object.
    if (!usedSourceInfo.has(realFilePath)) {
      usedSourceInfo.set(realFilePath, {
        sourceName: info.source,
        //sourceContent: sourceMapConsumer.sourceContentFor(m.source),
        totalLines: sourceMapConsumer.sourceContentFor(info.source).split("\n")
          .length,
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

  /**
   * Potentially we could be smart and actually detect duplicated subexpressions inside of a single file
   * This was a naive approach.. did not really work since something like
   *
   * () => ... gets turned into multiple expressions when compiled.. we would need someway to join things
   * back up.
   *
  for (const track of usedSourceInfo.values()) {
    track.linesInUse = Object.values(track.inUse).length;
    // walk over each column... determine the MIN number of times the column was hit, and that is a
    // how many times the line showed up in the compiled code.

    // walk over each line
    Object.values(track.inUse).forEach((line: InUseLine) => {

      let minHits: number|undefined = undefined;

      // find the min column hit count per line
      Object.values(line.columns).forEach((columnHits: InUseColumns[]) => {
        if (minHits === undefined || columnHits.length < minHits) {
          minHits = columnHits.length;
        }
      });

      line.lineHits = minHits || -1;
    });
  }

  for(const inuseFile of usedSourceInfo.values()) {
    const multiuse: {[key: number]: InUseLine} = {};

    for (const lineNumber of Object.keys(inuseFile.inUse)) {
      if (inuseFile.inUse[parseInt(lineNumber, 10)].lineHits > 1) {
        multiuse[parseInt(lineNumber, 10)] = inuseFile.inUse[parseInt(lineNumber, 10)];
      }
    }

    inuseFile.inUse = multiuse;
  }
*/
  return usedSourceInfo;
}

function hashFileLineNumber(fileName: string, lineNumber: number | string) {
  return `${fileName}${HASH_SPLITTER}${lineNumber}`;
}

function hashToFileAndLineNumber(hash: string) {
  return {
    fileName: hash.split(HASH_SPLITTER)[0],
    lineNumber: hash.split(HASH_SPLITTER)[1]
  };
}

const lineHitMap = new Map<
  string,
  {
    from: string[];
    count: number;
  }
>();

for (const sourceMap of process.argv.slice(2)) {
  const bundleHits = sourceMapToLineHits(extractHitInto(sourceMap));

  for (let hit of bundleHits) {
    if (lineHitMap.get(hit) === undefined) {
      lineHitMap.set(hit, {
        from: [],
        count: 0
      });
    }

    lineHitMap.get(hit)!.from.push(sourceMap);
    lineHitMap.get(hit)!.count++;
  }
}

// Walk all line hits and find the hits that are > 1 hit.. this means there is duplication :D
for (const lineHash of lineHitMap.keys()) {
  const match = lineHitMap.get(lineHash)!;

  if (match.count <= 1) continue;

  const details = hashToFileAndLineNumber(lineHash);

  console.log(`
  ------ Duplicated line found ------

  File: ${details.fileName}
  Line: ${details.lineNumber}

  Was found in the following bundles:`);
  console.log(match.from);
}
