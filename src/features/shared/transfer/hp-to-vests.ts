import { formatNumber, hpToVests as hpToV } from "@/utils";

export const hpToVests = (hp: number, hivePerMVests: number): string => {
  const vests = hpToV(hp, hivePerMVests);

  return `${formatNumber(vests, 6)} VESTS`;
};
