import { processSourcemap, ProcessedSourceMap } from "./process_sourcemaps";
import { GraphEdges } from "../types";
import { ReportErrorUri } from "../report_error";

export interface ImportProcess {
  proccessedSourcemap?: ProcessedSourceMap;
  processedGraph?: GraphEdges;
  sourceMapProcessError?: Error;
  graphProcessError?: Error;
}

// TODO(samccone) we will want to handle more error types.
function humanizeSourceMapImportError(e: Error) {
  return `importing source map: \n${e.toString()}`;
}

function humanizeGraphProcessError(e: Error) {
  return `importing graph contents: \n${e.toString()}`;
}

function mergeProcessedSourceMaps(processed: {
  [filename: string]: ProcessedSourceMap;
}): ProcessedSourceMap {
  const ret: ProcessedSourceMap = {};

  for (const bundleName of Object.keys(processed)) {
    for (const filename of Object.keys(processed[bundleName])) {
      if (
        ret[filename] == null ||
        ret[filename].totalBytes < processed[bundleName][filename].totalBytes
      ) {
        ret[filename] = processed[bundleName][filename];
      }
    }
  }

  return ret;
}

export async function processImports(opts: {
  sourceMapContents: { [filename: string]: string };
  graphEdges: GraphEdges | string;
  graphPreProcessFn?: (contents: any) => GraphEdges;
}): Promise<ImportProcess> {
  const ret: ImportProcess = { proccessedSourcemap: {} };

  const processed: { [filename: string]: ProcessedSourceMap } = {};

  for (const bundleName of Object.keys(opts.sourceMapContents)) {
    if (ret.sourceMapProcessError != null) {
      continue;
    }

    try {
      processed[bundleName] = await processSourcemap(
        opts.sourceMapContents[bundleName]
      );
    } catch (e) {
      ret.sourceMapProcessError = new Error(humanizeSourceMapImportError(e));
    }
  }

  ret.proccessedSourcemap = mergeProcessedSourceMaps(processed);

  try {
    if (typeof opts.graphEdges === "string") {
      let parsedNodes = JSON.parse(opts.graphEdges);

      if (opts.graphPreProcessFn != null) {
        parsedNodes = opts.graphPreProcessFn(parsedNodes);
      }

      ret.processedGraph = parsedNodes as GraphEdges;
    } else {
      ret.processedGraph = opts.graphEdges;
    }
  } catch (e) {
    ret.graphProcessError = new Error(humanizeGraphProcessError(e));
  }

  return ret;
}

export function buildImportErrorReport(
  processed: ImportProcess,
  files: { graphFile: { name: string }; sourceMapFiles: File[] }
) {
  let importError = null;
  const reportUri = new ReportErrorUri();

  if (processed.graphProcessError != null) {
    importError = `${files.graphFile.name} ${processed.graphProcessError}\n`;
    reportUri.addError(files.graphFile.name, processed.graphProcessError);
  }

  if (processed.sourceMapProcessError != null) {
    if (importError == null) {
      importError = "";
    }

    reportUri.addError(
      Object.keys(files.sourceMapFiles.map((f) => f.name)).join(","),
      processed.sourceMapProcessError
    );
    importError += `${Object.keys(files.sourceMapFiles.map((f) => f.name)).join(
      ","
    )}: ${processed.sourceMapProcessError}`;
  }

  return {
    importError,
    importErrorUri: reportUri.toUri(),
  };
}
