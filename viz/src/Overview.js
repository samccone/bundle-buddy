import React, { Component } from "react";
import File from "./File";

class Overview extends Component {
  render() {
    const { inputFiles, outputFiles } = this.props;
    const overlapFiles = outputFiles.filter(d => d[2].highestBundle > 1);

    return (
      <div>
        {overlapFiles.map(d =>
          <File
            key={d[0]}
            name={d[0]}
            slices={Object.values(d[1])}
            stats={d[2]}
          />
        )}
      </div>
    );
  }
}

export default Overview;
