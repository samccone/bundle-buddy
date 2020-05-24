import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import Header from "./Header";
import TestProcess from "./TestProcess";
import ErrorBoundry from "./ErrorBoundry";
import { Location } from "history";
import {
  ImportResolveState,
  ProcessedImportState,
  ImportHistory,
} from "./types";

const Bundle = lazy(() => import("./bundle/Bundle"));
const Home = lazy(() => import("./home/Home"));

export default function App() {
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
                    location,
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
                  path="/testProcess"
                  component={({
                    location,
                  }: {
                    location: Location<ProcessedImportState>;
                  }) => {
                    return <TestProcess />;
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
                        graphEdges={h.location.state?.graphEdges}
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
