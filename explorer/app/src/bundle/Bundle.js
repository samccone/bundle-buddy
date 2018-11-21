import React, { Component } from "react";
import OverviewBarChart from "./OverviewBarChart";
import ByTypeBarChart from "./ByTypeBarChart";
import BundleMakeup from "./BundleMakeup";
import Dendrogram from "./Dendrogram";
import Network from "./Network";
import hierarchy from "./prototype/hierarchy.json";
import totalsByType from "./prototype/totalsByType.json";

import data from "./prototype/network.json";
import { stratify } from "d3-hierarchy";

// noopener noreferrer

class App extends Component {
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

    this.state = {
      hierarchy: h,
      byTypeHierarchy: byType,
      selected: null
    };

    this.changeSelected = this.changeSelected.bind(this);
  }

  changeSelected(selected) {
    this.setState({ selected });
  }

  render() {
    let edges = [],
      nodes = [],
      nodeMap = {};

    if (this.state.selected) {
      edges = data.edges.filter(d => {
        return (
          d.source === this.state.selected || d.target === this.state.selected
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
    console.log(data);
    return (
      <div className="App">
        <header className="App-header">
          <h1>Bundle Buddy</h1>

          <p>One Bundle</p>
          <p>Multiple Bundles</p>
          <p>Bundles Over Time</p>
        </header>
        <ByTypeBarChart hierarchy={this.state.byTypeHierarchy} />
        <Network />
        {false && (
          <OverviewBarChart
            hierarchy={this.state.hierarchy}
            nodeMap={nodeMap}
          />
        )}{" "}
        <div>
          {false && this.state.hierarchy && (
            <BundleMakeup
              changeSelected={this.changeSelected}
              nodeMap={nodeMap}
              hierarchy={this.state.hierarchy}
              selected={this.state.selected}
            />
          )}
        </div>
        <div>
          <p>{this.state.selected}</p>

          {this.state.selected && <Dendrogram nodes={nodes} edges={edges} />}
        </div>
      </div>
    );
  }
}

export default App;
