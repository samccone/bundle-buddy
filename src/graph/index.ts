import { GraphEdges, FlattendGraph } from "../types";

export interface RequireGraph {
  [target: string]: {
    requires: Set<string>;
  };
}

export function edgesToGraph(edges: GraphEdges): FlattendGraph {
  const ret: FlattendGraph = {};

  // materialze the graph with all nodes.
  for (const edge of edges) {
    if (ret[edge.source] == null) {
      ret[edge.source] = {
        requires: new Set<string>(),
        requiredBy: new Set<string>()
      };
    }

    if (ret[edge.target] == null) {
      ret[edge.target] = {
        requires: new Set<string>(),
        requiredBy: new Set<string>()
      };
    }
  }

  for (const key of Object.keys(ret)) {
    for (const edge of Object.values(edges)) {
      if (edge.source === key) {
        ret[key].requires.add(edge.target);
      }

      if (edge.target === key) {
        ret[key].requiredBy.add(edge.source);
      }
    }
  }

  return ret;
}

function getModules(
  graph: { [target: string]: { requiredBy: string[] | Set<string> } },
  node: string,
  { isRoot }: { isRoot: boolean },
  seen: Set<string> = new Set<string>()
): string[] {
  seen.add(node);

  // Filter out duplicate nodes that we have already handled
  const names = Array.from(graph[node].requiredBy).filter(v => !seen.has(v));

  // Add all new nodes to the seen list
  for (const n of names) {
    seen.add(n);
  }

  // Walk graph gathering all new nodes
  const allNames = names.map(v => {
    return getModules(graph, v, { isRoot: false }, seen);
  });

  // Add the current node that we are looking at.
  if (!isRoot) {
    allNames.push([node]);
  }

  // Flatten the list now and return.
  const ret: string[] = [];
  for (const nameList of allNames) {
    ret.push(...nameList);
  }

  return ret;
}

/**
 * Determines the transitive requires for a given node in the require graph.
 * This function is useful for answering the question, what are *all* of requires for this node.
 *
 * Example:
 *   a.js
 *     import 'foo'
 *
 *   foo.js
 *      import 'zap'
 *
 *
 *  transitive requires of 'a.js' would be ['foo', 'zap']
 *
 *
 * @param nodeId the node you would like to calculate the transitive requires for
 * @param graph  the dependency graph
 */
export function calculateTransitiveRequires(
  nodeId: string,
  graph: RequireGraph
): Set<string> {
  const ret = new Set<string>();

  if (graph[nodeId] == null) {
    return ret;
  }

  const toScan = graph[nodeId].requires;

  while (toScan.size) {
    for (const n of toScan) {
      // add dep
      ret.add(n);

      // Add the dependent nodes now
      if (graph[n]?.requires) {
        for (const nested of graph[n]?.requires) {
          // skip adding if we have already seen this node
          if (ret.has(nested)) {
            continue;
          }
          toScan.add(nested);
        }
      }

      // remove the node now that we have scanned it
      toScan.delete(n);
    }
  }

  if (ret.has(nodeId)) {
    ret.delete(nodeId);
  }

  return ret;
}

/**
 * Determines the number of nodes that a given node directly depends on
 * @param d network
 */
export function directRequires(d: {
  [target: string]: { requiredBy: string[] | Set<string> };
}): RequireGraph {
  const ret: RequireGraph = {};

  for (const [target, { requiredBy }] of Object.entries(d)) {
    for (const v of Array.from(requiredBy)) {
      if (ret[v] == null) {
        ret[v] = { requires: new Set() };
      }

      ret[v].requires.add(target);
    }
  }

  return ret;
}

/**
 * Determines the number of nodes that something is transitivly required by
 * @param d network
 */
export function requiredBy(d: {
  [target: string]: { requiredBy: string[] | Set<string> };
}): {
  [target: string]: {
    transitiveRequiredBy: string[];
  };
} {
  const ret: {
    [target: string]: {
      transitiveRequiredBy: string[];
    };
  } = {};

  for (const rootK of Object.keys(d)) {
    const moduleDeps = getModules(d, rootK, { isRoot: true });
    ret[rootK] = {
      transitiveRequiredBy: moduleDeps
    };
  }

  return ret;
}
