import { getHivePrice } from "@/api/spk-api";
import { SpkApiWallet } from "@/entities";

export const getEstimatedBalance = async (wallet: SpkApiWallet) => {
  const hivePrice = await getHivePrice();
  return (
    ((wallet.gov + wallet.poweredUp + wallet.claim + wallet.spk + wallet.balance) / 1000) *
    +wallet.tick *
    hivePrice.hive.usd
  ).toFixed(2);
};
