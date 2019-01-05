import React from "react";

import ResponsiveOrdinalFrame from "semiotic/lib/ResponsiveOrdinalFrame";
import { colors, mainFileColor, secondaryFileColor } from "../theme";
import { getPercent } from "./stringFormats";

const typeColors = {
  js: mainFileColor,
  ts: mainFileColor,
  jsx: mainFileColor,
  tsx: mainFileColor
};

const frameProps = {
  type: "bar",
  oPadding: 2,
  rAccessor: "totalBytes",
  oAccessor: "id",
  margin: { left: 70 },
  projection: "horizontal",

  style: () => {
    return {
      fill: colors[0],
      stroke: "white"
    };
  }
};

export default class OverviewBarChart extends React.Component {
  state = { search: "" };

  render() {
    const {
      hierarchy,
      network = {},
      changeSelected,
      counts,
      directoryColors
    } = this.props;
    const nodes = network.nodes.sort((a, b) => b.totalBytes - a.totalBytes);
    const max = nodes[0].totalBytes;

    let withNodeModules = 0;
    let withoutNodeModules = 0;

    nodes.forEach(n => {
      if (n.id.indexOf("node_modules") !== -1) withNodeModules++;
      else withoutNodeModules++;
    });

    return (
      <div>
        <p>
          <img className="icon" alt="details" src="/img/details.png" />
          <b>Details</b>
        </p>
        <p>
          Bundled{" "}
          {withNodeModules &&
            <span>
              <b>{withNodeModules}</b> node_modules
            </span>}{" "}
          {withNodeModules && "with "}
          <b>{withoutNodeModules}</b> files
        </p>

        <ResponsiveOrdinalFrame
          data={nodes.sort((a, b) => b.totalBytes - a.totalBytes)}
          {...frameProps}
          rExtent={[0, max]}
          customClickBehavior={changeSelected}
          responsiveWidth={true}
          size={[180, nodes.length * 29]}
          type={{
            type: "bar",
            customMark: d => {
              const count = counts[d.id];
              return (
                <g onClick={() => changeSelected(d.id)}>
                  <rect
                    width={d.scaledValue}
                    height={8}
                    y={15}
                    fill={directoryColors[d.directory] || "url(#dags)"}
                  />
                  <text fontSize="12" x={-30} y={10}>
                    {count && count.transitiveRequiredBy.length}
                  </text>
                  <text fontSize="12" x={-40} y={10}>
                    <tspan fontWeight="bold" textAnchor="end">
                      {getPercent(d.totalBytes, hierarchy.value)}
                    </tspan>
                    <tspan x={0}>
                      {(d.directory !== "No Directory" &&
                        d.id.replace(d.directory + "/", "")) ||
                        d.id}
                    </tspan>
                    <tspan textAnchor="start" opacity="0" fontWeight="bold">
                      {d.asSource},{" "}
                      {counts[d.id] && counts[d.id].indirectDependedOnCount}
                    </tspan>{" "}
                  </text>
                </g>
              );
            }
          }}
        />
      </div>
    );
  }
}
