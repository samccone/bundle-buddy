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

const width = 800;
const height = 500;

const cachedPositions = {};

function drawNetwork({
  nodes,
  links,
  outputNodeSummary,
  updateSelectedBundles,
  selectedBundles
}) {
  const filtered = selectedBundles !== null;
  const svg = select("svg#network");
  const maxLines = max(nodes, d => d.size);
  const size = scaleSqrt().domain([0, maxLines]).range([0, filtered ? 60 : 30]);

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
      })
      .on("click", function(d) {
        updateSelectedBundles(d.id);
      })
      .on("mouseover", function(hover) {
        if (hover.id !== selectedBundles) {
          if (hover.type === "input") {
            const relevantNodes = new Set(
              links.filter(d => d.source.id === hover.id).map(d => d.target.id)
            );

            svg
              .selectAll("g.node")
              .filter(d => !relevantNodes.has(d.id) && d.id !== hover.id)
              .classed("inactive", true);

            svg
              .selectAll("g.links line")
              .filter(d => d.source.id !== hover.id)
              .classed("inactive", true);
          }
        }
      })
      .on("mouseout", function() {
        svg.selectAll("g.node").classed("inactive", false);
        svg.selectAll("g.links line").classed("inactive", false);
      });

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

  node.exit().remove();

  // svg.append("g").attr("class", "annotation-group");

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
}

class NetworkAnalysis extends Component {
  componentDidMount() {
    (window.requestIdleCallback || window.requestAnimationFrame)(
      () => {
        drawNetwork(this.props);
      },
      { timeout: 100 }
    );
  }

  componentDidUpdate(prevProps) {
    if (prevProps.selectedBundles !== this.props.selectedBundles) {
      drawNetwork(this.props);
    }
  }

  render() {
    return (
      <div className="row">
        <svg id="network" width={width} height={height}>
          <g className="links" />
          <g className="nodes" />
        </svg>
      </div>
    );
  }
}

export default NetworkAnalysis;
