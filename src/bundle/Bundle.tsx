import React, { useState, useMemo, useEffect } from "react";
import Header from "./Header";
import Report from "./Report";
import FileDetails from "./FileDetails";
import RippleChart from "./RippleChart";
import Treemap from "./Treemap";
import { colors } from "../theme";
import {
  TrimmedNetwork,
  BundleNetworkCount,
  ProcessedImportState
} from "../types";
import { requiredBy } from "../graph";

// noopener noreferrer
function countsFromNetwork(
  network: TrimmedNetwork
): { [target: string]: BundleNetworkCount } {
  const d: { [target: string]: BundleNetworkCount } = {};

  for (const n of network.edges) {
    if (d[n.target] == null) {
      d[n.target] = {
        requiredBy: new Set(),
        requires: new Set()
      };
    }

    (d[n.target].requires as Set<string>).add(n.source);

    if (d[n.source] == null) {
      d[n.source] = {
        requiredBy: new Set(),
        requires: new Set()
      };
    }
  }

  const keys = Object.keys(d);

  for (const k of keys) {
    for (const k2 of keys) {
      if (k !== k2 && (d[k2].requires as Set<string>).has(k)) {
        (d[k].requiredBy as Set<string>).add(k2);
      }
    }
  }

  for (const k of keys) {
    d[k] = {
      requiredBy: Array.from(d[k].requiredBy),
      requires: Array.from(d[k].requires)
    };
  }

  const deps = requiredBy(d);
  for (const moduleName of Object.keys(d)) {
    d[moduleName].transitiveRequiredBy = deps[moduleName].transitiveRequiredBy;
  }

  return d;
}

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
    type: "application/json"
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
  const counts = useMemo(() => countsFromNetwork(trimmedNetwork), [
    trimmedNetwork
  ]);

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
    .map(d => d.name);

  const directoryColors: { [dir: string]: string } = {};
  let i = 0;
  directories.forEach(d => {
    if (d.indexOf("node_modules") !== -1) {
      directoryColors[d] = "url(#dags)";
    } else {
      directoryColors[d] = colors[i] || "black";
      i++;
    }
  });

  rollups.directories.forEach(d => {
    d.color = directoryColors[d.name];
  });

  const nodesWithMetadata = nodes.map(d => {
    const index = d.id.indexOf("/");
    if (index !== -1) d.directory = d.id.slice(0, index);
    else d.directory = "No Directory";
    const lastSlash = d.id.lastIndexOf("/");

    const nodeWithMetadata = {
      ...d,
      text:
        (d.directory !== "No Directory" &&
          d.id.replace(d.directory + "/", "")) ||
        d.id,
      fileName: d.id.slice(lastSlash !== -1 ? lastSlash + 1 : 0),
      count: counts[d.id]
    };

    return nodeWithMetadata;
  });

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
              nodes={nodesWithMetadata.map(d => Object.assign({}, d))}
              edges={edges.map(d => Object.assign({}, d))}
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
