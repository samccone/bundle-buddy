import React, { Component } from "react";

// noopener noreferrer

class Import extends Component {
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
        </header>
      </div>
    );
  }
}

export default Import;
