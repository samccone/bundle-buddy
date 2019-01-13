import React, { Component } from "react";
import Introduction from "./Introduction";
import Guide from "./Guide";
import Import from "../import/Import";

// <Route path="/import" component={Import} />
// <Route
//   path="/resolve"
//   component={(h: {
//     location: Location<ImportResolveState>;
//     history: History;
//   }) => {
//     return (
//       <Resolve
//         history={h.history}
//         graphNodes={h.location.state.graphNodes}
//         processedSourceMap={
//           h.location.state.processedSourceMap
//         }
//       />
//     );
//   }}
// />
class Home extends Component {
  render() {
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
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
