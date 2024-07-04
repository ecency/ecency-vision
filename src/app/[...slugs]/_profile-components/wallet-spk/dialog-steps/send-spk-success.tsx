import React from "react";
import { Button } from "@ui/button";
import { Tsx } from "@/features/i18n/helper";
import i18next from "i18next";
import { useGlobalStore } from "@/core/global-store";

interface Props {
  amount: string;
  asset: string;
  onFinish: () => void;
  to: string;
  mode: string;
  reset: () => void;
}

export const SendSpkSuccess = ({ amount, mode, asset, onFinish, to, reset }: Props) => {
  const activeUser = useGlobalStore((s) => s.activeUser);

  return (
    <div className="transaction-form-body">
      <Tsx
        k={`transfer.${mode}-summary`}
        args={{ amount: `${amount} ${asset}`, from: activeUser!.username, to }}
      >
        <div className="success" />
      </Tsx>
      <div className="flex justify-center">
        <Button appearance="secondary" outline={true} onClick={reset}>
          {i18next.t("transfer.reset")}
        </Button>
        <span className="hr-6px-btn-spacer" />
        <Button onClick={onFinish}>{i18next.t("g.finish")}</Button>
      </div>
    </div>
  );
};
