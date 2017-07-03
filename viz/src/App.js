import React, { Component } from "react";
import "./flexboxgrid.min.css";
import Overview from "./Overview";
import NetworkAnalysis from "./NetworkAnalysis";
import BottomPanel from "./BottomPanel";
import numeral from "numeral";
import { stripHashes } from "./util";
import { forceSimulation, forceLink } from "d3-force";

const filterNetwork = (name, nodes, links) => {
  if (!name) {
    return { nodes, links };
  }

  if (!links[0].target.id) {
    const simulation = forceSimulation().force(
      "link",
      forceLink().id(d => d.id)
    );
    simulation.nodes(nodes);
    simulation.force("link").links(links);
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
      updateSelectedSource,
      state
    } = this.props.appState;
    const {
      outputNodesSummary,
      overlapFilesCount,
      networkNodes,
      networkLinks,
      outputFiles,
      sourceFiles
    } = this.props.passedData;

    const { nodes, links } = filterNetwork(
      state.selectedBundles,
      networkNodes,
      networkLinks
    );

    let summarySentence;

    if (state.selectedBundles) {
      const matchFile = outputFiles.find(d => d[0] === state.selectedBundles);
      console.log("matchFile", matchFile);
      summarySentence = (
        <h2 className="light-font">
          Bundle <b>{stripHashes(state.selectedBundles)} </b>
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
          <b>{Object.keys(sourceFiles).length} </b>
          files were bundled into
          <b>{outputFiles.length} </b>
          bundles. Of those,
          <b> {overlapFilesCount} </b>
          bundles have overlaps
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
                inputFiles={Object.keys(sourceFiles)}
                outputFiles={outputFiles}
                updateSelectedBundles={updateSelectedBundles}
                selectedBundles={state.selectedBundles}
              />
            </div>
            <div className="col-xs-8 col-md-9 main-panel">
              <div className="networkAnalysis">
                <NetworkAnalysis
                  nodes={nodes}
                  links={links}
                  height={600}
                  selectedBundles={state.selectedBundles}
                  selectedSource={state.selectedSource}
                  updateSelectedBundles={updateSelectedBundles}
                  updateSelectedSource={updateSelectedSource}
                  outputNodeSummary={outputNodesSummary}
                />
              </div>
              <div className="row bottombar">
                <BottomPanel summarySentence={summarySentence} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
