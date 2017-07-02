import React, { Component } from "react";
import "./flexboxgrid.min.css";
import Overview from "./Overview";
import NetworkAnalysis from "./NetworkAnalysis";
import data from "./data/output.json";
import numeral from "numeral";
import { max, sum } from "d3-array";
import { nest } from "d3-collection";

//TODO move this data transformation into the scripts
let relatedNodes = [];
let orphanNodes = [];
data.bundleFileStats.forEach(d => {
  const files = Object.values(d[1]);

  const uniqueBundles = Array.from(files.reduce((accum, file) => {
    for (const bundleIn of file.containedInBundles) {
      accum.add(bundleIn);
    }

    return accum;
  }, new Set([])));

  const stats = {
    highestBundle: max(files, v => v.inBundleCount),
    totalLines: sum(files, v => v.count),
    totalOverlapLines: sum(files, v => (v.inBundleCount > 1 ? v.count : 0)),
    containedInBundles: uniqueBundles,
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
    d[3] = nest()
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
const networkLinks = data.graph.links.filter(
  d => relatedNodes.indexOf(d.target) !== -1
);

//Add in all related source nodes
networkLinks.forEach(d => {
  if (relatedNodes.indexOf(d.source) === -1) {
    relatedNodes.push(d.source);
  }
});

const outputNodesSummary = {};
outputFiles.forEach(d => (outputNodesSummary[d[0]] = d[3]));

const networkNodes = data.graph.nodes.filter(
  d => relatedNodes.indexOf(d.id) !== -1
);

const filterNetwork = (name, nodes, links) => {
  if (!name) {
    return { nodes, links };
  }

  const filteredNodeKeys = [name];

  const children = [];
  const childrenLinks = links.filter(d => {
    const match =
      d.target.id === name &&
      d.source.inBundleFiles &&
      d.source.inBundleFiles.length > 1;

    if (match) {
      children.push(d.source.id);
    }

    return match;
  });

  const rootBundle = nodes.find(d => d.id === name);
  const bundleChildren = nodes.filter(
    d =>
      d.inBundleFiles &&
      d.inBundleFiles.length > 1 &&
      children.indexOf(d.id) !== -1
  );

  const bundleChildrenIds = new Set(bundleChildren.map(child => child.id));

  const grandchildrenLinks = links.filter(d => {
    return bundleChildrenIds.has(d.source.id);
  });

  const grandchildrenNodesKeys = new Set(
    grandchildrenLinks.map(v => v.target.id)
  );

  const grandchildrenNodes = nodes.filter(d =>
    grandchildrenNodesKeys.has(d.id)
  );

  return {
    nodes: [rootBundle, ...bundleChildren, ...grandchildrenNodes],
    links: childrenLinks.concat(grandchildrenLinks)
  };
};

class App extends Component {
  render() {
    const {
      updateSelectedBundles,
      clearSelectedBundles,
      state
    } = this.props.appState;
    console.log("STATE", state);

    const { nodes, links } = filterNetwork(
      state.selectedBundles,
      networkNodes,
      networkLinks
    );

    let summarySentence;

    if (state.selectedBundles) {
      const matchFile = outputFiles.find(d => d[0] === state.selectedBundles);

      summarySentence = (
        <h2 className="light-font">
          Bundle <b>{state.selectedBundles} </b>
          has
          <b> {numeral(matchFile[2].pctOverlap).format("0.0%")} </b>
          overlapping lines across
          <b> {nodes.filter(d => d.type === "output").length - 2} </b>
          bundles
        </h2>
      );
    } else {
      summarySentence = (
        <h2 className="light-font">
          <b>{Object.keys(data.sourceFiles).length} </b>
          files were bundled into
          <b>{outputFiles.length} </b>
          bundles. Of those,
          <b> {overlapFilesCount} </b>
          lightbundles have overlaps
        </h2>
      );
    }

    return (
      <div className="App wrap container-fluid">
        <div className="App-body">
          <div className="row">
            <div className="col-xs-4 col-md-3 sidebar">
              <h1>Bundle Buddy</h1>

              <Overview
                inputFiles={Object.keys(data.sourceFiles)}
                outputFiles={outputFiles}
                updateSelectedBundles={updateSelectedBundles}
                selectedBundles={state.selectedBundles}
              />
            </div>
            <div className="col-xs-8 col-md-9 main-panel">
              <NetworkAnalysis
                nodes={nodes}
                links={links}
                selectedBundles={state.selectedBundles}
                updateSelectedBundles={updateSelectedBundles}
                outputNodeSummary={outputNodesSummary}
              />
              <div className="row bottombar">
                <div className="col-xs-12">
                  {summarySentence}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
