import {
  EsBuildMetadata,
  GraphEdges,
  ProcessedBundle,
  BundledFiles,
} from "../../types";

/**
 * Given an esbuild metafile file convert it into edges.
 * @param metadata esbuild metafile info.
 */
export function toEdges(metadata: EsBuildMetadata): GraphEdges {
  const ret: GraphEdges = [];

  for (const [file, val] of Object.entries(metadata.inputs)) {
    for (const { path } of val.imports) {
      ret.push({
        source: file,
        target: path,
      });
    }
  }

  return ret;
}

/**
 * Given an esbuild metafile convert it into a list of processed bundles.
 * @param metadata esbuild metafile info.
 */
export function toProcessedBundles(
  metadata: EsBuildMetadata
): { [bundleName: string]: ProcessedBundle } {
  const ret: { [bundleName: string]: ProcessedBundle } = {};

  for (const [bundleName, stats] of Object.entries(metadata.outputs)) {
    const files: BundledFiles = {};

    for (const [fileName, fileStats] of Object.entries(stats.inputs)) {
      files[fileName] = {
        totalBytes: fileStats.bytesInOutput,
      };
    }

    ret[bundleName] = {
      totalBytes: stats.bytes,
      files,
    };
  }

  return ret;
}
