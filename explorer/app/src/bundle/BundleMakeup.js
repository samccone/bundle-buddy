import React, { Component } from "react";

import { voronoiTreemap } from "d3-voronoi-treemap";
import { scaleQuantize } from "d3-scale";

// const colorScale = scaleQuantize()
//   .domain([0, 8])
//   .range(["0-1", "2-3", "4-5", "6+"])

const colorScale = scaleQuantize()
  .domain([0, 8])
  .range(["#dff4f2", "#b2dfdb", "#79b9b3"]);

// const colorScaleMap = scaleOrdinal()
//   // .scaleQuantize()
//   .range(["#a1e2cc", "#e8e8e8", "#dfc6de", "#ce8ac8"])
//   .domain(["0-1", "2-3", "4-5", "6+"])

const width = 800;
const height = 500;
class BundleMakeup extends Component {
  constructor(props) {
    super(props);

    voronoiTreemap().size([width, height])(props.hierarchy);

    this.state = {
      h: props.hierarchy
    };
  }

  render() {
    const h = this.state.h;
    const { nodeMap, selected } = this.props;
    const children = h.children;
    const polygons = h.leaves().map((p, i) => {
      const index = p.id.lastIndexOf("/");
      const unselected = selected && !nodeMap[p.id];
      return (
        <g key={i + "polygon"}>
          <clipPath id={p.id}>
            <polygon points={`${p.polygon.map(q => q.join(",")).join(" ")}`} />
          </clipPath>
          <polygon
            points={`${p.polygon.map(q => q.join(",")).join(" ")}`}
            // fillOpacity=".1"
            stroke={"white"}
            strokeWidth={2}
            opacity={1}
            onClick={() => this.props.changeSelected(p.id)}
            fill={unselected ? "#eee" : colorScale(p.data.asSource || 0)}
          />
          <text
            pointerEvents="none"
            x={p.polygon.site.x}
            y={p.polygon.site.y}
            fontSize="11"
            textAnchor="middle"
            fill={unselected ? "#ccc" : "black"}
            clipPath={`url(#${p.id})`}
          >
            {p.id.slice(index + 1)}
          </text>
        </g>
      );
    });

    const total = h.value;
    const topOrBottom = c =>
      c.polygon.site.y / height <= 0.5 ? "top" : "bottom";
    const offsets = { top: 0, bottom: 0 };
    children.forEach(c => {
      c.topOrBottom = topOrBottom(c);
      offsets[c.topOrBottom]++;
    });

    const margin = {
      top: offsets.top * 30,
      bottom: offsets.bottom * 30,
      left: 20,
      right: 20
    };

    offsets.top = 0;
    offsets.bottom = 0;
    return (
      <svg
        width={width + margin.left + margin.right}
        height={height + margin.top + margin.bottom}
        overflow="visible"
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          {polygons}
          {children.map(c => {
            offsets[c.topOrBottom]++;
            const y = c.topOrBottom === "top"
              ? -offsets[c.topOrBottom] * 30 + 20
              : height + offsets[c.topOrBottom] * 30;

            const matchHeight = c.topOrBottom === "top" ? 0 : height;
            const matchingSide = c.polygon.filter(d => d[1] === matchHeight);

            let x = c.polygon.site.x;
            if (matchingSide.length === 2) {
              const xes = matchingSide.map(m => m[0]).sort();
              x = xes[0] + (xes[1] - xes[0]) / 2;
            }

            return (
              <g pointerEvents="none">
                {c.children &&
                  c.children.map(d => {
                    const i = d.id.lastIndexOf("/");

                    const sel =
                      !selected ||
                      (selected && d.leaves().find(l => nodeMap[l.id]));
                    // if (selected) console.log(d)

                    return (
                      <g key={d.id}>
                        <polygon
                          points={`${d.polygon
                            .map(q => q.join(","))
                            .join(" ")}`}
                          fillOpacity="0"
                          stroke={sel ? "black" : "none"}
                          strokeWidth={2}
                          opacity={1}
                        />
                        {d.value / total > 0.01 &&
                          <text
                            x={d.polygon.site.x}
                            y={d.polygon.site.y}
                            fontSize="24"
                            opacity={0.2}
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {d.id.slice(i + 1)}
                          </text>}
                      </g>
                    );
                  })}
                <polygon
                  points={`${c.polygon.map(q => q.join(",")).join(" ")}`}
                  fillOpacity="0"
                  stroke={"black"}
                  strokeWidth={4}
                  opacity={1}
                />
                <line
                  x1={x}
                  x2={x}
                  y1={c.topOrBottom === "bottom" ? y - 20 : y}
                  y2={(c.topOrBottom === "bottom" && height) || 0}
                  stroke="black"
                />
                <text
                  x={x}
                  y={y}
                  fontSize="20"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {c.id}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    );

    // const children = tree.children[0].children

    // const highestLevel = children.map(d => {
    //   const i = d.id.lastIndexOf("/")
    //   return (
    //     <g key={d.id + "group"} transform={`translate(${d.x0},${d.y0})`}>
    //       <rect
    //         stroke="#222"
    //         width={d.x1 - d.x0}
    //         height={d.y1 - d.y0}
    //         fill="none"
    //       />

    //       <text
    //         fontSize={d.height === 4 ? 20 : 15}
    //         y={d.height < 4 && "1em"}
    //         fontWeight="bold"
    //       >
    //         {d.id.slice(i + 1)}
    //       </text>
    //     </g>
    //   )
    // })

    // return (
    //   <svg width={width} height={height} overflow="visible">
    //     {highestLevel}
    //     {children.map(c => {
    //       return (
    //         c.children &&
    //         c.children.map(d => {
    //           const i = d.id.lastIndexOf("/")
    //           return (
    //             <g key={d.id} transform={`translate(${d.x0},${d.y0})`}>
    //               <clipPath id={d.id}>
    //                 <rect
    //                   width={d.x1 - d.x0}
    //                   height={d.y1 - d.y0}
    //                   fillOpacity=".1"
    //                 />
    //               </clipPath>
    //               <rect
    //                 stroke="#ccc"
    //                 width={d.x1 - d.x0}
    //                 height={d.y1 - d.y0}
    //                 fillOpacity=".1"
    //               />
    //               <text
    //                 x={5}
    //                 fontSize="12"
    //                 y={"1em"}
    //                 clipPath={`url(#${d.id})`}
    //               >
    //                 {d.id.slice(i + 1)}
    //               </text>
    //             </g>
    //           )
    //         })
    //       )
    //     })}
    //   </svg>
    // )
  }
}

export default BundleMakeup;
