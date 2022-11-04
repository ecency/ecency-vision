import * as api from "../../../api/operations";
import { swapByHs, swapByKc, swapByKey } from "./swapping";
import { MarketAsset } from "../market-pair";
import { ActiveUser } from "../../../store/active-user/types";
import { TransactionType } from "../../buy-sell-hive";
import { OrderIdPrefix } from "../../../api/operations";

describe("Swapping", function () {
  it("should swap hive by key", function () {
    const mock = jest.fn();
    jest.spyOn(api, "limitOrderCreate").mockImplementation(mock);
    const testKey = "test" as any;
    swapByKey(testKey, {
      fromAmount: "1,111",
      toAmount: "2,111",
      fromAsset: MarketAsset.HIVE,
      activeUser: { username: "test" } as ActiveUser
    });
    expect(mock).toHaveBeenCalledWith(
      "test",
      testKey,
      2111,
      1111,
      TransactionType.Sell,
      OrderIdPrefix.SWAP
    );
  });

  it("should swap hive by hs", function () {
    const mock = jest.fn();
    jest.spyOn(api, "limitOrderCreateHot").mockImplementation(mock);
    swapByHs({
      fromAmount: "1,111",
      toAmount: "2,111",
      fromAsset: MarketAsset.HIVE,
      activeUser: { username: "test" } as ActiveUser
    });
    expect(mock).toHaveBeenCalledWith("test", 2111, 1111, TransactionType.Sell, OrderIdPrefix.SWAP);
  });

  it("should swap hive by kc", function () {
    const mock = jest.fn();
    jest.spyOn(api, "limitOrderCreateKc").mockImplementation(mock);
    swapByKc({
      fromAmount: "1,111",
      toAmount: "2,111",
      fromAsset: MarketAsset.HIVE,
      activeUser: { username: "test" } as ActiveUser
    });
    expect(mock).toHaveBeenCalledWith("test", 2111, 1111, TransactionType.Sell, OrderIdPrefix.SWAP);
  });

  it("should swap hbd by key", function () {
    const mock = jest.fn();
    jest.spyOn(api, "limitOrderCreate").mockImplementation(mock);
    const testKey = "test" as any;
    swapByKey(testKey, {
      fromAmount: "1,111",
      toAmount: "2,111",
      fromAsset: MarketAsset.HBD,
      activeUser: { username: "test" } as ActiveUser
    });
    expect(mock).toHaveBeenCalledWith(
      "test",
      testKey,
      1111,
      2111,
      TransactionType.Buy,
      OrderIdPrefix.SWAP
    );
  });

  it("should swap hbd by hs", function () {
    const mock = jest.fn();
    jest.spyOn(api, "limitOrderCreateHot").mockImplementation(mock);
    swapByHs({
      fromAmount: "1,111",
      toAmount: "2,111",
      fromAsset: MarketAsset.HBD,
      activeUser: { username: "test" } as ActiveUser
    });
    expect(mock).toHaveBeenCalledWith("test", 1111, 2111, TransactionType.Buy, OrderIdPrefix.SWAP);
  });

  it("should swap hbd by kc", function () {
    const mock = jest.fn();
    jest.spyOn(api, "limitOrderCreateKc").mockImplementation(mock);
    swapByKc({
      fromAmount: "1,111",
      toAmount: "2,111",
      fromAsset: MarketAsset.HBD,
      activeUser: { username: "test" } as ActiveUser
    });
    expect(mock).toHaveBeenCalledWith("test", 1111, 2111, TransactionType.Buy, OrderIdPrefix.SWAP);
  });
});
