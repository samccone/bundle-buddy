import React from "react";
import { scaleSqrt, scaleLinear } from "d3-scale";
import { colors, primary, mainFileColor, secondaryFileColor } from "../theme";
import { typeColors } from "./ByTypeBarChart";
import { arc } from "d3-shape";

export default function Dendrogram({
  edges,
  nodes,
  max,
  selected,
  counts,
  directories,
  changeSelected
}) {
  // const sorted = nodes.sort((a, b) => (b.totalBytes || 0) - (a.totalBytes || 0))
  // const max = (sorted[0] && sorted[0].totalBytes) || 0

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

  const radiusScale = scaleSqrt().domain([0, max]).range([1, 50]);

  let translateX = 0,
    translateY = 150,
    maxX = 0;

  const mapLocation = (inOrOut, files, rOffset = 150) => {
    let total = 0;
    const requires = files
      .sort((a, b) => b.totalBytes - a.totalBytes)
      .map((d, i) => {
        const spacing = Math.max(radiusScale(d.totalBytes) * 2, 18);
        const value = {
          ...d,
          r: radiusScale(d.totalBytes),
          spacing,
          offset: total + spacing / 2
        };

        total += value.spacing;

        return value;
      });

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

      d.x = xScale(degrees, rSize) + sign * (rSize - r);
      d.y = yScale(degrees, rSize);
      d.r = radiusScale(d.totalBytes);
      if (-(d.x + d.r) > translateX) translateX = -(d.x + d.r);
      if (d.y > translateY) translateY = d.y;
      if (d.x > maxX) maxX = d.x;
      d.degrees = degrees;
    });

    return requires;
  };

  const placeCircles = (inOrOut, files) => {
    return files.sort((a, b) => a.r - b.r).map(d => {
      const index = d.id.lastIndexOf("/");
      return (
        <g key={d.id} onClick={() => changeSelected(d.id)}>
          <g transform={`translate(${d.x}, ${d.y})`}>
            <circle r={d.r} fill={getFill(d)} stroke="white" />
            <text
              y=".4em"
              fontSize="12"
              textAnchor={(inOrOut === "in" && "end") || "start"}
            >
              {d.id.slice(index !== -1 ? index + 1 : 0)}
            </text>
          </g>
        </g>
      );
    });
  };

  let requires = [],
    requiredBy = [];

  if (count) {
    requires = mapLocation(
      "in",
      nodes.filter(d => count.requires.indexOf(d.id) !== -1)
    );
    requiredBy = mapLocation(
      "out",
      nodes.filter(d => count.requiredBy.indexOf(d.id) !== -1)
    );
  }

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

  count && getNextLevel(count.requiredBy);

  const selectedNode = nodes.find(d => d.id === selected);

  if (requires.length === 0) {
    translateX = 150;
  } else {
    translateX += 150;
  }

  const primaryRadius = radiusScale(selectedNode.totalBytes);

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
          <span key={i} style={{ color: colors[i], fontWeight: "bold" }}>
            {d}{" "}
          </span>
        )}
      </p>
      <svg
        width={translateX + maxX + 200}
        height={translateY * 2 + 60}
        className="overflow-visible"
        style={{ border: `1px solid ${primary}` }}
      >
        <g transform={`translate(${translateX},${translateY + 30})`}>
          <circle
            r={primaryRadius}
            stroke={primary}
            strokeWidth={2}
            fill={getFill(selectedNode)}
          />
          <g transform={`translate(${primaryRadius} , 0)`}>
            <line stroke={primary} x2={80} />
            <text fontSize="11" fontWeight="bold" x={5} y={-3}>
              Required by
            </text>
          </g>
          {requires &&
            requires.length !== 0 &&
            <g transform={`translate(${-primaryRadius} , 0)`}>
              <line stroke={primary} x2={-80} />{" "}
              <text
                textAnchor="end"
                fontSize="11"
                fontWeight="bold"
                x={-8}
                y={-3}
              >
                Requires
              </text>
            </g>}
          <g transform="translate(0, -100)">
            <text x={-200} textAnchor="middle">
              {selected.split("/").map((d, i, array) => {
                return (
                  <tspan key={i} x={0} dy={"1em"}>
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
