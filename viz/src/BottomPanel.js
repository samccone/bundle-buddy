import React, { Component } from "react";
import { select } from "d3-selection";
import { scaleLinear, scaleQuantize } from "d3-scale";
import { colorScale } from "./color";
import SourceView from "./SourceView";
import { fisheye } from "./util";
import { annotation, annotationCallout } from "d3-svg-annotation";

const width = 200;
const height = 500;

function drawFile({ outputFile, updateSelectedSource, selectedSource }) {
  const svg = select("svg#fileMap");

  if (outputFile) {
    let totalCount = 0;
    const files = Object.keys(outputFile[1])
      .map(d => {
        return {
          name: d,
          ...outputFile[1][d]
        };
      })
      .filter(d => d.inBundleCount > 1)
      .sort((a, b) => b.inBundleCount - a.inBundleCount)
      .map(d => {
        d.totalCount = totalCount;
        totalCount += d.count;
        return d;
      });

    const chunks = svg.select("g.chunks").selectAll("rect").data(files);

    const yScale = fisheye(scaleLinear())
      .domain([0, totalCount])
      .range([0, height]);
    chunks
      .enter()
      .append("rect")
      .on("click", d => updateSelectedSource(d.name))
      .merge(chunks)
      .attr("width", 100)
      .attr("fill", d => colorScale(d.inBundleCount))
      .attr("x", 100)
      .attr("y", d => yScale(d.totalCount))
      .attr(
        "height",
        d => yScale(d.totalCount + d.count) - yScale(d.totalCount)
      );

    svg.node().addEventListener("mousemove", function(d) {
      const mouseY = d.layerY - svg.node().getBoundingClientRect().top;
      yScale.distortion(2.5).focus(mouseY);
      updateRects(svg, yScale);
    });
    svg.node().addEventListener("mouseout", function(d) {
      yScale.distortion(0);
      updateRects(svg, yScale, true);
    });

    chunks.exit().remove();

    const lines = svg.select("g.chunks").selectAll("line").data(files);

    lines
      .enter()
      .append("line")
      .attr("stroke", "white")
      .merge(lines)
      .attr("x1", 0)
      .attr("x2", 200)
      .attr("y1", d => yScale(d.totalCount))
      .attr("y2", d => yScale(d.totalCount));

    lines.exit().remove();

    highlightSelected(selectedSource);
  }
}

function updateRects(svg, yScale, transition) {
  svg
    .selectAll("rect")
    .attr("y", d => yScale(d.totalCount))
    .attr("height", d => yScale(d.totalCount + d.count) - yScale(d.totalCount));

  svg
    .selectAll("line")
    .attr("y1", d => yScale(d.totalCount))
    .attr("y2", d => yScale(d.totalCount));
}

function highlightSelected(selectedSource) {
  const svg = select("svg#fileMap");

  if (selectedSource) {
    svg.selectAll("rect").classed("unselected", false);

    svg
      .selectAll("rect")
      .filter(d => d.name !== selectedSource)
      .classed("unselected", true);
  } else {
    svg.selectAll("rect").classed("unselected", false);
  }
}

class BottomPanel extends Component {
  componentDidMount() {
    drawFile(this.props);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.selectedBundles !== this.props.selectedBundles) {
      drawFile(this.props);
    } else if (prevProps.selectedSource !== this.props.selectedSource) {
      highlightSelected(this.props.selectedSource);
    }
  }

  summarizeOverlapInfo(sourceOverlapInfo) {
    let ret = "";

    if (sourceOverlapInfo === undefined) {
      return ret;
    }

    for (const bundleGroupKey of Object.keys(sourceOverlapInfo)) {
      const bundleGroup = sourceOverlapInfo[bundleGroupKey];
      ret += `Lines ${bundleGroup.lines
        .sort((a, b) => a - b)
        .join(",")} appear in bundles ${bundleGroup.bundles.join(",")}\n`;
    }

    return ret;
  }

  render() {
    const {
      summarySentence,
      selectedSource,
      sourceFiles,
      perFileStats,
      selectedBundles
    } = this.props;

    let sourceFile, bundleInfo;

    if (!selectedBundles) {
      bundleInfo = (
        <div>
          <p>
            <b>See details by:</b> Clicking on a file in the left nav, or a
            bundle in the network graph
          </p>
        </div>
      );
    } else if (!selectedSource && selectedBundles) {
      sourceFile = (
        <p style={{ marginLeft: 20 }}>
          Click on a file on the left to look at the shared lines of code
        </p>
      );
    } else if (selectedSource) {
      sourceFile = (
        <div
          className="source-container"
          style={{
            display: selectedSource === null ? "none" : "block"
          }}
        >
          <p className="overlap-info">
            {this.summarizeOverlapInfo(
              this.props.sourceFileLinesGroupedByCommonBundle[
                this.props.selectedSource
              ]
            )}
          </p>
          <SourceView
            selectedSource={selectedSource}
            perFileStats={perFileStats}
            sourceFiles={sourceFiles}
          />
        </div>
      );
    }

    return (
      <div>
        <div className="col-xs-12">
          {summarySentence}
          {bundleInfo}
        </div>
        <div className="col-xs-12">
          <div className="source-details">
            <svg id="fileMap" width={width} height={height}>
              <g className="chunks" />
              <g className="annotations" />
            </svg>
            {sourceFile}
          </div>
        </div>
      </div>
    );
  }
}

export default BottomPanel;
