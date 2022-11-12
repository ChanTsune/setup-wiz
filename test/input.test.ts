import { Input } from "../src/input";

describe("Input", () => {
  test("Not specify version", (done) => {
    const input = new Input("");
    expect(input.version).toBe("dev-latest");
    done();
  });

  test("Specify version", (done) => {
    const input = new Input("0.0.0");
    expect(input.version).toBe("0.0.0");
    done();
  });
});
