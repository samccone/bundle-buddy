import React, { Component } from "react";
import { sum } from "d3-array";
import { scaleLinear, scaleQuantize } from "d3-scale";
import numeral from "numeral";
import {
  blueGrey100,
  deepPurple200,
  deepPurple400,
  deepPurple600,
  deepPurple900,
  redA400,
  teal100
} from "material-ui/styles/colors";

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
    const { slices, stats } = this.props;

    const fileStyle = {
      height: 20
    };

    const pStyle = {
      marginTop: 2
    };

    return (
      <div>
        <div className="row">
          <div className="col-xs-12">
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
                overlap
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
