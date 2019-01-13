import React, { Component } from "react";
import { Link } from "react-router-dom";
// noopener noreferrer

class DescribeImport extends Component {
  constructor(props: {}) {
    super(props);
  }

  state: {} = {};

  render() {
    return (
      <div>
        <h1>Analyze</h1>
        <p>How many bundles does your project have?</p>
        <p> One or more than one</p>
        <p>Which bundler are you using?</p>
        <div className="flex">
          <Link to="/webpack" aria-label="webpack project import">
            <button className="type-button">
              <img className="webpack-logo" src="img/webpack_logo.png" />
            </button>
          </Link>
          <Link
            to="/rollup"
            aria-label="rollup project import"
            className="no-link-underline"
          >
            <button className="type-button rollup-import">
              <img src="img/rollup_logo.png" className="rollup-logo" /> Rollup
            </button>
          </Link>
          <div>
            <button className="type-button rollup-import">
              Try a sample project
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default DescribeImport;
