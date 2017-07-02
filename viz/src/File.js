import React, { Component } from "react";
import { scaleLinear, scaleQuantize } from "d3-scale";
import numeral from "numeral";
import { teal100 } from "material-ui/styles/colors";

class Files extends Component {
  createSlices(slices, totalLines) {
    const pctScale = scaleLinear().domain([0, totalLines]).range([0, 100]);
    const color = scaleQuantize()
      .domain([1, 5])
      .range([teal100, "#ffafb6", "#ff616f", "#d21c5b", "#6d253e"]);

    return slices.map((d, i) =>
      <div
        key={`slice-${i}`}
        style={{
          width: `${pctScale(d.value)}%`,
          height: "100%",
          background: color(d.key),
          display: "inline-block"
        }}
      />
    );
  }

  render() {
    const {
      name,
      slices,
      stats,
      updateSelectedBundles,
      sourceFiles,
      className
    } = this.props;

    const fileStyle = {
      height: 20
    };

    const pStyle = {
      marginTop: 2
    };

    // let sourceFileTable;

    // if (className) {
    //   sourceFileTable = (
    //     <div className="row">
    //       <div className="col-xs-12">
    //         <BundleFileTable rows={sourceFiles} />
    //       </div>
    //     </div>
    //   );
    // }
    return (
      <div className={`bundle-file-info ${className}`}>
        <div className="row" onClick={() => updateSelectedBundles(name)}>
          <div className="col-xs-12">
            <div className="row">
              <div className="col-xs-12 bundle-file-name">
                {name}
              </div>
            </div>
            <div className="file" style={fileStyle}>
              {this.createSlices(slices, stats.totalLines)}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-6">
            <p style={pStyle}>
              <small>
                <b>
                  {numeral(stats.totalOverlapLines / stats.totalLines).format(
                    "0.0%"
                  )}
                </b>{" "}
                lines shared with {stats.containedInBundles.length - 1} bundles.
              </small>
            </p>
          </div>
          <div className="col-xs-6">
            <p style={{ ...pStyle, textAlign: "right" }}>
              <small>
                <b>{numeral(stats.totalLines).format("0a")}</b> input lines
              </small>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default Files;
