import React, { Component } from "react";
import { cleanGraph } from "./graph_process";
import { statsToGraph } from "./stats_to_graph";
import { readFileAsText } from './file_reader';

// noopener noreferrer

class Import extends Component {
  sourceMapInput?: React.RefObject<HTMLInputElement & { files: FileList }>;
  statsInput?: React.RefObject<HTMLInputElement & { files: FileList }>;

  constructor(props: {}) {
    super(props);

    this.sourceMapInput = React.createRef();
    this.statsInput = React.createRef();
    this.changeSelected = this.changeSelected.bind(this);
  }

  state: { selected: boolean | null } = {
    selected: null
  };

  changeSelected(selected: boolean) {
    this.setState({ selected });
  }

  async processFiles() {
    if (this.statsInput != null && this.statsInput.current != null) {
      const contents = await readFileAsText(this.statsInput.current.files[0]);
      const stats = JSON.parse(contents);
      console.log(cleanGraph(statsToGraph(stats)));
    }
  }

  render() {
    return (
      <div>
        <div className="col-container">
          <div className="left-col">
            <h5>Let's get started</h5>
            <p>Which bundler are you using?</p>
            <button className="type-button" aria-label="webpack project import"><img className="webpack-logo" src="img/webpack_logo.png"></img></button>
            <button className="type-button rollup-import" aria-label="rollup project import"><img src="img/rollup_logo.png"></img> Rollup</button>
          </div>
          <div className="right-col">
            <h5>What is this?</h5>
            <p>
              <b>Bundle Buddy</b> is a tool to understand  simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker inclu
            </p>
            <button>Try a sample project</button>
          </div>
        </div>
        <div>
          <label htmlFor="stats">stats.json</label>
          <input id="stats" type="file" ref={this.statsInput} />
          <label htmlFor="sourcemap">sourcemap</label>
          <input id="sourcemap" type="file" ref={this.sourceMapInput} />
          <button onClick={() => this.processFiles()}>Process</button>
        </div>
      </div>
    );
  }
}

export default Import;
