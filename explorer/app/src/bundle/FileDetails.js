import React from "react";

import OrdinalFrame from "semiotic/lib/OrdinalFrame";
import ResponsiveOrdinalFrame from "semiotic/lib/ResponsiveOrdinalFrame";
import { colors, primary, mainFileColor, secondaryFileColor } from "../theme";
import { getFileSize, getPercent } from "./stringFormats";

const typeColors = {
  js: mainFileColor,
  ts: mainFileColor,
  jsx: mainFileColor,
  tsx: mainFileColor
};

const frameProps = {
  margin: { top: 50 },
  oAccessor: d => d.parent.id,
  rAccessor: d => d.value,
  type: "bar",
  projection: "vertical",
  oPadding: 2,

  style: d => {
    return {
      fill: typeColors[d.id] || secondaryFileColor
      // stroke: typeColors[d.id] || secondaryFileColor
    };
  }
};

const trimmedProps = {
  ...frameProps,
  rAccessor: "totalBytes",
  oAccessor: "id",
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

  console.log(nodes);

  let withNodeModules = 0;
  let withoutNodeModules = 0;

  nodes.forEach(n => {
    if (n.id.indexOf("node_modules") !== -1) withNodeModules++;
    else withoutNodeModules++;
  });

  return (
    <div className="relative flex top-border">
      <div className="panel ">
        <p>
          <img className="icon" alt="details" src="/img/details.png" />
          <b>Details</b>
        </p>
        <p>
          Bundled{" "}
          {withNodeModules &&
            <span>
              <b>{withNodeModules}</b> node_modules
            </span>}{" "}
          {withNodeModules && "with "}
          <b>{withoutNodeModules}</b> files
        </p>
      </div>
      <div>
        <div className="flex">
          <div className="side-panel left padding">
            <p>
              <b>
                <small>Examine</small>
              </b>
            </p>
            <p>Placeholder Search bar</p>
          </div>
          <div className="side-panel right padding relative">
            <div className="flex">
              {hierarchy.children.sort((a, b) => b.value - a.value).map(l => {
                const d = nodes.filter(d => d.id.indexOf(l.id) === 0);
                return (
                  <div
                    style={{
                      minWidth: 200,
                      width: 200,
                      display: "inline-block"
                    }}
                  >
                    <p>{l.id}</p>
                    <OrdinalFrame
                      data={d}
                      {...frameProps}
                      {...trimmedProps}
                      rExtent={[0, max]}
                      margin={{ left: 45 }}
                      customClickBehavior={changeSelected}
                      size={[180, d.length * 29]}
                      type={{
                        type: "bar",
                        customMark: d => {
                          return (
                            <g onClick={() => changeSelected(d.id)}>
                              <rect
                                width={d.scaledValue}
                                height={8}
                                y={15}
                                fill={mainFileColor}
                              />
                              <text fontSize="12" x={-40} y={10}>
                                <tspan fontWeight="bold">
                                  {getPercent(d.totalBytes, hierarchy.value)}
                                </tspan>
                                <tspan x={0}>
                                  {d.id.replace(l.id + "/", "")}
                                </tspan>
                                <tspan
                                  textAnchor="start"
                                  opacity="0"
                                  fontWeight="bold"
                                >
                                  {d.asSource},{" "}
                                  {counts[d.id] &&
                                    counts[d.id].indirectDependedOnCount}
                                </tspan>{" "}
                              </text>
                            </g>
                          );
                        }
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
