import { buildHotSignUrl } from "./hive-signer";

jest.mock("../../client_config.ts", () => ({
  TEST_NET: false,
  APP_URL: "https://ecency.com",
  APP_DOMAIN: "https://ecency.com"
}));

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
