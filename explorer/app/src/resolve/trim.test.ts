import { findTrims } from "./trim";

it("finds no trims when no /", () => {
  expect(findTrims(["wow"], ["wo"])).toEqual({});
});

it("finds no trims", () => {
  expect(findTrims(["wo/ok"], ["../ok"])).toEqual({});
});

it("finds trims", () => {
  expect(findTrims(["a/b/ok"], ["b/ok"])).toEqual({
    "a/": 1
  });

  expect(findTrims(["b/ok"], ["a/b/ok"])).toEqual({
    "a/": 1
  });
});

it("finds multi trims", () => {
  expect(
    findTrims(["a/b/ok", "nothing", "../a/b.js"], ["b/ok", "a/b.js"])
  ).toEqual({
    "a/": 1,
    "../": 1
  });
});
