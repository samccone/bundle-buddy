import { Route, Switch } from "react-router-dom";
import React, { Component } from "react";
import Introduction from "./Introduction";
import Guide from "./Guide";
import Resolve from "../resolve/Resolve";
import { ImportResolveState, ImportHistory, ImportTypes } from "../types";
import Importer from "../import/Importer";
import Describe from "../import/Describe";
import WebpackImport from "../import/webpack/Importer";
class Home extends Component<ImportResolveState & { history: ImportHistory }> {
  render() {
    const {
      history,
      graphNodes,
      processedSourceMap,
      sourceMapFileTransform,
      graphFileTransform
    } = this.props;

    const imported = !!(graphNodes && processedSourceMap);

    return (
      <div className="col-container">
        <Switch>
          <Route exact path="/">
            <div className="left-col border-right">
              <div className="padding">
                <Introduction />
                <Guide />
              </div>
            </div>
          </Route>
        </Switch>
        <div className="right-col">
          <div className="padding">
            {!imported && (
              <Switch>
                <Route
                  exact
                  path="/"
                  component={(h: { history: History }) => {
                    return <Describe history={h.history as any} />;
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
              </Switch>
            )}

            {imported && (
              <Resolve
                history={history}
                graphNodes={graphNodes}
                processedSourceMap={processedSourceMap}
                sourceMapFileTransform={sourceMapFileTransform}
                graphFileTransform={graphFileTransform}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
