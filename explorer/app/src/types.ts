import { History } from "history";
import { GraphNodes } from "./import/graph_process";
import { ProcessedSourceMap } from "./import/process_sourcemaps";

export interface ImportResolveState {
  graphNodes: GraphNodes;
  processedSourceMap: ProcessedSourceMap;
}

export interface ImportProps {
  history: History;
}
