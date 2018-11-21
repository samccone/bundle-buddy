import React from "react";
import dagre from "dagre";
import NetworkFrame from "semiotic/lib/NetworkFrame";
import { scaleLinear } from "d3-scale";

export default function Dendrogram({ edges, nodes }) {
  const heightScale = scaleLinear()
    .domain([0, (nodes[0] && nodes[0].totalBytes) || 1])
    .range([0, 50]);
  // let graph = null

  var g = new dagre.graphlib.Graph();

  g.setGraph({
    rankdir: "LR",
    ranker: "tight-tree",
    nodesep: 2,
    edgesep: 2
  });

  g.setDefaultEdgeLabel(function() {
    return {};
  });

  nodes.forEach(n =>
    g.setNode(n.id, {
      ...n,
      weight: n.totalBytes,
      width: 20,
      height: heightScale(n.totalBytes) || 10
    })
  );
  edges.forEach(e => g.setEdge(e.source, e.target));

  dagre.layout(g);

  return (
    <div>
      <NetworkFrame
        size={[1000, 500]}
        graph={g}
        networkType={{ type: "dagre", zoom: true }}
        nodeStyle={d => {
          return {
            stroke: "#999",
            fill: "#999",

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

          return <text>{d.id}</text>;
        }}
        // hoverAnnotation={true}
      />
    </div>
  );
}
