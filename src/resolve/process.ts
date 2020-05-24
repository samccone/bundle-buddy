import { ProcessedSourceMap } from "../import/process_sourcemaps";
import {
  TrimmedDataNode,
  Edge,
  ProcessedImportState,
  TreemapNode,
  GraphEdges,
  FlattendGraph
  // TrimmedNetwork,
  // BundleNetworkCount,
} from "../types";
import {
  requiredBy,
  calculateTransitiveRequires,
  edgesToGraph
} from "../graph";

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
      name: "rootNode"
    }
  ];

  const unique: { [hash: string]: Boolean } = {};

  Object.keys(data).forEach(d => {
    const parents = d.split(/\/(?!\/)/).filter(d => d);

    parents.forEach((p, i, array) => {
      const value = {
        name: array.slice(0, i + 1).join("/"),
        parent: array.slice(0, i).join("/") || "rootNode",
        totalBytes: 0
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

function initializeNode(id: string) {
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
    totalBytes: 0,
    text,
    fileName,
    directory,
    count: {
      requiredBy: [],
      requires: [],
      transitiveRequiredBy: [],
      transitiveRequires: [],
      transitiveRequiresSize: 0
    }
  };
}

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
    directories: {}
  };

  Object.keys(fileSizes).forEach(key => {
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
          totalBytes: fileSizes[key].totalBytes
        };
      }

      if (summary.directories[parent]) {
        summary.directories[parent].totalBytes += fileSizes[key].totalBytes;
      } else {
        summary.directories[parent] = {
          name: parent,
          totalBytes: fileSizes[key].totalBytes
        };
      }
    }
  });

  return {
    value: summary.value,
    fileTypes: values(summary.fileTypes).map(d => ({
      ...d,
      pct: d.totalBytes / summary.value
    })),
    directories: values(summary.directories).map(d => ({
      ...d,
      pct: d.totalBytes / summary.value
    }))
  };
}

/**
 * Given a list of files find duplicate node modules and the dependencies that
 * brought them into the project.
 * @param sourceMapFiles a list of files in the project
 */
export function findDuplicateModules(
  sourceMapFiles: string[]
): Array<{
  key: string;
  value: string[];
}> {
  const ret: Array<{
    key: string;
    value: string[];
  }> = [];
  const containsNodeModules = sourceMapFiles.filter(
    v => v.indexOf("node_modules") > -1
  );
  const explodedPaths = containsNodeModules
    .map(v => v.split("/"))
    .map(splitPath => {
      return {
        nodeModulePreamables: splitPath
          .map((v, i) => {
            if (v === "node_modules") {
              return [splitPath[i + 1], splitPath[i - 1]];
            }

            return undefined;
          })
          .filter(v => v != null)
      };
    })
    .sort(
      (a, b) => a.nodeModulePreamables.length - b.nodeModulePreamables.length
    );

  const dupes: { [module: string]: { imports: Set<string> } } = {};

  const seen = new Set<string>();
  for (const d of explodedPaths as any) {
    const module = d.nodeModulePreamables[d.nodeModulePreamables.length - 1][0];
    const from = d.nodeModulePreamables[d.nodeModulePreamables.length - 1][1];

    if (d.nodeModulePreamables.length === 1) {
      dupes[module] = { imports: new Set<string>(["<PROJECT ROOT>"]) };
      seen.add(module);
    } else {
      if (seen.has(module)) {
        if (dupes[module] == null) {
          dupes[module] = { imports: new Set<string>([]) };
        }

        dupes[module].imports.add(from);
      } else {
        seen.add(module);
      }
    }
  }

  for (const key of Object.keys(dupes)) {
    if (dupes[key].imports?.size > 1) {
      ret.push({
        key,
        value: Array.from(dupes[key].imports)
      });
    }
  }

  return ret;
}

