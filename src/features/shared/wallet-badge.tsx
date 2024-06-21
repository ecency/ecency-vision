import { HiveWallet } from "@/utils";
import React, { ReactNode, useEffect, useState } from "react";
import { Tooltip } from "@ui/tooltip";
import Link from "next/link";
import { creditCardSvg } from "@ui/svg";
import i18next from "i18next";
import { useGlobalStore } from "@/core/global-store";
import { getDynamicPropsQuery } from "@/api/queries";

export const WalletBadge = ({ icon }: { icon: ReactNode }) => {
  const activeUser = useGlobalStore((s) => s.activeUser);

  const [hasUnclaimedRewards, setHasUnclaimedRewards] = useState(false);

  const { data: dynamicProps } = getDynamicPropsQuery().useClientQuery();

  useEffect(() => {
    if (activeUser?.data?.__loaded) {
      setHasUnclaimedRewards(new HiveWallet(activeUser.data, dynamicProps!).hasUnclaimedRewards);
    }
  }, [activeUser]);
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
