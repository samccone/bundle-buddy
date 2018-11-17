const fs = require('fs');
const sourceMap = require('source-map');
const contents = fs.readFileSync('/Users/samccone/Downloads/drive-download-20181110T180955Z-001/app.a80edbe1239ad91b8907.min.js.map', 'utf-8');

sourceMap.SourceMapConsumer.with(contents, null, consumer => {
    const files = {};
    consumer.computeColumnSpans();
    consumer.eachMapping(m => {
        if (files[m.source] == null) {
            files[m.source] = {
                totalBytes: 0,
            }
        }

        if (m.lastGeneratedColumn != null) {
            files[m.source].totalBytes += (-m.generatedColumn + m.lastGeneratedColumn);
        }
    });




    const prefixClean = findCommonPrefix(files);
    const ret = {};

    for (const k of Object.keys(files)) {
        ret[k.slice(prefixClean.length)] = files[k];
    }
    
    console.log(JSON.stringify(ret, null, 2));
});

function findCommonPrefix(files) {
    let commonPrefix = null;

    for (const k of Object.keys(files)) {
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