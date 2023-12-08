import React, { ReactNode, useEffect, useState } from "react";
import { useGlobalStore } from "@/core/global-store";
import { useDynamicPropsQuery } from "@/api/queries";
import { HiveWallet } from "@/utils";
import { Tooltip } from "@ui/tooltip";
import i18next from "i18next";
import Link from "next/link";
import { creditCardSvg } from "@ui/svg";

export const WalletBadge = ({ icon }: { icon: ReactNode }) => {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const { data: dynamicProps } = useDynamicPropsQuery();

  const [hasUnclaimedRewards, setHasUnclaimedRewards] = useState(false);

  useEffect(() => {
    if (activeUser?.data?.__loaded) {
      setHasUnclaimedRewards(new HiveWallet(activeUser.data, dynamicProps).hasUnclaimedRewards);
    }
  }, [activeUser, dynamicProps]);
  return (
    <>
      <Tooltip
        content={
          hasUnclaimedRewards
            ? i18next.t("user-nav.unclaimed-reward-notice")
            : i18next.t("user-nav.wallet")
        }
      >
        <Link href={`/@${activeUser?.username}/wallet`} className="user-wallet">
          {hasUnclaimedRewards && <span className="reward-badge" />}
          {icon ?? creditCardSvg}
        </Link>
      </Tooltip>
    </>
  );
};
