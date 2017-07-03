
/**
 * Strip hashes from filename strings
 * @param {string} string
 */
export function stripHashes(string) {
  const hashRegex = /[a-f0-9]{20,}/g;
  const match = string.match(hashRegex);
  if (!match) return string;

  const shortHash = match[0].slice(0, 7);
  return string.replace(hashRegex, `${shortHash}…`);
}
