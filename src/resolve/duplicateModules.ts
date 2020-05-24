/**
 * Given a list of files find duplicate node modules and the dependencies that
 * brought them into the project.
 * @param sourceMapFiles a list of files in the project
 */
export function findDuplicateModules(
  sourceMapFiles: string[]
): Array<{
  key: string;
  value: string[];
}> {
  const ret: Array<{
    key: string;
    value: string[];
  }> = [];
  const containsNodeModules = sourceMapFiles.filter(
    v => v.indexOf("node_modules") > -1
  );
  const explodedPaths = containsNodeModules
    .map(v => v.split("/"))
    .map(splitPath => {
      return {
        nodeModulePreamables: splitPath
          .map((v, i) => {
            if (v === "node_modules") {
              return [splitPath[i + 1], splitPath[i - 1]];
            }

            return undefined;
          })
          .filter(v => v != null)
      };
    })
    .sort(
      (a, b) => a.nodeModulePreamables.length - b.nodeModulePreamables.length
    );

  const dupes: { [module: string]: { imports: Set<string> } } = {};

  const seen = new Set<string>();
  for (const d of explodedPaths as any) {
    const module = d.nodeModulePreamables[d.nodeModulePreamables.length - 1][0];
    const from = d.nodeModulePreamables[d.nodeModulePreamables.length - 1][1];

    if (d.nodeModulePreamables.length === 1) {
      dupes[module] = { imports: new Set<string>(["<PROJECT ROOT>"]) };
      seen.add(module);
    } else {
      if (seen.has(module)) {
        if (dupes[module] == null) {
          dupes[module] = { imports: new Set<string>([]) };
        }

        dupes[module].imports.add(from);
      } else {
        seen.add(module);
      }
    }
  }

  for (const key of Object.keys(dupes)) {
    if (dupes[key].imports?.size > 1) {
      ret.push({
        key,
        value: Array.from(dupes[key].imports)
      });
    }
  }

  return ret;
}
