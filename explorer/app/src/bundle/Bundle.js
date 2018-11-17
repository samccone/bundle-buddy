import React, { Component } from "react";
import BundleMakeup from "./BundleMakeup";
import Dendrogram from "./Dendrogram";

// noopener noreferrer

class App extends Component {
  constructor(props) {
    super(props);

    this.changeSelected = this.changeSelected.bind(this);
  }

  state = {
    selected: null
  };

  changeSelected(selected) {
    this.setState({ selected });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Bundle Buddy</h1>

          <p>One Bundle</p>
          <p>Multiple Bundles</p>
          <p>Bundles Over Time</p>
        </header>

        <div>
          <BundleMakeup changeSelected={this.changeSelected} />
        </div>
        <div>
          <Dendrogram selected={this.state.selected} />
        </div>
      </div>
    );
  }
}

export default App;
