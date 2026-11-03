import {test} from "vitest";
import assert from "assert";
import * as d3 from "../src/index.js";

test("drag methods", () => {
  assert.deepStrictEqual(Object.keys(d3), [
    "drag", "dragDisable", "dragEnable"
  ]);
});	
