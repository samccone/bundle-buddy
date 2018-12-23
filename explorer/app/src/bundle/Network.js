import React from "react";
// import dagre from "dagre"
import network from "./prototype-semiotic/trimmed-network.json";
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
  if (c.asSource > 8) {
    // if (c.asSource > 6) {
    p[c.id] = true;
  }

  return p;
}, {});

export default function Dendrogram() {
  const sorted = nodes.sort((a, b) => b.totalBytes - a.totalBytes);
  const heightScale = scaleSqrt()
    .domain([0, (sorted[0] && sorted[0].totalBytes) || 1])
    .range([0, 50]);

  const filteredNodes = nodes.filter(d => !veryConnected[d.id]);

  filteredNodes.forEach(n => {
    n.r = heightScale(n.totalBytes);
  });

  const filteredEdges = edges.filter(
    d =>
      !veryConnected[d.source] &&
      !veryConnected[d.target] &&
      d.target.indexOf("$") === -1
    // filteredNodes.find(n => n.id === d.source) &&
    // filteredNodes.find(n => n.id === d.target)
  );

  // console.log(filteredNodes, filteredEdges)

  // const connectedEdges = edges.filter(
  //   d => veryConnected[d.source] && veryConnected[d.target]
  // )
  const connectedNodes = nodes.filter(d => veryConnected[d.id]);
  const simulation = forceSimulation(filteredNodes)
    .force(
      "charge",
      forceManyBody()
        .strength(0)
        // .distanceMax(100)
        .strength(d => -d.r * 10)
    )
    // .force("collide", forceCollide(d => d.r * 3).strength(1))

    .force(
      "link",
      forceLink(filteredEdges).id(d => d.id).strength(d => {
        // console.log(d)
        return d.target.asTarget > 6 ? 0.01 : 0.2;
      })
    )
    .stop();
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

  // const iterations = 1000
  // for (let i = 0; i < iterations; ++i) simulation.tick()

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

                    border: `2px solid ${d.id.indexOf("node_modules") !== -1
                      ? colors[1]
                      : colors[0]}`
                  }}
                />
                <div className="absolute" style={{ top: 0 }}>
                  <p y={-10} fontSize="10" textAnchor="middle">
                    ↓<small>{d.asTarget}</small> <br />
                    <span>
                      <b>↑</b>
                    </span>{" "}
                    <small>{d.asSource}</small>
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
        size={[900, 600]}
        // graph={g}
        networkType={{ type: "force", iterations: 500 }}
        edges={filteredEdges}
        nodes={nodes}
        nodeStyle={d => {
          return {
            stroke: d.id.indexOf("node_modules") !== -1 ? colors[1] : colors[0],
            fill: veryConnected[d.id]
              ? "#eee"
              : d.id.indexOf("node_modules") !== -1 ? colors[1] : colors[0],
            strokeWidth: 1
          };
        }}
        nodeSizeAccessor={d => heightScale(d.totalBytes)}
        edgeStyle={d => {
          return {
            fill: d.source.id.indexOf("node_modules") !== -1
              ? colors[1]
              : colors[0]
            // opacity: d.target.asTarget > 6 ? 0.2 : 1
            // fillOpacity: 0.75,
            // strokeWidth: 0.5
            //              opacity: isMainPath ? 1 : 0.1
          };
        }}
        edgeType="arrowhead"
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
              {veryConnected[d.id] &&
                <text y={-10} fontSize="10" textAnchor="middle">
                  <tspan fontSize="12" fontWeight="bold">
                    ↑
                  </tspan>{" "}
                  {d.asSource}
                </text>}
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
