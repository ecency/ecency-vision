import { buildHotSignUrl } from "./hive-signer";

describe("hotSign", () => {
  it("should build hot signing url", () => {
    const params = {
      required_auths: `["foo"]`,
      json: JSON.stringify({
        bar: "baz"
      })
    };
    expect(buildHotSignUrl("custom-json", params, "@foo/wallet")).toMatchSnapshot();
  });
});
