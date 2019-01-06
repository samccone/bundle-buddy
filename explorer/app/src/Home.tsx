import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import React, { Component, Suspense, lazy } from "react";
import Header from "./Header";
import ErrorBoundry from "./ErrorBoundry";
import { Location as HistoryLocation } from "history";
import { ImportResolveState } from "./types";

// noopener noreferrer

const Bundle = lazy(() => import("./bundle/Bundle"));
const Import = lazy(() => import("./import/Import"));
const Resolve = lazy(() => import("./resolve/Resolve"));

type T = typeof Resolve;

class Home extends Component {
  constructor(props: {}) {
    super(props);
  }

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
                    component={({ location }: { location: Location }) => {
                      let params = new URLSearchParams(location.search);
                      return <Bundle selected={params.get("selected")} />;
                    }}
                  />
                  <Route path="/import" component={Import} />
                  <Route
                    path="/resolve"
                    component={({
                      location
                    }: {
                      location: HistoryLocation<ImportResolveState>;
                    }) => {
                      return (
                        <Resolve
                          graphNodes={location.state.graphNodes}
                          processedSourceMap={location.state.processedSourceMap}
                        />
                      );
                    }}
                  />
                </Switch>
              </Suspense>{" "}
            </div>
          </div>
        </ErrorBoundry>
      </Router>
    );
  }
}

export default Home;
