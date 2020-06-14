import { History } from "history";

export interface FlattendGraph {
  [target: string]: {
    requiredBy: Set<string>;
    requires: Set<string>;
  };
}

export interface Edge {
  // current file
  source: string;
  // imports the following
  target: string;
}

export interface Imported {
  // current file
  fileName: string;
  // imported the following
  imported: string;
  importedFileNames?: string[];
}

export type GraphEdges = Edge[];

export enum ImportTypes {
  ROLLUP,
  PARCEL,
  ROME,
  WEBPACK,
}

export interface ImportResolveState {
  graphEdges: GraphEdges;
  processedSourceMap: ProcessedBundle;
  graphFileTransform?: string;
  bundledFilesTransform?: string;
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

export type ProcessedHistory = History<{ key: string }>;
export type ImportHistory = History<{ key: string }>;

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

export interface ResolveProps {
  history: ProcessedHistory;
  graphEdges: GraphEdges;
  processedBundle: ProcessedBundle;
  graphFileTransform?: string;
  sourceMapFileTransform?: string;
}

export interface TrimmedNetwork {
  nodes: TrimmedDataNode[];
  edges: Imported[];
}

export interface TrimmedDataNode {
  id: string;
  totalBytes: number;
  directory: string;
  fileName: string;
  text: string;
  requiredBy: string[];
  requires: string[];
  transitiveRequiredBy: string[];
  transitiveRequires: string[];
  transitiveRequiresSize: number;
}

export interface ImportState {
  sourceMapFiles?: File[];
  graphFile?: File;
  importError?: string | null;
  importErrorUri?: string | null;
}

export interface BundledFile {
  totalBytes: number;
}

export type BundledFiles = { [fileName: string]: BundledFile };

export interface ProcessedBundle {
  files: BundledFiles;
  totalBytes: number;
}

export interface ImportProcess {
  bundleSizes: { [bundleName: string]: BundledFile };
  processedSourcemap?: ProcessedBundle;
  processedGraph?: GraphEdges;
  sourceMapProcessError?: Error;
  graphProcessError?: Error;
}

/**
 * Stats exported from esbuild when passed the --metafile flag
 */
export interface EsBuildMetadata {
  inputs: {
    [path: string]: {
      bytes: number;
      imports: {
        path: string;
      }[];
    };
  };
  outputs: {
    [path: string]: {
      bytes: number;
      inputs: {
        [path: string]: {
          bytesInOutput: number;
        };
      };
    };
  };
}
