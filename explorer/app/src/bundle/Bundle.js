import React, { Component } from "react";
import ByTypeBarChart from "./ByTypeBarChart";
import Report from "./Report";
import FileDetails from "./FileDetails";
import RippleChart from "./RippleChart";
import Treemap from "./Treemap";

import DEFAULT_TOTALS from "./prototype-semiotic/totalsByType.json";
import DEFAULT_NETWORK from "./prototype-semiotic/trimmed-network.json";
import DEFAULT_HIERARCHY from "./prototype-semiotic/hierarchy.json";

import { colors } from "../theme";

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

      if (root !== true) {
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

class Bundle extends Component {
  constructor(props) {
    super(props);

    this.changeSelected = this.changeSelected.bind(this);

    //TODO change to URI encode
    this.state = {
      selected: props.selected,
      counts: countsFromNetwork(props.trimmedNetwork || DEFAULT_NETWORK)
    };
  }

  changeSelected(selected) {
    // console.log(selected);
    window.history.pushState(
      { selected },
      "",
      selected
        ? `${window.location.origin}${window.location
            .pathname}?selected=${selected}`
        : `${window.location.origin}${window.location.pathname}`
    );
    this.setState({ selected });
  }

  render() {
    const network = this.props.trimmedNetwork || DEFAULT_NETWORK;
    const totalsByType = this.props.rollups || DEFAULT_TOTALS;
    const hierarchy = DEFAULT_HIERARCHY;
    const duplicateNodeModules = this.props.duplicateNodeModules || {};
    const name = "Project Name";

    let edges = network.edges || [],
      nodes = network.nodes || [];

    const max =
      network &&
      network.nodes &&
      network.nodes.sort((a, b) => b.totalBytes - a.totalBytes)[0].totalBytes;

    const directories = totalsByType.directories
      .sort((a, b) => b.totalBytes - a.totalBytes)
      .map(d => d.name);

    const directoryColors = {};
    let i = 0;
    directories.forEach(d => {
      if (d.indexOf("node_modules") !== -1) {
        directoryColors[d] = "url(#dags)";
      } else {
        directoryColors[d] = colors[i] || "black";
        i++;
      }
    });

    totalsByType.directories.forEach(d => {
      d.color = directoryColors[d.name];
    });

    network.nodes.forEach(d => {
      const index = d.id.indexOf("/");
      if (index !== -1) d.directory = d.id.slice(0, index);
      else d.directory = "No Directory";
      d.text =
        (d.directory !== "No Directory" &&
          d.id.replace(d.directory + "/", "")) ||
        d.id;

      const lastSlash = d.id.lastIndexOf("/");
      d.fileName = d.id.slice(lastSlash !== -1 ? lastSlash + 1 : 0);
      d.count = this.state.counts[d.id];
    });

    // console.log(network, nodes, edges);
    const total = totalsByType.value;

    return (
      <div>
        <div>
          <ByTypeBarChart
            totalsByType={totalsByType}
            network={network}
            changeSelected={this.changeSelected}
            total={total}
            name={name}
          />
        </div>
        <div>
          <Report
            totalsByType={totalsByType}
            network={network}
            changeSelected={this.changeSelected}
            total={total}
            duplicateNodeModules={duplicateNodeModules}
          />
        </div>
        <div className="flex page">
          <div className="panel">
            <FileDetails
              total={total}
              network={network}
              changeSelected={this.changeSelected}
              directoryColors={directoryColors}
            />
          </div>
          <div className="panel large">
            {this.state.selected
              ? <RippleChart
                  changeSelected={this.changeSelected}
                  nodes={nodes.map(d => Object.assign({}, d))}
                  edges={edges.map(d => Object.assign({}, d))}
                  max={max}
                  selected={this.state.selected}
                  directories={directories}
                  directoryColors={directoryColors}
                />
              : <Treemap
                  hierarchy={hierarchy}
                  name={name}
                  bgColorsMap={directoryColors}
                  changeSelected={this.changeSelected}
                />}
          </div>
        </div>
      </div>
    );
  }
}

export default Bundle;
