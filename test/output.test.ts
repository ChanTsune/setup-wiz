import { Output } from "../src/output";

describe("Output", () => {
  test("", (done) => {
    const output = new Output("path", "version");
    expect(output.version).toBe("version");
    done();
  });
});
