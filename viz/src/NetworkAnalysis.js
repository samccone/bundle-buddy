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
import { max } from "d3-array";
import { scaleSqrt, scaleQuantize } from "d3-scale";
import { pie, arc } from "d3-shape";
import {
  blueGrey100,
  deepPurple200,
  deepPurple400,
  deepPurple600,
  deepPurple900,
  teal100
} from "material-ui/styles/colors";

class NetworkAnalysis extends Component {
  componentDidMount() {
    const svg = select("svg#network");
    const { nodes, links, outputNodeSummary } = this.props;
    console.log("nodes", nodes);
    const simulation = forceSimulation()
      .force("link", forceLink().id(d => d.id).strength(2))
      .force("collide", forceCollide().radius(d => size(d.size) + 1))
      .force("forceY", forceX(1000 / 2).strength(0.05))
      .force("charge", forceManyBody().strength(-10))
      .force("center", forceCenter(500 / 2, 1000 / 2));

    console.log("links", links);
    const maxLines = max(nodes, d => d.size);
    const size = scaleSqrt().domain([0, maxLines]).range([0, 30]);

    // const color = d3.scaleLinear().domain([0, 5])//.clamp(true)
    // const colorScale = (count) => d3.interpolatePuRd(color(count))
    const color = scaleQuantize()
      .domain([1, 5])
      .range([blueGrey100, "#ffafb6", "#ff616f", "#d21c5b", "#6d253e"]);

    const link = svg
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke-width", 1);

    var node = svg
      .append("g")
      .attr("class", "nodes")
      .selectAll("g.node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .each(function(d) {
        select(this)
          .append("circle")
          .attr("class", "node")
          .attr("r", function(d) {
            return size(d.size);
          })
          .attr("fill", function(d) {
            return d.type === "output"
              ? teal100
              : color(d.inBundleFiles.length);
          })
          .on("mouseover", function(d) {
            // const annotations = [
            //   {
            //     x: d.x,
            //     y: d.y,
            //     // dx: size(d.size)*2,
            //     dy: -100,
            //     note: { title: d.type === "output" ? "Output" : "Input", "align": "middle",
            //       label: d.id
            //     },
            //     className: d.type === "output" ? "target" : "source",
            //     subject: {
            //       radiusPadding: 2,
            //       radius: size(d.size) + 1,
            //     }
            //   }
            // ]

            const relatedNodes = links
              .filter(g => {
                return g.source.id === d.id || g.target.id === d.id;
              })
              .forEach(g => {
                const other = g.source.id === d.id ? g.target : g.source;

                // if (other.type === "output" || other.inBundleFiles.length > 1){
                // annotations.push({
                //     x: other.x,
                //     y: other.y,
                //     disable: ['note', 'connector'],
                //     // dx: size(other.size)*4,
                //     // dy: size(other.size)*4,
                //     className: other.type === "output" ? "target thick" : "source thick",
                //     // note: { title: other.inBundleFiles ? 'Input' : 'Output'},
                //     subject: {
                //       radiusPadding: 2,
                //       radius: size(other.size) + 1,
                //     }
                //   })
                // }
              });

            // svg.select("g.annotation-group")
            // .call(d3.annotation()
            //   .type(d3.annotationCalloutCircle)
            // .annotations(annotations))
          })
          .on("mouseout", function(d) {
            svg.select("g.annotation-group g.annotations").remove();
          });

        const gobstopper = outputNodeSummary[d.id];
        if (gobstopper) {
          const pieLayout = pie().value(d => d.value);
          const path = arc().innerRadius(0).outerRadius(size(d.size) - 2);
          console.log("in here", pieLayout(gobstopper));
          select(this)
            .selectAll("path.arc")
            .data(pieLayout(gobstopper).filter(d => d.data.key > 1))
            .enter()
            .append("path")
            .attr("d", path)
            .attr("class", "arc")
            .style("pointer-events", "none")
            .attr("fill", d => color(d.data.key));

          // select(this).selectAll('circle.gobstopper')
          //   .data(gobstopper.filter(d => d.key > 1).sort((a,b) => b.value - a.value))
          //   .enter()
          //   .append('circle')
          //   .attr('class', 'gobstopper')
          //   .attr("r", d => size(d.value))
          //   .attr("fill", d => color(d.key))
        }
      });

    // node.append("title")
    //     .text(function(d) { return d.id; });

    simulation.nodes(nodes).on("tick", ticked);

    simulation.force("link").links(links);

    svg.append("g").attr("class", "annotation-group");

    function ticked() {
      link
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
      node.attr("transform", d => `translate(${d.x}, ${d.y})`);
      // .attr("cx", function(d) { return d.x; })
      // .attr("cy", function(d) { return d.y; });
    }
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
          <svg id="network" width={500} height={1000} />
        </div>
      </div>
    );
  }
}

export default NetworkAnalysis;
