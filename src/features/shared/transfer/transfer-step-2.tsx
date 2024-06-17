import { TransferFormHeader } from "@/features/shared/transfer/transfer-form-header";
import i18next from "i18next";
import { UserAvatar } from "@/features/shared";
import { arrowRightSvg } from "@ui/svg";
import { Button } from "@ui/button";
import React, { useMemo } from "react";
import { useTransferSharedState } from "./transfer-shared-state";
import { useGlobalStore } from "@/core/global-store";
import { hpToVests } from "@/features/shared/transfer/hp-to-vests";
import { getDynamicPropsQuery } from "@/api/queries";

interface Props {
  titleLngKey: string;
}

export function TransferStep2({ titleLngKey }: Props) {
  const activeUser = useGlobalStore((s) => s.activeUser);

  const { data: dynamicProps } = getDynamicPropsQuery().useClientQuery();
  const { step, amount, asset, memo, to, setStep, inProgress, mode } = useTransferSharedState();

  const showTo = useMemo(
    () => ["transfer", "transfer-saving", "withdraw-saving", "power-up", "delegate"].includes(mode),
    [mode]
  );

  return (
    <div className="transaction-form">
      <TransferFormHeader title="confirm-title" step={step} subtitle="confirm-sub-title" />
      <div className="transaction-form-body">
        <div className="confirmation">
          <div className="confirm-title">{i18next.t(`transfer.${titleLngKey}`)}</div>
          <div className="users">
            <div className="from-user">
              <UserAvatar username={activeUser!.username} size="large" />
            </div>
            {showTo && (
              <>
                <div className="arrow">{arrowRightSvg}</div>
                <div className="to-user">
                  <UserAvatar username={to} size="large" />
                </div>
              </>
            )}
          </div>
          <div className="amount">
            {amount} {asset}
          </div>
          {asset === "HP" && (
            <div className="amount-vests">
              {hpToVests(Number(amount), dynamicProps!.hivePerMVests)}
            </div>
          )}
          {memo && <div className="memo">{memo}</div>}
        </div>
        <div className="flex justify-center">
          <Button
            appearance="secondary"
            outline={true}
            disabled={inProgress}
            onClick={() => setStep(1)}
          >
            {i18next.t("g.back")}
          </Button>
          <span className="hr-6px-btn-spacer" />
          <Button disabled={inProgress} onClick={() => setStep(3)}>
            {i18next.t("transfer.confirm")}
          </Button>
        </div>
      </div>
    </div>
  );
}
