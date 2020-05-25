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

  const selectedNode = nodes.find((d) => d.id === selected);

  return (
    <div>
      <div className="flex">
        <div style={{ width: "25vw" }}>
          <h1>Analyze</h1>
        </div>
        <div>
          <p>
            <img className="icon" alt="details" src="/img/details.png" />
            <b>Details</b>
          </p>
          <p>
            Bundled{" "}
            {withNodeModules && (
              <span>
                <b>{withNodeModules}</b> node_modules
              </span>
            )}{" "}
            {withNodeModules && "with "}
            <b>{withoutNodeModules}</b> files
          </p>
        </div>
      </div>

      <br />
      <FileDetails
        total={total}
        network={network}
        selected={selected}
        changeSelected={changeSelected}
        directoryColors={directoryColors}
        hierarchy={hierarchy}
      />
      {selected && (
        <div className="bottom-panel paper">
          <RippleChart
            changeSelected={changeSelected}
            nodes={nodes.map((d) => Object.assign({}, d))}
            edges={edges.map((d) => Object.assign({}, d))}
            max={max}
            selected={selected}
            directories={directories}
            directoryColors={svgDirectoryColors}
          />
        </div>
      )}
    </div>
  );
}