export function transform(
  graphEdges: GraphEdges,
  fileSizes: ProcessedSourceMap,
  sourceMapFiles: string[]
): ProcessedImportState {
  const addedNodes: { [name: string]: boolean } = {};
  const trimmedNodes: { [name: string]: TrimmedDataNode } = {};
  const trimmedEdges: Edge[] = [];
  const unique: { [k: string]: boolean } = {};

  graphEdges.forEach(e => {
    //trimmed network functions
    addedNodes[e.source] = true;

    if (e.target != null) {
      addedNodes[e.target] = true;
    }

    const sourceKey =
      e.source.indexOf("node_modules") !== -1
        ? e.source
            .split("/")
            .slice(0, 2)
            .join("/")
        : e.source;

    if (e.target != null) {
      trimmedEdges.push({
        source: sourceKey,
        target: e.target
      });

      if (!trimmedNodes[sourceKey]) {
        trimmedNodes[sourceKey] = initializeNode(sourceKey);
      }

      if (e.target != null && !trimmedNodes[e.target]) {
        trimmedNodes[e.target] = initializeNode(e.target);
      }
    }

    if (e.target != null && !unique[e.target] && trimmedNodes[e.target]) {
      unique[e.target] = true;

      if (fileSizes[e.target]) {
        if (
          trimmedNodes[e.target] != null &&
          trimmedNodes[e.target].totalBytes != null &&
          fileSizes[e.target].totalBytes != null
        ) {
          trimmedNodes[e.target].totalBytes! += fileSizes[e.target].totalBytes;
        }
      }
    }

    if (!unique[e.source] && trimmedNodes[sourceKey]) {
      unique[e.source] = true;

      if (
        fileSizes[e.source] != null &&
        trimmedNodes[sourceKey] != null &&
        trimmedNodes[sourceKey].totalBytes != null
      ) {
        trimmedNodes[sourceKey].totalBytes! += fileSizes[e.source].totalBytes;
      }
    }
  });

  Object.keys(fileSizes).forEach(d => {
    if (!addedNodes[d]) {
      if (d.indexOf("node_modules") === -1) {
        trimmedNodes[d] = initializeNode(d);
      }
    }
  });

  const counts: FlattendGraph = edgesToGraph(trimmedEdges);

  for (const k of Object.keys(counts)) {
    trimmedNodes[k].count.requiredBy = Array.from(counts[k].requiredBy);
    trimmedNodes[k].count.requires = Array.from(counts[k].requires);
  }

  const deps = requiredBy(counts);
  for (const moduleName of Object.keys(counts)) {
    trimmedNodes[moduleName].count.transitiveRequiredBy =
      deps[moduleName].transitiveRequiredBy;

    const transitiveRequires = calculateTransitiveRequires(moduleName, counts);

    trimmedNodes[moduleName].count.transitiveRequires = Array.from(
      transitiveRequires
    );

    let transitiveRequiresSize = 0;

    for (const name of transitiveRequires) {
      transitiveRequiresSize += trimmedNodes[name].totalBytes;
    }

    trimmedNodes[
      moduleName
    ].count.transitiveRequiresSize = transitiveRequiresSize;
  }

  const trimmedNetwork = {
    nodes: values(trimmedNodes),
    edges: trimmedEdges
  };

  trimmedNetwork.nodes.forEach(d => {
    const index = d.id.indexOf("/");
    if (index !== -1) d.directory = d.id.slice(0, index);
    else d.directory = EMPTY_NAME;
    d.text =
      (d.directory !== EMPTY_NAME && d.id.replace(d.directory + "/", "")) ||
      d.id;

    const lastSlash = d.id.lastIndexOf("/");
    d.fileName = d.id.slice(lastSlash !== -1 ? lastSlash + 1 : 0);
  });

  return {
    rollups: getRollups(fileSizes),
    trimmedNetwork,
    duplicateNodeModules: findDuplicateModules(sourceMapFiles),
    hierarchy: nodesToTreeMap(fileSizes)
  };
}
