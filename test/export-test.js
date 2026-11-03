import assert from "node:assert";
import {it} from "vitest";
import * as d3 from "../src/index.js";

it("drag methods", () => {
  assert.deepStrictEqual(Object.keys(d3), [
    "drag", "dragDisable", "dragEnable"
  ]);
});	
