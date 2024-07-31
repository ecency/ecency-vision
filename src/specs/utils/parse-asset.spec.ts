import { parseAsset } from "../../utils/parse-asset";

describe("Parse asset(token)", () => {
  it("(1) should parse", () => {
    const input = "18.494 HBD";
    expect(parseAsset(input)).toMatchSnapshot();
  });

  it("(2) should parse", () => {
    const input = "0.012 HIVE";
    expect(parseAsset(input)).toMatchSnapshot();
  });
});
