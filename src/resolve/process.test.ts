import { getTrimmedNetwork } from "./process";

it("creates nodes from ", () => {
  expect(
    getTrimmedNetwork(
      [
        {
          source: "src/DisplayComment.js",
          target: "node_modules/react/react.js",
        },
        {
          source: "src/DisplayComment.js",
          target: "node_modules/react/test.js",
        },
      ],
      {
        files: {
          "src/DisplayComment.js": { totalBytes: 833 },
          "node_modules/react/react.js": { totalBytes: 145 },
          "node_modules/react/test.js": { totalBytes: 20 },
        },
        totalSize: 0,
      }
    )
  ).toEqual({
    nodes: [
      {
        requiredBy: [],
        requires: ["node_modules/react"],
        transitiveRequiredBy: [],
        transitiveRequires: ["node_modules/react"],
        transitiveRequiresSize: 165,
        directory: "src",
        fileName: "DisplayComment.js",
        id: "src/DisplayComment.js",
        text: "DisplayComment.js",
        totalBytes: 833,
      },
      {
        requiredBy: ["src/DisplayComment.js"],
        requires: [],
        transitiveRequiredBy: ["src/DisplayComment.js"],
        transitiveRequires: [],
        transitiveRequiresSize: 0,
        directory: "node_modules",
        fileName: "react",
        id: "node_modules/react",
        text: "react",
        totalBytes: 165,
      },
    ],
    edges: [
      {
        fileName: "src/DisplayComment.js",
        imported: "node_modules/react",
        importedFileNames: [
          "node_modules/react/react.js",
          "node_modules/react/test.js",
        ],
      },
    ],
  });
});
