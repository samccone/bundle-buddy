import { Route, Switch } from "react-router-dom";
import React, { Component } from "react";
import Resolve from "../resolve/Resolve";
import { ImportResolveState, ImportHistory, ImportTypes } from "../types";
import Importer from "../import/Importer";
import ImportSelector from "../import/import_selector";
import WebpackImport from "../import/webpack/Importer";
import { stateFromResolveKey } from "../routes";
import "./home.css";

class Home extends Component<ImportResolveState & { history: ImportHistory }> {
  render() {
    const {
      graphEdges,
      processedSourceMap,
      bundledFilesTransform: sourceMapFileTransform,
      graphFileTransform,
      history,
    } = this.props;

    const state = stateFromResolveKey(history.location.state?.key);

    return (
      <div id="home">
        <section style={{ background: "var(--grey900)", color: "white" }}>
          <header className="left-panel">
            <div
              className="inner-border vertical-center"
              style={{ borderRight: `3px solid var(--grey700)` }}
            >
              <h1>Bundle Buddy</h1>
            </div>
          </header>

          <div className="right-panel">
            <p className="ft-24">
              <i>
                Visualizing what code is in your web bundle, and how it got
                there.
              </i>
            </p>
          </div>
        </section>

        <section style={{ background: "var(--primary-color)", color: "white" }}>
          <div className="left-panel">
            <div
              className="inner-border vertical-center"
              style={{ borderRight: `3px solid var(--grey300)` }}
            >
              <h2>Step 1</h2>
            </div>
          </div>
          <div className="right-panel">
            <p className="ft-18">Select the bundler you are using:</p>
            <ImportSelector history={History as any} />
          </div>
        </section>
        <section
          style={{ background: "var(--grey200)", color: "var(--grey900)" }}
        >
          <div className="left-panel">
            <div
              className="inner-border vertical-center"
              style={{ borderRight: `3px solid var(--grey300)` }}
            >
              <h2>Step 2</h2>
            </div>
          </div>

          <div className="col-container">
            <div className="right-col">
              <div className="padding">
                <Switch>
                  <Route
                    exact
                    path="/webpack"
                    component={(h: { history: History }) => {
                      return (
                        <WebpackImport
                          graphFileName="stats.json"
                          history={h.history as any}
                          importType={ImportTypes.WEBPACK}
                        />
                      );
                    }}
                  />
                  <Route
                    exact
                    path="/rollup"
                    component={(h: { history: History }) => {
                      return (
                        <Importer
                          importType={ImportTypes.ROLLUP}
                          graphFileName="graph.json"
                          history={h.history as any}
                        />
                      );
                    }}
                  />
                  <Route
                    exact
                    path="/rome"
                    component={(h: { history: History }) => {
                      return (
                        <Importer
                          importType={ImportTypes.ROME}
                          graphFileName="bundlebuddy.json"
                          history={h.history as any}
                        />
                      );
                    }}
                  />
                  <Route
                    exact
                    path="/parcel"
                    component={(h: { history: History }) => {
                      return (
                        <Importer
                          importType={ImportTypes.PARCEL}
                          graphFileName="bundle-buddy.json"
                          history={h.history as any}
                        />
                      );
                    }}
                  />
                  <Route
                    exact
                    path="/esbuild"
                    component={(h: { history: History }) => {
                      return (
                        <Importer
                          importType={ImportTypes.ESBUILD}
                          graphFileName="esbuild.json"
                          history={h.history as any}
                        />
                      );
                    }}
                  />
                  <Route
                    exact
                    path="/"
                    component={(h: { history: History }) => {
                      return (
                        <WebpackImport
                          graphFileName="stats.json"
                          history={h.history as any}
                          importType={ImportTypes.WEBPACK}
                        />
                      );
                    }}
                  />
                  <Route
                    path="/:importer/resolve"
                    component={(h: { history: History }) => {
                      return (
                        <Resolve
                          history={h.history as any}
                          graphEdges={graphEdges}
                          processedBundle={processedSourceMap}
                          sourceMapFileTransform={sourceMapFileTransform}
                          graphFileTransform={graphFileTransform}
                        />
                      );
                    }}
                  />
                </Switch>
              </div>
            </div>
          </div>
        </section>
        {state && graphEdges && (
          <section style={{ color: "var(--grey900)" }}>
            <div className="left-panel">
              <div
                className="inner-border vertical-center"
                style={{ borderRight: `3px solid var(--grey300)` }}
              >
                <h2>Step 3</h2>
              </div>
            </div>
            <div className="right-panel">
              <p className="ft-18">Reconcile file paths:</p>

              <Resolve
                history={history}
                graphEdges={graphEdges}
                processedBundle={state.processedSourceMap}
                sourceMapFileTransform={state.bundledFilesTransform}
                graphFileTransform={state.graphFileTransform}
              />
            </div>
          </section>
        )}
      </div>
    );
  }
}

export default Home;
