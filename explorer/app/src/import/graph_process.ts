import builtins from "./builtins";
import { findFirstIndex, findCommonPrefix } from "../import/prefix_cleaner";

export interface GraphNode {
  source: string;
  target: string | null;
}

export type GraphNodes = GraphNode[];

const prefixStrips = [
  // Rollup specific prefix added to add commonjs proxy nodes.
  "\u0000commonjs-proxy:",
  "commonjs-proxy:/",
  // Rollup specific prefix added to add commonjs external nodes.
  "\u0000commonjs-external:",
  // More rollup magic prefixing.
  "\u0000"
];

export const ignoreNodes = new Set(
  [
    // Rollup specific magic module.
    "\u0000commonjsHelpers",
    "commonjsHelpers",
    "babelHelpers"
  ].concat(builtins)
);

export function filterIgnoredNodes(nodes: string[]) {
  return nodes.filter(v => !ignoreNodes.has(v));
}

function getAllGraphFiles(graph: GraphNodes): string[] {
  const ret = new Set<string>();
  for (const { target, source } of graph) {
    if (target != null) {
      ret.add(target);
    }
    ret.add(source);
  }

  return Array.from(ret);
}

export function cleanGraph(graph: GraphNodes): GraphNodes {
  // Strip all magic prefixes
  for (const node of graph) {
    for (const key of Object.keys(node) as Array<"target" | "source">) {
      if (node[key] == null) {
        continue;
      }

      for (const magicPrefix of prefixStrips) {
        if (node[key]!.startsWith(magicPrefix)) {
          if (node[key]!.length !== magicPrefix.length) {
            node[key] = node[key]!.slice(magicPrefix.length);
          }
        }
      }
    }
  }

  // Strip common prefixes
  const graphFiles = filterIgnoredNodes(getAllGraphFiles(graph));
  const prefix = findCommonPrefix(filterIgnoredNodes(graphFiles)) || "";

  if (prefix.length) {
    for (const node of graph) {
      for (const key of Object.keys(node) as Array<"target" | "source">) {
        if (node[key]!.startsWith(prefix)) {
          if (node[key] != null) {
            node[key] = node[key]!.slice(prefix.length);
          }
        }
      }
    }
  } else {
    // fallback to Strip up to first /
    const firstIndex = findFirstIndex(filterIgnoredNodes(graphFiles));
    if (firstIndex > 0) {
      for (const node of graph) {
        for (const key of Object.keys(node) as Array<"target" | "source">) {
          if (node[key] != null) {
            node[key] = node[key]!.slice(firstIndex + 1);
          }
        }
      }
    }
  }

  // Remove null nodes in graph
  const ret: GraphNodes = [];
  for (const node of graph) {
    if (
      node.target !== node.source &&
      node.target !== null &&
      node.source !== null
    ) {
      ret.push(node);
    }
  }

  return ret;
}
