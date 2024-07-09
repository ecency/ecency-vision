import React, { useEffect } from "react";
import { MarketAsset } from "@/api/market-pair";
import { useGlobalStore } from "@/core/global-store";
import { FullAccount } from "@/entities";

interface Props {
  fromAsset: MarketAsset;
  setBuyBalance: (value: string) => void;
  setSellBalance: (value: string) => void;
}

export const UserBalanceObserver = ({ fromAsset, setBuyBalance, setSellBalance }: Props) => {
  const activeUser = useGlobalStore((s) => s.activeUser);

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
