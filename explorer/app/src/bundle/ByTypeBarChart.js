//What are modules that I am directly importing?
//What are modules that are secondary imports?

//Top-level hierarchy of fileType by level 1 hierarchy?

import React from "react";

import OrdinalFrame from "semiotic/lib/OrdinalFrame";
import { colors } from "../theme";

export default function OverviewBarChart({ hierarchy }) {
  const typeColors = {
    js: colors[0],
    ts: colors[0]
  };

  const radius = 100;
  const frameProps = {
    size: [radius * 2, radius * 2],
    oAccessor: "id",
    rAccessor: d => 1,
    projection: "radial",
    // oLabel: true,
    margin: 0,
    dynamicColumnWidth: "value",
    // rAccessor: "value",
    style: d => {
      return {
        fill: typeColors[d.id] || colors[1],
        stroke: "white"
      };
    }
  };

  return (
    <div className="relative">
      <h2>
        Total Size:{Math.round(hierarchy.value / 1024)}KB,{" "}
        {(hierarchy.value / 1024 / 1024).toFixed(2)}MB
      </h2>
      <div style={{ height: radius * 2, margin: 20 }}>
        {hierarchy.children
          .sort((a, b) => b.value - a.value)
          .map((d, i, arr) => {
            const ratio =
              arr.slice(0, i).reduce((p, c) => p + c.value, 0) /
              hierarchy.value;

            const margin = radius * ratio * ratio;

            const innerRadius =
              radius -
              (radius * arr.slice(0, i + 1).reduce((p, c) => p + c.value, 0)) /
                hierarchy.value;

            return (
              <div className="absolute">
                <OrdinalFrame
                  {...frameProps}
                  type={{
                    type: "bar",
                    outerRadius: radius - margin,
                    innerRadius
                  }}
                  margin={margin}
                  data={d.children.sort((a, b) => a.value - b.value)}
                  title={
                    1 - ratio > 0.01 && (
                      <g>
                        <text
                          fontSize="16"
                          x={-5}
                          textAnchor="end"
                          fontWeight="100"
                          y={margin + 17}
                        >
                          {(d.value / 1024).toFixed(0)} KB
                        </text>
                        <text
                          fontSize="12"
                          fontWeight="bold"
                          x={-5}
                          textAnchor="end"
                          y={margin - 5}
                        >
                          {d.id}
                        </text>
                      </g>
                    )
                  }
                />
              </div>
            );
          })}
      </div>
    </div>
  );
}
