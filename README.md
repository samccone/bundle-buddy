Bundle Buddy
====

Bundle Buddy is a tool to help you find source code duplication across your javascript chunks/splits. This enables you to fine tune code splitting parameters to reduce bundle invalidation rates as well as improve repeat page load performance \o/. 

<a href="https://build-wryzeystih.now.sh/ ">"<img src="https://user-images.githubusercontent.com/883126/28001744-ed90cef4-64e3-11e7-919a-f27ced92f9b9.png" height="400px"><caption><p><small><b>Example Bundle Buddy UI</b></small></p></caption></a>


Bundly Buddy operates on any source maps, but you *must* include the source content. It will work for any CSS/JS/TEMPLATES etc. that is mapped.

In webpack this means setting devtool to `source-map`
https://webpack.github.io/docs/configuration.html#devtool

-----

## How to use?

```bash

npm install -g bundle-buddy

bundle-buddy <$SOURCE_MAP_GLOB>
```

### Bundle Buddy UI interactions.

<img height="400px" src="https://user-images.githubusercontent.com/883126/28001816-9f045656-64e4-11e7-8439-54e7091b29ff.png">

When you select a bundle on the left panel, you can then see the bundle breakdown, which shows you the most duplicated source lines across bundles that the currently selected bundle contains.

After clicking on a bundle chunk we will then show you the lines of the source file that are repeated as well as what other bundles contain said source lines.


### Acting on the results.

The ideal workflow flow using Bundle Buddy is to first identify what code is most duplicated across the project's bundles, then to utilize a common code bundling techique (https://webpack.js.org/plugins/commons-chunk-plugin/), then to rebuild your site, and then *finally* to measure again to see your impact.

### How does this work?

Bundle Buddy builds up a mapping across every source map of every file and each line in each file that is used. This enables Bundle Buddy to detect common source lines between different project chunks. 

----


### Contributing 

Working on the front end is simple

```bash
cd viz
yarn install
yarn start
```

Working on the CLI component is also straight forward

```bash
yarn install
./node_modules/.bin/ts-node index.ts
```
