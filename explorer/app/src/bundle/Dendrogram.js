import React from "react";
import dagre from "dagre";
import NetworkFrame from "semiotic/lib/NetworkFrame";
import { scaleLinear } from "d3-scale";
import { colors } from "../theme";
import {
  forceY,
  forceX,
  forceSimulation,
  forceManyBody,
  forceCollide,
  forceRadial,
  forceLink
} from "d3-force";

export default function Dendrogram({ edges, nodes, max, selected, counts }) {
  // const sorted = nodes.sort((a, b) => (b.totalBytes || 0) - (a.totalBytes || 0))
  // const max = (sorted[0] && sorted[0].totalBytes) || 0
  const width = 150;

  const heightScale = scaleLinear().domain([0, max]).range([0, width]);

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

  const count = counts[selected];
  return (
    <div className="bottom-panel padding">
      <p>
        Selected File: <b>{selected}</b>{" "}
        {count &&
          <span>
            is imported by <b>{count.requiredBy.length}</b> file
            {count.requiredBy.length > 1 && "s"}
            {selected.indexOf("node_modules") === -1 &&
              <span>
                , and imports <b>{count.requires.length}</b> files/modules
              </span>}
          </span>}
      </p>
    </div>
  );
}
