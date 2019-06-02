import { History } from "history";
import { GraphNodes } from "./import/graph_process";
import { ProcessedSourceMap } from "./import/process_sourcemaps";

export interface ImportResolveState {
  graphNodes: GraphNodes;
  processedSourceMap: ProcessedSourceMap;
  graphFileTransform?: string;
  sourceMapFileTransform?: string;
}

export interface TreemapNode {
  parent: string;
  name: string;
  totalBytes?: number;
}

export interface ImportProps {
  history: History<ImportResolveState>;
  selected: boolean;
}

export interface ResolveProps {
  history: History<ImportResolveState>;
  graphNodes: GraphNodes;
  processedSourceMap: ProcessedSourceMap;
  graphFileTransform?: string;
  sourceMapFileTransform?: string;
}

export interface ProcessedImportState {
  trimmedNetwork: { nodes: TrimmedNode[]; edges: Edge[] };
  hierachy: TreemapNode[];
  rollups: {
    value: number;
    fileTypes: {
      pct: number;
      name: string;
      totalBytes: number;
    }[];
    directories: {
      pct: number;
      name: string;
      totalBytes: number;
    }[];
  };
  duplicateNodeModules: {
    [key: string]: string[];
  };
}

export interface Edge {
  source: string;
  target: string;
}

export interface TrimmedNode {
  id: string;
  totalBytes?: number;
  directory?: string;
  fileName?: string;
  text?: string;
}

export interface ImportState {
  sourceMapFiles?: File[];
  graphFile?: File;
  importError?: string | null;
  importErrorUri?: string | null;
}
