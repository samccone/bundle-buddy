import { findCommonPrefix } from './prefix_cleaner';

export type GraphNodes = Array<{source: string; target: string}>

const magicPrefixes = [
    // Rollup specific prefix added to add commonjs proxy nodes.
    "\u0000commonjs-proxy:",
    // Rollup specific prefix added to add commonjs external nodes.
    "\u0000commonjs-external:",
    // More rollup magic prefixing.
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

export function cleanGraph(graph: GraphNodes): GraphNodes {
    const keys = new Set();

    for (let { source, target } of graph) {
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

    const commonPrefix = findCommonPrefix(Array.from(keys));

    if (commonPrefix != null && commonPrefix.length) {
        for (const node of graph) {
            for (const key of Object.keys(node) as Array<'target'|'source'>) {
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

    const ret: Array<{source: string; target: string}> = []
    for (const node of graph) {
        if (node.target !== node.source) {
            ret.push(node);
        }
    }

    return ret;
}
