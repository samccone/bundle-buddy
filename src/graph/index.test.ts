import { requiredBy, directRequires, calculateTransitiveRequires } from ".";

it("calculate transitive requires cycles", () => {
  const input = {
    a: { requiredBy: ["b"] },
    c: { requiredBy: ["a"] },
    b: { requiredBy: ["c", "a"] }
  };

  expect(
    Array.from(calculateTransitiveRequires("a", directRequires(input))).sort()
  ).toEqual(["b", "c"]);

  expect(
    Array.from(calculateTransitiveRequires("b", directRequires(input))).sort()
  ).toEqual(["a", "c"]);

  expect(
    Array.from(calculateTransitiveRequires("c", directRequires(input))).sort()
  ).toEqual(["a", "b"]);
});

it("calculate transitive requires", () => {
  const input = {
    a: { requiredBy: ["b"] },
    c: { requiredBy: ["a"] },
    z: { requiredBy: ["a"] },
    q: { requiredBy: ["c"] }
  };

  // handles when a node is not in the graph
  expect(
    Array.from(calculateTransitiveRequires("foo", directRequires(input))).sort()
  ).toEqual([]);

  expect(
    Array.from(calculateTransitiveRequires("a", directRequires(input))).sort()
  ).toEqual(["c", "q", "z"]);
});

it("builds direct requires (depends on) graph", () => {
  const input = {
    a: { requiredBy: ["b"] },
    c: { requiredBy: ["a"] },
    z: { requiredBy: ["a", "t"] },
    q: { requiredBy: ["c"] }
  };

  const ret = directRequires(input);

  expect(Array.from(ret["a"].requires).sort()).toEqual(["c", "z"]);

  expect(Array.from(ret["b"].requires)).toEqual(["a"]);

  expect(Array.from(ret["c"].requires).sort()).toEqual(["q"]);

  expect(Array.from(ret["t"].requires).sort()).toEqual(["z"]);
});

it("calulates transitive required by (required by)", () => {
  const input = {
    a: { requiredBy: ["b"] },
    b: { requiredBy: [] },
    c: { requiredBy: ["a", "b"] },
    d: { requiredBy: ["a"] }
  };

  const ret = requiredBy(input);

  expect(ret["a"].transitiveRequiredBy).toEqual(["b"]);
  expect(ret["b"].transitiveRequiredBy).toEqual([]);
  expect(ret["c"].transitiveRequiredBy.sort()).toEqual(["a", "b"].sort());
  expect(ret["d"].transitiveRequiredBy.sort()).toEqual(["a", "b"].sort());
});

it("does not cycle", () => {
  const input = {
    a: { requiredBy: ["b"] },
    b: { requiredBy: ["a"] }
  };

  const ret = requiredBy(input);

  expect(ret["a"].transitiveRequiredBy).toEqual(["b"]);
  expect(ret["b"].transitiveRequiredBy).toEqual(["a"]);
});
