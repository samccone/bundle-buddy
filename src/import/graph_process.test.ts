import { GraphNodes } from "../types";
import { cleanGraph } from "./graph_process";

it("strips magic prefixes", () => {
  const nodes: GraphNodes = [
    { source: "commonjs-proxy:/foo.js", target: "zap.ts" }
  ];
  const ret = cleanGraph(nodes);

  expect(ret[0].source).toBe("foo.js");
});

it("strips common prefix", () => {
  const nodes: GraphNodes = [{ source: "wow/foo.js", target: "wow/zap.ts" }];
  const ret = cleanGraph(nodes);

  expect(ret[0].source).toBe("foo.js");
  expect(ret[0].target).toBe("zap.ts");
});

it("strips common prefix ignoring ignored nodes", () => {
  const nodes: GraphNodes = [
    {
      source: "wow/foo.js",
      target: "wow/zap.ts"
    },
    {
      source: "fs",
      target: "wow/zap.ts"
    }
  ];
  const ret = cleanGraph(nodes);

  expect(ret[0].source).toBe("foo.js");
  expect(ret[0].target).toBe("zap.ts");
  expect(ret[1].target).toBe("zap.ts");
});

it("strips no matching prefix but common /", () => {
  const nodes: GraphNodes = [
    {
      source: "(foo) ./wow.js",
      target: "./zap.ts"
    },
    {
      source: "./client.js",
      target: "./zap.ts"
    },
    {
      source: "./more.js",
      target: "./no.ts"
    }
  ];
  const ret = cleanGraph(nodes);

  expect(ret[0].source).toBe("(foo) ./wow.js");
  expect(ret[2].target).toBe("no.ts");
});
