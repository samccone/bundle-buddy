import React from "react";
// import dagre from "dagre"
import network from "./prototype/trimmed-network.json";
import NetworkFrame from "semiotic/lib/NetworkFrame";
import { scaleSqrt } from "d3-scale";
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
const { edges, nodes } = network;
// console.log(edges, nodes)

const veryConnected = nodes.reduce((p, c) => {
  // if (c.asSource > 6 || c.asTarget > 20) {
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

  const filteredEdges = edges.filter(
    d =>
      !veryConnected[d.source] &&
      !veryConnected[d.target] &&
      d.target.indexOf("$") === -1
  );

  console.log(filteredEdges);

  const filteredNodes = nodes.filter(d => !veryConnected[d.id]);

  const connectedNodes = nodes.filter(d => veryConnected[d.id]);
  const simulation = forceSimulation(filteredNodes)
    .force(
      "charge",
      forceManyBody()
        .strength(0)
        // .distanceMax(100)
        .strength(d => -300 * d.totalBytes)
    )
    // .force("collide", forceCollide(d => d.r * 3).strength(1))
    //   // .force('x', force)
    //   // // .force("x", forceX((d => d.fociX))
    // .force("x", forceX(d => d.xplace).strength(0.5))
    .force("link", forceLink(filteredEdges).strength(d => d.value || 1));
  // .force("x", d => {})
  // .force("y", forceY(d => d.yplace).strength(0.5))
  // .force("radial", forceRadial(d => d.id.length * 40).strength(0.8))
  // console.log(
  //   "EDGES",
  //   edges,
  //   edges.filter(
  //     d =>
  //       !veryConnected[d.source] &&
  //       !veryConnected[d.target] &&
  //       d.target.indexOf("$") === -1
  //   )
  // )
  return (
    <div>
      <div>
        {connectedNodes.map(d => {
          const index = d.id.lastIndexOf("/");
          let name = d.id.slice(index + 1);
          return (
            <div className="inline">
              <div
                className="relative"
                style={{
                  height: heightScale(connectedNodes[0].totalBytes) * 2,
                  width: Math.max(heightScale(d.totalBytes) * 2, 50),
                  marginLeft: 10,
                  marginRight: 10
                }}
              >
                <div
                  className=""
                  style={{
                    width: heightScale(d.totalBytes) * 2,
                    height: heightScale(d.totalBytes) * 2,
                    borderRadius: "100%",
                    background: "#ccc",

                    border: `2px solid ${
                      d.id.indexOf("node_modules") !== -1
                        ? colors[1]
                        : colors[0]
                    }`
                  }}
                />
                <div className="absolute" style={{ top: 0 }}>
                  <p y={-10} fontSize="10" textAnchor="middle">
                    <span>
                      <b>↑</b>
                    </span>{" "}
                    <small>{d.asSource}</small>
                    <br />↓<small>{d.asTarget}</small>
                    <br />
                    <small>{name}</small>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <NetworkFrame
        size={[600, 600]}
        // graph={g}
        networkType={{ type: "force", iterations: 500, simulation }}
        edges={filteredEdges}
        nodes={filteredNodes}
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
