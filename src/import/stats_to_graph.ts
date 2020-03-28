import { Edge } from "../types";

interface Module {
  name: string;
  reasons: Array<{ moduleName: string }>;
  modules?: Array<Module>;
}

function cleanWebpackMagicFiles(f: string): string {
  const matches = [
    {
      replace: "node_modules/webpack/buildin",
      matcher: /\(webpack\)\/buildin/
    }
  ];

  for (const m of matches) {
    if (m.matcher.exec(f)) {
      return f.replace(m.matcher.exec(f)![0], m.replace);
    }
  }

  return f;
}

function cleanEdges(edges: Edge[], plusMap: Map<string, Set<string>>): Edge[] {
  const exploded: Edge[] = [];

  let pushedMore = false;
  for (const uncleanEdge of edges) {
    const foundNestedDeps = plusMap.get(uncleanEdge.target);
    if (foundNestedDeps) {
      pushedMore = true;
      for (const toExplodeTarget of foundNestedDeps.values()) {
        exploded.push({
          target: toExplodeTarget,
          source: uncleanEdge.source
        });
      }
    } else {
      exploded.push(uncleanEdge);
    }
  }

  if (pushedMore) {
    return cleanEdges(exploded, plusMap);
  } else {
    return exploded;
  }
}

export function gatherEdges(
  stats: { modules: Module[] },
  edges: Edge[] = [],
  lookupMap: Set<string> = new Set<string>(),
  plusMap: Map<string, Set<string>> = new Map()
): { edges: Edge[]; plusMap: Map<string, Set<string>> } {
  for (const module of stats.modules || []) {
    if (module.modules != null) {
      if (!plusMap.has(module.name)) {
        plusMap.set(module.name, new Set());
        for (const subModule of module.modules) {
          plusMap.get(module.name)!.add(subModule.name);
        }
      }

      edges = gatherEdges(
        { modules: module.modules },
        edges,
        lookupMap,
        plusMap
      ).edges;
    } else {
      const moduleName = cleanWebpackMagicFiles(module.name);
      for (const reason of module.reasons || []) {
        const reasonModuleName = cleanWebpackMagicFiles(reason.moduleName);
        if (!lookupMap.has(`${moduleName}|${reasonModuleName}`)) {
          edges.push({
            target: reasonModuleName,
            source: moduleName
          });
          lookupMap.add(`${moduleName}|${reasonModuleName}`);
        }
      }
    }
  }

  return { edges, plusMap };
}

/**
 * Converts a webpack stats.json object to a dot formatted graph list.
 * @param stats A webpack stats.json object
 */
export function statsToGraph(stats: { modules: Module[] }): Edge[] {
  const { edges, plusMap } = gatherEdges(stats);
  return cleanEdges(edges, plusMap);
}
