import React, { useEffect } from "react";
import { ActiveUser } from "../../../store/active-user/types";
import { MarketAsset } from "../../../components/market-swap-form/market-pair";
import { FullAccount } from "../../../store/accounts/types";

interface Props {
  activeUser: ActiveUser | null;
  fromAsset: MarketAsset;
  setBuyBalance: (value: string) => void;
  setSellBalance: (value: string) => void;
}

export const UserBalanceObserver = ({
  activeUser,
  fromAsset,
  setBuyBalance,
  setSellBalance
}: Props) => {
  useEffect(() => {
    if (activeUser) {
      switch (fromAsset) {
        case MarketAsset.HBD:
        case MarketAsset.HIVE:
          setSellBalance((activeUser.data as FullAccount).balance);
          setBuyBalance((activeUser.data as FullAccount).hbd_balance);
          break;
      }
    }
  }, [activeUser, fromAsset]);

  return <></>;
};
