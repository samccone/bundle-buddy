import React, { Component } from "react";
import { Link } from "react-router-dom";
// noopener noreferrer

class DescribeImport extends Component {
  constructor(props: {}) {
    super(props);
  }

  state: {} = {};

  render() {
    const selected = window.location.pathname;

    return (
      <div>
        <h1>Analyze</h1>
        <h5>How many bundles do you have?</h5>
        <div className="flex">
          <button className="type-button">One</button>
          <button className="type-button">More than one</button>
        </div>
        <h5>What bundler are you using?</h5>
        <div className="flex">
          <Link
            to="/webpack"
            aria-label="webpack project import"
            className="no-link-underline"
          >
            <button
              className={`${
                selected === "webpack" ? "selected" : ""
              } type-button  rollup-import`}
            >
              <img className="rollup-logo" src="/img/webpack_logo.png" />
              Webpack
            </button>
          </Link>
          <Link
            to="/rollup"
            aria-label="rollup project import"
            className="no-link-underline"
          >
            <button
              className={`${
                selected === "rollup" ? "selected" : ""
              } type-button rollup-import`}
            >
              <img src="/img/rollup_logo.png" className="rollup-logo" /> Rollup
            </button>
          </Link>
          <div>
            <button className="type-button rollup-import">
              See Sample Project
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default DescribeImport;
