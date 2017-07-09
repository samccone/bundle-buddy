import React, { Component } from "react";
import { select } from "d3-selection";
import { scaleLinear, scaleQuantize } from "d3-scale";
import { colorScale } from "./color";
import SourceView from "./SourceView";
import { fisheye } from "./util";
import { annotation, annotationCallout } from "d3-svg-annotation";
import { stripHashes, deferWork } from "./util";

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

    const createAnnotations = (files, source) => {
      return files
        .filter((d, i) => {
          return i < 6 || d.name === source;
        })
        .map(d => ({
          className: d.name === source ? "selected" : "",
          note: {
            title: d.name === source ? "Selected Source" : null,
            label: getLastFile(d.name)
          },
          data: d,
          type: annotationCallout,
          x: 100,
          dx: -5,
          disable: ["connector"]
        }));
    };

    const sourceLabels = annotation()
      .annotations(createAnnotations(files, selectedSource))
      .accessors({ y: d => getRectMiddle(yScale, d) });

    svg.select("g.labels").call(sourceLabels);

    const hoverAnnotations = annotation().accessors({
      y: d => getRectMiddle(yScale, d)
    });
    svg.select("g.hoverAnnotations").call(hoverAnnotations);

    const chunks = svg.select("g.chunks").selectAll("rect").data(files);

    chunks
      .enter()
      .append("rect")
      .attr("class", "chunk")
      .merge(chunks)
      .on("click", d => {
        deferWork(() => {
          updateSelectedSource(d.name);
          sourceLabels.annotations(
            createAnnotations(
              files,
              d.name === selectedSource ? undefined : d.name
            )
          );
          svg.select("g.hoverAnnotations").selectAll("g").remove();
        });
      })
      .on("mouseover", function(hover) {
        const existingAnnotation = svg
          .selectAll(".annotation")
          .data()
          .some(d => d.data.name === hover.name);

        if (!existingAnnotation) {
          hoverAnnotations.annotations([
            {
              note: {
                label: getLastFile(hover.name)
              },
              data: hover,
              type: annotationCallout,
              x: 100,
              dx: -5,
              disable: ["connector"]
            }
          ]);
        }
      })
      .on("mouseout", function() {
        hoverAnnotations.annotations([]);
      })
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
      hoverAnnotations.updatedAccessors();
    });
    svg.node().addEventListener("mouseout", function(d) {
      yScale.distortion(3).focus(0);
      updateRects(svg, yScale);

      svg.select("g.hoverAnnotations").selectAll("g").remove();
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
      drawFile(this.props);
    }
  }

  buildRangeString(bundleGroup) {
    const sortedLines = bundleGroup.lines.sort((a, b) => a - b);
    const ranges = [];
    const ret = [];

    for (const line of sortedLines) {
      if (ranges.length === 0) {
        ranges.push({
          start: line,
          end: line
        });

        continue;
      }

      if (ranges[ranges.length - 1].end + 1 === line) {
        ranges[ranges.length - 1].end++;
        continue;
      }

      ranges.push({
        start: line,
        end: line
      });
    }

    for (const range of ranges) {
      if (range.start === range.end) {
        ret.push(`${range.start}`);
      } else {
        ret.push(`${range.start}-${range.end}`);
      }
    }

    return ret.join(",");
  }

  buildSingleBundleSummary(selectedSource, bundle, attachLineInfo = false) {
    const bundles = bundle.bundles;

    return (
      <div>
        <p>
          Duplicated Lines for file <b>{selectedSource}</b> appears in{" "}
          <b>{bundles.length}</b> bundles:{" "}
        </p>
        <ul>
          {bundles.map(bundle =>
            <li key={bundle}>
              {bundle}
            </li>
          )}
        </ul>
        {attachLineInfo
          ? <p className="line-info">
              <span className="line-info-title">On The following lines:</span>
              <p className="raw-lines">
                {this.buildRangeString(bundle)}
              </p>
            </p>
          : null}
      </div>
    );
  }

  summarizeOverlapInfo(selectedSource, sourceOverlapInfo) {
    if (sourceOverlapInfo === undefined) {
      return null;
    }

    const sourceLinesWithOverlaps = {};
    for (const bundleGroupKey of Object.keys(sourceOverlapInfo)) {
      if (sourceOverlapInfo[bundleGroupKey].bundles.length > 1) {
        sourceLinesWithOverlaps[bundleGroupKey] =
          sourceOverlapInfo[bundleGroupKey];
      }
    }

    // If we only have a single common bundle overlap list, no need to list line nums.
    if (Object.keys(sourceLinesWithOverlaps).length === 1) {
      return this.buildSingleBundleSummary(
        selectedSource,
        Object.values(sourceLinesWithOverlaps)[0]
      );
    }

    let ret = [];
    for (const bundleGroupKey of Object.keys(sourceLinesWithOverlaps)) {
      const bundle = sourceLinesWithOverlaps[bundleGroupKey];
      ret.push(this.buildSingleBundleSummary(selectedSource, bundle, true));
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

    let sourceFile, bundleInfo, sourceTitles, sourceDetails;

    if (!selectedBundles) {
      bundleInfo = (
        <div>
          <p>
            <b>See details by:</b> Clicking on a file in the left nav, or a
            bundle in the network graph
          </p>
        </div>
      );
    } else {
      sourceTitles = (
        <div className="col-xs-12 sourceTitles">
          <div
            style={{
              width: 200,
              borderRight: "1px solid #ccc"
            }}
          >
            <p>Bundle Breakdown</p>
          </div>
          <div style={{ paddingLeft: 10 }}>
            <p>Selected Source</p>
          </div>
        </div>
      );

      if (!selectedSource) {
        sourceFile = (
          <p style={{ marginLeft: 20 }}>
            Click on a source file on the left to look at the shared lines of
            code
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
                selectedSource,
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
      sourceDetails = (
        <div className="col-xs-12">
          <div className="source-details">
            <svg id="fileMap" width={width} height={height}>
              <g className="chunks" />
              <g className="labels" />
              <g className="hoverAnnotations" />
            </svg>
            {sourceFile}
          </div>
        </div>
      );
    }

    return (
      <div className="fullWidth">
        <div className="col-xs-12 bottomSummary">
          {summarySentence}
          {bundleInfo}
        </div>
        {sourceTitles}
        {sourceDetails}
      </div>
    );
  }
}

export default BottomPanel;
