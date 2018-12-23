import React, { Component } from "react";
import {Link} from "react-router-dom";
// noopener noreferrer

class DescribeImport extends Component {
  constructor(props: {}) {
    super(props);
  }

  state: {} = {
  };

  render() {
      return (
        <div className="col-container">
          <div className="left-col">
            <h5>Let's get started</h5>
            <p>Which bundler are you using?</p>
            <Link to="/import/webpack" aria-label="webpack project import">
                <button className="type-button"><img className="webpack-logo" src="img/webpack_logo.png"></img></button>
            </Link>
            <Link to="/import/rollup" aria-label="rollup project import" className="no-link-underline">
                <button className="type-button rollup-import"><img src="img/rollup_logo.png" className="rollup-logo"></img> Rollup</button>
            </Link>
          </div>
          <div className="right-col">
            <h5>What is this?</h5>
            <p>
              <b>Bundle Buddy</b> is a tool to understand  simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker inclu
            </p>
            <button>Try a sample project</button>
          </div>
        </div>
      )
  }
}

export default DescribeImport;