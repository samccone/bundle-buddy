import React from "react";

import OrdinalFrame from "semiotic/lib/OrdinalFrame";
import ResponsiveOrdinalFrame from "semiotic/lib/ResponsiveOrdinalFrame";
import { colors, primary, mainFileColor, secondaryFileColor } from "../theme";

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

const mb = 1024 * 1024;
const kb = 1024;
const getFileSize = size => {
  return (
    (size && size >= mb ? size / mb : size / kb).toFixed(2) +
    " " +
    (size >= mb ? "MB" : "KB")
  );
};

const getPercent = (size, total) => {
  let rounded = size / total * 100;

  if (rounded < 1) rounded = rounded.toFixed(2);
  else rounded = rounded.toFixed(0);

  return rounded + "%";
};

export default function OverviewBarChart({
  hierarchy,
  network = {},
  changeSelected,
  counts
}) {
  const nodes = network.nodes.sort((a, b) => b.totalBytes - a.totalBytes);
  const max = nodes[0].totalBytes;

  const totalSize = hierarchy.value;

  const fileTypes = hierarchy.leaves().reduce((p, c) => {
    if (!p[c.id]) {
      p[c.id] = {
        id: c.id,
        value: c.value
      };
    } else {
      p[c.id].value += c.value;
    }

    return p;
  }, {});

  return (
    <div className="relative flex">
      <div className="panel">
        <h1>Project Name</h1>
        <b>
          <small>Uploaded Date</small>
        </b>
        <h2>{getFileSize(totalSize)}</h2>

        <p>
          Your bundle is made up <b>{hierarchy.children.length}</b> top-level
          directories
        </p>
      </div>
      <div>
        <div className="flex">
          <div className="side-panel left padding">
            <p>
              <b>
                <small>File Types</small>
              </b>
            </p>
          </div>
          <div className="side-panel right padding relative">
            <ResponsiveOrdinalFrame
              size={[500, 100]}
              {...frameProps}
              data={Object.values(fileTypes).sort((a, b) => b.value - a.value)}
              oAccessor={"none"}
              margin={{ right: 100 }}
              responsiveWidth={true}
              className="overflow-visible"
              projection="horizontal"
              type={{
                type: "bar",
                customMark: d => {
                  if (!d.value) return null;

                  const color = typeColors[d.id] || secondaryFileColor;
                  return (
                    <g transform="translate(0, 30)">
                      <rect
                        width={d.scaledValue}
                        height={40}
                        fill={color}
                        stroke={color}
                      />
                      <text fontWeight="bold" y={-5}>
                        {getPercent(d.value, hierarchy.value)}
                      </text>
                      <text y={25} x={5}>
                        .{d.id}
                      </text>
                    </g>
                  );
                }
              }}
              // oLabel={(d, arr) => {
              //   return (
              //     <text textAnchor="middle" fontSize="10" opacity=".6">
              //       <tspan>{d}</tspan>
              //       <tspan x={0} y={15} fontWeight="bold">
              //         {Math.round((arr[0].parent.value / hierarchy.value) * 100)}%{" "}
              //       </tspan>
              //       <tspan>
              //         {arr[0].parent && (arr[0].parent.value / 1024).toFixed(2)}{" "}
              //         KB
              //       </tspan>
              //     </text>
              //   );
              // }}
            />
          </div>
        </div>
        <div className="flex">
          <div className="side-panel left padding">
            <p>
              <b>
                <small>Directories</small>
              </b>
            </p>
          </div>
          <div className="side-panel right padding relative">
            <OrdinalFrame
              size={[hierarchy.children.length * 200, 120]}
              {...frameProps}
              data={hierarchy.leaves().sort((a, b) => b.value - a.value)}
              oLabel={(d, arr) => {
                return (
                  <text
                    transform="translate(0, -110)"
                    textAnchor="middle"
                    opacity=".6"
                  >
                    <tspan>{d}</tspan>
                    <tspan x={0} y={15} fontWeight="bold">
                      {Math.round(arr[0].parent.value / hierarchy.value * 100)}
                      %{" "}
                    </tspan>
                    <tspan>
                      {arr[0].parent &&
                        (arr[0].parent.value / 1024).toFixed(2)}{" "}
                      KB
                    </tspan>
                  </text>
                );
              }}
            />
          </div>
        </div>

        <div className="flex">
          <div className="side-panel left padding">
            <p>
              <b>
                <small>Files</small>
              </b>
            </p>
          </div>
          <div className="side-panel right padding">
            {hierarchy.children.sort((a, b) => b.value - a.value).map(l => {
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
      </div>
    </div>
  );
}
