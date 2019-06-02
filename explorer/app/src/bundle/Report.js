import React from "react";

// import { primary, mainFileColor, secondaryFileColor } from "../theme";

// import { getFileSize, getPercent } from "./stringFormats";

export default function ByTypeBarChart({
  totalsByType,
  total,
  duplicateNodeModules
}) {
  // const totalSize = total;

  const fileTypes = totalsByType.fileTypes.sort(
    (a, b) => b.totalBytes - a.totalBytes
  );
  // const directories = totalsByType.directories.sort(
  //   (a, b) => b.totalBytes - a.totalBytes
  // );

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
  }

  return (
    <div className="flex padding top-panel">
      <div style={{ width: "25vw" }}>
        <h1>Report</h1>
      </div>
      <div style={{ width: "37vw" }}>
        <p>
          <img className="icon" alt="file types" src="/img/file.png" />
          <b>
            <small>File Types (placeholder)</small>
          </b>
        </p>
        <p>{fileTypeMessage}</p>
      </div>
      <div className="scoll-y" style={{ width: "37vw" }}>
        <div className="sticky-wrapper">
          <div className="sticky">
            <p>
              <img className="icon" alt="directories" src="/img/folder.png" />
              <b>
                <small>Duplicate Node Modules</small>
              </b>
            </p>
          </div>
          {Object.keys(duplicateNodeModules).map(k => {
            return (
              <div key={k}>
                <p>
                  <b>{k}</b>: {duplicateNodeModules[k].join(", ")}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
