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
  margin: { left: 95, top: 80 },
  projection: "horizontal",

  style: () => {
    return {
      fill: colors[0],
      stroke: "white"
    };
  }
};

const options = [
  {
    value: "totalBytes",
    label: "Size"
  },
  {
    value: "requires",
    label: "Requires"
  },
  {
    value: "transitiveRequiredBy",
    label: "Required By"
  },
  {
    value: "text",
    label: "Name"
  }
];

export default class OverviewBarChart extends React.Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.resetSearch = this.resetSearch.bind(this);

    this.state = { search: "", order: "desc", sort: "totalBytes" };
  }

  onChange(e, t) {
    this.setState({ search: e.currentTarget.value });
  }

  resetSearch() {
    this.setState({ search: "" });
    this.search.value = "";
  }

  sort(type) {
    if (type === this.state.sort) {
      this.setState({ order: this.state.order === "desc" ? "asc" : "desc" });
      console.log("IN SAME TYPE");
    } else {
      this.setState({ sort: type, order: type === "id" ? "asc" : "desc" });
    }
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
      nodes = nodes.filter(
        d => !values.find(v => d.id.toLowerCase().indexOf(v) === -1)
      );
    }

    if (this.state.sort !== "totalBytes" || this.state.order !== "desc") {
      const sign = this.state.order === "desc" ? -1 : 1;

      if (this.state.sort === "text") {
        if (this.state.order === "desc") {
          nodes = nodes.sort((a, b) => b.text.localeCompare(a.text));
        } else {
          nodes = nodes.sort((a, b) => a.text.localeCompare(b.text));
        }
      } else if (this.state.sort === "totalBytes") {
        nodes = nodes.sort(
          (a, b) => sign * a[this.state.sort] - sign * b[this.state.sort]
        );
      } else {
        nodes = nodes.sort((a, b) => {
          const av =
            sign *
            ((counts[a.id] && counts[a.id][this.state.sort].length) || 0);
          const bv =
            sign *
            ((counts[b.id] && counts[b.id][this.state.sort].length) || 0);
          return av - bv;
        });
      }
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
            className="search"
            onChange={this.onChange}
            ref={input => (this.search = input)}
          />
          <button className="clear">
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
          foregroundGraphics={[
            <g transform="translate(-5, 65) " fontSize="13">
              {options.map((o, i) => {
                return (
                  <g
                    transform={`translate(${30 + i * 25}, 0)  rotate(-45)`}
                    onClick={this.sort.bind(this, o.value)}
                    className="pointer"
                  >
                    <text
                      fontWeight={o.value === this.state.sort ? "bold" : 300}
                    >
                      {o.label}{" "}
                      {this.state.sort === o.value &&
                        `${this.state.order === "desc" ? "▼" : "▲"}`}
                    </text>
                  </g>
                );
              })}
            </g>
          ]}
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
                  <text fontSize="12" x={-68} y={10}>
                    <tspan fontWeight="bold" textAnchor="end">
                      {getPercent(d.totalBytes, hierarchy.value)}
                    </tspan>
                    <tspan x={0}>{d.text}</tspan>
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
