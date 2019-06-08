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

/**
 * Converts a webpack stats.json object to a dot formatted graph list.
 * @param stats A webpack stats.json object
 */
export function statsToGraph(stats: {
  modules: Array<{
    name: string;
    reasons: Array<{ moduleName: string }>;
    modules?: Array<{ name: string; reasons: Array<{ moduleName: string }> }>;
  }>;
}): Edge[] {
  const graph = [];
  const lookupMap = new Set<string>();

  const ret: Edge[] = [];

  for (const module of stats.modules) {
    const moduleName = cleanWebpackMagicFiles(module.name);
    for (const reason of module.reasons || []) {
      const reasonModuleName = cleanWebpackMagicFiles(reason.moduleName || "");
      if (!lookupMap.has(`${moduleName}|${reasonModuleName}`)) {
        ret.push({
          source: moduleName,
          target: reasonModuleName
        });
        lookupMap.add(`${moduleName}|${reasonModuleName}`);
      }

      if (module.modules != null) {
        for (const m of module.modules) {
          const subModuleName = cleanWebpackMagicFiles(m.name);
          if (!lookupMap.has(`${moduleName}|${subModuleName}`)) {
            ret.push({
              source: moduleName,
              target: subModuleName
            });
            lookupMap.add(`${moduleName}|${subModuleName}`);
          }
        }
      }
    }
  }

  return ret;
}
