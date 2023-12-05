export function vestsToHp(vests: number, hivePerMVests: number): number {
  return (vests / 1e6) * hivePerMVests;
}

export function hpToVests(sp: number, hivePerMVests: number) {
  return (sp * 1e6) / hivePerMVests;
}

export function vestsToRshares(vests: number, votingPower: number, votePerc: number): number {
  const vestingShares = vests * 1e6;
  const power = (votingPower * votePerc) / 1e4 / 50 + 1;
  return (power * vestingShares) / 1e4;
}
