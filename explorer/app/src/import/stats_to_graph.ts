import { Edge } from "../types";

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

export function removePlusNames(edges: Edge[]): Edge[] {
  const ret: Edge[] = [];
  const matcher = /\+ \d+ modules/;

  const plusNames: Map<string, Set<string>> = new Map();

  for (const e of edges) {
    if (matcher.exec(e.source)) {
      if (!plusNames.has(e.source)) {
        plusNames.set(e.source, new Set());
      }

      plusNames.get(e.source)!.add(e.target);
    }
  }

  for (const m of plusNames.values()) {
    for (const k of m.values()) {
      if (plusNames.has(k)) {
        for (const l of plusNames.get(k)!.values()) {
          m.add(l);
        }
        m.delete(k);
      }
    }
  }

  for (const e of edges) {
    if (plusNames.has(e.source)) {
      continue;
    }
    if (plusNames.has(e.target)) {
      for (const target of plusNames.get(e.target)!.values()) {
        ret.push({
          target,
          source: e.source
        });
      }
    } else {
      ret.push(e);
    }
  }

  return ret;
}

interface Module {
  name: string;
  reasons: Array<{ moduleName: string }>;
  modules?: Array<Module>;
}

export function gatherEdges(
  stats: { modules: Module[] },
  edges: Edge[] = [],
  reasonOverrideName?: string
): Edge[] {
  const graph = [];
  const lookupMap = new Set<string>();

  for (const module of stats.modules || []) {
    const moduleName = cleanWebpackMagicFiles(module.name);
    for (const reason of module.reasons || []) {
      const reasonModuleName =
        reasonOverrideName || cleanWebpackMagicFiles(reason.moduleName);
      if (!lookupMap.has(`${moduleName}|${reasonModuleName}`)) {
        edges.push({
          target: reasonModuleName,
          source: moduleName
        });
        lookupMap.add(`${moduleName}|${reasonModuleName}`);
      }
    }

    if (module.modules != null) {
      edges = gatherEdges({ modules: module.modules }, edges, moduleName);
    }
  }

  return edges;
}

/**
 * Converts a webpack stats.json object to a dot formatted graph list.
 * @param stats A webpack stats.json object
 */
export function statsToGraph(stats: { modules: Module[] }): Edge[] {
  const edges = gatherEdges(stats);
  return edges;
}
