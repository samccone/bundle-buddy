import React, { Component } from "react";
import "./flexboxgrid.min.css";
import "./App.css";
import Overview from "./Overview";
import NetworkAnalysis from "./NetworkAnalysis";
import data from "./data/output.json";
import network from "./data/network.json";
import { max, sum } from "d3-array";
import { nest } from "d3-collection";

//TODO move this data transformation into the scripts
let relatedNodes = [];
let orphanNodes = [];

data.bundleFileStats.forEach(d => {
  const files = Object.values(d[1]);
  const stats = {
    highestBundle: max(files, v => v.inBundleCount),
    totalLines: sum(files, v => v.count),
    totalOverlapLines: sum(files, v => (v.inBundleCount > 1 ? v.count : 0))
  };

  stats.pctOverlap = stats.totalOverlapLines / stats.totalLines;
  d.push(stats);

  if (stats.highestBundle > 1) {
    relatedNodes.push(d);
  } else {
    orphanNodes.push(d);
  }
});

const outputFiles = data.bundleFileStats
  .sort((a, b) => {
    return (
      b[2].highestBundle +
      b[2].pctOverlap -
      (a[2].highestBundle + a[2].pctOverlap)
    );
  })
  .map(d => {
    d[1] = nest()
      .key(d => d.inBundleCount)
      .rollup(leaves => sum(leaves, l => l.count))
      .entries(Object.values(d[1]))
      .map(d => {
        d.key = parseInt(d.key);
        return d;
      })
      .sort((a, b) => b.key - a.key);

    return d;
  });

relatedNodes = relatedNodes.map(d => d[0]);
orphanNodes = orphanNodes.map(d => d[0]);
const overlapFilesCount = relatedNodes.length;
//Filter out only links that are reated to source nodes with shared bundle code
const networkLinks = network.graph.links.filter(
  d => relatedNodes.indexOf(d.target) !== -1
);

//Add in all related source nodes
networkLinks.forEach(d => {
  if (relatedNodes.indexOf(d.source) === -1) {
    relatedNodes.push(d.source);
  }
});

console.log("data", data, outputFiles);
const outputNodesSummary = {};
outputFiles.forEach(d => (outputNodesSummary[d[0]] = d[1]));

const networkNodes = network.graph.nodes.filter(
  d => relatedNodes.indexOf(d.id) !== -1
);
class App extends Component {
  render() {
    return (
      <div className="App wrap container-fluid">
        <div className="App-header">
          <div className="row">
            <div className="col-xs-12">
              <h1>Bundle Buddy</h1>
            </div>
          </div>
        </div>
        <div className="App-body">
          <div className="row">
            <div className="col-xs-12">
              <h2>{`${Object.keys(data.sourceFiles)
                .length} files were bundled into ${outputFiles.length} bundles. Of those, ${overlapFilesCount} bundles have overlaps`}</h2>
            </div>
          </div>

          <div className="row">
            <div className="col-xs-4 col-md-3">
              <Overview
                inputFiles={Object.keys(data.sourceFiles)}
                outputFiles={outputFiles}
              />
            </div>
            <div className="col-xs-8 col-md-9">
              <NetworkAnalysis
                nodes={networkNodes}
                links={networkLinks}
                outputNodeSummary={outputNodesSummary}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
