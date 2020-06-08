import { Route, Switch } from "react-router-dom";
import React, { Component } from "react";
import Resolve from "../resolve/Resolve";
import { ImportResolveState, ImportHistory, ImportTypes } from "../types";
import Importer from "../import/Importer";
import ImportSelector from "../import/import_selector";
import WebpackImport from "../import/webpack/Importer";
import { stateFromResolveKey } from "../routes";
class Home extends Component<ImportResolveState & { history: ImportHistory }> {
  render() {
    const {
      graphEdges,
      processedSourceMap,
      sourceMapFileTransform,
      graphFileTransform,
    } = this.props;

    return (
      <div className="col-container">
        <div className="right-col">
          <div className="padding">
            <Switch>
              <Route
                exact
                path="/"
                component={(h: { history: History }) => {
                  return <ImportSelector history={h.history as any} />;
                }}
              />
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
                path="/:importer/resolve"
                component={(h: { history: History }) => {
                  const state = stateFromResolveKey(
                    (h as any).location.state.key
                  );

                  if (state == null) {
                    throw new Error("missing state");
                  }

                  return (
                    <Resolve
                      history={h.history as any}
                      graphEdges={graphEdges}
                      processedSourceMap={state.processedSourceMap}
                      sourceMapFileTransform={state.sourceMapFileTransform}
                      graphFileTransform={state.graphFileTransform}
                    />
                  );
                }}
              />
            </Switch>
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
