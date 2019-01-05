/**
 * Converts a webpack stats.json object to a dot formatted graph list.
 * @param stats A webpack stats.json object
 */
export function statsToGraph(stats: {
  modules: Array<{
    name: string;
    reasons: Array<{ moduleName: string }>;
  }>;
}): Array<{ source: string; target: string }> {
  const graph = [];
  const lookupMap = new Set<string>();

  const ret: Array<{ source: string; target: string }> = [];

  for (const module of stats.modules) {
    const moduleName = module.name;
    for (const reason of module.reasons || []) {
      if (!lookupMap.has(`${moduleName}|${reason.moduleName}`)) {
        ret.push({
          source: moduleName,
          target: reason.moduleName
        });
        lookupMap.add(`${moduleName}|${reason.moduleName}`);
      }
    }
  }

  return ret;
}
