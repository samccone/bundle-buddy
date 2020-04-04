import { requiredBy } from "./requiredBy";

it("calulates transitive deps", () => {
  const input = {
    a: { requiredBy: ["b"] },
    b: { requiredBy: [] },
    c: { requiredBy: ["a", "b"] },
    d: { requiredBy: ["a"] }
  };

  const ret = requiredBy(input);

  expect(ret["a"].indirectDependedOnCount).toBe(1);
  expect(ret["a"].transitiveRequiredBy).toEqual(["b"]);
  expect(ret["b"].indirectDependedOnCount).toBe(0);
  expect(ret["b"].transitiveRequiredBy).toEqual([]);
  expect(ret["c"].indirectDependedOnCount).toBe(2);
  expect(ret["c"].transitiveRequiredBy.sort()).toEqual(["a", "b"].sort());
  expect(ret["d"].indirectDependedOnCount).toBe(2);
  expect(ret["d"].transitiveRequiredBy.sort()).toEqual(["a", "b"].sort());
});

it("does not cycle", () => {
  const input = {
    a: { requiredBy: ["b"] },
    b: { requiredBy: ["a"] }
  };

  const ret = requiredBy(input);

  expect(ret["a"].indirectDependedOnCount).toBe(1);
  expect(ret["a"].transitiveRequiredBy).toEqual(["b"]);
  expect(ret["b"].indirectDependedOnCount).toBe(1);
  expect(ret["b"].transitiveRequiredBy).toEqual(["a"]);
});
