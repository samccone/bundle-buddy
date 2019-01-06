import { Route, Switch, Link } from "react-router-dom";
import React, { Component, Suspense, lazy } from "react";
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
          <Switch>
            <Route exact path="/import" component={Describe}></Route>
            <Route exact path="/import/webpack" component={WebpackImport}></Route>
            <Route exact path="/import/rollup" component={RollupImport}></Route>
          </Switch>
        </Suspense>
      </div>
    );
  }
}

export default Import;
