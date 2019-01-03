import { processSourcemap, ProcessedSourceMap } from './process_sourcemaps'
import { cleanGraph, GraphNodes } from "./graph_process";

export interface ImportProcess {
    proccessedSourcemap?: ProcessedSourceMap;
    processedGraph?: GraphNodes;
    sourceMapProcessError?: Error;
    graphProcessError?: Error
};

// TODO(samccone) we will want to handle more error types.
function humanizeSourceMapImportError(e: Error) {
    return `importing source map: \n${e.toString()}`;
}

function humanizeGraphProcessError(e: Error) {
    return `importing graph contents: \n${e.toString()}`;
}

export async function processImports(opts: {
    sourceMapContents: string;
    graphNodes: GraphNodes | string;
    graphPreProcessFn?: (contents: any) => GraphNodes;
}): Promise<ImportProcess> {
    const ret: ImportProcess = { proccessedSourcemap: {} };

    try {
        ret.proccessedSourcemap = await processSourcemap(opts.sourceMapContents)
    } catch (e) {
        ret.sourceMapProcessError = new Error(humanizeSourceMapImportError(e))
    }

    try {
        if (typeof opts.graphNodes === 'string') {
            let parsedNodes = JSON.parse(opts.graphNodes);

            if (opts.graphPreProcessFn != null) {
                parsedNodes = opts.graphPreProcessFn(parsedNodes)
            }

            ret.processedGraph = await cleanGraph(parsedNodes as GraphNodes);
        } else {
            ret.processedGraph = await cleanGraph(opts.graphNodes)
        }
    } catch (e) {
        ret.graphProcessError = new Error(humanizeGraphProcessError(e))
    }

    return ret
}


export function buildErrorString(processed: ImportProcess, files: { graphFile: {name: string}, sourceMapFile: {name: string}}): null | string {
    let importError = null;

    if (processed.graphProcessError != null) {
        importError = `${files.graphFile.name} ${processed.graphProcessError}\n`;
    }

    if (processed.sourceMapProcessError != null) {
        if (importError == null) {
            importError = '';
        }


        importError += `${files.sourceMapFile.name}: ${processed.sourceMapProcessError}`;
    }


    return importError
}