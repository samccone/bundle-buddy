//Code by @stil From https://github.com/stil/treemap-multilevel

import React, { Fragment } from "react";
import { stratify } from "d3-hierarchy";
import { treemapBinary } from "d3-hierarchy";
import TreemapComponent from "./TreemapComponent";
import { getFileSize } from "./stringFormats";

export default class Treemap extends React.Component {
  constructor(props) {
    super(props);
    this.state = { zoomed: null };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(node) {
    if (node.children) {
      this.setState((prevState) => {
        if (node.depth === 0) {
          return { zoomed: null };
        }
        return prevState.zoomed === node.data.name
          ? { zoomed: node.parent.data.name }
          : { zoomed: node.data.name };
      });
    } else {
      this.props.changeSelected(node.data.name);
    }
  }

  render() {
    const padding = [20, 2, 2, 2];
    const size = [800, 400];
    const { hierarchy, bgColorsMap } = this.props;

    const tree = stratify()
      .id(function (d) {
        return d.name;
      })
      .parentId(function (d) {
        return d.parent;
      })(hierarchy);
    // .sum(d => d.totalBytes);

    return (
      <div>
        <div style={{ width: `${size[0]}px`, margin: "auto" }}>
          <div style={{ margin: "12px 8px" }}>
            {this.state.zoomed === null
              ? "Fully zoomed out, click to zoom directories (bolded) "
              : tree
                  .descendants()
                  .find((node) => node.data.name === this.state.zoomed)
                  .ancestors()
                  .reverse()
                  .map((node, i) => (
                    <Fragment key={node.data.name}>
                      {i > 0 ? " - " : ""}
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          this.handleClick(node);
                        }}
                      >
                        {node.data.name}
                      </a>
                    </Fragment>
                  ))}
          </div>

          <div
            style={{
              height: `${size[1]}px`,
              position: "relative",
              overflow: "hidden",
              borderRadius: "2px",
              backgroundClip: "padding-box",
            }}
          >
            <TreemapComponent
              tile={treemapBinary}
              root={tree}
              zoomed={this.state.zoomed}
              width={size[0]}
              height={size[1]}
              padding={padding}
              transition="all 300ms ease"
              nodeComponent={(node, i, posStyle) => {
                const name = node.data.name;
                const index = name.lastIndexOf("/");
                let fileName = name.slice(index !== -1 ? index + 1 : 0);

                if (fileName === "rootNode") fileName = this.props.name;
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
                        this.handleClick(node);
                      }}
                      style={{
                        lineHeight: `${padding[0] - 2}px`,
                        fontWeight: node.children ? "bold" : "100",
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
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}
