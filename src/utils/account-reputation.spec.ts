import { accountReputation } from "./account-reputation";

describe("Account Reputation", () => {
  it("Should convert raw account reputation", () => {
    expect(accountReputation("253948750399663")).toBe(73);

    expect(accountReputation(258273053764877)).toBe(73);

    expect(accountReputation("8015808359006")).toBe(60);

    expect(accountReputation(1661224045060)).toBe(53);

    expect(accountReputation(51140617022287)).toBe(67);

    expect(accountReputation("268491430682952")).toBe(73);

    expect(accountReputation(-54158579309067)).toBe(-18);

    expect(accountReputation(11964041002)).toBe(34);

    expect(accountReputation(945546552)).toBe(25);

    expect(accountReputation(0)).toBe(25);

    expect(accountReputation(533215985)).toBe(25);

    expect(accountReputation("39508828392")).toBe(39);

    expect(accountReputation(352800518860)).toBe(47);

    expect(accountReputation(6702887567)).toBe(32);

    expect(accountReputation(75.61)).toBe(75);

    expect(accountReputation("75.61")).toBe(75);
  });
});
