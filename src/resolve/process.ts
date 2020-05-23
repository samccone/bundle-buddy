import { ProcessedSourceMap } from "../import/process_sourcemaps";
import {
  TrimmedDataNode,
  Edge,
  ProcessedImportState,
  TreemapNode,
  GraphEdges
  // TrimmedNetwork,
  // BundleNetworkCount,
} from "../types";
import { requiredBy, calculateTransitiveRequires } from "../graph";

const EMPTY_NAME = "No Directory";

function values<V>(entity: { [k: string]: V }): V[] {
  const ret: V[] = [];
  for (const o of Object.keys(entity)) {
    ret.push(entity[o]);
  }

  return ret;
}

function nodesToTreeMap(data: {
  [id: string]: TrimmedDataNode;
}): TreemapNode[] {
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

export function transform(
  graphEdges: GraphEdges,
  sourceMapData: ProcessedSourceMap,
  sourceMapFiles: string[]
): ProcessedImportState {
  const addedNodes: { [name: string]: boolean } = {};
  const trimmedNodes: { [name: string]: TrimmedDataNode } = {};
  const trimmedEdges: Edge[] = [];
  const unique: { [k: string]: boolean } = {};
  const nmLength = "node_modules".length + 1;
  const dps = sourceMapFiles.reduce<{
    [key: string]: string[];
  }>((p, d) => {
    var regex = /node_modules/gi,
      result,
      indices = [];
    while ((result = regex.exec(d))) {
      indices.push(result.index);
    }

    //has multiple node modules in string
    if (indices.length > 1) {
      const parent = d.slice(indices[0] + nmLength, indices[1] - 1);

      const child = d.slice(indices[1] + nmLength);
      const childDirIndex = child.indexOf("/");
      const childDir = child.slice(0, childDirIndex);

      if (!p[childDir]) p[childDir] = [];

      if (p[childDir].indexOf(parent) === -1) p[childDir].push(parent);
    }
    return p;
  }, {});

  const duplicateNodeModules = Object.keys(dps).reduce(
    (p, c) => {
      const v = dps[c];

      if (v.length > 1) p.push({ key: c, value: v });
      return p;
    },
    [] as Array<{
      key: string;
      value: string[];
    }>
  );

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

      if (sourceMapData[e.target]) {
        if (
          trimmedNodes[e.target] != null &&
          trimmedNodes[e.target].totalBytes != null &&
          sourceMapData[e.target].totalBytes != null
        ) {
          trimmedNodes[e.target].totalBytes! += sourceMapData[
            e.target
          ].totalBytes;
        }
      }
    }

    if (!unique[e.source] && trimmedNodes[sourceKey]) {
      unique[e.source] = true;

      if (
        sourceMapData[e.source] != null &&
        trimmedNodes[sourceKey] != null &&
        trimmedNodes[sourceKey].totalBytes != null
      ) {
        trimmedNodes[sourceKey].totalBytes! += sourceMapData[
          e.source
        ].totalBytes;
      }
    }
  });

  Object.keys(sourceMapData).forEach(d => {
    if (!addedNodes[d]) {
      if (d.indexOf("node_modules") === -1) {
        trimmedNodes[d] = initializeNode(d);
      }
      console.log(d, sourceMapData[d].totalBytes);
    }
  });

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

  Object.keys(sourceMapData).forEach(key => {
    summary.value += sourceMapData[key].totalBytes;
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
        summary.fileTypes[extension].totalBytes +=
          sourceMapData[key].totalBytes;
      } else {
        summary.fileTypes[extension] = {
          name: extension,
          totalBytes: sourceMapData[key].totalBytes
        };
      }

      if (summary.directories[parent]) {
        summary.directories[parent].totalBytes += sourceMapData[key].totalBytes;
      } else {
        summary.directories[parent] = {
          name: parent,
          totalBytes: sourceMapData[key].totalBytes
        };
      }
    }
  });

  const rollups = {
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

  const hierarchy = nodesToTreeMap(trimmedNodes);

  const counts: {
    [target: string]: {
      requiredBy: Set<string>;
      requires: Set<string>;
    };
  } = {};

  for (const n of trimmedEdges) {
    if (counts[n.target] == null) {
      counts[n.target] = {
        requiredBy: new Set(),
        requires: new Set()
      };
    }

    (counts[n.target].requires as Set<string>).add(n.source);

    if (counts[n.source] == null) {
      counts[n.source] = {
        requiredBy: new Set(),
        requires: new Set()
      };
    }
  }

  const keys = Object.keys(counts);

  for (const k of keys) {
    for (const k2 of keys) {
      if (k !== k2 && (counts[k2].requires as Set<string>).has(k)) {
        (counts[k].requiredBy as Set<string>).add(k2);
      }
    }
  }

  for (const k of keys) {
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

  return { rollups, trimmedNetwork, duplicateNodeModules, hierarchy };
}
