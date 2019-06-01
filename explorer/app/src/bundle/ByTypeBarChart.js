import React from "react";

import ResponsiveOrdinalFrame from "semiotic/lib/ResponsiveOrdinalFrame";
import { primary, mainFileColor, secondaryFileColor } from "../theme";

import { getFileSize, getPercent } from "./stringFormats";

export const typeColors = {
  js: mainFileColor,
  ts: mainFileColor,
  jsx: mainFileColor,
  tsx: mainFileColor
};

const frameProps = {
  margin: { top: 5, right: 50, left: 140 },
  oAccessor: d => d.name,
  rAccessor: d => d.totalBytes,
  type: "bar",
  projection: "horizontal",
  oPadding: 10,
  responsiveWidth: true,
  style: d => {
    return {
      fill: typeColors[d.name] || d.color || secondaryFileColor
    };
  }
};

frameProps.oLabel = (d, arr) => {
  return (
    <text transform={`translate(-${frameProps.margin.left - 5}, -5)`}>
      <tspan>{d}</tspan>
      <tspan x={0} y={18} fontWeight="bold">
        {getPercent(arr[0].pct)}{" "}
      </tspan>
      <tspan opacity=".6">{arr[0] && getFileSize(arr[0].totalBytes)}</tspan>
    </text>
  );
};

const directoryProps = {
  ...frameProps,
  additionalDefs: [
    <pattern
      key="1"
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
    <pattern
      key="2"
      id="dags"
      patternUnits="userSpaceOnUse"
      width="4"
      height="4"
    >
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

  let fileTypeMessage;

  if (fileTypes.length === 1) {
    fileTypeMessage = (
      <span>
        Your project only has one file type: <b>{fileTypes[0].name}</b>
      </span>
    );
  } else {
    if (fileTypes[0].pct >= 0.6) {
      fileTypeMessage = (
        <span>
          Your project has <b>{fileTypes.length}</b> file types, but it is
          mostly <b>{fileTypes[0].name}</b> files.
        </span>
      );
    } else {
      fileTypeMessage = (
        <span>
          Your bundle has <b>{fileTypes.length}</b> file types
        </span>
      );
    }

    // console.log(fileTypes);
  }

  return (
    <div className="flex padding top-panel">
      <div style={{ width: "25vw" }}>
        <h1>Project Name</h1>
        <b>
          <small>Uploaded Date</small>
        </b>
        <p>
          <b>
            <small>Total Size</small>
          </b>
        </p>
        <h2>{getFileSize(totalSize)}</h2>
      </div>
      <div style={{ width: "37vw" }}>
        <p>
          <img className="icon" alt="file types" src="/img/file.png" />
          <b>
            <small>File Types</small>
          </b>
        </p>
        <p>{fileTypeMessage}</p>

        <ResponsiveOrdinalFrame
          size={[100, fileTypes.length * 45 + frameProps.margin.top]}
          {...frameProps}
          data={fileTypes}
          className="overflow-visible"
        />
      </div>
      <div style={{ width: "37vw" }}>
        <p>
          <img className="icon" alt="directories" src="/img/folder.png" />
          <b>
            <small>Directories</small>
          </b>
        </p>
        <p>
          Your project is made up <b>{directories.length}</b> top-level
          directories
        </p>

        <ResponsiveOrdinalFrame
          size={[100, directories.length * 45 + frameProps.margin.top]}
          {...directoryProps}
          data={directories}
        />
      </div>
    </div>
  );
}
