import React from "react";
import { scaleSqrt, scaleLinear } from "d3-scale";
import { colors, primary, mainFileColor, secondaryFileColor } from "../theme";
import { typeColors } from "./ByTypeBarChart";
import { arc } from "d3-shape";
import { render } from "react-dom";
import arrow from "viz-annotation/lib/Connector/end-arrow";

export default class RippleChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hover: null };
  }

  render() {
    const {
      edges,
      nodes,
      max,
      selected,
      counts,
      directories,
      changeSelected
    } = this.props;
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
        return (
          <g
            key={d.id}
            onClick={() => changeSelected(d.id)}
            onMouseEnter={() => this.setState({ hover: d.id })}
            onMouseLeave={() => this.setState({ hover: null })}
          >
            <g transform={`translate(${d.x}, ${d.y})`}>
              <circle r={d.r} fill={getFill(d)} stroke="white" />
              <text
                y=".4em"
                fontSize="12"
                textAnchor={(inOrOut === "in" && "end") || "start"}
              >
                {d.fileName}
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
    let nextLevelEdges = [
      ...count.requires.map(d => ({ source: d, target: selected })),
      ...count.requiredBy.map(d => ({ target: d, source: selected }))
    ];

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

    let showEdges = [];
    let showNodes = [];
    if (this.state.hover) {
      showEdges = nextLevelEdges.filter(
        d => d.source === this.state.hover || d.target === this.state.hover
      );

      showNodes = Object.values(
        showEdges.reduce((p, c) => {
          p[c.source] = {
            id: c.source,
            anchor: c.target === selected ? "end" : "start"
          };
          p[c.target] = { id: c.target, anchor: "start" };
          return p;
        }, {})
      );
    }

    console.log(showNodes);

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

            <rect
              x={-translateX - 30}
              y={-translateY}
              width="100%"
              height="100%"
              fill="white"
              className={`opacity-filter ${(this.state.hover && "on") ||
                "off"}`}
              pointerEvents="none"
            />

            {this.state.hover &&
              showEdges.map((d, i) => {
                const source = usedNodes[d.source];
                const target = usedNodes[d.target];

                const middle = {
                  x: source.x + (target.x - source.x) * 2 / 3,
                  y: source.y + (target.y - source.y) * 2 / 3
                };

                const a = arrow({
                  start: [source.x, source.y],
                  end: [middle.x, middle.y],
                  scale: 1.5
                });
                // console.log(a);
                return (
                  <g pointerEvents="none" key={i}>
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke="#ccc"
                    />
                    <circle
                      r={source.r}
                      cx={source.x}
                      cy={source.y}
                      fill={primary}
                    />
                    <path d={a.components[0].attrs.d} fill={primary} />
                    <circle
                      r={target.r}
                      cx={target.x}
                      cy={target.y}
                      fill={primary}
                    />
                  </g>
                );
              })}
            {this.state.hover &&
              showNodes.map((d, i) => {
                const n = usedNodes[d.id];
                return (
                  <g
                    transform={`translate(${n.x},${n.y})`}
                    pointerEvents="none"
                    key={i}
                  >
                    <text
                      y=".4em"
                      fontSize="12"
                      // fontWeight="bold"
                      textAnchor={d.anchor}
                    >
                      {n.fileName}
                    </text>
                  </g>
                );
              })}
          </g>
        </svg>
      </div>
    );
  }
}
