import React, { Component } from "react";
import { cleanGraph } from './graph_process';
import { statsToGraph } from "./stats_to_graph";

// noopener noreferrer


function readFileAsText(file: File): Promise<string> {
  return new Promise((res, rej) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const target = (e.target as EventTarget & { result: string });
        res(target.result)
      }

      reader.onabort = reader.onerror = (e) => Promise.reject(e);
      reader.readAsText(file);

  });
}

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
