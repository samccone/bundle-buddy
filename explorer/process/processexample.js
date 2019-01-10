const jsonfile = require("jsonfile");

const edges = require("./semiotic/graph.json");
const data = require("./semiotic/files.json");

// const nodes = {};

const addedNodes = {};
const trimmedNodes = {};
const trimmedEdges = [];
const unique = {};

const EMPTY_NAME = "No Directory";

edges.forEach(e => {
  //trimmed network functions
  addedNodes[e.source] = true;
  addedNodes[e.target] = true;

  const sourceKey = e.source.indexOf("node_modules") !== -1
    ? e.source.split("/").slice(0, 2).join("/")
    : e.source;

  if (e.target.indexOf("node_modules") === -1) {
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

    if (!trimmedNodes[e.target]) {
      trimmedNodes[e.target] = {
        id: e.target,
        totalBytes: 0
      };
    }
  }

  if (!unique[e.target] && trimmedNodes[e.target]) {
    unique[e.target] = true;

    if (data[e.target]) {
      trimmedNodes[e.target].totalBytes += data[e.target].totalBytes;
    }
  }

  if (!unique[e.source] && trimmedNodes[sourceKey]) {
    unique[e.source] = true;

    if (data[e.source]) {
      trimmedNodes[sourceKey].totalBytes += data[e.source].totalBytes;
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

Object.keys(data).forEach(d => {
  if (!addedNodes[d]) {
    trimmedNodes[d] = {
      id: d,
      totalBytes: data[d].totalBytes
    };
  }
});

const trimmedNetwork = {
  nodes: Object.values(trimmedNodes),
  edges: trimmedEdges
};

trimmedNetwork.nodes.forEach(d => {
  const index = d.id.indexOf("/");
  if (index !== -1) d.directory = d.id.slice(0, index);
  else d.directory = EMPTY_NAME;
  d.text =
    (d.directory !== EMPTY_NAME && d.id.replace(d.directory + "/", "")) || d.id;

  const lastSlash = d.id.lastIndexOf("/");
  d.fileName = d.id.slice(lastSlash !== -1 ? lastSlash + 1 : 0);
});

jsonfile.writeFile("./semiotic-test/trimmed-network.json", trimmedNetwork);

// jsonfile.writeFile("./semiotic-test/network.json", {
//   nodes: Object.values(nodes),
//   edges
// });

const rollups = {
  value: 0,
  fileTypes: {},
  directories: {}
};

Object.keys(data).forEach(key => {
  rollups.value += data[key].totalBytes;
  const index = key.lastIndexOf("/");
  const fileName = key.slice(index + 1).split(/\./g);

  if (fileName.length > 1) {
    const extension = fileName[fileName.length - 1].split("?")[0];

    const parentIndex = key.indexOf("/");
    let parent = EMPTY_NAME;

    if (parentIndex !== -1) {
      parent = key.slice(0, parentIndex);
    }

    if (rollups.fileTypes[extension]) {
      rollups.fileTypes[extension].totalBytes += data[key].totalBytes;
    } else {
      rollups.fileTypes[extension] = {
        name: extension,
        totalBytes: data[key].totalBytes
      };
    }

    if (rollups.directories[parent]) {
      rollups.directories[parent].totalBytes += data[key].totalBytes;
    } else {
      rollups.directories[parent] = {
        name: parent,
        totalBytes: data[key].totalBytes
      };
    }
  }
});

rollups.fileTypes = Object.values(rollups.fileTypes).map(d => {
  return { ...d, pct: d.totalBytes / rollups.value };
});
rollups.directories = Object.values(rollups.directories).map(d => {
  return { ...d, pct: d.totalBytes / rollups.value };
});

jsonfile.writeFile("./semiotic-test/totalsByType.json", rollups);
