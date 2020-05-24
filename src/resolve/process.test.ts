import { findDuplicateModules } from "./process";

it("handles one module", () => {
  const ret = findDuplicateModules(["foo/zap/node_modules/tap"]);

  expect(ret.length).toBe(0);
});

it("handles multiple modules", () => {
  const ret = findDuplicateModules([
    "foo/zap/node_modules/tap",
    "foo/zap/node_modules/bar"
  ]);

  expect(ret.length).toBe(0);
});

it("handles duplicate modules", () => {
  const ret = findDuplicateModules([
    "foo/zap/node_modules/tap",
    "foo/zap/node_modules/bar/node_modules/tap"
  ]);

  expect(ret.length).toBe(1);
  expect(ret[0].key).toBe("tap");
  expect(ret[0].value.sort()).toEqual(["<PROJECT ROOT>", "bar"]);
});

it("handles multiple duplicate modules", () => {
  const ret = findDuplicateModules([
    "foo/zap/node_modules/tap",
    "foo/zap/node_modules/bar/node_modules/tap",
    "foo/zap/node_modules/lap",
    "foo/zap/node_modules/wow/node_modules/lap"
  ]);

  expect(ret.length).toBe(2);
  expect(ret[0].key).toBe("tap");
  expect(ret[0].value.sort()).toEqual(["<PROJECT ROOT>", "bar"]);

  expect(ret[1].key).toBe("lap");
  expect(ret[1].value.sort()).toEqual(["<PROJECT ROOT>", "wow"]);
});
