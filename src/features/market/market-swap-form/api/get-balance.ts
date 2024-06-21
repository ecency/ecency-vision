import { MarketAsset } from "../market-pair";
import { ActiveUser, FullAccount } from "@/entities";

export const getBalance = (asset: MarketAsset, activeUser: ActiveUser): string => {
  switch (asset) {
    case MarketAsset.HBD:
      return (activeUser.data as FullAccount).hbd_balance;
    case MarketAsset.HIVE:
      return (activeUser.data as FullAccount).balance;
  }
};
