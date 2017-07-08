import React, { Component } from "react";
import File from "./File";

class Overview extends Component {
  isSelected(name, selectedBundles) {
    if (selectedBundles === null) {
      return false;
    }

    return name === selectedBundles;
  }

  render() {
    const { outputFiles, updateSelectedBundles, selectedBundles } = this.props;
    const overlapFiles = outputFiles.filter(d => d[2].highestBundle > 1);

    return (
      <div className={selectedBundles !== null ? "active-filter" : ""}>
        {overlapFiles.map(d =>
          <File
            className={this.isSelected(d[0], selectedBundles) ? "selected" : ""}
            key={d[0]}
            name={d[0]}
            slices={Object.values(d[3])}
            stats={d[2]}
            updateSelectedBundles={updateSelectedBundles}
          />
        )}
      </div>
    );
  }
}

export default Overview;
