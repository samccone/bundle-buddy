import { Route, Switch, Link } from "react-router-dom";
import React, { Component } from "react";
import { History } from "history";
import { ImportResolveState } from "../types";
import Describe from "./Describe";
import WebpackImport from "./webpack/Import";
import RollupImport from "./rollup/Import";

// noopener noreferrer

class Import extends Component {
  render() {
    return (
      <div>
        <Describe />
        <Switch>
          <Route exact path="/webpack" component={WebpackImport} />
          <Route exact path="/webpack/resolve" component={WebpackImport} />
          <Route exact path="/rollup" component={RollupImport} />
          <Route exact path="/rollup/resolve" component={RollupImport} />
        </Switch>
      </div>
    );
  }
}

export default Import;
