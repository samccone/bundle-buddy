import { Route, Switch, Link } from "react-router-dom";
import React, { Component, Suspense, lazy } from "react";
import { History } from "history";
import { ImportResolveState } from "../types";
const Describe = lazy(() => import("./Describe"));
const WebpackImport = lazy(() => import("./webpack/Import"));
const RollupImport = lazy(() => import("./rollup/Import"));

// noopener noreferrer

class Import extends Component {
  constructor(props: {}) {
    super(props);
  }

  render() {
    return (
      <div>
        <Suspense fallback={<div>Loading...</div>}>
          <Describe />
          <Switch>
            <Route
              exact
              path="/webpack"
              component={({history}: {history: History<ImportResolveState>}) => {
                return <WebpackImport selected history={history} />
              }}
            />
            <Route exact path="/rollup" component={RollupImport} />
          </Switch>
        </Suspense>
      </div>
    );
  }
}

export default Import;