import React from "react";

import OrdinalFrame from "semiotic/lib/OrdinalFrame";
import { colors } from "../theme";

const typeColors = {
  js: colors[0],
  ts: colors[0],
  jsx: colors[0],
  tsx: colors[0]
};

const frameProps = {
  margin: { left: 20, bottom: 40 },
  oAccessor: d => d.parent.id,
  rAccessor: d => d.value,
  type: "bar",
  projection: "vertical",
  oPadding: 2,

  style: d => {
    return {
      fill: typeColors[d.id] || colors[1],
      stroke: typeColors[d.id] || colors[1]
    };
  }
};

const trimmedProps = {
  ...frameProps,
  rAccessor: "totalBytes",
  oAccessor: "id",
  size: [400, 1000],
  margin: 0,
  projection: "horizontal",

  style: d => {
    return {
      fill: colors[0],
      stroke: "white"
    };
  }
};

export default function OverviewBarChart({
  hierarchy,
  network = {},
  changeSelected,
  counts
}) {
  const nodes = network.nodes.sort((a, b) => b.totalBytes - a.totalBytes);
  const max = nodes[0].totalBytes;

  return (
    <div className="relative">
      <h2>
        Total Size:{Math.round(hierarchy.value / 1024)}KB,{" "}
        {(hierarchy.value / 1024 / 1024).toFixed(2)}MB
      </h2>
      <div>
        <OrdinalFrame
          size={[hierarchy.children.length * 200, 100]}
          {...frameProps}
          data={hierarchy.leaves()}
          oLabel={(d, arr) => {
            return (
              <text textAnchor="middle" fontSize="10" opacity=".6">
                <tspan>{d}</tspan>
                <tspan x={0} y={15} fontWeight="bold">
                  {Math.round(arr[0].parent.value / hierarchy.value * 100)}%{" "}
                </tspan>
                <tspan>
                  {arr[0].parent && (arr[0].parent.value / 1024).toFixed(2)} KB
                </tspan>
              </text>
            );
          }}
        />
      </div>

      <div
        style={{
          marginLeft: frameProps.margin.left,
          display: "flex"
        }}
      >
        {hierarchy.children.map(l => {
          const d = nodes.filter(d => d.id.indexOf(l.id) !== -1);
          return (
            <div style={{ width: 200, display: "inline-block" }}>
              <OrdinalFrame
                data={d}
                {...frameProps}
                {...trimmedProps}
                rExtent={[0, max]}
                customClickBehavior={changeSelected}
                size={[200, d.length * 13]}
                oLabel={(d, arr) =>
                  <text
                    fontSize="12"
                    opacity=".6"
                    x={3}
                    y={3}
                    onClick={() => changeSelected(d)}
                  >
                    <tspan textAnchor="start" fontWeight="bold">
                      {arr[0].asSource},{" "}
                      {counts[d] && counts[d].indirectDependedOnCount}
                    </tspan>{" "}
                    <tspan x={45}>{d.replace(l.id + "/", "")}</tspan>
                  </text>}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
