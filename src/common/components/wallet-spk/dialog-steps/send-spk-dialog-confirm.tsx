import { _t } from "../../../i18n";
import { arrowRightSvg } from "../../../img/svg";
import React from "react";
import UserAvatar from "../../user-avatar";
import { ActiveUser } from "../../../store/active-user/types";
import { Global } from "../../../store/global/types";
import { Button } from "@ui/button";

interface Props {
  global: Global;
  title: string;
  activeUser: ActiveUser | null;
  showTo: boolean;
  to: string;
  memo: string;
  amount: string;
  asset: string;
  back: Function;
  confirm: Function;
}

export const SendSpkDialogConfirm = ({
  global,
  title,
  activeUser,
  showTo,
  to,
  memo,
  amount,
  asset,
  back,
  confirm
}: Props) => {
  return (
    <>
      <div className="confirmation">
        <div className="confirm-title">{_t(`transfer.${title}`)}</div>
        <div className="users">
          <div className="from-user flex justify-center items-center">
            <UserAvatar username={activeUser!!.username} size="large" />
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
        {memo && <div className="memo">{memo}</div>}
      </div>
      <div className="flex justify-center">
        <Button appearance="secondary" outline={true} onClick={() => back()}>
          {_t("g.back")}
        </Button>
        <span className="hr-6px-btn-spacer" />
        <Button onClick={() => confirm()}>{_t("transfer.confirm")}</Button>
      </div>
    </>
  );
};
