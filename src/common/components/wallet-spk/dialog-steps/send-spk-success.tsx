import { Tsx } from "../../../i18n/helper";
import { _t } from "../../../i18n";
import React from "react";
import { ActiveUser } from "../../../store/active-user/types";
import { Button } from "@ui/button";

interface Props {
  amount: string;
  activeUser: ActiveUser | null;
  asset: string;
  onFinish: () => void;
  to: string;
  mode: string;
  reset: () => void;
}

export const SendSpkSuccess = ({ amount, mode, activeUser, asset, onFinish, to, reset }: Props) => {
  return (
    <div className="transaction-form-body">
      <Tsx
        k={`transfer.${mode}-summary`}
        args={{ amount: `${amount} ${asset}`, from: activeUser!.username, to }}
      >
        <div className="success" />
      </Tsx>
      <div className="d-flex justify-content-center">
        <Button appearance="secondary" outline={true} onClick={reset}>
          {_t("transfer.reset")}
        </Button>
        <span className="hr-6px-btn-spacer" />
        <Button onClick={onFinish}>{_t("g.finish")}</Button>
      </div>
    </div>
  );
};
