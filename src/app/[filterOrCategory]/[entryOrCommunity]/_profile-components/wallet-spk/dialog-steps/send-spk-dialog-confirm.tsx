import { Button } from "@ui/button";
import i18next from "i18next";
import { UserAvatar } from "@/features/shared";
import { arrowRightSvg } from "@ui/svg";
import { useGlobalStore } from "@/core/global-store";

interface Props {
  title: string;
  showTo: boolean;
  to: string;
  memo: string;
  amount: string;
  asset: string;
  back: Function;
  confirm: Function;
}

export const SendSpkDialogConfirm = ({
  title,
  showTo,
  to,
  memo,
  amount,
  asset,
  back,
  confirm
}: Props) => {
  const activeUser = useGlobalStore((s) => s.activeUser);

  return (
    <>
      <div className="confirmation">
        <div className="confirm-title">{i18next.t(`transfer.${title}`)}</div>
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
          {i18next.t("g.back")}
        </Button>
        <span className="hr-6px-btn-spacer" />
        <Button onClick={() => confirm()}>{i18next.t("transfer.confirm")}</Button>
      </div>
    </>
  );
};
