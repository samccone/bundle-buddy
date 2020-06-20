import React, { useMemo, useCallback } from "react";
import { TreemapNode } from "../types";

import { stratify, HierarchyNode } from "d3-hierarchy";
const wtm = require("../webtreemap");

export default function Treemap({ hierarchy }: { hierarchy: TreemapNode[] }) {
  const tree = useMemo(
    () =>
      stratify<TreemapNode>()
        .id(function (d) {
          return d.name;
        })
        .parentId(function (d) {
          return d.parent;
        })(hierarchy)
        .sum((d) => d?.totalBytes || 0)
        .eachAfter(
          (n) =>
            ((n as HierarchyNode<TreemapNode> & { size: number }).size =
              n.value || 0)
        ),
    [hierarchy]
  );

  const treemapTarget = useCallback(
    (node) => {
      if (node != null) {
        const tm = new wtm.TreeMap(
          tree as HierarchyNode<TreemapNode> & { size: number },
          {
            padding: [14, 3, 3, 3],
            caption: (node: any) => node.id,
            showNode: (node: any, width: number, height: number): boolean => {
              return width > 2 && height >= 2;
            },
            showChildren: (
              node: any,
              width: number,
              height: number
            ): boolean => {
              return width > 10 && height > 10;
            },
          }
        );

        tm.render(node);
      }
    },
    [tree]
  );

  return (
    <div>
      <div
        style={{ height: "600px", width: "800px" }}
        ref={treemapTarget}
      ></div>
    </div>
  );
}
