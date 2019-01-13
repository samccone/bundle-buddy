import React, { Component } from "react";
import { Link } from "react-router-dom";

// noopener noreferrer
// <p>
// <Link to="/import">Import</Link>
// </p>

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
        <div className="flex nav space-between padding">
          <Link to="/">
            <svg viewBox="0 0 24 24" width="2em" height="1em">
              <title>house</title>
              <g fill="#111111">
                <path
                  d="M22.625,8.219l-10-8a1,1,0,0,0-1.25,0l-10,8A1,1,0,0,0,1,9V22a1,1,0,0,0,1,1H9V15h6v8h7a1,1,0,0,0,1-1V9A1,1,0,0,0,22.625,8.219Z"
                  fill="#111111"
                />
              </g>
            </svg>
            Home
          </Link>

          <Link to="/bundle">
            <svg viewBox="0 0 24 24" width="2em" height="1em">
              <title>bookmark</title>
              <g fill="#111111">
                <path
                  d="M22,24,12,18,2,24V3A3,3,0,0,1,5,0H19a3,3,0,0,1,3,3Z"
                  fill="#111111"
                />
              </g>
            </svg>
            Saved Bundles
          </Link>
        </div>
      </header>
    );
  }
}

export default Header;
