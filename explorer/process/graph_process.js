const fs = require('fs');
const cleaner = require('./prefix_cleaner');

const magicPrefixes = [
  // Rollup specific prefix added to add commonjs proxy nodes.
  "\u0000commonjs-proxy:",
  // Rollup specific prefix added to add commonjs external nodes.
  "\u0000commonjs-external:",
  '\u0000',
]

const ignoreNodes = new Set([
  // Rollup specific magic module.
  "\u0000commonjsHelpers",
  'babelHelpers',
  // Core nodejs modules
  "crypto",
  "events",
  "path",
  "module",
  "fs",
  "util",
]);

if (process.argv[2] == null) {
  throw new Error('Please pass a graph json path');
}

const contents = JSON.parse(fs.readFileSync(process.argv[2], 'utf-8'));
const keys = new Set();

for (let {source, target} of contents) {
  for (const magicPrefix of magicPrefixes) {
    if (source.startsWith(magicPrefix)) {
      source = source.slice(magicPrefix.length);
    }

    if (target.startsWith(magicPrefix)) {
      target = target.slice(magicPrefix.length);
    }
  }

  if (!ignoreNodes.has(source)) {
    keys.add(source);
  }

  if (!ignoreNodes.has(target)) {
    keys.add(target);
  }
}

const commonPrefix = cleaner.findCommonPrefix(Array.from(keys));

if (commonPrefix.length) {
  console.error(`Cleaning common prefix ${commonPrefix}`);
  for (const node of contents) {
    for (const key of Object.keys(node)) {
      for (const magicPrefix of magicPrefixes) {
        if (node[key].startsWith(magicPrefix)) {
          node[key] = node[key].slice(magicPrefix.length);
        }
      }

      if (node[key].startsWith(commonPrefix)) {
        node[key] = node[key].slice(commonPrefix.length);
      }
    }
  }
}

const ret = []
for (const node of contents) {
  if (node.target !== node.source) {
    ret.push(node);
  }
}

console.log(JSON.stringify(ret, null, 2));
