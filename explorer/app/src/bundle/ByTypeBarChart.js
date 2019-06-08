import React from "react";

import { primary, mainFileColor, secondaryFileColor } from "../theme";

import { getFileSize, getPercent } from "./stringFormats";
import BarChart from "./BarChart";

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
  oPadding: 10,
  responsiveWidth: true,
  style: d => {
    return {};
  },
  barHeight: 45,
  bar: (d, width) => {
    return (
      <div
        style={{
          background: typeColors[d.name] || d.color || secondaryFileColor,
          height: "100%",
          width
        }}
      />
    );
  },
  oLabel: (d, o, r) => {
    return (
      <div>
        <span>{o}</span>
        <br />
        <span>
          <b>{getPercent(d.pct)}</b>{" "}
          <span style={{ opacity: 0.6 }}>{getFileSize(r)}</span>
        </span>
      </div>
    );
  }
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

export default function ByTypeBarChart({ totalsByType = {}, total, name }) {
  const totalSize = total || totalsByType.value;
  const types = totalsByType.fileTypes || [];
  const folders = totalsByType.directories || [];

  const fileTypes = types.sort((a, b) => b.totalBytes - a.totalBytes);
  const directories = folders.sort((a, b) => b.totalBytes - a.totalBytes);

  let fileTypeMessage;

  if (fileTypes.length === 1) {
    fileTypeMessage = (
      <span>
        Your project only has one file type: <b>{fileTypes[0].name}</b>
      </span>
    );
  } else {
    if (fileTypes[0] && fileTypes[0].pct >= 0.6) {
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
  }

  return (
    <div className="flex padding top-panel">
      <div style={{ width: "25vw" }}>
        <h1>{name}</h1>
        <b>
          <small>Uploaded Date</small>
        </b>
        {totalSize &&
          <div>
            <p>
              <b>
                <small>Total Size</small>
              </b>
            </p>
            <h2>{getFileSize(totalSize)}</h2>
          </div>}
      </div>
      <div className="scroll-y" style={{ width: "37vw" }}>
        <div className="sticky-wrapper">
          <div className="sticky">
            {" "}
            <p>
              <img className="icon" alt="file types" src="/img/file.png" />
              <b>
                <small>File Types</small>
              </b>
            </p>
            <p>{fileTypeMessage}</p>
          </div>
          <BarChart {...frameProps} data={fileTypes} />
        </div>
      </div>
      <div className="scroll-y" style={{ width: "37vw" }}>
        <div className="sticky-wrapper">
          <div className="sticky">
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
          </div>
          <BarChart {...directoryProps} data={directories} />
        </div>
      </div>
    </div>
  );
}
