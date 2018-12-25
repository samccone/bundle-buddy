export function findCommonPrefix(strings: string[]): string|null {
    let commonPrefix = null;

    for (const k of strings) {
        if (commonPrefix == null) {
            commonPrefix = k;
        } else {
            let matched = false;
            for (let splitPoint = k.length; splitPoint > 0; splitPoint--) {
                const split = k.slice(0, splitPoint);
                if (commonPrefix.indexOf(split) != -1) {
                    commonPrefix = split;
                    matched = true;
                    break;
                }

                if (split.length === 1) {
                    break;
                }
            }

            if (!matched) {
                commonPrefix = '';
                break;
            }
        }
    }

    return commonPrefix;
}
