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
import { max } from "d3-array";
import { scaleSqrt, scaleQuantize } from "d3-scale";
import { pie, arc } from "d3-shape";
import { blueGrey100, teal100 } from "material-ui/styles/colors";
import { legendColor, legendSize } from "d3-svg-legend";
import * as d3 from "d3-transition";
import numeral from "numeral";
import Dimensions from "react-dimensions";

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

  const color = scaleQuantize()
    .domain([1, 5])
    .range([blueGrey100, "#ffafb6", "#ff616f", "#d21c5b", "#6d253e"]);

  const link = svg.select("g.links").selectAll("line").data(links);
  link.enter().append("line").attr("stroke-width", 1).merge(link);
  link.exit().remove();

  const node = svg.select("g.nodes").selectAll("g.node").data(nodes);

  node.enter().append("g").attr("class", "node");

  svg.select("g.nodes").selectAll("g.node").each(function(d) {
    const circle = select(this).selectAll("circle").data([d]);

    circle
      .enter()
      .append("circle")
      .attr("class", "node")
      .merge(circle)
      .attr("r", function(d) {
        return size(d.size);
      })
      .attr("fill", function(d) {
        return d.type === "output" ? teal100 : color(d.inBundleFiles.length);
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

  select("svg g.fullNetwork").attr(
    "transform",
    `translate(${width / 2 - nodeBBox.width / 2 - nodeBBox.x}, ${-nodeBBox.y +
      20})`
  );

  const sizeLegendBBox = select("svg g.sizeLegend").node().getBBox();
  select("svg g.sizeLegend").attr(
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
