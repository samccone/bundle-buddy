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
  margin: { left: 95, top: 70 },
  projection: "horizontal",

  style: () => {
    return {
      fill: colors[0],
      stroke: "white"
    };
  },
  foregroundGraphics: [
    <g transform="translate(0, 65) " fontSize="13">
      <g transform="translate(55, 0)  rotate(-45)">
        <text>Requires</text>{" "}
      </g>
      <g transform="translate(80, 0) rotate(-45)">
        <text>Required By</text>
      </g>
    </g>
  ]
};

export default class OverviewBarChart extends React.Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.resetSearch = this.resetSearch.bind(this);

    this.state = { search: "" };
  }

  onChange(e, t) {
    this.setState({ search: e.currentTarget.value });
  }

  resetSearch() {
    this.setState({ search: "" });
    this.search.value = "";
  }

  render() {
    const {
      hierarchy,
      network = {},
      changeSelected,
      counts,
      directoryColors
    } = this.props;

    let nodes = network.nodes.sort((a, b) => b.totalBytes - a.totalBytes);

    const max = nodes[0].totalBytes;

    let withNodeModules = 0;
    let withoutNodeModules = 0;

    nodes.forEach(n => {
      if (n.id.indexOf("node_modules") !== -1) withNodeModules++;
      else withoutNodeModules++;
    });

    if (this.state.search) {
      const values = this.state.search.split(" ").map(d => d.toLowerCase());
      nodes = nodes.filter(d =>
        values.find(v => d.id.toLowerCase().indexOf(v) !== -1)
      );
    }

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
        <div>
          <input
            type="text"
            placeholder="Search"
            onChange={this.onChange}
            ref={input => (this.search = input)}
          />
          <button>
            <span style={{ color: "red" }} onClick={this.resetSearch}>
              ✖
            </span>
          </button>
        </div>

        <ResponsiveOrdinalFrame
          data={nodes}
          {...frameProps}
          rExtent={[0, max]}
          customClickBehavior={changeSelected}
          responsiveWidth={true}
          size={[180, nodes.length * 29 + frameProps.margin.top]}
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
                  <text fontSize="12" x={-10} y={10} textAnchor="end">
                    {count && count.transitiveRequiredBy.length}
                  </text>
                  <text fontSize="12" x={-40} y={10} textAnchor="end">
                    {count && count.requires.length}
                  </text>
                  <text fontSize="12" x={-70} y={10}>
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
