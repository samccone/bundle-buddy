import React, { Component } from "react";
import { select } from "d3-selection";
import { scaleLinear, scaleQuantize } from "d3-scale";
import { colorScale } from "./color";
import SourceView from "./SourceView";
import { fisheye } from "./util";
import { annotation, annotationCallout } from "d3-svg-annotation";
import { stripHashes } from "./util";

const width = 200;
const height = 500;

function getLastFile(id) {
  const dirs = id.split("/");
  return dirs[dirs.length - 1];
}

function getRectMiddle(yScale, d) {
  return (
    yScale(d.totalCount) +
    (yScale(d.totalCount + d.adjustedCount) - yScale(d.totalCount)) / 2
  );
}

function drawFile({ outputFile, updateSelectedSource, selectedSource }) {
  const svg = select("svg#fileMap");

  if (outputFile) {
    let totalCount = 0;
    const files = Object.keys(outputFile[1])
      .map(d => {
        const file = outputFile[1][d];
        return {
          name: d,
          adjustedCount: file.inBundleCount * file.count,
          ...file
        };
      })
      .filter(d => d.inBundleCount > 1)
      .sort((a, b) => b.adjustedCount - a.adjustedCount)
      .map(d => {
        d.totalCount = totalCount;
        totalCount += d.adjustedCount;
        return d;
      });

    const yScale = fisheye(scaleLinear())
      .domain([0, totalCount])
      .range([0, height]);

    const createAnnotations = source => {
      console.log("source", source);
      return files
        .filter((d, i) => {
          console.log("in filter", source, d.name, d.name === source);
          return i < 6 || d.name === source;
        })
        .map(d => ({
          className: d.name === source ? "selected" : "",
          note: {
            label: getLastFile(d.name),
            align: "middle",
            lineType: "vertical"
          },
          data: d,
          type: annotationCallout,
          x: 100,
          dx: -10
        }));
    };

    const sourceLabels = annotation()
      .annotations(createAnnotations(selectedSource))
      .accessors({ y: d => getRectMiddle(yScale, d) });

    svg.select("g.annotations").call(sourceLabels);

    const chunks = svg.select("g.chunks").selectAll("rect").data(files);

    chunks
      .enter()
      .append("rect")
      .attr("class", "chunk")
      .on("click", d => {
        updateSelectedSource(d.name);
        console.log("here", createAnnotations(d.name));
        sourceLabels
          .annotations(createAnnotations(d.name))
          .update()
          .updatedAccessors()
          .updateText();
        //svg.select("g.annotations").call(sourceLabels);
      })
      .merge(chunks)
      .attr("width", 100)
      .attr("fill", d => colorScale(d.inBundleCount))
      .attr("x", 100)
      .attr("y", d => yScale(d.totalCount))
      .attr(
        "height",
        d => yScale(d.totalCount + d.adjustedCount) - yScale(d.totalCount)
      );

    svg.node().addEventListener("mousemove", function(d) {
      const mouseY = d.layerY - svg.node().getBoundingClientRect().top;
      yScale.distortion(2.5).focus(mouseY);

      updateRects(svg, yScale);
      sourceLabels.updatedAccessors();
    });
    svg.node().addEventListener("mouseout", function(d) {
      yScale.distortion(3).focus(0);
      updateRects(svg, yScale);

      sourceLabels.updatedAccessors();
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

function updateRects(svg, yScale) {
  svg
    .selectAll("rect.chunk")
    .attr("y", d => yScale(d.totalCount))
    .attr(
      "height",
      d => yScale(d.totalCount + d.adjustedCount) - yScale(d.totalCount)
    );

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
