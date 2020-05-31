import {
  TrimmedDataNode,
  Imported,
  ProcessedImportState,
  TreemapNode,
  GraphEdges,
  FlattendGraph,
  ProcessedSourceMap,
  // TrimmedNetwork,
  // BundleNetworkCount,
} from "../types";
import {
  requiredBy,
  calculateTransitiveRequires,
  edgesToGraph,
} from "../graph";
import { findDuplicateModules } from "./duplicateModules";

const EMPTY_NAME = "No Directory";

function values<V>(entity: { [k: string]: V }): V[] {
  const ret: V[] = [];
  for (const o of Object.keys(entity)) {
    ret.push(entity[o]);
  }

  return ret;
}

function nodesToTreeMap(data: ProcessedSourceMap): TreemapNode[] {
  const rel = [
    {
      parent: "",
      name: "rootNode",
    },
  ];

  const unique: { [hash: string]: Boolean } = {};

  Object.keys(data).forEach((d) => {
    const parents = d.split(/\/(?!\/)/).filter((d) => d);

    parents.forEach((p, i, array) => {
      const value = {
        name: array.slice(0, i + 1).join("/"),
        parent: array.slice(0, i).join("/") || "rootNode",
        totalBytes: 0,
      };

      if (i === array.length - 1) {
        value.totalBytes = data[d].totalBytes || 0;
      }

      const key = JSON.stringify(value);

      if (!unique[key]) {
        rel.push(value);
        unique[key] = true;
      }
    });
  });

  return rel;
}

// noopener noreferrer

function getRollups(fileSizes: ProcessedSourceMap) {
  const summary: {
    value: number;
    fileTypes: {
      [type: string]: {
        name: string;
        totalBytes: number;
        pct?: number;
      };
    };
    directories: {
      [parent: string]: {
        name: string;
        totalBytes: number;
        pct?: number;
      };
    };
  } = {
    value: 0,
    fileTypes: {},
    directories: {},
  };

  Object.keys(fileSizes).forEach((key) => {
    summary.value += fileSizes[key].totalBytes;
    const index = key.lastIndexOf("/");
    const fileName = key.slice(index + 1).split(/\./g);

    if (fileName.length > 1) {
      const extension = fileName[fileName.length - 1].split("?")[0];

      const parentIndex = key.indexOf("/");
      let parent = EMPTY_NAME;

      if (parentIndex !== -1) {
        parent = key.slice(0, parentIndex);
      }

      if (summary.fileTypes[extension]) {
        summary.fileTypes[extension].totalBytes += fileSizes[key].totalBytes;
      } else {
        summary.fileTypes[extension] = {
          name: extension,
          totalBytes: fileSizes[key].totalBytes,
        };
      }

      if (summary.directories[parent]) {
        summary.directories[parent].totalBytes += fileSizes[key].totalBytes;
      } else {
        summary.directories[parent] = {
          name: parent,
          totalBytes: fileSizes[key].totalBytes,
        };
      }
    }
  });

  return {
    value: summary.value,
    fileTypes: values(summary.fileTypes).map((d) => ({
      ...d,
      pct: d.totalBytes / summary.value,
    })),
    directories: values(summary.directories).map((d) => ({
      ...d,
      pct: d.totalBytes / summary.value,
    })),
  };
}

function initializeNode(id: string, size: number = 0) {
  const index = id.indexOf("/");
  let directory = "";
  if (index !== -1) directory = id.slice(0, index);
  else directory = EMPTY_NAME;
  const text =
    (directory !== EMPTY_NAME && id.replace(directory + "/", "")) || id;

  const lastSlash = id.lastIndexOf("/");
  const fileName = id.slice(lastSlash !== -1 ? lastSlash + 1 : 0);

  return {
    id,
    totalBytes: size,
    text,
    fileName,
    directory,
    requiredBy: [],
    requires: [],
    transitiveRequiredBy: [],
    transitiveRequires: [],
    transitiveRequiresSize: 0,
  };
}

