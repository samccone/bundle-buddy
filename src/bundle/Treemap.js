//Code by @stil From https://github.com/stil/treemap-multilevel
/*
MIT License

Copyright (c) 2019 

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

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
    } else if (node) {
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
  const { hierarchy, bgColorsMap, changeSelected, name, directories } = props;

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
        <div
          className="flex space-between baseline"
          style={{ margin: "12px 8px" }}
        >
          <div className="right-spacing">
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
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleClick(zoomed, node);
                        }}
                      >
                        {node.data.name}
                      </button>
                    </Fragment>
                  ))}
          </div>
          <div>
            {directories.map((d, i) => (
              <span key={i} className="padding-right inline-block">
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    display: "inline-block",
                    marginRight: 8,
                    background: bgColorsMap[d],
                    border: `1px solid var(--grey700)`,
                  }}
                ></span>
                {d}{" "}
              </span>
            ))}
          </div>
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
