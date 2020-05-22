import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import React, { Component, Suspense, lazy } from "react";
import Header from "./Header";
import ErrorBoundry from "./ErrorBoundry";
import { Location } from "history";
import {
  ImportResolveState,
  ProcessedImportState,
  ImportHistory
} from "./types";

const Bundle = lazy(() => import("./bundle/Bundle"));
const Home = lazy(() => import("./home/Home"));

class App extends Component {
  state = {};

  render() {
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
                          trimmedNetwork={location.state.trimmedNetwork}
                          rollups={location.state.rollups}
                          duplicateNodeModules={
                            location.state.duplicateNodeModules
                          }
                          selected={params.get("selected")}
                          hierarchy={location.state.hierarchy}
                        />
                      );
                    }}
                  />

                  <Route
                    path="/"
                    component={(h: {
                      location: Location<ImportResolveState>;
                      history: ImportHistory;
                    }) => {
                      return (
                        <Home
                          history={h.history}
                          graphNodes={h.location.state?.graphNodes}
                          processedSourceMap={
                            h.location.state?.processedSourceMap
                          }
                          sourceMapFileTransform={
                            h.location.state?.sourceMapFileTransform
                          }
                          graphFileTransform={
                            h.location.state?.graphFileTransform
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
