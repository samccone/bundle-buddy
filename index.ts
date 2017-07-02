import { processSourceMaps } from './process';
import * as meow from 'meow';

const cli = meow(
	`
  Usage:
    bundle-buddy  <source_map_glob>

  Options:
    --stdout -o: Write analysis to stdout
  
  Example:
    bundle-buddy my_app/dist/*.map
`,
	{
		alias: {
			o: 'stdout'
		}
	}
);

const processed = processSourceMaps(cli.input);

if (cli.flags['stdout']) {
	console.log(
		JSON.stringify({
			graph: processed.graph,
			sourceFiles: processed.sourceFiles,
			bundleFileStats: [ ...processed.bundleFileStats ],
			outputFiles: processed.outputFiles,
			groupedBundleStats: [ ...processed.groupedBundleStats ],
			stats: [ ...processed.stats ]
		})
	);
}
