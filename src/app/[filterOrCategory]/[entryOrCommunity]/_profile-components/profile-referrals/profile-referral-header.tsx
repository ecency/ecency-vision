import { Button } from "@ui/button";
import React, { useCallback, useMemo } from "react";
import i18next from "i18next";
import { shareVariantSvg } from "@ui/svg";
import { Tsx } from "@/features/i18n/helper";
import { success } from "@/features/shared";
import { Account } from "@/entities";
import { getReferralsStatsQuery } from "@/api/queries";

interface Props {
  account: Account;
}

export function ProfileReferralHeader({ account }: Props) {
  const { data: stats } = getReferralsStatsQuery(account.name).useClientQuery();

  const { earnedPoints, unearnedPoints } = useMemo(() => {
    const earnedPoints = (stats?.rewarded ?? 0) * 100;
    const unearnedPoints = ((stats?.total ?? 0) - (stats?.rewarded ?? 0)) * 100;
    return {
      earnedPoints,
      unearnedPoints
    };
  }, [stats?.rewarded, stats?.total]);

  const copyToClipboard = useCallback((text: string) => {
    const textField = document.createElement("textarea");
    textField.innerText = text;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand("copy");
    textField.remove();
    success(i18next.t("profile-edit.copied"));
  }, []);

  return (
    <div className="page-header mt-2 mb-2">
      <div className="header-title !text-left">{i18next.t("referral.page-title")}</div>

      <div className="flex mt-2">
        <div>
          <h5 className="header-title !text-left">{earnedPoints}</h5>
          <h6 className=" text-left">{i18next.t("referral.earned-reward")}</h6>
        </div>
        <div>
          <h5 className="header-title !text-left ml-3">{unearnedPoints}</h5>
          <h6 className=" text-left ml-3">{i18next.t("referral.pending-reward")}</h6>
        </div>
        <div className="ml-5">
          <Button
            icon={shareVariantSvg}
            onClick={() => copyToClipboard(`https://ecency.com/signup?referral=${account.name}`)}
          >
            {i18next.t("entry.address-copy")}
          </Button>
        </div>
      </div>
      <Tsx k="referral.page-description-long">
        <div className="header-description !text-left" />
      </Tsx>
    </div>
  );
}
