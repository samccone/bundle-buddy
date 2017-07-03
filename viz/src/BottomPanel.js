import React, { Component } from "react";
import { select } from "d3-selection";
import { scaleLinear, scaleQuantize } from "d3-scale";

const width = 400;
const height = 500;

function drawFile({ outputFile }) {
  const svg = select("svg#fileMap");

  console.log("outputfile", outputFile);

  if (outputFile) {
    let totalCount = 0;
    const files = Object.keys(outputFile[1])
      .map(d => {
        return {
          name: d,
          ...outputFile[1][d]
        };
      })
      .sort((a, b) => b.inBundleCount - a.inBundleCount)
      .map(d => {
        d.totalCount = totalCount;
        totalCount += d.count;
        return d;
      });

    const chunks = svg.select("g.chunks").selectAll("rect").data(files);

    const yScale = scaleLinear()
      .domain([0, outputFile[2].totalLines])
      .range([0, height]);
    chunks
      .enter()
      .append("rect")
      .merge(chunks)
      .attr("width", 200)
      .attr("y", d => yScale(d.totalCount))
      .attr("height", d => yScale(d.count));
  }
}

class BottomPanel extends Component {
  componentDidMount() {
    drawFile(this.props);
  }

  render() {
    const { summarySentence } = this.props;

    return (
      <div className="col-xs-12">
        {summarySentence}

        <svg id="fileMap" width={width} height={height}>
          <g className="chunks" />
          <g className="annotations" />
        </svg>
      </div>
    );
  }
}

export default BottomPanel;
