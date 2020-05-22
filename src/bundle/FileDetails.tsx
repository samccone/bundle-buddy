import React, { useState, createRef } from "react";
import BarChart from "./BarChart";

// import { colors } from "../theme";
import { getPercent } from "./stringFormats";
import { ProcessedImportState, SizeData } from "../types";

const inputStyle = { width: "70%" };

const frameProps = {
  type: "bar",
  oPadding: 2,
  rAccessor: (d: SizeData) => d.totalBytes,
  oAccessor: (d: any) => d.id,
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

type Props = {
  total?: number;
  changeSelected: React.Dispatch<string>;
  directoryColors: { [dir: string]: string };
  network: ProcessedImportState["trimmedNetwork"];
};

function getOnChange(updateSearch: React.Dispatch<string>) {
  return (e: React.SyntheticEvent<HTMLInputElement>) =>
    updateSearch(e.currentTarget.value);
}

function resetSearch(
  searchInput: React.RefObject<HTMLInputElement>,
  updateSearch: React.Dispatch<string>
) {
  updateSearch("");
  if (searchInput) {
    searchInput!.current!.value = "";
  }
}

function onSort(
  type: string,
  order: string,
  updateOrder: React.Dispatch<string>,
  sort: string,
  updateSort: React.Dispatch<string>
) {
  if (type === sort) {
    updateOrder(order === "desc" ? "asc" : "desc");
  } else {
    updateSort(type);
    updateOrder(type === "id" ? "asc" : "desc");
  }
}

let onInputChange: (e: any) => void;

export default function FileDetails(props: Props) {
  const [search, updateSearch] = useState("");
  const [sort, updateSort] = useState("totalBytes");
  const [order, updateOrder] = useState("desc");
  const searchInput = createRef<HTMLInputElement>();

  if (!onInputChange) {
    onInputChange = getOnChange(updateSearch);
  }

  const {
    total,
    network = {} as ProcessedImportState["trimmedNetwork"],
    changeSelected,
    directoryColors
  } = props;
  const { nodes = [] } = network;

  let sortedNodes = nodes.sort((a, b) => b.totalBytes! - a.totalBytes!);

  const max = nodes[0] && nodes[0].totalBytes;

  let withNodeModules = 0;
  let withoutNodeModules = 0;

  sortedNodes.forEach(n => {
    if (n.id.indexOf("node_modules") !== -1) withNodeModules++;
    else withoutNodeModules++;
  });

  if (search) {
    const values = search.split(" ").map(d => d.toLowerCase());
    sortedNodes = nodes.filter(
      d => !values.find(v => d.id.toLowerCase().indexOf(v) === -1)
    );
  }

  if (sort !== "totalBytes" || order !== "desc") {
    const sign = order === "desc" ? -1 : 1;

    if (sort === "text") {
      if (order === "desc") {
        sortedNodes = nodes.sort((a, b) => b.text!.localeCompare(a.text!));
      } else {
        sortedNodes = nodes.sort((a, b) => a.text!.localeCompare(b.text!));
      }
    } else if (sort === "totalBytes") {
      sortedNodes = nodes.sort((a, b) => sign * a[sort]! - sign * b[sort]!);
    } else {
      sortedNodes = nodes.sort((a, b) => {
        const av =
          sign *
          ((a.count &&
            (a.count[sort as "requiredBy" | "requires"] as string[])!.length) ||
            0);
        const bv =
          sign *
          ((b.count &&
            (b.count[sort as "requiredBy" | "requires"] as string[])!.length) ||
            0);
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
          onChange={onInputChange}
          ref={searchInput}
          style={inputStyle}
        />
        <button className="clear">
          <span
            style={{ color: "red" }}
            onClick={() => resetSearch(searchInput, updateSearch)}
          >
            ✖
          </span>
        </button>
      </div>

      <BarChart
        data={sortedNodes}
        {...frameProps}
        rExtent={max ? [0, max] : undefined}
        onBarClick={changeSelected}
        foregroundGraphics={[
          <g key="1" transform="translate(-5, 70) " fontSize="13">
            {options.map((o, i) => {
              return (
                <g
                  transform={`translate(${30 + i * 25}, 0)  rotate(-45)`}
                  onClick={() =>
                    onSort(o.value, order, updateOrder, sort, updateSort)
                  }
                  className="pointer"
                  key={`${o.value}_${i}`}
                >
                  <text fontWeight={o.value === sort ? "bold" : 300}>
                    {o.label}{" "}
                    {sort === o.value && `${order === "desc" ? "▼" : "▲"}`}
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
                <b>{getPercent(d.totalBytes, total)}</b>
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
