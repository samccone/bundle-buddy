import { Route, Switch, Link } from "react-router-dom";
import React, { Component, Suspense, lazy } from "react";
import { cleanGraph } from "./graph_process";
import { statsToGraph } from "./stats_to_graph";
import { readFileAsText } from './file_reader';


const Describe = lazy(() => import("./Describe"));
const WebpackImport = lazy(() => import("./webpack/Import"));
const RollupImport = lazy(() => import("./rollup/Import"));

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
        <Suspense fallback={<div>Loading...</div>}>
          <Switch>
            <Route exact path="/import" component={Describe}></Route>
            <Route exact path="/import/webpack" component={WebpackImport}></Route>
            <Route exact path="/import/rollup" component={RollupImport}></Route>
          </Switch>
        </Suspense>
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
