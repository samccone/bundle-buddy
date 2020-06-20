import React from "react";
import FileDetails from "./FileDetails";
import RippleChart from "./RippleChart";
import { ProcessedImportState } from "../types";

type Props = {
  total?: number;
  changeSelected: React.Dispatch<string | null>;
  directoryColors: { [dir: string]: string };
  svgDirectoryColors: { [dir: string]: string };
  network: ProcessedImportState["trimmedNetwork"];
  hierarchy: ProcessedImportState["hierarchy"];
  selected: string | null;
  directories: string[];
};

export default function Analyze(props: Props) {
  const {
    network,
    total,
    hierarchy,
    directoryColors,
    directories,
    changeSelected,
    svgDirectoryColors,
    selected,
  } = props;

  const { nodes = [], edges = [] } = network;

  const max =
    network &&
    network.nodes &&
    network.nodes.sort((a, b) => {
      if (a.totalBytes == null || b.totalBytes == null) {
        return 0;
      }
      return b.totalBytes - a.totalBytes;
    })[0].totalBytes;

  let withNodeModules = 0;
  let withoutNodeModules = 0;

  nodes.forEach((n) => {
    if (n.id.indexOf("node_modules") !== -1) withNodeModules++;
    else withoutNodeModules++;
  });

  return (
    <div className="Analyze">
      <div className="flex header">
        <div className="right-padding left-panel" style={{ width: "25vw" }}>
          <h1 className="uppercase-header">Analyze</h1>
        </div>
        <div>
          <p className="subheader">
            <img className="icon" alt="details" src="/img/details.png" />
            <b>Details</b>
          </p>
          <p>
            This project bundled{" "}
            {withNodeModules && (
              <span>
                <b>{withNodeModules}</b> node_modules
              </span>
            )}{" "}
            {withNodeModules && "with "}
            <b>{withoutNodeModules}</b> files
          </p>
        </div>
        <br />
      </div>

      <FileDetails
        total={total}
        network={network}
        selected={selected}
        changeSelected={changeSelected}
        directoryColors={directoryColors}
        hierarchy={hierarchy}
        directories={directories}
      />
      {selected && (
        <div className="bottom-panel paper">
          <RippleChart
            changeSelected={changeSelected}
            nodes={nodes.map((d) => Object.assign({}, d))}
            edges={edges.map((d) => Object.assign({}, d))}
            max={max}
            selected={selected}
            directoryColors={svgDirectoryColors}
          />
        </div>
      )}
    </div>
  );
}
