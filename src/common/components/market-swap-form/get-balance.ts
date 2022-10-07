import { MarketAsset } from "./market-pair";
import { ActiveUser } from "../../store/active-user/types";
import { FullAccount } from "../../store/accounts/types";

export const getBalance = (asset: MarketAsset, activeUser: ActiveUser): string => {
  switch (asset) {
    case MarketAsset.HBD:
      return (activeUser.data as FullAccount).balance;
    case MarketAsset.HIVE:
      return (activeUser.data as FullAccount).hbd_balance;
  }
};
