import { GraphNodes } from "../import/graph_process";
import { ProcessedSourceMap } from "../import/process_sourcemaps";
import { TrimmedNode, Edge, ProcessedImportState } from "../types";

const addedNodes: { [name: string]: boolean } = {};
const trimmedNodes: { [name: string]: TrimmedNode } = {};
const trimmedEdges: Edge[] = [];
const unique: { [k: string]: boolean } = {};

const EMPTY_NAME = "No Directory";

function values<V>(entity: { [k: string]: V }): V[] {
  const ret: V[] = [];
  for (const o of Object.keys(entity)) {
    ret.push(entity[o]);
  }

  return ret;
}

export function transform(
  graphNodes: GraphNodes,
  sourceMapData: ProcessedSourceMap
): ProcessedImportState {
  graphNodes.forEach(e => {
    //trimmed network functions
    addedNodes[e.source] = true;

    if (e.target != null) {
      addedNodes[e.target] = true;
    }

    const sourceKey = e.source.indexOf("node_modules") !== -1
      ? e.source.split("/").slice(0, 2).join("/")
      : e.source;

    if (e.target != null && e.target.indexOf("node_modules") === -1) {
      trimmedEdges.push({
        source: sourceKey,
        target: e.target
      });

      if (!trimmedNodes[sourceKey]) {
        trimmedNodes[sourceKey] = {
          id: sourceKey,
          totalBytes: 0
        };
      }

      if (e.target != null && !trimmedNodes[e.target]) {
        trimmedNodes[e.target] = {
          id: e.target,
          totalBytes: 0
        };
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

    //regular network functions

    // if (!nodes[e.source]) {
    //   nodes[e.source] = {
    //     id: e.source,
    //     asSource: 1,
    //     asTarget: 0
    //   };

    //   if (data[e.source]) {
    //     nodes[e.source].totalBytes = data[e.source].totalBytes;
    //   }
    // } else {
    //   nodes[e.source].asSource++;
    // }

    // if (!nodes[e.target]) {
    //   nodes[e.target] = {
    //     id: e.target,
    //     asSource: 0,
    //     asTarget: 1
    //   };

    //   if (data[e.target]) {
    //     nodes[e.target].totalBytes = data[e.target].totalBytes;
    //   }
    // } else {
    //   nodes[e.target].asTarget++;
    // }
  });

  Object.keys(sourceMapData).forEach(d => {
    if (!addedNodes[d]) {
      trimmedNodes[d] = {
        id: d,
        totalBytes: sourceMapData[d].totalBytes
      };
    }
  });

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

  // jsonfile.writeFile("./semiotic-test/network.json", {
  //   nodes: values(nodes),
  //   edges
  // });

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

  return { rollups, trimmedNetwork };
}
