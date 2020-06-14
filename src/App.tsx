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
import { stateFromProcessedKey, stateFromResolveKey } from "./routes";

const Bundle = lazy(() => import("./bundle/Bundle"));
const Home = lazy(() => import("./home/Home"));

export default function App() {
  return (
    <Router>
      <ErrorBoundry>
        <div className="App">
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
                    const state = stateFromProcessedKey(
                      (location.state as any).key
                    );
                    if (state == null) {
                      throw new Error("invalid state");
                    }

                    let params = new URLSearchParams(location.search);
                    return (
                      <div>
                        <Header />
                        <Bundle
                          trimmedNetwork={state.trimmedNetwork}
                          rollups={state.rollups}
                          duplicateNodeModules={state.duplicateNodeModules}
                          selected={params.get("selected")}
                          hierarchy={state.hierarchy}
                        />
                      </div>
                    );
                  }}
                />

                {/* TODO remove this test route */}
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
                    const state = stateFromResolveKey(
                      ((h.location.state as any) || { key: "" }).key
                    );
                    return (
                      <Home
                        history={h.history}
                        graphEdges={state?.graphEdges!}
                        processedSourceMap={state?.processedSourceMap!}
                        bundledFilesTransform={state?.bundledFilesTransform}
                        graphFileTransform={state?.graphFileTransform}
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
