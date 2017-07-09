import React, { Component } from "react";
import {
  forceSimulation,
  forceLink,
  forceCollide,
  forceManyBody,
  forceCenter,
  forceX
} from "d3-force";
import { select } from "d3-selection";
import { extent, max } from "d3-array";
import { scaleSqrt } from "d3-scale";
import { colorScale } from "./color";
import { pie, arc } from "d3-shape";
import { legendColor, legendSize } from "d3-svg-legend";
import * as d3 from "d3-transition";
import numeral from "numeral";
import Dimensions from "react-dimensions";
import { annotation, annotationCalloutCircle } from "d3-svg-annotation";
import { stripHashes } from "./util";
import { blueGrey100 } from "material-ui/styles/colors";

const width = 800;
const height = 500;

const cachedPositions = {};

function drawNetwork({
  nodes,
  links,
  outputNodeSummary,
  updateSelectedBundles,
  containerWidth
}) {
  const svg = select("svg#network");
  const maxLines = max(nodes, d => d.size);
  const size = scaleSqrt().domain([1, maxLines]).range([1, 30]);
  const cacheMatch = cachedPositions[`${window.innerWidth}`];
  if (cacheMatch) {
    nodes = JSON.parse(cacheMatch.nodes);
    links = JSON.parse(cacheMatch.links);
  } else {
    const simulation = forceSimulation()
      .force("link", forceLink().id(d => d.id).strength(2))
      .force("collide", forceCollide().radius(d => size(d.size) + 1))
      .force("forceX", forceX(height / 2).strength(0.05))
      .force("charge", forceManyBody().strength(-10))
      .force("center", forceCenter(width / 2, height / 2));

    simulation.nodes(nodes);
    simulation.force("link").links(links);
    simulation.stop();

    for (let i = 0; i < 150; i++) simulation.tick();

    const xExtent = extent(nodes, d => d.x);
    const yExtent = extent(nodes, d => d.y);

    const xRange = xExtent[1] - xExtent[0];
    const yRange = yExtent[1] - yExtent[0];

    if (yRange > xRange) {
      nodes.forEach(d => {
        const y = parseFloat(d.y);
        d.y = parseFloat(d.x);
        d.x = y;
      });
    }

    cachedPositions[`${window.innerWidth}`] = {
      nodes: JSON.stringify(nodes),
      links: JSON.stringify(links)
    };
  }

  const color = colorScale;
  const link = svg.select("g.links").selectAll("line").data(links);
  link.enter().append("line").attr("stroke-width", 1).merge(link);
  link.exit().remove();

  const node = svg.select("g.nodes").selectAll("g.node").data(nodes);

  node
    .enter()
    .append("g")
    .attr("class", d => {
      return `node ${d.type}`;
    })
    .on("mouseover", function(d) {
      const hoverAnnotations = annotation().annotations([
        {
          note: {
            title: d.type === "input" ? "Source File" : "Bundle File",
            label: stripHashes(d.id),
            align: "middle"
          },
          type: annotationCalloutCircle,
          dy: 40 + size(d.size),
          x: d.x,
          y: d.y,
          subject: {
            radius: size(d.size) + 3
          }
        }
      ]);
      svg.select("g.hoverAnnotations").call(hoverAnnotations);
    })
    .on("mouseout", function(d) {
      svg.select("g.hoverAnnotations").selectAll("g").remove();
    })
    .filter(d => d.type === "output")
    .on("click", function(d) {
      updateSelectedBundles(d.id);
    });

  svg.select("g.nodes").selectAll("g.node").each(function(d) {
    const circle = select(this).selectAll("circle").data([d]);

    circle
      .enter()
      .append("circle")
      .merge(circle)
      .attr("r", function(d) {
        return size(d.size);
      })
      .attr("fill", function(d) {
        return d.type === "output"
          ? color(0)
          : d.inBundleFiles.length === 1
            ? blueGrey100
            : color(d.inBundleFiles.length);
      });

    circle.exit().remove();

    const slices = outputNodeSummary[d.id];
    if (slices) {
      const pieLayout = pie().value(d => d.value).sort((a, b) => b.key - a.key);
      const path = arc().innerRadius(0).outerRadius(size(d.size) - 2);

      const pieSlices = select(this)
        .selectAll("path.arc")
        .data(pieLayout(slices).filter(d => d.data.key > 1));

      pieSlices
        .enter()
        .append("path")
        .merge(pieSlices)
        .attr("d", path)
        .attr("class", "arc")
        .style("pointer-events", "none")
        .attr("fill", d => color(d.data.key));

      pieSlices.exit().remove();
    } else {
      select(this).selectAll("path.arc").remove();
    }
  });

  svg.selectAll("g.node").classed("inactiveSource", false);
  svg.selectAll("g.links line").classed("activeSource", false);

  node.exit().remove();

  svg
    .select("g.links")
    .selectAll("line")
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y)
    .attr("stroke", d => color(d.source.inBundleFiles.length));

  svg
    .select("g.nodes")
    .selectAll("g.node")
    .attr("transform", d => `translate(${d.x}, ${d.y})`);

  const colorLegend = legendColor()
    .scale(color)
    .orient("horizontal")
    .shapeWidth(50)
    .shapeHeight(10)
    .shapePadding(5)
    .labelWrap(50)
    .title("Number of bundles source code appers in")
    .labels(["No shared code", "2", "3", "4", "Code in 5+ bundles"]);

  svg.select("g.colorLegend").call(colorLegend);

  const sizeLegend = legendSize()
    .scale(size)
    .shape("circle")
    .shapePadding(15)
    .title("Lines of code")
    .labelFormat(d => numeral(d).format("0a"))
    .cells([
      Math.round(maxLines * 0.1),
      Math.round(maxLines * 0.25),
      Math.round(maxLines * 0.5),
      maxLines
    ])
    .orient("horizontal");
  svg.select("g.sizeLegend").selectAll(".cells").remove();
  svg.select("g.sizeLegend").call(sizeLegend);
  updateNetworkPosition(containerWidth);

  const annotations = [];

  const rightBundle = nodes
    .sort((a, b) => b.x - a.x)
    .find(d => d.type === "output");
  const nodeBBox = select("svg g.nodes").node().getBBox();

  if (rightBundle) {
    annotations.push({
      note: {
        title: "Bundle File",
        label: "Inner pie chart shows overlapping code",
        align: "middle"
      },
      type: annotationCalloutCircle,
      x: rightBundle.x,
      y: rightBundle.y,
      ny: nodeBBox.y,
      subject: {
        radius: size(rightBundle.size) + 3
      }
    });
  }

  const leftSourceFile = nodes
    .sort((a, b) => a.x - b.x)
    .find(d => d.type === "input");

  if (leftSourceFile) {
    annotations.push({
      note: {
        title: "Source File",
        label: "Grey = no overlapping, otherwise colored by degree of overlap",
        align: "middle"
      },
      type: annotationCalloutCircle,
      x: leftSourceFile.x,
      y: leftSourceFile.y,
      ny: nodeBBox.y,
      subject: {
        radius: size(leftSourceFile.size) + 3
      }
    });
  }

  const makeAnnotations = annotation().annotations(annotations);

  svg.select("g.annotations").call(makeAnnotations);
}

