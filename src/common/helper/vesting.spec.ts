import { vestsToHp, spToVests, vestsToRshares } from "./vesting";

describe("Vesting", () => {
  it("(1) vestsToHp", () => {
    const vests = 350;
    const steemPerMVests = 495.05469644322403;

    expect(vestsToHp(vests, steemPerMVests)).toMatchSnapshot();
  });

  it("(2) spToVests", () => {
    const sp = 0.17326914375512842;
    const steemPerMVests = 495.05469644322403;

    expect(spToVests(sp, steemPerMVests)).toMatchSnapshot();
  });

  it("(3) vestsToRshares", () => {
    const vests = 173734.018323;
    const votingPower = 9800;
    const votePerc = 32 * 100;

    expect(vestsToRshares(vests, votingPower, votePerc)).toMatchSnapshot();
  });
});
