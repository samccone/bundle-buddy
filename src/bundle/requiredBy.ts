function getModules(
  graph: { [target: string]: { requiredBy: string[] | Set<string> } },
  node: string,
  { isRoot }: { isRoot: boolean },
  seen: Set<string> = new Set<string>()
): string[] {
  seen.add(node);

  // Filter out duplicate nodes that we have already handled
  const names = (graph[node].requiredBy as string[]).filter(v => !seen.has(v));

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

export function requiredBy(d: {
  [target: string]: { requiredBy: string[] | Set<string> };
}): {
  [target: string]: {
    indirectDependedOnCount: number;
    transitiveRequiredBy: string[];
  };
} {
  const ret: {
    [target: string]: {
      indirectDependedOnCount: number;
      transitiveRequiredBy: string[];
    };
  } = {};

  for (const rootK of Object.keys(d)) {
    const moduleDeps = getModules(d, rootK, { isRoot: true });
    ret[rootK] = {
      indirectDependedOnCount: moduleDeps.length,
      transitiveRequiredBy: moduleDeps
    };
  }

  return ret;
}
