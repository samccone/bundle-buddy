import React, { Component } from "react";
import { cleanGraph } from './graph_process';
import { statsToGraph } from "./stats_to_graph";

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

  processFiles() {
    if (this.statsInput != null && this.statsInput.current != null) {
      const statsFile = this.statsInput.current.files[0];
      const reader = new FileReader()
      reader.onload = (e) => {
        const target = (e.target as EventTarget & { result: string });
        const stats = JSON.parse(target.result);
        console.log(cleanGraph(statsToGraph(stats)));
      }

      reader.readAsText(statsFile);
    }
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Bundle Buddy</h1>
        </header>

        <label htmlFor="stats" >stats.json</label>
        <input id="stats" type="file" ref={this.statsInput}></input>
        <label htmlFor="sourcemap">sourcemap</label>
        <input id="sourcemap" type="file" ref={this.sourceMapInput}></input>
        <button onClick={() => this.processFiles()}>Process</button>
      </div>
    );
  }
}

export default Import;
