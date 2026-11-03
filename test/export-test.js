import assert from "node:assert";
import {it} from "vitest";
import * as d3 from "d3-drag";

it("drag methods", () => {
  assert.deepStrictEqual(Object.keys(d3), [
    "drag", "dragDisable", "dragEnable"
  ]);
});
