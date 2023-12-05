import { currencySymbol } from "./currency-symbol";

describe("Currency Symbol", () => {
  it("Symbols", () => {
    expect(currencySymbol("hbd")).toBe("$");
    expect(currencySymbol("usd")).toBe("$");
    expect(currencySymbol("eur")).toBe("€");
    expect(currencySymbol("try")).toBe("₺");
    expect(currencySymbol("btc")).toBe("฿");
  });
});
