//Code by @stil From https://github.com/stil/treemap-multilevel

import React, { Fragment, useState, useMemo } from "react";
import { stratify } from "d3-hierarchy";
import TreemapComponent from "./TreemapComponent";
import { getFileSize } from "./stringFormats";
import useWindowSize from "@rehooks/window-size";

function getHandleClick(changeSelected, setZoom) {
  return (zoomed, node) => {
    if (node.children) {
      if (node.depth === 0) {
        setZoom(undefined);
      }
      zoomed === node.data.name
        ? setZoom(node.parent.data.name)
        : setZoom(node.data.name);
    } else {
      changeSelected(node.data.name);
    }
  };
}
const padding = [20, 2, 2, 2];

function getNodeComponent(name, bgColorsMap, zoomed, handleClick) {
  return (node, i, posStyle) => {
    const name = node.data.name;
    const index = name.lastIndexOf("/");
    let fileName = name.slice(index !== -1 ? index + 1 : 0);

    if (fileName === "rootNode") fileName = name;
    const dirIndex = name.indexOf("/");
    let directory = name;
    if (dirIndex !== -1) directory = name.slice(0, dirIndex);

    return (
      <div
        className="treemap__node"
        style={{
          ...posStyle,
          background: bgColorsMap[directory] || "white",
        }}
      >
        <div
          className={`treemap__label${
            node.children ? " treemap__label--children" : ""
          }`}
          onClick={() => {
            handleClick(zoomed, node);
          }}
          style={{
            lineHeight: `${padding[0] - 2}px`,
            fontWeight: node.children ? "bold" : "300",
            color: "black", //textColorsMap.get(node.data.key),
          }}
        >
          {posStyle.height > 5 && (
            <div>
              <span>{fileName}</span>
              {posStyle.height > 2 * padding[0] &&
              (!node.children || node.children.length === 0) ? (
                <span>
                  <br />
                  {getFileSize(node.value)}
                </span>
              ) : (
                <span> ({getFileSize(node.value)})</span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };
}

export default function Treemap(props) {
  const [zoomed, setZoom] = useState();
  const { hierarchy, bgColorsMap, changeSelected, name } = props;

  const { innerWidth, innerHeight } = useWindowSize();
  const width = innerWidth - 80,
    height = innerHeight * 0.3;

  const handleClick = useMemo(() => getHandleClick(changeSelected, setZoom), [
    changeSelected,
    setZoom,
  ]);

  const tree = useMemo(
    () =>
      stratify()
        .id(function (d) {
          return d.name;
        })
        .parentId(function (d) {
          return d.parent;
        })(hierarchy)
        .sum((d) => d.totalBytes)
        .sort((a, b) => b.height - a.height || b.value - a.value),
    [hierarchy]
  );

  const nodeComponent = useMemo(
    () => getNodeComponent(name, bgColorsMap, zoomed, handleClick),
    [name, bgColorsMap, zoomed, handleClick]
  );

  return (
    <div>
      <div>
        <div style={{ margin: "12px 8px" }}>
          {zoomed === undefined
            ? "Fully zoomed out, click to zoom directories (bolded) "
            : tree
                .descendants()
                .find((node) => node.data.name === zoomed)
                .ancestors()
                .reverse()
                .map((node, i) => (
                  <Fragment key={node.data.name}>
                    {i > 0 ? " - " : ""}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleClick(zoomed, node);
                      }}
                    >
                      {node.data.name}
                    </a>
                  </Fragment>
                ))}
        </div>

        <div
          style={{
            height: `${height}px`,
            position: "relative",
            overflow: "hidden",
            borderRadius: "2px",
            backgroundClip: "padding-box",
          }}
        >
          <TreemapComponent
            root={tree}
            zoomed={zoomed}
            width={width}
            height={height}
            padding={padding}
            transition="all 300ms ease"
            nodeComponent={nodeComponent}
          />
        </div>
      </div>
    </div>
  );
}
