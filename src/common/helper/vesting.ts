export const vestsToHp = (vests: number, hivePerMVests: number): number => (vests / 1e6) * hivePerMVests;

export const hpToVests = (sp: number, hivePerMVests: number) => (sp * 1e6) / hivePerMVests;

export const vestsToRshares = (vests: number, votingPower: number, votePerc: number): number => {
  const vestingShares = vests * 1e6;
  const power = (votingPower * votePerc) / 1e4 / 50 + 1;
  return (power * vestingShares) / 1e4;
};
