import React from "react";
import dagre from "dagre";
import NetworkFrame from "semiotic/lib/NetworkFrame";
import { scaleLinear } from "d3-scale";
import { colors, primary, mainFileColor, secondaryFileColor } from "../theme";
import { typeColors } from "./ByTypeBarChart";
import { arc } from "d3-shape";

export default function Dendrogram({
  edges,
  nodes,
  max,
  selected,
  counts,
  directories
}) {
  // const sorted = nodes.sort((a, b) => (b.totalBytes || 0) - (a.totalBytes || 0))
  // const max = (sorted[0] && sorted[0].totalBytes) || 0
  const width = 100;

  const count = counts[selected];

  const getFill = d => {
    // if (d.id !== selected) {
    if (d.id.indexOf("node_modules") !== -1) {
      return "url(#dags)";
    } else if (d.id.indexOf("/") === -1) {
      const match = directories.findIndex(dir => dir === "No Directory");

      return colors[match % colors.length];
    } else {
      const match = directories.findIndex(dir => d.id.indexOf(dir) === 0);

      return colors[match % colors.length];
    }
  };

  const heightScale = scaleLinear().domain([0, max]).range([1, width]);

  const mapLocation = (inOrOut, files, rOffset = 150) => {
    let total = 0;
    const requires = files
      .sort((a, b) => b.totalBytes - a.totalBytes)
      .map((d, i) => {
        const spacing = Math.max(heightScale(d.totalBytes) * 2, 18);
        const value = {
          ...d,
          r: heightScale(d.totalBytes),
          spacing,
          offset: total + spacing / 2
        };

        total += value.spacing;

        return value;
      });

    //cconst r = total*2/2/Math.PI =  r
    // const r = (total * 2) / 2 / Math.PI;
    const r = rOffset;
    const rSize = Math.max(rOffset, total * 2.4 / 2 / Math.PI);
    const circumfrence = 2 * Math.PI * rSize;

    const overallArcStart = total / circumfrence / 2 * 360;

    const center = inOrOut === "in" ? 270 : 90;
    const sign = inOrOut === "in" ? 1 : -1;

    const angleScale = scaleLinear()
      .domain([0, total || 0])
      .range([
        center + overallArcStart * sign,
        center - overallArcStart * sign
      ]),
      yScale = (degrees, r) => -Math.cos(degrees * (Math.PI / 180)) * r,
      xScale = (degrees, r) => Math.sin(degrees * (Math.PI / 180)) * r;

    requires.forEach(d => {
      const degrees = angleScale(d.offset);
      d.x = xScale(degrees, rSize) - (rSize - r);
      d.y = yScale(degrees, rSize);
      d.degrees = degrees;
    });

    return requires;
  };

  const placeCircles = (inOrOut, files) => {
    return files.map(d => {
      const index = d.id.lastIndexOf("/");
      return (
        <g>
          <g transform={`translate(${d.x}, ${d.y})`}>
            <circle r={heightScale(d.totalBytes)} fill={getFill(d)} />
            <text
              // transform={`rotate(${d.degrees - (inOrOut === "in" ? 270 : 90)})`}
              y=".4em"
              fontSize="12"
              textAnchor={inOrOut === "in" && "end"}
            >
              {d.id.slice(index !== -1 ? index + 1 : 0)}
            </text>
          </g>
        </g>
      );
    });
  };

  const requires = mapLocation(
    "in",
    nodes.filter(d => count.requires.indexOf(d.id) !== -1)
  );

  const requiredBy = mapLocation(
    "out",
    nodes.filter(d => count.requiredBy.indexOf(d.id) !== -1)
  );

  const usedNodes = [
    ...requires,
    ...requiredBy,
    { id: selected }
  ].reduce((p, c) => {
    p[c.id] = c;
    return p;
  }, {});

  let nextLevelNodes = [];
  let nextLevelEdges = [];

  const getNextLevel = (requiredByKeys, level = 0) => {
    const edgeLevel = edges.filter(
      d => requiredByKeys.indexOf(d.source) !== -1
    );
    nextLevelEdges.push(...edgeLevel);

    const edgeLevelKeys = edgeLevel.map(d => d.target);

    const matchingNodes = nodes.filter(
      d => edgeLevelKeys.indexOf(d.id) !== -1 && !usedNodes[d.id]
    );

    if (matchingNodes.length > 0) {
      const newNodes = mapLocation("out", matchingNodes, 150 * (level + 2));

      newNodes.forEach(n => {
        usedNodes[n.id] = n;
        nextLevelNodes.push(n);
      });

      getNextLevel(newNodes.map(d => d.id), level + 1);
    }
  };

  getNextLevel(count.requiredBy);

  const selectedNode = nodes.find(d => d.id === selected);

  return (
    <div className="bottom-panel padding">
      <p>
        Selected File: <b style={{ color: primary }}>{selected}</b>{" "}
        {count &&
          <span>
            is imported by <b>{count.requiredBy.length}</b> file
            {count.requiredBy.length > 1 && "s"}
            {selected.indexOf("node_modules") === -1 &&
              <span>
                , and imports <b>{count.requires.length}</b> files/modules
              </span>}
          </span>}
      </p>
      <p>
        {directories.map((d, i) =>
          <span style={{ color: colors[i], fontWeight: "bold" }}>{d} </span>
        )}
      </p>
      <svg width={800} height={800} className="overflow-visible">
        <pattern
          id="dags-primary"
          patternUnits="userSpaceOnUse"
          width="4"
          height="4"
        >
          <path
            d="M 0,4 l 4,-4 M -1,1 l 2,-2 M 3,5 l 2,-2"
            shapeRendering="auto"
            stroke={primary}
            strokeLinecap="square"
          />
        </pattern>
        <pattern id="dags" patternUnits="userSpaceOnUse" width="4" height="4">
          <path
            d="M 0,4 l 4,-4 M -1,1 l 2,-2 M 3,5 l 2,-2"
            shapeRendering="auto"
            stroke={"#ddd"}
            strokeLinecap="square"
          />
        </pattern>
        <g transform="translate(300,300)">
          <circle
            r={heightScale(selectedNode.totalBytes)}
            stroke={primary}
            strokeWidth={2}
            fill={getFill(selectedNode)}
          />
          <g transform="translate(0, -100)">
            <text x={-200} textAnchor="middle">
              {selected.split("/").map((d, i, array) => {
                return (
                  <tspan x={0} dy={"1em"}>
                    {d}
                    {i !== array.length - 1 && "/"}
                  </tspan>
                );
              })}
            </text>
          </g>
          {placeCircles("in", requires)}
          {placeCircles("out", requiredBy)}
          {placeCircles("out", nextLevelNodes)}
        </g>
      </svg>
    </div>
  );
}
