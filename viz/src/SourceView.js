import React, { Component } from "react";
import { colorScale } from "./color";

export default class SourceView extends Component {
  render() {
    if (this.props.selectedSource === null) {
      return null;
    }

    const matchFile = this.props.selectedSource;
    const fileStats = this.props.perFileStats.find(
      thing => thing[0] === matchFile
    )[1];
    const tableRows = this.props.sourceFiles[
      matchFile
    ].source.map((lineContent, i) => {
      const lineNumber = i + 1;
      const bundleHits = fileStats[lineNumber]
        ? fileStats[lineNumber].inBundles
        : [];
      const bundleHitsForThisLine = bundleHits.length;
      return (
        <tr key={`${lineNumber}-${this.props.selectedSource}`}>
          <td
            style={{ borderColor: colorScale(bundleHitsForThisLine) }}
            title={bundleHits.join("\n")}
          >
            {bundleHitsForThisLine}
          </td>
          <td
            className={`source-line ${bundleHitsForThisLine > 0
              ? "in-use"
              : "unused"}`}
          >
            <pre>
              {lineContent}
            </pre>
          </td>
        </tr>
      );
    });

    return (
      <div>
        <h5 className="viewing-file-header">
          Viewing File{" "}
          <span className="source">{this.props.selectedSource}</span>
        </h5>
        <table className="sourceView">
          <thead>
            <tr>
              <th />
              <th />
            </tr>
          </thead>
          <tbody>
            {tableRows}
          </tbody>
        </table>
      </div>
    );
  }
}
