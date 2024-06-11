import { TransferFormHeader } from "@/features/shared/transfer/transfer-form-header";
import { Tsx } from "@/features/i18n/helper";
import { Button } from "@ui/button";
import i18next from "i18next";
import React, { useMemo } from "react";
import { useTransferSharedState } from "./transfer-shared-state";
import { useGlobalStore } from "@/core/global-store";
import { QueryIdentifiers } from "@/core/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { Account } from "@/entities";

interface Props {
  account?: Account;
  onFinish: () => void;
}

export function TransferStep4({ onFinish, account }: Props) {
  const queryClient = useQueryClient();
  const activeUser = useGlobalStore((s) => s.activeUser);

  const { mode, amount, asset, step, to, reset } = useTransferSharedState();

  const summaryLngKey = useMemo(() => `${mode}-summary`, [mode]);

  const finish = () => {
    if (account && activeUser && account.name !== activeUser.username) {
      if (mode === "transfer" && asset === "POINT") {
        queryClient.invalidateQueries({
          queryKey: [QueryIdentifiers.POINTS, account.name]
        }); // todo: find filter
      } else {
        queryClient.invalidateQueries({
          queryKey: [QueryIdentifiers.GET_ACCOUNT_FULL, account.name]
        });
      }
    }

    onFinish();
  };

  return (
    <div className="transaction-form">
      <TransferFormHeader title="success-title" step={step} subtitle="success-sub-title" />
      <div className="transaction-form-body">
        <Tsx
          k={`transfer.${summaryLngKey}`}
          args={{ amount: `${amount} ${asset}`, from: activeUser!.username, to }}
        >
          <div className="success" />
        </Tsx>
        <div className="flex justify-center">
          <Button appearance="secondary" outline={true} onClick={reset}>
            {i18next.t("transfer.reset")}
          </Button>
          <span className="hr-6px-btn-spacer" />
          <Button onClick={finish}>{i18next.t("g.finish")}</Button>
        </div>
      </div>
    </div>
  );
}
