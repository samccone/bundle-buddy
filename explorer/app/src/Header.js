import React, { Component } from "react";

// noopener noreferrer

class Heaer extends Component {
  render() {
    return (
      <header className="App-header flex">
        <div className="panel bottom">
          <h1>Bundle Buddy</h1>
          <div className="flex space-between">
            <p>
              <a href="/">About</a>
            </p>
            <p>
              <a href="/import">Import</a>
            </p>
            <p>
              <a href="/bundle">Bundle</a>
            </p>
          </div>
        </div>
        <div className="overview-barchart">
          <p>placeholder for bar chart view</p>
        </div>
      </header>
    );
  }
}

export default Heaer;
