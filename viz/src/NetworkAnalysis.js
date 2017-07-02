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

function drawNetwork({ nodes, links, outputNodeSummary }, selectedBundles) {
  const filtered = selectedBundles !== null;
  const svg = select("svg#network");
  const maxLines = max(nodes, d => d.size);
  const size = scaleSqrt().domain([0, maxLines]).range([0, filtered ? 60 : 30]);

  const simulation = forceSimulation()
    .force("link", forceLink().id(d => d.id).strength(filtered ? 0.06 : 2))
    .force("collide", forceCollide().radius(d => size(d.size) + 1))
    .force("forceX", forceX(1000 / 2).strength(filtered ? 0 : 0.05))
    .force("charge", forceManyBody().strength(filtered ? -50 : -10))
    .force("center", forceCenter(500 / 2, 1000 / 2));

  if (filtered) {
    simulation.force(
      "forceY",
      forceY(
        d =>
          d.id === selectedBundles
            ? 1000 / 4
            : d.type === "input" ? 1000 / 2 : 1000 * 3 / 4
      )
    );
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

  simulation.nodes(nodes).on("tick", ticked);

  simulation.force("link").links(links);

  svg.append("g").attr("class", "annotation-group");

  function ticked() {
    svg
      .select("g.links")
      .selectAll("line")
      .attr("x1", function(d) {
        return d.source.x;
      })
      .attr("y1", function(d) {
        return d.source.y;
      })
      .attr("x2", function(d) {
        return d.target.x;
      })
      .attr("y2", function(d) {
        return d.target.y;
      })
      .attr("stroke", d => color(d.source.inBundleFiles.length));

    svg
      .select("g.nodes")
      .selectAll("g.node")
      .attr("transform", d => `translate(${d.x}, ${d.y})`);
  }
}

class NetworkAnalysis extends Component {
  componentDidMount() {
    drawNetwork(this.props, this.props.selectedBundles);
  }

  componentDidUpdate() {
    drawNetwork(this.props, this.props.selectedBundles);
  }

  render() {
    return (
      <div>
        <div className="row">
          <div className="col-xs-12">
            <h2
              style={{ fontWeight: 100 }}
            >{`Relationships of Files with Shared Code`}</h2>
          </div>
        </div>
        <div className="row">
          <svg id="network" width={500} height={1000}>
            <g className="links" />
            <g className="nodes" />
          </svg>
        </div>
      </div>
    );
  }
}

export default NetworkAnalysis;
