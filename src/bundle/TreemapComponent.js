//Code by @stil From https://github.com/stil/treemap-multilevel

/* eslint-disable no-param-reassign */
import React, { Fragment, useMemo } from "react";
import PropTypes from "prop-types"; // eslint-disable-line import/no-extraneous-dependencies
import { treemap, treemapBinary } from "d3-hierarchy";
import {} from "d3-hierarchy";

function canDisplay(node) {
  const width = node.x1 - node.x0;
  const height = node.y1 - node.y0;
  if (width <= 5 || height <= 3) {
    return false;
  }

  return true;
}

function calculatePos(node) {
  return {
    transform: `translate(${node.x0}px, ${node.y0}px)`,
    width: node.x1 - node.x0,
    height: node.y1 - node.y0,
  };
}

function reposition(root, width, height, zoomed, padding) {
  treemap().tile(treemapBinary).size([width, height])(root);

  const zoomedEl = zoomed
    ? root.descendants().find((node) => node.data.name === zoomed)
    : root;

  if (zoomedEl.depth > 0) {
    const scaleX = (root.x1 - root.x0) / (zoomedEl.x1 - zoomedEl.x0);
    const scaleY = (root.y1 - root.y0) / (zoomedEl.y1 - zoomedEl.y0);
    const refPointY = zoomedEl.y0;
    const refPointX = zoomedEl.x0;
    root.descendants().forEach((node) => {
      node.y0 = scaleY * (node.y0 - refPointY);
      node.y1 = scaleY * (node.y1 - refPointY);
      node.x0 = scaleX * (node.x0 - refPointX);
      node.x1 = scaleX * (node.x1 - refPointX);
    });
  }

  zoomedEl.descendants().forEach((relativeRoot) => {
    relativeRoot
      .descendants()
      .slice(1)
      .forEach((node) => {
        let refPoint;
        let scale;

        // Scale vertically to bottom.
        scale = 1 - padding[0] / (relativeRoot.y1 - relativeRoot.y0);

        if (scale > 0) {
          refPoint = relativeRoot.y1;
          node.y0 = refPoint + scale * (node.y0 - refPoint);
          node.y1 = refPoint + scale * (node.y1 - refPoint);
        }

        // Scale vertically to top.
        scale = 1 - padding[2] / (relativeRoot.y1 - relativeRoot.y0);

        if (scale > 0) {
          refPoint = relativeRoot.y0;
          node.y0 = refPoint + scale * (node.y0 - refPoint);
          node.y1 = refPoint + scale * (node.y1 - refPoint);
        }
        // Scale horizontally to left.
        scale = 1 - padding[1] / (relativeRoot.x1 - relativeRoot.x0);
        if (scale > 0) {
          refPoint = relativeRoot.x0;
          node.x0 = refPoint + scale * (node.x0 - refPoint);
          node.x1 = refPoint + scale * (node.x1 - refPoint);
        }
        // Scale horizontally to right.
        scale = 1 - padding[3] / (relativeRoot.x1 - relativeRoot.x0);
        if (scale > 0) {
          refPoint = relativeRoot.x1;
          node.x0 = refPoint + scale * (node.x0 - refPoint);
          node.x1 = refPoint + scale * (node.x1 - refPoint);
        }
      });
  });

  return zoomedEl;
}

export default function TreemapComponent({
  root,
  zoomed,
  width,
  height,
  padding,
  nodeComponent,
}) {
  const zoomedEl = useMemo(
    () => reposition(root, width, height, zoomed, padding),
    [root, width, height, zoomed, padding]
  );

  return zoomedEl
    .descendants()
    .filter((node) => canDisplay(node))
    .map((node, i) => (
      <Fragment key={node.data.name + node.depth}>
        {nodeComponent(node, i, calculatePos(node))}
      </Fragment>
    ));
}

TreemapComponent.propTypes = {
  root: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  padding: PropTypes.arrayOf(PropTypes.number),
  nodeComponent: PropTypes.func,
  zoomed: PropTypes.string,
  tile: PropTypes.func.isRequired,
};

TreemapComponent.defaultProps = {
  zoomed: null,
  nodeComponent: (node, i, posStyle) => (
    <div
      style={{
        ...posStyle,
        position: "absolute",
        background: "rgba(255,0,0,0.1)",
      }}
    >
      {node.data.key}
    </div>
  ),
  padding: [20, 2, 2, 2],
};
