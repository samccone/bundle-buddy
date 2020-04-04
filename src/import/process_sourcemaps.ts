import * as sourceMap from "source-map";

(sourceMap.SourceMapConsumer as any).initialize({
  "lib/mappings.wasm": "/mappings.wasm"
});

export interface ProcessedSourceMap {
  [file: string]: { totalBytes: number };
}

export function processSourcemap(
  contents: string
): Promise<ProcessedSourceMap> {
  let missedLines = 0;
  let missedColumns = 0;
  let totalBytes = 0;

  // TODO(samccone) fix typing when https://github.com/mozilla/source-map/pull/374 lands.
  function onMapping(
    cursor: { line: number; column: number },
    files: ProcessedSourceMap,
    m: sourceMap.MappingItem & { lastGeneratedColumn?: number }
  ) {
    if (m.source == null) {
      return;
    }

    if (files[m.source] == null) {
      files[m.source] = {
        totalBytes: 0
      };
    }

    if (m.generatedLine == null) {
      return;
    }

    if (
      cursor.line === m.generatedLine &&
      m.generatedColumn != null &&
      m.generatedColumn != cursor.column + 1
    ) {
      missedColumns += m.generatedColumn - cursor.column;
    }

    if (cursor.line != m.generatedLine && cursor.line + 1 != m.generatedLine) {
      missedLines += m.generatedLine - cursor.line;
    }

    // On newline reset cursor info
    if (cursor.line != m.generatedLine && m.generatedLine != null) {
      cursor.line = m.generatedLine;
      cursor.column = m.lastGeneratedColumn || 1;
    } else {
      // On non-newline update column cursor
      cursor.column = m.lastGeneratedColumn || 1;
    }

    if (m.lastGeneratedColumn != null && m.lastGeneratedColumn != -1) {
      // These values are inclusive so when we generate the difference add 1
      totalBytes += m.lastGeneratedColumn - m.generatedColumn + 1;
      files[m.source].totalBytes +=
        m.lastGeneratedColumn - m.generatedColumn + 1;
    } else {
      // this seems to only happen when we encounter the last char on the line so add 1 char.
      files[m.source].totalBytes += 1;
      totalBytes += 1;
    }
  }

  return new Promise((res, rej) => {
    sourceMap.SourceMapConsumer.with(contents, null, consumer => {
      const files: ProcessedSourceMap = {};
      const cursor = { line: 1, column: 1 };
      try {
        consumer.computeColumnSpans();
      } catch (e) {
        rej(e);
        return;
      }

      consumer.eachMapping(m => onMapping(cursor, files, m));
      res(files);
    }).catch(e => rej(e));
  });
}
