function generatePrefixList(items: string[]) {
  const kk: { [prefix: string]: number } = {};

  for (const i of items) {
    const components = i.split("/");
    let prev = components[0] + "/";
    for (const c of components.slice(1)) {
      kk[prev + c] = kk[prev + c] || 0;
      kk[prev + c]++;
      prev = prev + c + "/";
    }
  }

  let prefixItems = [];
  for (const k of Object.keys(kk)) {
    prefixItems.push({ prefix: k, count: kk[k] });
  }

  return prefixItems.sort((a, b) => b.count - a.count);
}

/**
 * Given two lists of strings find common prefixes that when removed would
 * align the two lists of strings.
 * @param items 
 * @param items2 
 */
export function findTrims(items: string[], items2: string[]) {
  const prefixList1 = generatePrefixList(items);
  const prefixList2 = generatePrefixList(items2);
  const recommendedTrims: { [prefix: string]: number } = {};
  for (let i = 0; i < prefixList1.length; i++) {
    for (let j = 0; j < prefixList2.length; j++) {
      if (prefixList1[i].prefix.length > prefixList2[j].prefix.length) {
        const idx = prefixList1[i].prefix.indexOf(prefixList2[j].prefix);
        if (idx > -1) {
          const str = prefixList1[i].prefix.slice(0, idx);
          if (str !== "") {
            recommendedTrims[str] = recommendedTrims[str] || 0;
            recommendedTrims[str]++;
          }
        }
      } else {
        const idx = prefixList2[j].prefix.indexOf(prefixList1[i].prefix);
        if (idx > -1) {
          const str = prefixList2[j].prefix.slice(0, idx);
          if (str !== "") {
            recommendedTrims[str] = recommendedTrims[str] || 0;
            recommendedTrims[str]++;
          }
        }
      }
    }
  }

  for (const k of Object.keys(recommendedTrims)) {
    for (const j of Object.keys(recommendedTrims)) {
      if (j.startsWith(k) && j !== k) {
        delete recommendedTrims[j];
      }
    }
  }
  return recommendedTrims;
}
