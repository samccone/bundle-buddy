import React, { Component } from "react";
import {Link} from "react-router-dom";

// noopener noreferrer

class Header extends Component {
  render() {
    return (
      <header className="App-header flex">
        <div className="panel bottom">
          <div className="relative">
            <img className="logo" src="/icon.png" width="60" height="60" />
            <h1>Bundle Buddy</h1>
          </div>
          <div className="flex space-between">
            <p>
              <Link to="/">About</Link>
            </p>
            <p>
              <Link to="/import">Import</Link>
            </p>
            <p>
              <Link to="/bundle">Bundle</Link>
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

export default Header;
