import { findCommonPrefix } from "./prefix_cleaner";
import builtins from "./builtins";

export interface GraphNode {
  source: string;
  target: string | null;
}

export type GraphNodes = GraphNode[];

const magicPrefixes = [
  // Rollup specific prefix added to add commonjs proxy nodes.
  "\u0000commonjs-proxy:",
  // Rollup specific prefix added to add commonjs external nodes.
  "\u0000commonjs-external:",
  // More rollup magic prefixing.
  "\u0000"
];

const ignoreNodes = new Set(
  [
    // Rollup specific magic module.
    "\u0000commonjsHelpers",
    "babelHelpers"
  ].concat(builtins)
);

export function cleanGraph(graph: GraphNodes): GraphNodes {
  const keys = new Set();

  for (let { source, target } of graph) {
    if (target == null || source == null) {
      continue;
    }

    for (const magicPrefix of magicPrefixes) {
      if (source.startsWith(magicPrefix)) {
        source = source.slice(magicPrefix.length);
      }

      if (target.startsWith(magicPrefix)) {
        if (target.length !== magicPrefix.length) {
          target = target.slice(magicPrefix.length);
        }
      }
    }

    if (!ignoreNodes.has(source)) {
      keys.add(source);
    }

    if (!ignoreNodes.has(target)) {
      keys.add(target);
    }
  }

  const commonPrefix = findCommonPrefix(Array.from(keys));

  if (commonPrefix != null && commonPrefix.length) {
    for (const node of graph) {
      for (const key of Object.keys(node) as Array<"target" | "source">) {
        if (node[key] == null) {
          continue;
        }

        for (const magicPrefix of magicPrefixes) {
          if (node[key]!.startsWith(magicPrefix)) {
            if (node[key]!.length !== magicPrefix.length) {
              node[key] = node[key]!.slice(magicPrefix.length);
            }
          }
        }

        if (node[key]!.startsWith(commonPrefix)) {
          if (node[key]!.length !== commonPrefix.length) {
            node[key] = node[key]!.slice(commonPrefix.length);
          }
        }
      }
    }
  }

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
