import { Route, Switch, Link } from "react-router-dom";
import React, { Component } from "react";
import { History } from "history";
import { ImportResolveState } from "../types";
import Describe from "./Describe";
import WebpackImport from "./webpack/Import";
import RollupImport from "./rollup/Import";

// noopener noreferrer

class Import extends Component<{imported:boolean}> {
  render() {
    const {imported} = this.props
    return (
      <div>
        <Describe />
        <Switch>
          <Route exact path="/webpack" component={WebpackImport} />
          <Route exact path="/webpack/resolve" component={
            (h: {history: History}) => {
            return (<WebpackImport imported={imported} history={h.history} />);
            }
           }
          />
          <Route exact path="/rollup" component={RollupImport} />
            <Route exact path="/rollup/resolve" component={
            (h: {history: History}) => {
            return (<RollupImport imported={imported} history={h.history} />);
            }
           }
          />
        </Switch>
      </div>
    );
  }
}

export default Import;