export function getTrimmedNetwork(
  graphEdges: GraphEdges,
  fileSizes: ProcessedSourceMap
) {
  const addedNodes: { [name: string]: boolean } = {};
  const addedEdges: { [name: string]: boolean } = {};

  const trimmedNodes: { [name: string]: TrimmedDataNode } = {};
  const trimmedEdges: { [edgeKey: string]: Imported } = {};

  //Add node from edges
  graphEdges.forEach((e) => {
    //trimmed network functions
    const fileName = typeof e.source === "string" && e.source;

    if (fileName) {
      addedNodes[fileName] = true;
      let importedShortedName, importedFileName;
      if (typeof e.target === "string") {
        importedShortedName = e.target.includes("node_modules")
          ? e.target.split("/").slice(0, 2).join("/")
          : e.target;
        importedFileName = e.target;
      }

      //if fileName does not include node modules
      if (!fileName.includes("node_modules")) {
        //add filename
        if (!trimmedNodes[fileName]) {
          trimmedNodes[fileName] = initializeNode(
            fileName,
            fileSizes[fileName] && fileSizes[fileName].totalBytes
          );
        }

        if (importedFileName && importedShortedName) {
          const edgeKey = `${importedShortedName} -> ${fileName}`;
          if (!addedEdges[edgeKey]) {
            addedEdges[edgeKey] = true;
            trimmedEdges[edgeKey] = {
              fileName,
              imported: importedShortedName,
              importedFileNames: [],
            };
          }
          if (importedFileName !== importedShortedName) {
            trimmedEdges[edgeKey].importedFileNames!.push(importedFileName);
          }

          //add shortened name
          if (!trimmedNodes[importedShortedName]) {
            addedNodes[importedFileName] = true;

            trimmedNodes[importedShortedName] = initializeNode(
              importedShortedName,
              fileSizes[importedFileName] &&
                fileSizes[importedFileName].totalBytes
            );
          }
        }
      }

      //aggregate total bytes for node_modules files under shortend name
      if (
        importedShortedName &&
        importedFileName &&
        !addedNodes[importedFileName] &&
        trimmedNodes[importedShortedName]
      ) {
        addedNodes[importedFileName] = true;

        if (fileSizes[importedFileName]) {
          trimmedNodes[importedShortedName].totalBytes +=
            fileSizes[importedFileName].totalBytes || 0;
        }
      }
    }
  });

  //Add any additional nodes from file sizes that were not in edges
  Object.keys(fileSizes).forEach((fileName) => {
    if (!addedNodes[fileName]) {
      if (!fileName.includes("node_modules")) {
        trimmedNodes[fileName] = initializeNode(
          fileName,
          fileSizes[fileName].totalBytes
        );
      }
    }
  });

  //Add requires / required by and transitive fields
  const counts: FlattendGraph = edgesToGraph(values(trimmedEdges));
  const transitiveRequiredBy = requiredBy(counts);

  for (const fileName of Object.keys(counts)) {
    trimmedNodes[fileName].requiredBy = Array.from(counts[fileName].requiredBy);

    trimmedNodes[fileName].requires = Array.from(counts[fileName].requires);

    trimmedNodes[fileName].transitiveRequiredBy =
      transitiveRequiredBy[fileName].transitiveRequiredBy;

    const transitiveRequires = calculateTransitiveRequires(fileName, counts);

    trimmedNodes[fileName].transitiveRequires = Array.from(transitiveRequires);

    let transitiveRequiresSize = 0;

    for (const name of transitiveRequires) {
      transitiveRequiresSize += trimmedNodes[name].totalBytes;
    }

    trimmedNodes[fileName].transitiveRequiresSize = transitiveRequiresSize;
  }

  const trimmedNetwork = {
    nodes: values(trimmedNodes),
    edges: values(trimmedEdges),
  };

  trimmedNetwork.nodes.forEach((d) => {
    const index = d.id.indexOf("/");
    if (index !== -1) d.directory = d.id.slice(0, index);
    else d.directory = EMPTY_NAME;
    d.text =
      (d.directory !== EMPTY_NAME && d.id.replace(d.directory + "/", "")) ||
      d.id;

    const lastSlash = d.id.lastIndexOf("/");
    d.fileName = d.id.slice(lastSlash !== -1 ? lastSlash + 1 : 0);
  });

  return trimmedNetwork;
}

export function transform(
  graphEdges: GraphEdges,
  fileSizes: ProcessedSourceMap,
  sourceMapFiles: string[]
): ProcessedImportState {
  return {
    rollups: getRollups(fileSizes),
    trimmedNetwork: getTrimmedNetwork(graphEdges, fileSizes),
    duplicateNodeModules: findDuplicateModules(sourceMapFiles),
    hierarchy: nodesToTreeMap(fileSizes),
  };
}
