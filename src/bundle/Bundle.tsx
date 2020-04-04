import React, { Component } from "react";
import ByTypeBarChart from "./ByTypeBarChart";
import Report from "./Report";
import OverviewBarChart from "./FileDetails";
import RippleChart from "./RippleChart";
import Treemap from "./Treemap";
import { colors } from "../theme";
import {
  BundleProps,
  BundleState,
  TrimmedNetwork,
  BundleNetworkCount
} from "../types";

const _untypedByTypeByChart: any = ByTypeBarChart;
const _untypedReport: any = Report;

// noopener noreferrer
function countsFromNetwork(
  network: TrimmedNetwork
): { [target: string]: BundleNetworkCount } {
  const d: { [target: string]: BundleNetworkCount } = {};

  for (const n of network.edges) {
    if (d[n.target] == null) {
      d[n.target] = {
        requiredBy: new Set(),
        requires: new Set()
      };
    }

    (d[n.target].requires as Set<string>).add(n.source);

    if (d[n.source] == null) {
      d[n.source] = {
        requiredBy: new Set(),
        requires: new Set()
      };
    }
  }

  const keys = Object.keys(d);

  for (const k of keys) {
    for (const k2 of keys) {
      if (k !== k2 && (d[k2].requires as Set<string>).has(k)) {
        (d[k].requiredBy as Set<string>).add(k2);
      }
    }
  }

  for (const k of keys) {
    d[k] = {
      requiredBy: Array.from(d[k].requiredBy),
      requires: Array.from(d[k].requires)
    };
  }

  function countTransitiveRequires(
    moduleName: string,
    seen: Set<string>,
    graph: { [t: string]: BundleNetworkCount },
    root: boolean
  ): number {
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
    const seen: Set<string> = new Set();
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

class Bundle extends Component<BundleProps, BundleState> {
  constructor(props: BundleProps) {
    super(props);

    this.changeSelected = this.changeSelected.bind(this);

    this.state = {
      selected: props.selected,
      counts: countsFromNetwork(props.trimmedNetwork)
    };
  }

  download() {
    const blob = new Blob([JSON.stringify(this.props)], {type : 'application/json'});
    const objectURL = URL.createObjectURL(blob);
    const a: HTMLAnchorElement = document.createElement('a');
    a.setAttribute('download', 'bundle-buddy-share.json');
    a.href = objectURL;
    a.click();
  }

  changeSelected(selected: string) {
    window.history.pushState(
      { ...window.history.state, selected },
      "",
      selected
        ? `${window.location.origin}${
            window.location.pathname
          }?selected=${encodeURIComponent(selected)}`
        : `${window.location.origin}${window.location.pathname}`
    );
    this.setState({ selected });
  }

  render() {
    const network = this.props.trimmedNetwork;
    const totalsByType = this.props.rollups;
    const hierarchy = this.props.hierarchy;
    const duplicateNodeModules = this.props.duplicateNodeModules || {};

    let edges = network.edges || [],
      nodes = network.nodes || [];

    const max =
      network &&
      network.nodes &&
      network.nodes.sort((a, b) => {
        if (a.totalBytes == null || b.totalBytes == null) {
          return 0;
        }
        return b.totalBytes - a.totalBytes;
      })[0].totalBytes;

    const directories = totalsByType.directories
      .sort((a, b) => b.totalBytes - a.totalBytes)
      .map(d => d.name);

    const directoryColors: { [dir: string]: string } = {};
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

    const total = totalsByType.value;

    return (
      <div>
        <button onClick={() => this.download()}>download analysis</button>
        <div>
          <_untypedByTypeByChart
            totalsByType={totalsByType}
            network={network}
            changeSelected={this.changeSelected}
            total={total}
          />
        </div>
        <div>
          <_untypedReport duplicateNodeModules={duplicateNodeModules} />
        </div>
        <div className="flex page">
          <div className="panel">
            <OverviewBarChart
              total={total}
              network={network}
              changeSelected={this.changeSelected}
              directoryColors={directoryColors}
            />
          </div>
          <div className="panel large">
            {this.state.selected ? (
              <RippleChart
                changeSelected={this.changeSelected}
                nodes={nodes.map(d => Object.assign({}, d))}
                edges={edges.map(d => Object.assign({}, d))}
                max={max}
                selected={this.state.selected}
                directories={directories}
                directoryColors={directoryColors}
              />
            ) : (
              <Treemap
                hierarchy={hierarchy}
                bgColorsMap={directoryColors}
                changeSelected={this.changeSelected}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Bundle;
