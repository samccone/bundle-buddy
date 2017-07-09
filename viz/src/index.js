import React from "react";
import { render } from "react-dom";
import AppState from "./AppState";
import "./annotations.css";
import "./index.css";
import injectTapEventPlugin from "react-tap-event-plugin";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { max, sum } from "d3-array";
import { nest } from "d3-collection";

// Default to the demo json if no file is passed.
const toLoadPath =
  new URLSearchParams((window.location.search || "").slice(1)).get("file") ||
  "/demo.json";

const target = document.querySelector("#root");
fetch(toLoadPath, { credentials: "include" })
  .then(v => v.json())
  .then(data => {
    //TODO move this data transformation into the scripts
    let relatedNodes = [];
    let orphanNodes = [];
    data.bundleFileStats.forEach(d => {
      const files = Object.values(d[1]);

      const uniqueBundles = Array.from(
        files.reduce((accum, file) => {
          for (const bundleIn of file.containedInBundles) {
            accum.add(bundleIn);
          }

          return accum;
        }, new Set([]))
      );

      const stats = {
        highestBundle: max(files, v => v.inBundleCount),
        totalLines: sum(files, v => v.count),
        totalOverlapLines: sum(files, v => (v.inBundleCount > 1 ? v.count : 0)),
        containedInBundles: uniqueBundles
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
          b[2].containedInBundles.length +
          b[2].pctOverlap -
          (a[2].containedInBundles.length + a[2].pctOverlap)
        );
      })
      .map(d => {
        d[3] = nest()
          .key(d => d.inBundleCount)
          .rollup(leaves => sum(leaves, l => l.count))
          .entries(Object.values(d[1]))
          .map(d => {
            d.key = parseInt(d.key, 10);
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

    const passedData = {
      outputNodesSummary,
      overlapFilesCount,
      networkNodes,
      networkLinks,
      outputFiles,
      perFileStats: data.perFileStats,
      sourceFiles: data.sourceFiles,
      sourceFileLinesGroupedByCommonBundle:
        data.sourceFileLinesGroupedByCommonBundle
    };

    injectTapEventPlugin();
    render(
      <Router>
        <div>
          <Route
            exact
            path="/"
            component={props => <AppState {...props} passedData={passedData} />}
          />
          <Route
            path="/:id/:hover?"
            component={props => <AppState {...props} passedData={passedData} />}
          />
        </div>
      </Router>,
      target
    );
  })
  .catch(e => {
    document.body.textContent = `Error fetching data from ${toLoadPath}, ${e}`;
  });
