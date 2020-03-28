import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import React, { Component, Suspense, lazy } from "react";
import Header from "./Header";
import ErrorBoundry from "./ErrorBoundry";
import { History, Location } from "history";
import { ImportResolveState, ProcessedImportState } from "./types";

const Bundle = lazy(() => import("./bundle/Bundle"));
const Home = lazy(() => import("./home/Home"));
const Resolve = lazy(() => import("./resolve/Resolve"));

type T = typeof Resolve;

class App extends Component {
  state = {};

  render() {
    if (process.env.NODE_ENV === "production") {
      if (!new URLSearchParams(window.location.search).has("randal")) {
        return `no access`;
      }
    }

    return (
      <Router>
        <ErrorBoundry>
          <div className="App">
            <Header />
            <div className="Page">
              <Suspense fallback={<div>Loading...</div>}>
                <Switch>
                  <Route
                    path="/bundle"
                    component={({
                      location
                    }: {
                      location: Location<ProcessedImportState>;
                    }) => {
                      let params = new URLSearchParams(location.search);
                      return (
                        <Bundle
                          trimmedNetwork={(location.state).trimmedNetwork}
                          rollups={(location.state).rollups}
                          duplicateNodeModules={
                            (location.state).duplicateNodeModules
                          }
                          selected={params.get("selected")}
                          hierarchy={location.state.hierachy}
                        />
                      );
                    }}
                  />

                  <Route
                    path="/"
                    component={(h: {
                      location: Location<ImportResolveState>;
                      history: History;
                    }) => {
                      return (
                        <Home
                          history={h.history}
                          graphNodes={
                            h.location.state && h.location.state.graphNodes
                          }
                          processedSourceMap={
                            h.location.state &&
                            h.location.state.processedSourceMap
                          }
                          sourceMapFileTransform={
                            h.location.state &&
                            h.location.state.sourceMapFileTransform
                          }
                          graphFileTransform={
                            h.location.state &&
                            h.location.state.graphFileTransform
                          }
                        />
                      );
                    }}
                  />
                </Switch>
              </Suspense>
            </div>
          </div>
        </ErrorBoundry>
      </Router>
    );
  }
}

export default App;
