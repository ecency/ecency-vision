import { getHiveMarketRate } from "./get-market-rate";
import { MarketAsset } from "../../market-pair";
import * as hive from "../../../../api/hive";

describe("GetMarketRate", function () {
  it("should return hive lowest ask", async function () {
    jest.spyOn(hive, "getMarketStatistics").mockImplementation(() => ({ lowest_ask: 0.5 } as any));
    const rate = await getHiveMarketRate(MarketAsset.HIVE);
    expect(rate).toBe(0.5);
  });

  it("should return hbd lowest ask", async function () {
    jest.spyOn(hive, "getMarketStatistics").mockImplementation(() => ({ lowest_ask: 0.5 } as any));
    const rate = await getHiveMarketRate(MarketAsset.HBD);
    expect(rate).toBe(2);
  });
});
