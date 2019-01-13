#!/bin/bash
set -e

protoc  --plugin="protoc-gen-ts=node_modules/.bin/protoc-gen-ts" --js_out=import_style=commonjs,binary:. --ts_out=. src/storage/import.proto
echo -e "/*global proto COMPILED:true*/\n $(cat src/storage/import_pb.js)" > /tmp/inert
mv /tmp/inert src/storage/import_pb.js

