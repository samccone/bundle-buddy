export interface SourceFileLineInfo {
  sourceFile: string;
  sourceLine: number;
  inBundles: string[];
}

export interface InUseColumns {
  generatedLine: number;
  generatedColumn: number;
}

export interface InUseLine {
  line: number;
  columns: {
    [key: number]: InUseColumns[];
  };
  lineHits: number;
}

export interface SourceTrack {
  sourceName: string;
  inUse: {
    [key: number]: InUseLine;
  };
}

export interface Node {
  id: string;
  type: string;
  size: number;
  inBundleFiles?: string[];
}

export interface SourceMapGraph {
  nodes: Node[];
  links: { source: string; target: string; strength: number }[];
}

export interface SourceMapProcessorResults {
  graph: SourceMapGraph;
  sourceFiles: SourceFiles;
  perFileStats: PerFileStats;
  sourceFileLinesGroupedByCommonBundle: SourceFileLinesGroupedByCommonBundle;
  bundleFileStats: BundleToSources;
  outputFiles: string[];
  groupedBundleStats: SourceFileToGrouped;
}

export type SourceFileToGrouped = Map<
  string,
  { [key: string]: { count: number; files: number } }
>;

export type SourceToBundles = { [source: string]: Set<string> };
export type LineHitMap = Map<string, { from: string[]; count: number }>;
export type SourceFiles = {
  [sourceFileName: string]: {
    sourceLines: number;
    source: string[];
  };
};

export type LogLevels = "silent" | "verbose";

export type BundleToSources = Map<
  string,
  {
    [srcFile: string]: {
      inBundleCount: number;
      containedInBundles: string[];
      count: number;
    };
  }
>;

export type PerFileStats = Map<
  string,
  { [sourceFileLine: number]: SourceFileLineInfo }
>;

export type SourceFileLinesGroupedByCommonBundle = {
  [sourceName: string]: {
    [bundleHash: string]: {
      lines: number[];
      bundles: string[];
      sourceName: string;
    };
  };
};
