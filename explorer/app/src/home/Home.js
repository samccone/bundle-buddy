import React, { Component } from "react";

// noopener noreferrer

class Home extends Component {
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
          <p>
            <a href="/import">Import</a>
          </p>
          <p>
            <a href="/bundle">Bundle</a>
          </p>
        </header>
      </div>
    );
  }
}

export default Home;
