import React, { Component } from "react";
import { Link } from "react-router-dom";

// noopener noreferrer

class Header extends Component {
  render() {
    return (
      <header className="App-header flex baseline padding">
        <img
          className="logo"
          src="/icon.png"
          width="60"
          height="60"
          alt="Bundle Buddy logo"
        />
        <h1>Bundle Buddy</h1>
        <div className="flex space-between padding">
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
      </header>
    );
  }
}

export default Header;
