import React, { Component } from "react";

class BottomPanel extends Component {
  render() {
    const { summarySentence } = this.props;

    return (
      <div className="col-xs-12">
        {summarySentence}
      </div>
    );
  }
}

export default BottomPanel;
