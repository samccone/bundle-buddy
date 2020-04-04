import React from "react";
import BarChart from "./BarChart";

// import { colors } from "../theme";
import { getPercent } from "./stringFormats";

const inputStyle = { width: "70%" };

const frameProps = {
  type: "bar",
  oPadding: 2,
  rAccessor: d => d.totalBytes,
  oAccessor: d => d.id,
  barHeight: 38,
  margin: { left: 95, top: 85 }
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
    } else {
      this.setState({ sort: type, order: type === "id" ? "asc" : "desc" });
    }
  }

  render() {
    const { total, network = {}, changeSelected, directoryColors } = this.props;
    const { nodes = [] } = network;

    let sortedNodes = nodes.sort((a, b) => b.totalBytes - a.totalBytes);

    const max = nodes[0] && nodes[0].totalBytes;

    let withNodeModules = 0;
    let withoutNodeModules = 0;

    sortedNodes.forEach(n => {
      if (n.id.indexOf("node_modules") !== -1) withNodeModules++;
      else withoutNodeModules++;
    });

    if (this.state.search) {
      const values = this.state.search.split(" ").map(d => d.toLowerCase());
      sortedNodes = nodes.filter(
        d => !values.find(v => d.id.toLowerCase().indexOf(v) === -1)
      );
    }

    if (this.state.sort !== "totalBytes" || this.state.order !== "desc") {
      const sign = this.state.order === "desc" ? -1 : 1;

      if (this.state.sort === "text") {
        if (this.state.order === "desc") {
          sortedNodes = nodes.sort((a, b) => b.text.localeCompare(a.text));
        } else {
          sortedNodes = nodes.sort((a, b) => a.text.localeCompare(b.text));
        }
      } else if (this.state.sort === "totalBytes") {
        sortedNodes = nodes.sort(
          (a, b) => sign * a[this.state.sort] - sign * b[this.state.sort]
        );
      } else {
        sortedNodes = nodes.sort((a, b) => {
          const av = sign * ((a.count && a.count[this.state.sort].length) || 0);
          const bv = sign * ((b.count && b.count[this.state.sort].length) || 0);
          return av - bv;
        });
      }
    }

    return (
      <div>
        <h1>Analyze</h1>

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
        <div>
          <input
            type="text"
            placeholder="Search"
            className="search"
            onChange={this.onChange}
            ref={input => (this.search = input)}
            style={inputStyle}
          />
          <button className="clear">
            <span style={{ color: "red" }} onClick={this.resetSearch}>
              ✖
            </span>
          </button>
        </div>

        <BarChart
          data={sortedNodes}
          {...frameProps}
          rExtent={[0, max]}
          onBarClick={changeSelected}
          foregroundGraphics={[
            <g key="1" transform="translate(-5, 70) " fontSize="13">
              {options.map((o, i) => {
                return (
                  <g
                    transform={`translate(${30 + i * 25}, 0)  rotate(-45)`}
                    onClick={this.sort.bind(this, o.value)}
                    className="pointer"
                    key={`${o.value}_${i}`}
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
            </g>,
            <line
              key="2"
              x1="35"
              x2="35"
              y1={frameProps.margin.top - 5}
              y2="100%"
              stroke="#ddd"
            />,
            <line
              key="3"
              x1="60"
              x2="60"
              y1={frameProps.margin.top - 5}
              y2="100%"
              stroke="#ddd"
            />
          ]}
          oLabel={d => {
            return (
              <div className="relative">
                <span
                  className="fixed-label"
                  style={{
                    left: 27
                  }}
                >
                  <b textAnchor="end">{getPercent(d.totalBytes, total)}</b>
                </span>

                <span
                  className="fixed-label"
                  style={{
                    left: 85
                  }}
                >
                  {!d.count ? "--" : d.count.transitiveRequiredBy.length}
                </span>
                <span
                  className="fixed-label"
                  style={{
                    left: 55
                  }}
                >
                  {!d.count ? "--" : d.count.requires.length}
                </span>
              </div>
            );
          }}
          bar={(d, width) => {
            return (
              <div className="relative">
                <div
                  style={{
                    background: directoryColors[d.directory] || "black",
                    border: "1px solid white",
                    height: 8,
                    width,
                    position: "relative",
                    top: 15
                  }}
                />

                <br />
                <span style={{ fontSize: 12, position: "absolute", top: 0 }}>
                  <span>{d.text}</span>
                </span>
              </div>
            );
          }}
        />
      </div>
    );
  }
}
