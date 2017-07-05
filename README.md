# Bundle Buddy

Bundle buddy helps you find **duplicated** code across your bundle splits.

## Warning Still in Active Development

using:

```
git clone https://github.com/samccone/bundle-buddy
yarn install
./node_modules/.bin/ts-node index.ts -o <relative_glob_path_to_source_maps/*.map> > viz/public/output.json
cd viz
yarn install
yarn start
```
