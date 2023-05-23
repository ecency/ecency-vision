import React, { useEffect, useState } from "react";
import { usePopper } from "react-popper";
import {
  client,
  findRcAccounts,
  powerRechargeTime,
  rcPower,
  getRcOperationStats,
  RcOperation
} from "../../api/hive";
import { _t } from "../../i18n";
import moment, { Moment } from "moment";
import { rcFormatter } from "../../util/formatted-number";
import { PurchaseQrDialog } from "../purchase-qr";
import { ActiveUser } from "../../store/active-user/types";
import { Location } from "history";
import "./index.scss";
import { useMounted } from "../../util/use-mounted";
import { createPortal } from "react-dom";

interface Props {
  username: string;
  operation: RcOperation;
  activeUser: ActiveUser | null;
  location: Location;
  className?: string;
}

export const AvailableCredits = ({ username, className, activeUser, location }: Props) => {
  const [rcpFixed, setRcpFixed] = useState(0);
  const [rcp, setRcp] = useState(0);
  const [rcpRechargeDate, setRcpRechargeDate] = useState<Moment>(moment());
  const [delegated, setDelegated] = useState("0");
  const [receivedDelegation, setReceivedDelegation] = useState("0");
  const [commentAmount, setCommentAmount] = useState(0);
  const [voteAmount, setVoteAmount] = useState(0);
  const [transferAmount, setTransferAmount] = useState(0);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);

  const [host, setHost] = useState<any>();
  const [popperElement, setPopperElement] = useState<any>();
  const [isShow, setIsShow] = useState(false);

  const popper = usePopper(host, popperElement);

  const isMounted = useMounted();

  useEffect(() => {
    fetchRc();
  }, [username]);

  const fetchRc = async () => {
    try {
      const response = await findRcAccounts(username);
      const account = response[0];

      setRcp(client.rc.calculateRCMana(account).current_mana);
      setRcpFixed(Math.floor(+rcPower(account)));
      setRcpRechargeDate(moment().add(powerRechargeTime(rcPower(account)), "seconds"));

      const outGoing = response.map((a: any) => a.delegated_rc);
      const delegated = outGoing[0];
      const formatOutGoing: any = rcFormatter(delegated);
      setDelegated(formatOutGoing);

      const inComing: any = response.map((a: any) => Number(a.received_delegated_rc));
      const formatIncoming = rcFormatter(inComing);
      setReceivedDelegation(formatIncoming);

      const rcStats: any = await getRcOperationStats();
      const operationCosts = rcStats.rc_stats.ops;
      const commentCost = operationCosts.comment_operation.avg_cost;
      const transferCost = operationCosts.transfer_operation.avg_cost;
      const voteCost = operationCosts.vote_operation.avg_cost;

      const availableResourceCredit: any = response.map((a: any) => a.rc_manabar.current_mana);
      setCommentAmount(Math.ceil(Number(availableResourceCredit[0]) / commentCost));
      setVoteAmount(Math.ceil(Number(availableResourceCredit[0]) / voteCost));
      setTransferAmount(Math.ceil(Number(availableResourceCredit[0]) / transferCost));
    } catch (error) {
      console.log(error);
    }
  };

  const show = () => {
    setIsShow(true);
    popper.update?.();
  };

  const hide = () => {
    setIsShow(false);
    popper.update?.();
  };

  return isMounted ? (
    <>
      <div className="available-credits d-flex align-items-center justify-content-between w-100 pr-2">
        <div
          ref={setHost}
          className={
            "available-credits-bar w-100 " +
            className +
            (rcpFixed <= 10 ? " danger" : rcpFixed <= 25 ? " warning" : "")
          }
          onMouseOver={show}
          onMouseLeave={hide}
          onFocus={show}
          onBlur={hide}
        >
          <div className="progress">
            <div
              className={
                "indicator " + (rcpFixed <= 10 ? "danger" : rcpFixed <= 25 ? "warning" : "")
              }
              style={{ width: `${rcpFixed}%` }}
            />
          </div>
        </div>
        {commentAmount <= 5 ? (
          <div className="btn btn-link px-0" onClick={() => setShowPurchaseDialog(true)}>
            {_t("rc-info.boost")}
          </div>
        ) : (
          <></>
        )}
      </div>
      {createPortal(
        <div
          ref={setPopperElement}
          className={"available-credits-bar-popper " + (isShow ? "show" : "")}
          style={popper.styles.popper}
          {...popper.attributes.popper}
        >
          <div>
            <div className="p-2">
              <span className="opacity-75">{_t("rc-info.resource-credits")}</span>
              <div>
                {rcFormatter(rcp)}({rcpFixed}%)
              </div>
              <div>
                {rcpFixed !== 100 && (
                  <small>
                    {_t("profile-info.recharge-time", { n: rcpRechargeDate.fromNow() })}
                  </small>
                )}
              </div>
            </div>
            <div className="delegations d-flex flex-column p-2">
              <span className="incoming mb-1">
                <div className="opacity-75">{_t("rc-info.received-delegations")}</div>
                {receivedDelegation}
              </span>
              <span className="outgoing">
                <div className="opacity-75">{_t("rc-info.delegated")}</div>
                {delegated}
              </span>
            </div>
          </div>

          <div className="extra-details p-2">
            <span className="d-block mb-2 opacity-5">{_t("rc-info.extra-details-heading")}</span>
            <div className="extras">
              <div className="mb-1">
                <div className="opacity-75">{_t("rc-info.extra-details-post")}</div>
                {commentAmount}
              </div>
              <div className="two-col">
                <div className="mb-1">
                  <div className="opacity-75">{_t("rc-info.extra-details-upvote")}</div>
                  {voteAmount}
                </div>
                <div>
                  <div className="opacity-75">{_t("rc-info.extra-details-transfer")}</div>
                  {transferAmount}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.querySelector("#popper-container")!!
      )}
      <PurchaseQrDialog
        show={showPurchaseDialog}
        setShow={(v) => setShowPurchaseDialog(v)}
        activeUser={activeUser}
        location={location}
      />
    </>
  ) : (
    <></>
  );
};