function applyClassForHighlight({
  svg,
  links,
  matchID,
  inactiveClass,
  activeClass
}) {
  const relevantNodes = new Set(
    links.filter(d => d.source.id === matchID).map(d => d.target.id)
  );

  svg
    .selectAll("g.node")
    .filter(d => !relevantNodes.has(d.id) && d.id !== matchID)
    .classed(inactiveClass, true);

  svg
    .selectAll("g.links line")
    .filter(d => d.source.id === matchID)
    .classed(activeClass, true);
}

function updateNetworkPosition(width) {
  const nodeBBox = select("svg g.nodes").node().getBBox();

  select("svg#network g.fullNetwork").attr(
    "transform",
    `translate(${width / 2 -
      nodeBBox.width / 2 -
      nodeBBox.x +
      40}, ${-nodeBBox.y + (300 - nodeBBox.height / 2) - 30})`
  );
  const sizeLegendBBox = select("svg#network g.sizeLegend").node().getBBox();
  select("svg#network g.sizeLegend").attr(
    "transform",
    `translate(${width - sizeLegendBBox.width}, ${600 - sizeLegendBBox.height})`
  );
}

function deferWork(fn) {
  (window.requestIdleCallback || window.requestAnimationFrame)(
    () => {
      fn();
    },
    { timeout: 100 }
  );
}

class NetworkAnalysis extends Component {
  componentDidMount() {
    deferWork(() => drawNetwork(this.props));
  }

  componentDidUpdate(prevProps) {
    deferWork(() => {
      if (prevProps.containerWidth !== this.props.containerWidth) {
        updateNetworkPosition(this.props.containerWidth);
      }
    }, this);
  }

  render() {
    const { height, containerWidth } = this.props;

    return (
      <div className="row">
        <svg id="network" width={containerWidth} height={600}>
          <g className="fullNetwork">
            <g className="links" />
            <g className="nodes" />
            <g className="annotations" />
            <g className="hoverAnnotations" />
          </g>
          <g
            className="colorLegend legend"
            transform={`translate(20, ${height - 80})`}
          />
          <g
            className="sizeLegend legend"
            transform={`translate(${containerWidth - 200}, ${height - 80})`}
          />
        </svg>
      </div>
    );
  }
}

export default Dimensions()(NetworkAnalysis);
