import React, { Component } from "react";
import Introduction from "./Introduction";
import Guide from "./Guide";
import Import from "../import/Import";
import Resolve from "../resolve/Resolve";

// <Route path="/import" component={Import} />

class Home extends Component {
  render() {
    const { history, graphNodes, processedSourceMap } = this.props;

    return (
      <div className="col-container">
        <div className="left-col border-right">
          <div className="padding">
            <Introduction />
            <Guide />
          </div>
        </div>
        <div className="right-col">
          <div className="padding">
            <Import />

            {graphNodes &&
              processedSourceMap &&
              <Resolve
                history={history}
                graphNodes={graphNodes}
                processedSourceMap={processedSourceMap}
              />}
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
