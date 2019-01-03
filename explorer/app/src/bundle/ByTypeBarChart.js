import React from "react";

import OrdinalFrame from "semiotic/lib/OrdinalFrame";
import ResponsiveOrdinalFrame from "semiotic/lib/ResponsiveOrdinalFrame";
import { colors, primary, mainFileColor, secondaryFileColor } from "../theme";

import { getFileSize, getPercent } from "./stringFormats";

export const typeColors = {
  js: mainFileColor,
  ts: mainFileColor,
  jsx: mainFileColor,
  tsx: mainFileColor
};

const frameProps = {
  margin: { top: 10 },
  oAccessor: d => d.parent.id,
  rAccessor: d => d.value,
  type: "bar",
  projection: "vertical",
  oPadding: 2,

  style: d => {
    // console.log(d);
    return {
      fill: d.color || d.parent.color //typeColors[d.id] || secondaryFileColor
      // stroke: typeColors[d.id] || secondaryFileColor
    };
  }
};

export default function OverviewBarChart({
  hierarchy,
  network = {},
  changeSelected,
  counts
}) {
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
    <div>
      <h1>Project Name</h1>
      <b>
        <small>Uploaded Date</small>
      </b>
      <h2>{getFileSize(totalSize)}</h2>
      <p>
        <img className="icon" alt="file types" src="/img/file.png" />
        <b>
          <small>File Types</small>
        </b>
      </p>

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
      />
      <p>
        Your bundle is made up <b>{hierarchy.children.length}</b> top-level
        directories
      </p>
      <p>
        <img className="icon" alt="directories" src="/img/folder.png" />
        <b>
          <small>Directories</small>
        </b>
      </p>
      <ResponsiveOrdinalFrame
        size={[100, hierarchy.children.length * 70]}
        {...frameProps}
        projection="horizontal"
        responsiveWidth={true}
        oPadding={40}
        data={hierarchy.leaves().sort((a, b) => b.value - a.value)}
        oLabel={(d, arr) => {
          return (
            <text transform="translate(5, -35)">
              <tspan>{d}</tspan>
              <tspan x={0} y={18} fontWeight="bold">
                {Math.round(arr[0].parent.value / hierarchy.value * 100)}%{" "}
              </tspan>
              <tspan opacity=".6">
                {arr[0].parent && (arr[0].parent.value / 1024).toFixed(2)} KB
              </tspan>
            </text>
          );
        }}
      />
    </div>
  );
}
