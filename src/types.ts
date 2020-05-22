import { History } from "history";
import { ProcessedSourceMap } from "./import/process_sourcemaps";

export interface GraphNode {
  source: string;
  target: string | null;
}

export type GraphNodes = GraphNode[];

export enum ImportTypes {
  ROLLUP,
  ROME,
  WEBPACK
}

export interface ImportResolveState {
  graphNodes: GraphNodes;
  processedSourceMap: ProcessedSourceMap;
  graphFileTransform?: string;
  sourceMapFileTransform?: string;
}

export type SizeData = {
  id?: string;
  pct: number;
  name: string;
  totalBytes: number;
  color?: string;
};

export interface ProcessedImportState {
  trimmedNetwork: TrimmedNetwork;
  hierarchy: TreemapNode[];
  rollups: {
    value: number;
    fileTypes: SizeData[];
    directories: SizeData[];
  };
  duplicateNodeModules: Array<{
    key: string;
    value: string[];
  }>;
}

export interface TreemapNode {
  parent: string;
  name: string;
  totalBytes?: number;
}

export type ProcessedHistory = History<ProcessedImportState>;
export type ImportHistory = History<ImportResolveState>;

export interface ImportProps {
  history: ImportHistory;
  graphFileName: string;
  importType: ImportTypes;
}

export interface BundleProps {
  trimmedNetwork: ProcessedImportState["trimmedNetwork"];
  rollups: ProcessedImportState["rollups"];
  duplicateNodeModules: ProcessedImportState["duplicateNodeModules"];
  selected: string | null;
  hierarchy: ProcessedImportState["hierarchy"];
}

export interface BundleState {
  selected: string | null;
  counts: { [k: string]: BundleNetworkCount };
}

export interface BundleNetworkCount {
  requiredBy: Set<string> | string[];
  requires: Set<string> | string[];
  transitiveRequiredBy?: string[];
}

export interface ResolveProps {
  history: ImportHistory;
  graphNodes: GraphNodes;
  processedSourceMap: ProcessedSourceMap;
  graphFileTransform?: string;
  sourceMapFileTransform?: string;
}

export interface TrimmedNetwork {
  nodes: TrimmedNode[];
  edges: Edge[];
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
  count?: BundleNetworkCount;
}

export interface ImportState {
  sourceMapFiles?: File[];
  graphFile?: File;
  importError?: string | null;
  importErrorUri?: string | null;
}
