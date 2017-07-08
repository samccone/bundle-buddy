import { LogLevels, SourceTrack } from "./types";
import * as chalk from "chalk";

const WEBPACK_MATCHER = /\/\/ WEBPACK FOOTER \/\/\n\/\/\s+(.*)/m;
const HASH_SPLITTER = "||||";

export function hashFileLineNumber(
  fileName: string,
  lineNumber: number | string
) {
  return `${fileName}${HASH_SPLITTER}${lineNumber}`;
}

export function hashToFileAndLineNumber(hash: string) {
  return {
    fileName: hash.split(HASH_SPLITTER)[0],
    lineNumber: parseInt(hash.split(HASH_SPLITTER)[1], 10)
  };
}

export function hashBundlesToKey(files: string[]) {
  return Array.from(files).sort().join(HASH_SPLITTER);
}

/**
 * Since the sourcemap file name does not always === the real file name
 * we need to do some cleanup work (specifically for webpack).
 */
export function getOriginalFileNameFromSourceName(
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

export function sourceMapToLineHits(hitTracks: Map<string, SourceTrack>) {
  const sourceToLineMapping = new Set<string>();

  for (const fileName of hitTracks.keys()) {
    Object.keys(hitTracks.get(fileName)!.inUse).forEach(lineNumber => {
      sourceToLineMapping.add(hashFileLineNumber(fileName, lineNumber));
    });
  }

  return sourceToLineMapping;
}

export class Logger {
  private logLevel: LogLevels;
  constructor(opts: { logLevel: LogLevels }) {
    this.logLevel = opts.logLevel;
  }

  error(s: string) {
    console.warn(chalk.white.bgRed.bold(s));
  }

  success(s: string) {
    console.warn(chalk.white.bgGreen.bold(s));
  }

  info(s: string) {
    if (this.logLevel === "verbose") {
      console.warn(chalk.grey(s));
    }
  }
}
