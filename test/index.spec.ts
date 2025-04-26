import { expect, use } from "chai";
import chaiJsonSchema from "chai-json-schema";

use(chaiJsonSchema);

import { getEnv } from "../src/utils";
import { runExample } from "../src/index";

describe("Testing specific functionality", () => {
  before(async function () {
    this.timeout(120_000);
  });

  it("should test for a specific thing", async () => {
    await runExample();
  }).timeout(120_000);
});
