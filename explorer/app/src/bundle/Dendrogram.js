import React from "react";
import dagre from "dagre";
import NetworkFrame from "semiotic/lib/NetworkFrame";
import { scaleLinear } from "d3-scale";
import { colors } from "../theme";

export default function Dendrogram({ edges, nodes, max, selected }) {
  // const sorted = nodes.sort((a, b) => (b.totalBytes || 0) - (a.totalBytes || 0))
  // const max = (sorted[0] && sorted[0].totalBytes) || 0

  const width = 150;

  const heightScale = scaleLinear()
    .domain([0, max])
    .range([0, width]);
  // let graph = null

  var g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: "LR",
    align: "UL",
    ranker: "tight-tree",
    nodesep: 25,
    edgesep: 2
  });

  g.setDefaultEdgeLabel(function() {
    return {};
  });

  nodes.forEach(n => {
    g.setNode(n.id, {
      ...n,
      weight: 1, //n.totalBytes,
      height: 6,
      width //heightScale(n.totalBytes || 0)
    });
  });
  edges.forEach(e => {
    if (e.source === selected || e.target === selected)
      g.setEdge(e.source, e.target);
  });

  dagre.layout(g);

  return (
    <div>
      <NetworkFrame
        size={[g.graph().width * 5 + 40, g.graph().height * 2 + 40]}
        graph={g}
        // dataVersion={new Date()}
        networkType={{ type: "dagre", zoom: false }}
        nodeStyle={d => {
          return {
            stroke: colors[0],
            fill: "white",

            strokeWidth: 1
          };
        }}
        edgeStyle={d => {
          return {
            stroke: "#ccc",
            fill: "none"
            // fillOpacity: 0.75,
            // strokeWidth: 0.5
            //              opacity: isMainPath ? 1 : 0.1
          };
        }}
        margin={20}
        nodeLabels={d => {
          // if (d.height < 1500) return null
          // console.log("here", d)
          return (
            <g transform={`translate(-${width / 2}, 0)`}>
              <rect
                height="6"
                y={-3}
                width={heightScale(d.totalBytes)}
                fill={colors[0]}
              />
              <text y={12} fontSize="10">
                {d.id}
              </text>
            </g>
          );
        }}
        // hoverAnnotation={true}
      />
    </div>
  );
}
