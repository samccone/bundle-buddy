import { ProcessedSourceMap } from "../types";

import * as sourceMap from "source-map";

(sourceMap.SourceMapConsumer as any).initialize({
  "lib/mappings.wasm": "/mappings.wasm",
});

/**
 * Calculates the total size of the processed sourcemap's contents.
 * @param processedSourceMap
 */
export function getTotalSize(processedSourceMap: ProcessedSourceMap): number {
  return Object.values(processedSourceMap).reduce(
    (a, b) => {
      return { totalBytes: a.totalBytes + b.totalBytes };
    },
    { totalBytes: 0 }
  ).totalBytes;
}

/**
 * Calculate the size of the sourcemap file contents.
 * @param contents The string sourcemap contents.
 */
export function calculateSourcemapFileContents(
  contents: string
): Promise<ProcessedSourceMap> {
  // TODO(samccone) fix typing when https://github.com/mozilla/source-map/pull/374 lands.
  function onMapping(
    cursor: { line: number; column: number },
    processed: ProcessedSourceMap,
    m: sourceMap.MappingItem & { lastGeneratedColumn?: number }
  ) {
    if (m.source == null) {
      return;
    }

    if (processed.files[m.source] == null) {
      processed.files[m.source] = {
        totalBytes: 0,
      };
    }

    if (m.generatedLine == null) {
      return;
    }

    // On newline reset cursor info
    if (cursor.line !== m.generatedLine && m.generatedLine != null) {
      cursor.line = m.generatedLine;
      cursor.column = m.lastGeneratedColumn || 1;
    } else {
      // On non-newline update column cursor
      cursor.column = m.lastGeneratedColumn || 1;
    }

    if (m.lastGeneratedColumn != null && m.lastGeneratedColumn !== -1) {
      processed.files[m.source].totalBytes +=
        m.lastGeneratedColumn - m.generatedColumn + 1;
    } else {
      // this seems to only happen when we encounter the last char on the line so add 1 char.
      processed.files[m.source].totalBytes += 1;
    }
  }

  return new Promise((res, rej) => {
    sourceMap.SourceMapConsumer.with(contents, null, (consumer) => {
      const processed: ProcessedSourceMap = {
        totalSize: 0,
        files: {},
      };
      const cursor = { line: 1, column: 1 };
      try {
        consumer.computeColumnSpans();
      } catch (e) {
        rej(e);
        return;
      }

      consumer.eachMapping((m) => onMapping(cursor, processed, m));
      res(processed);
    }).catch((e) => rej(e));
  });
}

export function mergeProcessedSourceMaps(processed: {
  [bundlename: string]: ProcessedSourceMap;
}): ProcessedSourceMap {
  const ret: ProcessedSourceMap = {
    files: {},
    totalSize: 0,
  };

  for (const bundleName of Object.keys(processed)) {
    for (const filename of Object.keys(processed[bundleName].files)) {
      if (
        ret.files[filename] == null ||
        ret.files[filename].totalBytes <
          processed[bundleName].files[filename].totalBytes
      ) {
        ret.files[filename] = processed[bundleName].files[filename];
      }
    }
  }

  return ret;
}
