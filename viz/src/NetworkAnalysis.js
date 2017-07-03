import React, { Component } from "react";
import {
  forceSimulation,
  forceLink,
  forceCollide,
  forceManyBody,
  forceCenter,
  forceX,
  forceY
} from "d3-force";
import { select } from "d3-selection";
import { max, min, mean } from "d3-array";
import { scaleSqrt } from "d3-scale";
import { colorScale } from "./color";
import { pie, arc } from "d3-shape";
import { legendColor, legendSize } from "d3-svg-legend";
import * as d3 from "d3-transition";
import numeral from "numeral";
import Dimensions from "react-dimensions";
import {
  annotation,
  annotationCallout,
  annotationCalloutRect
} from "d3-svg-annotation";
import { stripHashes } from "./util";

const width = 800;
const height = 500;

const cachedPositions = {};

function drawNetwork({
  nodes,
  links,
  outputNodeSummary,
  updateSelectedBundles,
  updateSelectedSource,
  selectedBundles,
  selectedSource,
  containerWidth
}) {
  const filtered = selectedBundles !== null;
  const svg = select("svg#network");
  const maxLines = max(nodes, d => d.size);
  const size = scaleSqrt().domain([1, maxLines]).range([1, filtered ? 60 : 30]);
  const cacheMatch = cachedPositions[`${selectedBundles}-${window.innerWidth}`];
  if (cacheMatch) {
    nodes = JSON.parse(cacheMatch.nodes);
    links = JSON.parse(cacheMatch.links);
  } else {
    const simulation = forceSimulation()
      .force("link", forceLink().id(d => d.id).strength(filtered ? 0.06 : 2))
      .force("collide", forceCollide().radius(d => size(d.size) + 1))
      .force("forceX", forceX(height / 2).strength(0.05))
      .force("charge", forceManyBody().strength(filtered ? -50 : -10))
      .force("center", forceCenter(width / 2, height / 2));

    if (filtered) {
      simulation.force(
        "forceY",
        forceY(
          d =>
            d.id === selectedBundles
              ? height / 4
              : d.type === "input" ? height / 2 : height * 3 / 4
        ).strength(2)
      );

      const totalInputNodes = nodes.filter(d => d.type === "input").length;
      const inputIncrement = width / (totalInputNodes + 1);
      const totalOtherBundles = nodes.length - totalInputNodes - 1;
      const otherBundleIncrement = width / (totalOtherBundles + 1);
      let inputCounter = 0;
      let otherBundleCounter = 0;

      simulation.force(
        "forceX",
        forceX(d => {
          if (d.id === selectedBundles) return width / 2;
          if (d.type === "input") {
            inputCounter++;
            return inputIncrement * inputCounter;
          } else {
            otherBundleCounter++;
            return otherBundleIncrement * otherBundleCounter;
          }
        }).strength(1.2)
      );
    }

    simulation.nodes(nodes);
    simulation.force("link").links(links);

    simulation.restart();
    for (let i = 0; i < 150; i++) simulation.tick();
    simulation.stop();

    cachedPositions[`${selectedBundles}-${window.innerWidth}`] = {
      nodes: JSON.stringify(nodes),
      links: JSON.stringify(links)
    };
  }

  const color = colorScale;
  const link = svg.select("g.links").selectAll("line").data(links);
  link.enter().append("line").attr("stroke-width", 1).merge(link);
  link.exit().remove();

  const node = svg.select("g.nodes").selectAll("g.node").data(nodes);

  node.enter().append("g").attr("class", d => {
    return `node ${d.id === selectedBundles ? "selectedBundle" : d.type}`;
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
        return d.type === "output" ? color(0) : color(d.inBundleFiles.length);
      });

    if (selectedBundles) {
      svg
        .selectAll("g.node circle")
        .on("click", function(d) {
          if (d.type === "output") {
            updateSelectedBundles(d.id);
          } else {
            updateSelectedSource(d.id);
          }
        })
        .on("mouseout", function() {
          svg.selectAll("g.node").classed("inactive", false);
          svg.selectAll("g.links line").classed("active", false);
        });

      if (!selectedSource) {
        svg.selectAll("g.node circle").on("mouseover", function(hover) {
          if (hover.id !== selectedBundles) {
            if (hover.type === "input") {
              applyClassForHighlight({
                svg,
                links,
                matchID: hover.id,
                inactiveClass: "inactive",
                activeClass: "active"
              });
            }
          }
        });
      } else {
        svg.selectAll("g.node circle").on("mouseover", null);
      }
    }

    circle.exit().remove();

    const slices = outputNodeSummary[d.id];
    if (slices) {
      const pieLayout = pie().value(d => d.value);
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
  if (selectedSource) {
    applyClassForHighlight({
      svg,
      links,
      matchID: selectedSource,
      inactiveClass: "inactiveSource",
      activeClass: "activeSource"
    });
  }

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

  let annotations = [];

  if (selectedBundles) {
    const match = svg.select(".node.selectedBundle");
    const matchBBox = match.node().getBBox();

    const nx = min(svg.selectAll(".node").data(), d => d.x - size(d.size)) - 10;

    const sources = svg
      .selectAll(".node")
      .data()
      .filter(d => d.type === "input");
    const minSource = min(sources, d => d.x);
    const maxSource = max(sources, d => d.x);
    const avgY = mean(sources, d => d.y);
    const maxHeight = size(max(sources, d => d.size));
    const rectPadding = 20;
    const wrap = containerWidth / 2 - (match.datum().x - nx);

    const selectedBundlesY = max(svg.selectAll(".node").data(), d => d.y);

    annotations = [
      {
        note: {
          title: "Selected Bundle",
          wrap,
          label: stripHashes(selectedBundles),
          align: "middle",
          lineType: "vertical"
        },
        type: annotationCallout,
        nx,
        x: match.datum().x,
        y: match.datum().y
      },
      {
        note: {
          title: "Overlapping Bundles",
          wrap,
          align: "middle",
          lineType: "vertical"
        },
        type: annotationCallout,
        nx,
        x: nx + 10,
        y: selectedBundlesY
      },
      {
        note: {
          title: "Source files",
          label: "hover and click to select",
          wrap,
          align: "middle",
          lineType: "vertical"
        },
        subject: {
          width: maxSource - minSource + rectPadding * 2,
          height: maxHeight + rectPadding * 2
        },
        nx: Math.min(nx, minSource - rectPadding - 1),
        x: minSource - rectPadding,
        y: avgY - (maxHeight + rectPadding * 2) / 2,
        dy: (maxHeight + rectPadding * 2) / 2,
        type: annotationCalloutRect
      }
    ];
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
      40}, ${-nodeBBox.y + 20})`
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
      if (prevProps.selectedSource !== this.props.selectedSource) {
        drawNetwork(this.props);
      } else if (prevProps.selectedBundles !== this.props.selectedBundles) {
        drawNetwork(this.props);
      } else if (prevProps.containerWidth !== this.props.containerWidth) {
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
            <g className="annotations" />
            <g className="links" />
            <g className="nodes" />
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
