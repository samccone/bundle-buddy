import { Route, Switch } from "react-router-dom";
import React, { Component } from "react";
import Introduction from "./Introduction";
import Guide from "./Guide";
import Import from "../import/Import";
import Resolve from "../resolve/Resolve";
import { ImportResolveState, ImportHistory } from "../types";

class Home extends Component<ImportResolveState & { history: ImportHistory }> {
  render() {
    const {
      history,
      graphNodes,
      processedSourceMap,
      sourceMapFileTransform,
      graphFileTransform
    } = this.props;

    const imported = !!(graphNodes && processedSourceMap);

    return (
      <div className="col-container">
        <Switch>
          <Route exact path="/">
            <div className="left-col border-right">
              <div className="padding">
                <Introduction />
                <Guide />
              </div>
            </div>
          </Route>
        </Switch>
        <div className="right-col">
          <div className="padding">
            {!imported && <Import imported={imported} />}

            {imported && (
              <Resolve
                history={history}
                graphNodes={graphNodes}
                processedSourceMap={processedSourceMap}
                sourceMapFileTransform={sourceMapFileTransform}
                graphFileTransform={graphFileTransform}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
