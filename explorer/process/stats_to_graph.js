const fs = require('fs');
if (process.argv.length <= 2) {
  console.error('Please pass the path to the stats.json file as the first argument');
  process.exit(1);
}

const stats = JSON.parse(fs.readFileSync(process.argv[2], 'utf-8'));
const graph = [];

function toNode(from, to) {
  return `"${from}" -> "${to}"`;
}

const ret = [];

for (const module of stats.modules) {
  const moduleName = module.name;
  for (const reason of module.reasons || []) {
    ret.push({
      source: moduleName,
      target: reason.moduleName
    });
  }
}

console.log(JSON.stringify(ret, null, 2));
