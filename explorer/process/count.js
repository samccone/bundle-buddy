const network = require('/Users/samccone/Downloads/trimmed-network.json');

/**
 * @param network {{edges: Array<{id: string, target: string, source: string}>}}
 * @returns {{[node: string]: {requiredBy: string[]; requires: string[]; indirectDependedOnCount: number, transitiveRequiredBy: string[]}}}
 */
function countsFromNetwork(network) {
    const d = {};
    for (const n of network.edges) {
        if (d[n.target] == null) {
            d[n.target] = {
                requiredBy: new Set(),
                requires: new Set(),
            };
        }

        d[n.target].requires.add(n.source);

        if (d[n.source] == null) {
            d[n.source] = {
                requiredBy: new Set(),
                requires: new Set(),
            }
        }
    }

    for (const k of Object.keys(d)) {
        for (const k2 of Object.keys(d)) {
            if (k !== k2 && d[k2].requires.has(k)) {
                d[k].requiredBy.add(k2)
            }
        }
    }


    for (const k of Object.keys(d)) {
        d[k] = {
            requiredBy: Array.from(d[k].requiredBy),
            requires: Array.from(d[k].requires),
        };
    }


    /**
     * 
     * @param {string} moduleName 
     * @param {Set<string>} seen 
     * @param {{[k: string]: {requiredBy: string[]}}} graph 
     * @param {boolean} root
     */
    function countTransitiveRequires(moduleName, seen, graph, root) {
        seen.add(moduleName)
        count = 0;

        for (const requiredBy of graph[moduleName].requiredBy) {
            if (seen.has(requiredBy)) {
                continue;
            }

            if (root != true) {
                count++;
            }

            count += countTransitiveRequires(requiredBy, seen, graph, false)
        }

        return count;
    }

    for (const moduleName of Object.keys(d)) {
        const seen = new Set();
        d[moduleName].indirectDependedOnCount = countTransitiveRequires(moduleName, seen, d, true);
        d[moduleName].transitiveRequiredBy = Array.from(seen).filter(v => v !== moduleName); 
    }


    return d;
}

console.log(JSON.stringify(countsFromNetwork(network), null, 2));