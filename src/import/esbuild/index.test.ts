import { toEdges, toProcessedBundles } from ".";

it("handles the empty case for toEdges", () => {
  expect(
    toEdges({
      outputs: {},
      inputs: {},
    })
  ).toEqual([]);
});

it("handles generating edges", () => {
  expect(
    toEdges({
      outputs: {},
      inputs: {
        "foo.js": {
          bytes: 0,
          imports: [
            {
              path: "tap.js",
            },
            {
              path: "lap.js",
            },
          ],
        },
        "wow.js": {
          bytes: 0,
          imports: [
            {
              path: "tap.js",
            },
          ],
        },
      },
    })
  ).toEqual([
    {
      source: "foo.js",
      target: "tap.js",
    },
    {
      source: "foo.js",
      target: "lap.js",
    },
    {
      source: "wow.js",
      target: "tap.js",
    },
  ]);
});

it("handles the empty case for toProcessedBundles", () => {
  expect(
    toProcessedBundles({
      outputs: {},
      inputs: {},
    })
  ).toEqual({});
});

it("converts into a processed bundle format", () => {
  expect(
    toProcessedBundles({
      outputs: {
        "foo.min.js": {
          bytes: 0,
          inputs: {
            "foo.js": {
              bytesInOutput: 0,
            },
            "tap.js": {
              bytesInOutput: 0,
            },
          },
        },
        "zap.min.js": {
          bytes: 0,
          inputs: {
            "zap.js": {
              bytesInOutput: 0,
            },
          },
        },
      },
      inputs: {},
    })
  ).toEqual({
    "foo.min.js": {
      files: {
        "foo.js": {
          totalBytes: 0,
        },
        "tap.js": {
          totalBytes: 0,
        },
      },
      totalBytes: 0,
    },
    "zap.min.js": {
      files: {
        "zap.js": {
          totalBytes: 0,
        },
      },
      totalBytes: 0,
    },
  });
});
