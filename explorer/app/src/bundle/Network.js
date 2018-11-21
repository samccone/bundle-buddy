import React from "react";
// import dagre from "dagre"
import network from "./prototype/trimmed-network.json";
import NetworkFrame from "semiotic/lib/NetworkFrame";
import { scaleSqrt } from "d3-scale";
import { colors } from "../theme";

const { edges, nodes } = network;
// console.log(edges, nodes)

const veryConnected = nodes.reduce((p, c) => {
  if (c.asSource > 6) {
    p[c.id] = true;
  }

  return p;
}, {});

export default function Dendrogram() {
  const sorted = nodes.sort((a, b) => b.totalBytes - a.totalBytes);
  const heightScale = scaleSqrt()
    .domain([0, (sorted[0] && sorted[0].totalBytes) || 1])
    .range([0, 50]);

  // console.log(nodes)
  return (
    <div>
      <NetworkFrame
        size={[800, 800]}
        // graph={g}
        networkType={{ type: "force", edgeStrength: 0.2 }}
        edges={edges.filter(
          d =>
            !veryConnected[d.source] &&
            !veryConnected[d.target] &&
            d.target.indexOf("$") === -1
        )}
        nodes={nodes}
        nodeStyle={d => {
          return {
            stroke: d.id.indexOf("node_modules") !== -1 ? colors[1] : colors[0],
            fill: veryConnected[d.id]
              ? "#eee"
              : d.id.indexOf("node_modules") !== -1
              ? colors[1]
              : colors[0],
            strokeWidth: 1
          };
        }}
        nodeSizeAccessor={d => heightScale(d.totalBytes)}
        edgeStyle={d => {
          return {
            stroke:
              d.source.id.indexOf("node_modules") !== -1 ? colors[1] : colors[0]

            // fillOpacity: 0.75,
            // strokeWidth: 0.5
            //              opacity: isMainPath ? 1 : 0.1
          };
        }}
        // edgeType="arrowhead"
        margin={20}
        nodeLabels={d => {
          // if (d.height < 1500) return null
          const index = d.id.lastIndexOf("/");
          let name = d.id.slice(index + 1);

          if (name.length > 10) {
            name = name.slice(0, 10) + "...";
          }
          return (
            <g>
              {veryConnected[d.id] && (
                <text y={-10} fontSize="10" textAnchor="middle">
                  <tspan fontSize="12" fontWeight="bold">
                    ↑
                  </tspan>{" "}
                  {d.asSource}
                </text>
              )}
              <text fontSize="10" textAnchor="middle">
                {name}
              </text>
            </g>
          );
        }}
        // hoverAnnotation={true}
      />
    </div>
  );
}
