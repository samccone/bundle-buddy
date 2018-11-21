const stats = require("/Users/samccone/Downloads/drive-download-20181110T180955Z-001/stats.json");
const graph = [];

function toNode(from, to) {
  return `"${from}" -> "${to}"`;
}

const ret = [];

for (const module of stats.modules) {
  const moduleName = module.name;
  console.log(module);
  return;
  for (const reason of module.reasons || []) {
    ret.push({
      source: moduleName,
      target: reason.moduleName
    });
  }
}

console.log(JSON.stringify(ret, null, 2));
