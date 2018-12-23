import React, { Component } from "react";
import ByTypeBarChart from "./ByTypeBarChart";
import FileDetails from "./FileDetails";
import Dendrogram from "./Dendrogram";
// import Network from "./Network"

// import hierarchy from "./prototype/hierarchy.json"
// import totalsByType from "./prototype/totalsByType.json"
// import data from "./prototype/network.json"
// import network from "./prototype/trimmed-network.json"
import hierarchy from "./prototype-semiotic/hierarchy.json";
import totalsByType from "./prototype-semiotic/totalsByType.json";
import data from "./prototype-semiotic/trimmed-network.json";
import network from "./prototype-semiotic/trimmed-network.json";

import { stratify } from "d3-hierarchy";

// noopener noreferrer
/**
 * @param network {{edges: Array<{id: string, target: string, source: string}>}}
 * @returns {{[node: string]: {requiredBy: string[]; requires: string[]; indirectDependedOnCount: number, transitiveRequiredBy: string[]}}}
 */
function countsFromNetwork(network) {
  const d = {};

  for (const n of network.edges) {
    if (d[n.target] == null) {
      d[n.target] = {
        requiredBy: new Set(),
        requires: new Set()
      };
    }

    d[n.target].requires.add(n.source);

    if (d[n.source] == null) {
      d[n.source] = {
        requiredBy: new Set(),
        requires: new Set()
      };
    }
  }

  for (const k of Object.keys(d)) {
    for (const k2 of Object.keys(d)) {
      if (k !== k2 && d[k2].requires.has(k)) {
        d[k].requiredBy.add(k2);
      }
    }
  }

  for (const k of Object.keys(d)) {
    d[k] = {
      requiredBy: Array.from(d[k].requiredBy),
      requires: Array.from(d[k].requires)
    };
  }

  /**
   *
   * @param {string} moduleName
   * @param {Set<string>} seen
   * @param {{[k: string]: {requiredBy: string[]}}} graph
   * @param {boolean} root
   */
  function countTransitiveRequires(moduleName, seen, graph, root) {
    seen.add(moduleName);
    var count = 0;

    for (const requiredBy of graph[moduleName].requiredBy) {
      if (seen.has(requiredBy)) {
        continue;
      }

      if (root != true) {
        count++;
      }

      count += countTransitiveRequires(requiredBy, seen, graph, false);
    }

    return count;
  }

  for (const moduleName of Object.keys(d)) {
    const seen = new Set();
    d[moduleName].indirectDependedOnCount = countTransitiveRequires(
      moduleName,
      seen,
      d,
      true
    );
    d[moduleName].transitiveRequiredBy = Array.from(seen).filter(
      v => v !== moduleName
    );
  }

  return d;
}

const counts = countsFromNetwork(network);

class Bundle extends Component {
  constructor(props) {
    super(props);

    const h = stratify()
      .id(function(d) {
        return d.name;
      })
      .parentId(function(d) {
        return d.parent;
      })(hierarchy);

    h.sum(d => d.totalBytes);

    const byType = stratify()
      .id(function(d) {
        return d.name;
      })
      .parentId(function(d) {
        return d.parent;
      })(totalsByType);

    byType.sum(d => d.totalBytes);

    //TODO change to URI encode
    this.state = {
      hierarchy: h,
      byTypeHierarchy: byType,
      selected: props.selected
    };

    this.changeSelected = this.changeSelected.bind(this);
  }

  changeSelected(selected) {
    window.history.pushState(
      { selected },
      "",
      `${window.location.origin}${window.location
        .pathname}?selected=${selected}`
    );
    this.setState({ selected });
  }

  render() {
    let edges = [],
      nodes = [],
      nodeMap = {};

    if (this.state.selected) {
      const validList =
        (counts[this.state.selected] &&
          counts[this.state.selected].transitiveRequiredBy) ||
        [];

      edges = data.edges.filter(d => {
        return (
          (validList.indexOf(d.source) !== -1 &&
            validList.indexOf(d.target) !== -1) ||
          (d.source === this.state.selected || d.target === this.state.selected)
        );
      });

      nodeMap = edges.reduce((p, c) => {
        p[c.source] = true;
        p[c.target] = true;

        return p;
      }, {});

      nodes = data.nodes
        .filter(d => nodeMap[d.id])
        .sort((a, b) => b.totalBytes - a.totalBytes);
    }

    const max =
      data &&
      data.nodes &&
      data.nodes.sort((a, b) => b.totalBytes - a.totalBytes)[0].totalBytes;

    console.log(counts, data.nodes.filter(d => d.asSource === 0));

    return (
      <div>
        <ByTypeBarChart
          hierarchy={this.state.byTypeHierarchy}
          network={network}
          changeSelected={this.changeSelected}
          counts={counts}
        />
        <FileDetails
          hierarchy={this.state.byTypeHierarchy}
          network={network}
          changeSelected={this.changeSelected}
          counts={counts}
        />

        <div>
          {this.state.selected &&
            <Dendrogram
              nodes={nodes}
              edges={edges}
              max={max}
              selected={this.state.selected}
              counts={counts}
            />}
        </div>
      </div>
    );
  }
}

export default Bundle;
