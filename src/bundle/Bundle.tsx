import React, { useState, useEffect } from "react";
import Header from "./Header";
import Report from "./Report";
import FileDetails from "./FileDetails";
import RippleChart from "./RippleChart";
import Treemap from "./Treemap";
import { colors } from "../theme";
import { ProcessedImportState } from "../types";

function storeSelected(selected?: string | null) {
  if (selected) {
    window.history.pushState(
      { ...window.history.state, selected },
      "",
      selected
        ? `${window.location.origin}${
            window.location.pathname
          }?selected=${encodeURIComponent(selected)}`
        : `${window.location.origin}${window.location.pathname}`
    );
  }
}

function download(props: Props) {
  const blob = new Blob([JSON.stringify(props)], {
    type: "application/json",
  });
  const objectURL = URL.createObjectURL(blob);
  const a: HTMLAnchorElement = document.createElement("a");
  a.setAttribute("download", "bundle-buddy-share.json");
  a.href = objectURL;
  a.click();
}

interface Props extends ProcessedImportState {
  selected?: string | null;
}
export default function Bundle(props: Props) {
  const { trimmedNetwork, rollups, hierarchy, duplicateNodeModules } = props;

  const [selected, changeSelected] = useState(props.selected);
  useEffect(() => storeSelected(selected), [selected]);

  const network = trimmedNetwork;

  let edges = network.edges || [],
    nodes = network.nodes || [];

  const max =
    network &&
    network.nodes &&
    network.nodes.sort((a, b) => {
      if (a.totalBytes == null || b.totalBytes == null) {
        return 0;
      }
      return b.totalBytes - a.totalBytes;
    })[0].totalBytes;

  const directories = rollups.directories
    .sort((a, b) => b.totalBytes - a.totalBytes)
    .map((d) => d.name);

  const directoryColors: { [dir: string]: string } = {};
  let i = 0;
  directories.forEach((d) => {
    if (d.indexOf("node_modules") !== -1) {
      directoryColors[d] = "url(#dags)";
    } else {
      directoryColors[d] = colors[i] || "black";
      i++;
    }
  });

  rollups.directories.forEach((d) => {
    d.color = directoryColors[d.name];
  });

  // const nodesWithMetadata = nodes.map((d) => {
  //   const nodeWithMetadata = {
  //     ...d,

  //     count: counts[d.id],
  //   };

  //   return nodeWithMetadata;
  // });

  return (
    <div>
      <button onClick={() => download(props)}>download analysis</button>
      <div>
        <Header rollups={rollups} />
      </div>
      <div>
        <Report duplicateNodeModules={duplicateNodeModules} />
      </div>
      <div className="flex page">
        <div className="panel">
          <FileDetails
            total={rollups.value}
            network={network}
            changeSelected={changeSelected}
            directoryColors={directoryColors}
          />
        </div>
        <div className="panel large">
          {selected ? (
            <RippleChart
              changeSelected={changeSelected}
              nodes={nodes.map((d) => Object.assign({}, d))}
              edges={edges.map((d) => Object.assign({}, d))}
              max={max}
              selected={selected}
              directories={directories}
              directoryColors={directoryColors}
            />
          ) : (
            <Treemap
              hierarchy={hierarchy}
              bgColorsMap={directoryColors}
              changeSelected={changeSelected}
            />
          )}
        </div>
      </div>
    </div>
  );
}
