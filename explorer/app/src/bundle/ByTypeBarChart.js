import React from "react";

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
  oAccessor: d => d.name,
  rAccessor: d => d.totalBytes,
  type: "bar",
  projection: "horizontal",
  oPadding: 2,
  responsiveWidth: true,
  style: d => {
    return {
      fill: d.color
    };
  }
};

const directoryProps = {
  ...frameProps,
  additionalDefs: [
    <pattern
      id="dags-primary"
      patternUnits="userSpaceOnUse"
      width="4"
      height="4"
    >
      <path
        d="M 0,4 l 4,-4 M -1,1 l 2,-2 M 3,5 l 2,-2"
        shapeRendering="auto"
        stroke={primary}
        strokeLinecap="square"
      />
    </pattern>,
    <pattern id="dags" patternUnits="userSpaceOnUse" width="4" height="4">
      <path
        d="M 0,4 l 4,-4 M -1,1 l 2,-2 M 3,5 l 2,-2"
        shapeRendering="auto"
        stroke={"#ddd"}
        strokeLinecap="square"
      />
    </pattern>
  ]
};

export default function ByTypeBarChart({ totalsByType, total }) {
  const totalSize = total;

  const fileTypes = totalsByType.fileTypes.sort(
    (a, b) => b.totalBytes - a.totalBytes
  );
  const directories = totalsByType.directories.sort(
    (a, b) => b.totalBytes - a.totalBytes
  );

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
        data={fileTypes}
        oAccessor={"none"}
        margin={{ right: 100 }}
        className="overflow-visible"
        type={{
          type: "bar",
          customMark: d => {
            if (!d.totalBytes) return null;

            const color = typeColors[d.name] || secondaryFileColor;
            return (
              <g transform="translate(0, 30)">
                <rect
                  width={d.scaledValue}
                  height={40}
                  fill={color}
                  stroke={color}
                />
                <text fontWeight="bold" y={-5}>
                  {getPercent(d.totalBytes, totalSize)}
                </text>
                <text y={25} x={5}>
                  .{d.name}
                </text>
              </g>
            );
          }
        }}
      />
      <p>
        Your bundle is made up <b>{directories.length}</b> top-level directories
      </p>
      <p>
        <img className="icon" alt="directories" src="/img/folder.png" />
        <b>
          <small>Directories</small>
        </b>
      </p>
      <ResponsiveOrdinalFrame
        size={[100, directories.length * 70]}
        {...directoryProps}
        oPadding={40}
        data={directories}
        oLabel={(d, arr) => {
          return (
            <text transform="translate(5, -35)">
              <tspan>{d}</tspan>
              <tspan x={0} y={18} fontWeight="bold">
                {getPercent(arr[0].pct)}{" "}
              </tspan>
              <tspan opacity=".6">
                {arr[0] && (arr[0].totalBytes / 1024).toFixed(2)} KB
              </tspan>
            </text>
          );
        }}
      />
    </div>
  );
}
