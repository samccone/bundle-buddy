import { History } from "history";
import { ProcessedSourceMap } from "./import/process_sourcemaps";

export interface Edge {
  // current file
  source: string;
  // imports the following
  target: string;
}

export type GraphEdges = Edge[];

export enum ImportTypes {
  ROLLUP,
  PARCEL,
  ROME,
  WEBPACK
}

export interface ImportResolveState {
  graphNodes: GraphEdges;
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
  requiredBy: string[];
  requires: string[];
  transitiveRequiredBy: string[];
  transitiveRequires: string[];
  transitiveRequiresSize: number;
}

export interface ResolveProps {
  history: ImportHistory;
  graphNodes: GraphEdges;
  processedSourceMap: ProcessedSourceMap;
  graphFileTransform?: string;
  sourceMapFileTransform?: string;
}

export interface TrimmedNetwork {
  nodes: TrimmedDataNode[];
  edges: Edge[];
}

export interface TrimmedDataNode {
  id: string;
  totalBytes: number;
  directory: string;
  fileName: string;
  text: string;
  count: BundleNetworkCount;
}

export interface ImportState {
  sourceMapFiles?: File[];
  graphFile?: File;
  importError?: string | null;
  importErrorUri?: string | null;
}
