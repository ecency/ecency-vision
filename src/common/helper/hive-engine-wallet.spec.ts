import { HiveEngineTokenBalance } from "./hive-engine-wallet";

describe("HiveEngineTokenBalance", () => {
  const subject: HiveEngineTokenBalance = new HiveEngineTokenBalance(
    {
      symbol: "POB",
      balance: "0.00000000",
      stake: "0.00000000",
      pendingUnstake: "0.00000000",
      delegationsIn: "0.00000000",
      delegationsOut: "0.00000000",
      pendingUndelegations: "0.00000000",
    },
    {
      issuer: "",
      symbol: "POB",
      name: "Proof of Brain",
      metadata: "",
      precision: 2,
      maxSupply: "0",
      supply: "0",
      circulatingSupply: "0",
      stakingEnabled: true,
      unstakingCooldown: 0,
      delegationEnabled: true,
      undelegationCooldown: 0,
      numberTransactions: 0,
      totalStaked: "0",
    },
    {
      desc: "",
      url: "",
      icon: "",
    }
  );

  describe("hasDelegations", () => {
    it("should return false if the token has no delegation enabled", () => {
      subject.delegationEnabled = false;

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
      subject.delegationEnabled = false;

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
});
