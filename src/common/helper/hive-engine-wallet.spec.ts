import HiveEngineToken from "./hive-engine-wallet";

describe("HiveEngineToken", () => {
  const subject: HiveEngineToken = new HiveEngineToken({
    symbol: "POB",
    name: "",
    icon: "",
    balance: "0.00000000",
    stake: "0.00000000",
    precision: 2,
    delegationsIn: "0.00000000",
    delegationsOut: "0.00000000",
    stakingEnabled: false,
    delegationEnabled: false
  });

  describe("hasDelegations", () => {
    it("should return false if the token has no delegation enabled", () => {
      expect(subject.hasDelegations()).toBe(false);
    });

    it("should return false if the delegations equals to zero", () => {
      subject.delegationEnabled = true;

      expect(subject.hasDelegations()).toBe(false);
    });

    it("should return true if there is some delegations", () => {
      subject.delegationEnabled = true;
      subject.delegationsIn = 1.0;

      expect(subject.hasDelegations()).toBe(false);
    });
  });

  describe("delegations", () => {
    it("should return an empty string if delegations are disabled", () => {
      expect(subject.delegations()).toBe("");
    });

    it("should return an empty string if there is no delegation", () => {
      subject.delegationEnabled = true;
      subject.delegationsIn = 0;
      subject.delegationsOut = 0;

      expect(subject.delegations()).toBe("");
    });

    it("should return the delegation string if there is some delegations", () => {
      subject.delegationEnabled = true;
      subject.delegationsIn = 1.0;
      subject.delegationsOut = 0.1;

      expect(subject.delegations()).toBe("(0.00 + 1.00 - 0.10)");
    });
  });

  describe("stakedBalance", () => {
    const subject = new HiveEngineToken({
      symbol: "POB",
      balance: "12.00000000",
      stake: "15.00000000",
      delegationsIn: "1.0023400",
      delegationsOut: "5.10000000",
      precision: 2,
      name: "",
      icon: "",
      stakingEnabled: true,
      delegationEnabled: false
    });

    it("computes the staked balance", () => {
      expect(subject.stakedBalance).toBe(10.90234);
    });

    it("formats the staked balance with the right precision", () => {
      subject.precision = 1;

      expect(subject.staked()).toBe("10.9");
    });

    it("doesn't format small balance to work around the numeric bug", () => {
      subject.stakedBalance = 0.00001;
      subject.delegationsIn = 0;
      subject.delegationsOut = 0;

      expect(subject.staked()).toBe("0.00001");
    });

    it("returns a '-' character if staking is not enabled", () => {
      subject.stakingEnabled = false;

      expect(subject.staked()).toBe("-");
    });
  });

  describe("balanced", () => {
    it("formats the balance with the right precision", () => {
      subject.balance = 12.00001;
      subject.precision = 1;

      expect(subject.balanced()).toBe("12.0");
    });
    it("doesn't format small balance to work around the numeric bug", () => {
      subject.balance = 0.00001;

      expect(subject.balanced()).toBe("0.00001");
    });
  });
});
