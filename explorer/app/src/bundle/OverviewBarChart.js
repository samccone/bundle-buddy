//What are modules that I am directly importing?
//What are modules that are secondary imports?

//Top-level hierarchy of fileType by level 1 hierarchy?

import React from "react";

import OrdinalFrame from "semiotic/lib/OrdinalFrame";
// import NetworkFrame from "semiotic/lib/NetworkFrame"
import { colors } from "../theme";
import { partition } from "d3-hierarchy";
import { scaleQuantize } from "d3-scale";

export default function OverviewBarChart({ hierarchy }) {
  // const data = hierarchy.children
  //   .concat(
  //     hierarchy.children.reduce((p, c) => {
  //       if (c.children) {
  //         p = p.concat(c.children)
  //         p = p.concat(
  //           c.children.reduce((t, s) => {
  //             if (s.children) return t.concat(s.children)
  //             return t
  //           }, [])
  //         )
  //       }
  //       return p
  //     }, [])
  //   )
  //   .concat(hierarchy.leaves().filter(d => d.depth > 3))

  // console.log(hierarchy)
  // const radius = 100
  const colorScale = scaleQuantize()
    .domain([0, 8])
    .range(["#dff4f2", "#b2dfdb", "#79b9b3"]);

  const height = 2500;
  const width = 1000;
  const rootNode = partition()
    .size([height, width])
    .padding(0)(hierarchy.sort((a, b) => b.value - a.value));
  return (
    <div>
      <h2>
        Total Size:{Math.round(hierarchy.value / 1024)}KB,{" "}
        {(hierarchy.value / 1024 / 1024).toFixed(2)}MB
      </h2>

      <svg width={width} height={height}>
        <g>
          {rootNode
            .descendants()
            .filter(d => d.depth)
            .map(d => {
              // console.log(d)
              const index = d.id.lastIndexOf("/");
              return (
                <g key={d.id} transform={`translate(${d.y0},${d.x0} )`}>
                  <clipPath id={d.id + "rect"}>
                    <rect width={d.y1 - d.y0} height={d.x1 - d.x0} />
                  </clipPath>
                  <rect
                    width={d.y1 - d.y0}
                    height={d.x1 - d.x0}
                    fill={colorScale(d.data.asSource || 0)}
                    stroke={"white"}
                  />
                  <text
                    pointerEvents="none"
                    y={10}
                    x={4}
                    // x={p.polygon.site.x}
                    // y={p.polygon.site.y}
                    fontSize="10"
                    clipPath={`url(#${d.id + "rect"})`}
                  >
                    {d.id.slice(index + 1)}
                  </text>
                </g>
              );
            })}
        </g>
      </svg>
    </div>
  );
}
