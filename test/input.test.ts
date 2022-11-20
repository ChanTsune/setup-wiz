import { Input } from "../src/input";

describe("Input", () => {
  test("Not specify version", (done) => {
    const input = new Input("", false);
    expect(input.version).toBe("dev-latest");
    done();
  });

  test("Specify version", (done) => {
    const input = new Input("0.0.0", false);
    expect(input.version).toBe("0.0.0");
    done();
  });
});
