import React, { Component } from "react";
import { Link } from "react-router-dom";

// noopener noreferrer
class Header extends Component {
  render() {
    return (
      <header className="App-header flex baseline padding">
        <Link className="header-link flex" to="/">
          <img
            className="logo"
            src="/icon.png"
            width="30"
            height="30"
            alt="Bundle Buddy logo"
          />
          <h1>Bundle Buddy</h1>
        </Link>
      </header>
    );
  }
}

export default Header;
