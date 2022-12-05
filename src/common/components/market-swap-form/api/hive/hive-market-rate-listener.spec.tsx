import { HiveMarket } from "./hive-market-rate-listener";
import { MarketAsset } from "../../market-pair";
import { OrdersDataItem } from "../../../../api/hive";

describe("HiveMarketRateListener", function () {
  it("should return empty order data", function () {
    const buyOrderBook: OrdersDataItem[] = [];
    const sellOrderBook: OrdersDataItem[] = [];
    const { emptyOrderBook } = HiveMarket.processHiveOrderBook(
      sellOrderBook,
      buyOrderBook,
      "100",
      MarketAsset.HBD
    );
    expect(emptyOrderBook).toBeTruthy();
  });

  it("should fill amount and return right price when sell Hive with slippage", function () {
    const buyOrderBook: OrdersDataItem[] = [
      {
        hive: 100000,
        hbd: 2,
        created: "test-string",
        order_price: {
          base: "1",
          quote: "1"
        },
        real_price: "1.1"
      },
      {
        hive: 100000,
        hbd: 2,
        created: "test-string",
        order_price: {
          base: "1",
          quote: "1"
        },
        real_price: "1.2"
      },
      {
        hive: 100000,
        hbd: 2,
        created: "test-string",
        order_price: {
          base: "1",
          quote: "1"
        },
        real_price: "1.3"
      }
    ];
    const sellOrderBook: OrdersDataItem[] = [
      {
        hive: 1,
        hbd: 2,
        created: "test-string",
        order_price: {
          base: "1",
          quote: "1"
        },
        real_price: "1"
      }
    ];
    const { toAmount, tooMuchSlippage } = HiveMarket.processHiveOrderBook(
      sellOrderBook,
      buyOrderBook,
      "100",
      MarketAsset.HIVE
    );
    expect(toAmount).toBe("120");
    expect(tooMuchSlippage).toBeTruthy();
  });

  it("should fill amount and return right price when sell Hive w/o slippage", function () {
    const buyOrderBook: OrdersDataItem[] = [
      {
        hive: 100000,
        hbd: 2,
        created: "test-string",
        order_price: {
          base: "1",
          quote: "1"
        },
        real_price: "1.111"
      },
      {
        hive: 100000,
        hbd: 2,
        created: "test-string",
        order_price: {
          base: "1",
          quote: "1"
        },
        real_price: "1.112"
      },
      {
        hive: 100000,
        hbd: 2,
        created: "test-string",
        order_price: {
          base: "1",
          quote: "1"
        },
        real_price: "1.113"
      }
    ];
    const sellOrderBook: OrdersDataItem[] = [
      {
        hive: 1,
        hbd: 2,
        created: "test-string",
        order_price: {
          base: "1",
          quote: "1"
        },
        real_price: "1"
      }
    ];
    const { tooMuchSlippage } = HiveMarket.processHiveOrderBook(
      sellOrderBook,
      buyOrderBook,
      "100",
      MarketAsset.HIVE
    );
    expect(tooMuchSlippage).toBeFalsy();
  });

  it("should return invalid amount if order book doesn`t have enough value in Hive", function () {
    const buyOrderBook: OrdersDataItem[] = [
      {
        hive: 100000,
        hbd: 2,
        created: "test-string",
        order_price: {
          base: "1",
          quote: "1"
        },
        real_price: "1.111"
      },
      {
        hive: 100000,
        hbd: 2,
        created: "test-string",
        order_price: {
          base: "1",
          quote: "1"
        },
        real_price: "1.112"
      },
      {
        hive: 100000,
        hbd: 2,
        created: "test-string",
        order_price: {
          base: "1",
          quote: "1"
        },
        real_price: "1.113"
      }
    ];
    const sellOrderBook: OrdersDataItem[] = [
      {
        hive: 1,
        hbd: 2,
        created: "test-string",
        order_price: {
          base: "1",
          quote: "1"
        },
        real_price: "1"
      }
    ];
    const { invalidAmount } = HiveMarket.processHiveOrderBook(
      buyOrderBook,
      sellOrderBook,
      "1000",
      MarketAsset.HIVE
    );
    expect(invalidAmount).toBeTruthy();
  });

  it("should fill amount and return right price when sell HBD with slippage", function () {
    const buyOrderBook: OrdersDataItem[] = [
      {
        hive: 2,
        hbd: 100000,
        created: "test-string",
        order_price: {
          base: "1",
          quote: "1"
        },
        real_price: "1.1"
      }
    ];
    const sellOrderBook: OrdersDataItem[] = [
      {
        hive: 2,
        hbd: 100000,
        created: "test-string",
        order_price: {
          base: "1",
          quote: "1"
        },
        real_price: "1.1"
      },
      {
        hive: 2,
        hbd: 100000,
        created: "test-string",
        order_price: {
          base: "1",
          quote: "1"
        },
        real_price: "1.12"
      },
      {
        hive: 2,
        hbd: 100000,
        created: "test-string",
        order_price: {
          base: "1",
          quote: "1"
        },
        real_price: "1.13"
      }
    ];
    const { toAmount, tooMuchSlippage } = HiveMarket.processHiveOrderBook(
      sellOrderBook,
      buyOrderBook,
      "100",
      MarketAsset.HBD
    );
    expect(toAmount).toBe("89.28571428571428");
    expect(tooMuchSlippage).toBeTruthy();
  });

  it("should fill amount and return right price when sell HBD w/o slippage", function () {
    const buyOrderBook: OrdersDataItem[] = [
      {
        hive: 2,
        hbd: 100000,
        created: "test-string",
        order_price: {
          base: "1",
          quote: "1"
        },
        real_price: "1.1"
      }
    ];
    const sellOrderBook: OrdersDataItem[] = [
      {
        hive: 2,
        hbd: 100000,
        created: "test-string",
        order_price: {
          base: "1",
          quote: "1"
        },
        real_price: "1.1"
      },
      {
        hive: 2,
        hbd: 100000,
        created: "test-string",
        order_price: {
          base: "1",
          quote: "1"
        },
        real_price: "1.12"
      },
      {
        hive: 2,
        hbd: 100000,
        created: "test-string",
        order_price: {
          base: "1",
          quote: "1"
        },
        real_price: "1.13"
      }
    ];
    const { tooMuchSlippage } = HiveMarket.processHiveOrderBook(
      sellOrderBook,
      buyOrderBook,
      "100",
      MarketAsset.HIVE
    );
    expect(tooMuchSlippage).toBeFalsy();
  });

  it("should return invalid amount if order book doesn`t have enough value in HBD", function () {
    const buyOrderBook: OrdersDataItem[] = [
      {
        hive: 2,
        hbd: 100000,
        created: "test-string",
        order_price: {
          base: "1",
          quote: "1"
        },
        real_price: "1.1"
      }
    ];
    const sellOrderBook: OrdersDataItem[] = [
      {
        hive: 2,
        hbd: 100000,
        created: "test-string",
        order_price: {
          base: "1",
          quote: "1"
        },
        real_price: "1.1"
      },
      {
        hive: 2,
        hbd: 100000,
        created: "test-string",
        order_price: {
          base: "1",
          quote: "1"
        },
        real_price: "1.12"
      },
      {
        hive: 2,
        hbd: 100000,
        created: "test-string",
        order_price: {
          base: "1",
          quote: "1"
        },
        real_price: "1.13"
      }
    ];
    const { invalidAmount } = HiveMarket.processHiveOrderBook(
      buyOrderBook,
      sellOrderBook,
      "1000",
      MarketAsset.HIVE
    );
    expect(invalidAmount).toBeTruthy();
  });
});
