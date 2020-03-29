import { Route, Switch } from "react-router-dom";
import React, { Component } from "react";
import { History } from "history";
import Describe from "./Describe";
import WebpackImport from "./webpack/Import";
import RollupImport from "./rollup/Import";
import { ImportTypes } from "../types";

// noopener noreferrer

class Import extends Component<{imported:boolean}> {
  render() {
    const {imported} = this.props
    return (
      <div>
        <Switch>
          <Route exact path="/" component={
            (h: {history: History}) => {
              return (
                <Describe history={h.history as any} />
              )
            }
           }
          />
          <Route exact path="/webpack" 
            component={
              (h: {history: History}) => {
                return (<WebpackImport
                  graphFileName='stats.json'
                  imported={false}
                  history={h.history as any}
                  importType={ImportTypes.WEBPACK}
                />)
              }
              } />
          <Route exact path="/webpack/resolve" component={
            (h: {history: History}) => {
            return (<WebpackImport 
              graphFileName='stats.json'
              importType={ImportTypes.WEBPACK}
              imported={imported} history={h.history as any} />);
            }
           }
          />
          <Route exact path="/rollup" component={(h: {history: History}) => {
            return <RollupImport 
              importType={ImportTypes.ROLLUP}
              graphFileName="graph.json" imported={false} history={h.history as any}/>
          }}
          />
            <Route exact path="/rollup/resolve" component={
            (h: {history: History}) => {
            return (<RollupImport 
              importType={ImportTypes.ROLLUP}
              graphFileName='graph.json'
              imported={imported} history={h.history as any} />);
            }
           }
          />
          <Route exact path="/rome" component={(h: {history: History}) => {
            return <RollupImport 
              importType={ImportTypes.ROME}
              graphFileName="bundlebuddy.json" imported={false} history={h.history as any}/>
          }}
          />
            <Route exact path="/rome/resolve" component={
            (h: {history: History}) => {
            return (<RollupImport 
              importType={ImportTypes.ROME}
              graphFileName='bundlebuddy.json'
              imported={imported} history={h.history as any} />);
            }
           }
          />
        </Switch>
      </div>
    );
  }
}

export default Import;
