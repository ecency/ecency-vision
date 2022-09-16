import { getHivePrice, SpkApiWallet } from '../../../api/spk-api';

export const getEstimatedBalance = async (wallet: SpkApiWallet) => {
  const hivePrice = await getHivePrice();
  return (
    ((wallet.gov + wallet.poweredUp + wallet.claim + wallet.spk + wallet.balance) / 1000) *
    +wallet.tick *
    hivePrice.hive.usd
  ).toFixed(2);
}