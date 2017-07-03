import React, { Component } from "react";

class BottomPanel extends Component {
  render() {
    const { summarySentence, sourceView } = this.props;

    return (
      <div className="col-xs-12">
        {summarySentence}
        {sourceView}
      </div>
    );
  }
}

export default BottomPanel;
