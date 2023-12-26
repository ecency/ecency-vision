import React, { useState } from "react";
import { _t } from "../../i18n";
import { findRcAccounts, getRcOperationStats } from "../../api/hive";
import { ResourceCreditsDelegation } from "./delegation";
import { ConfirmDelete, RcDelegationsList } from "./list";
import { rcFormatter } from "../../util/formatted-number";
import RcProgressCircle from "./circle";
import "./_index.scss";
// import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
// import { Button } from "@ui/button";
import { Button, Modal, ModalBody, ModalTitle } from "react-bootstrap";
import ClaimAccountCredit from "./claim-credit";
// import { List, ListItem } from "@ui/list";
// import ClaimAccountCredit from "./claim-credit";

export const ResourceCreditsInfo = (props: any) => {
  const { rcPercent, account, activeUser } = props;

  const radius = 70;
  const dasharray = 440;
  const unUsedOffset = (rcPercent / 100) * dasharray;
  const usedOffset = ((100 - rcPercent) / 100) * dasharray;

  const [showRcInfo, setShowRcInfo] = useState(false);
  const [delegated, setDelegated] = useState();
  const [receivedDelegation, setReceivedDelegation] = useState();
  const [resourceCredit, setResourceCredit] = useState<any>();
  const [showDelegationModal, setShowDelegationModal] = useState(false);
  const [showDelegationsList, setShowDelegationsList] = useState(false);
  const [listMode, setListMode] = useState("");
  const [toFromList, setToFromList] = useState("");
  const [amountFromList, setAmountFromList]: any = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [delegateeData, setDelegateeData] = useState("");
  const [commentAmount, setCommentAmount] = useState(0);
  const [voteAmount, setVoteAmount] = useState(0);
  const [transferAmount, setTransferAmount] = useState(0);
  const [customJsonAmount, setCustomJsonAmount] = useState(0);
  const [claimAccountAmount, setClaimAccountAmount] = useState(0);

  const showModal = () => {
    fetchRCData();
    setShowRcInfo(true);
  };

  const hideModal = () => {
    setShowRcInfo(false);
  };

  const showDelegation = () => {
    setShowDelegationModal(true);
    setShowRcInfo(false);
  };

  const hideDelegation = () => {
    setShowDelegationModal(false);
    setToFromList("");
    setAmountFromList("");
  };

  const showIncomingList = () => {
    setShowDelegationsList(true);
    setListMode("in");
  };

  const showOutGoingList = () => {
    setShowDelegationsList(true);
    setListMode("out");
  };

  const hideList = () => {
    setShowDelegationsList(false);
  };

  const confirmDelete = () => {
    setShowConfirmDelete(true);
    setShowDelegationsList(false);
  };

  const hideConfirmDelete = () => {
    setShowConfirmDelete(false);
  };

  const fetchRCData = () => {
    findRcAccounts(account?.name)
      .then((r) => {
        const outGoing = r.map((a: any) => a.delegated_rc);
        const delegated = outGoing[0];
        const formatOutGoing: any = rcFormatter(delegated);
        setDelegated(formatOutGoing);
        const availableResourceCredit: any = r.map((a: any) => Number(a.rc_manabar.current_mana));
        const inComing: any = r.map((a: any) => Number(a.received_delegated_rc));
        const formatIncoming = rcFormatter(inComing);
        const totalRc = Number(availableResourceCredit) + Number(inComing);
        setReceivedDelegation(formatIncoming);
        setResourceCredit(totalRc);

        const rcOperationsCost = async () => {
          const rcStats: any = await getRcOperationStats();
          const operationCosts = rcStats.rc_stats.ops;
          const commentCost = operationCosts.comment_operation.avg_cost;
          const transferCost = operationCosts.transfer_operation.avg_cost;
          const voteCost = operationCosts.vote_operation.avg_cost;
          const customJsonOperationsCosts = operationCosts.custom_json_operation.avg_cost;
          const createClaimAccountCost = Number(operationCosts.claim_account_operation.avg_cost);

          const commentCount: number = Math.ceil(Number(availableResourceCredit) / commentCost);
          const votetCount: number = Math.ceil(Number(availableResourceCredit) / voteCost);
          const transferCount: number = Math.ceil(Number(availableResourceCredit) / transferCost);
          const customJsonCount: number = Math.ceil(
            Number(availableResourceCredit) / customJsonOperationsCosts
          );
          const createClaimAccountCount: number = Math.floor(
            Number(availableResourceCredit) / createClaimAccountCost
          );
          setCommentAmount(commentCount);
          setVoteAmount(votetCount);
          setTransferAmount(transferCount);
          setCustomJsonAmount(customJsonCount);
          setClaimAccountAmount(createClaimAccountCount);
        };
        rcOperationsCost();
      })
      .catch(console.log);
  };

  return (
    <div>
      <div className="cursor-pointer d-flex flex-column" onClick={showModal}>
        <div className="bg-y-200 d-flex flex-row h-[1rem] text-white rounded-lg flex overflow-hidden">
          <div
            className="cursor-pointer d-flex bg-success justify-content-center overflow-hidden text-xs bg-blue-dark-sky"
            role="progressbar"
            style={{ width: `${rcPercent}%` }}
          >
            {_t("rc-info.available")}
          </div>
          <div
            className="cursor-pointer d-flex bg-danger justify-center-center overflow-hidden text-xs bg-[#F0706A]"
            role="progressbar"
            style={{ width: `${100 - rcPercent}%` }}
          >
            {/* Utilized */}
            {_t("rc-info.used")}
          </div>
        </div>
        <div className="rc-percentage mt-2 align-self-center">
          <span className="cursor-pointer">{_t("rc-info.resource-credits")}</span>
        </div>
      </div>

      <Modal
        size="lg"
        animation={false}
        show={showRcInfo}
        centered={true}
        onHide={hideModal}
        className="purchase-qr-dialog"
        dialogClassName="modal-90w"
      >
        <Modal.Header closeButton={true}>
          <ModalTitle>
            <div className="rc-header">
              <span>{_t("rc-info.resource-credits")}</span>
              {/* <div className="about-rc">
                <span>{`${_t("rc-info.check-faq")} `}</span>
                <a href={_t("rc-info.learn-more")}>{_t("rc-info.faq-link")}</a>
              </div> */}
            </div>
          </ModalTitle>
        </Modal.Header>
        <ModalBody>
          <div className="rc-infocontainer">
            <div className="percent">
              <div className="circle">
                <div className="outer-circle">
                  <div className="inner-circle">
                    <span>{`${rcPercent}%`}</span>
                  </div>
                </div>
                <RcProgressCircle
                  radius={radius}
                  usedOffset={usedOffset}
                  dasharray={dasharray}
                  unUsedOffset={unUsedOffset}
                />
              </div>

              <div className="percentage-info">
                <div className="unused">
                  <div className="unused-box" />
                  <span>{`${_t("rc-info.rc-available")}: ${rcFormatter(
                    (rcPercent / 100) * resourceCredit
                  )}`}</span>
                </div>
                <div className="used">
                  <div className="used-box" />
                  <span>
                    {`Utilized: ${rcFormatter(
                      ((100 - rcPercent) / 100) * resourceCredit
                    )}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="rc-details">
              <div className="delegations">
                <span className="outgoing" onClick={showOutGoingList}>
                  {`${_t("rc-info.delegated")}: ${delegated}`}
                </span>
                <span className="incoming" onClick={showIncomingList}>
                  {`${_t("rc-info.received-delegations")}: ${receivedDelegation}`}
                </span>
              </div>

              <div className="line-break my-5">
                <hr />
              </div>

              <div className="extra-details d-flex flex-column">
                <p>{_t("rc-info.extra-details-heading")}</p>
                <div className="rc-info-extras mt-2 d-flex flex-column">
                  <span>
                    {_t("rc-info.comments-posts")}
                    <span>{commentAmount}</span>
                  </span>
                  <span>
                    {_t("rc-info.votes")}
                    <span>{voteAmount}</span>
                  </span>
                  <span>
                    {_t("rc-info.transfers")}
                    <span>{transferAmount}</span>
                  </span>
                  <span>
                    {_t("rc-info.reblogs-follows")}
                    <span>{customJsonAmount}</span>
                  </span>
                  <span>
                    <ClaimAccountCredit claimAccountAmount={claimAccountAmount} account={account} />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-center w-100 mt-3">
            {activeUser && (
              <Button className="w-50" onClick={showDelegation}>{_t("rc-info.delegation-button")}</Button>
             )}
          </div>
        </ModalBody>
      </Modal>

      <Modal
        onHide={hideList}
        show={showDelegationsList}
        centered={true}
        animation={false}
        size="lg"
      >
        <Modal.Header closeButton={true}>
          <ModalTitle>
            {listMode === "in" ? _t("rc-info.incoming") : _t("rc-info.outgoing")}
          </ModalTitle>
        </Modal.Header>
        <ModalBody>
          <RcDelegationsList
            {...props}
            activeUser={activeUser}
            rcFormatter={rcFormatter}
            delegated={delegated}
            showDelegation={showDelegation}
            hideList={hideList}
            listMode={listMode}
            setToFromList={setToFromList}
            setAmountFromList={setAmountFromList}
            confirmDelete={confirmDelete}
            setDelegateeData={setDelegateeData}
            setShowDelegationsList={setShowDelegationsList}
          />
        </ModalBody>
      </Modal>

      <div>
        <Modal
          animation={false}
          show={showDelegationModal}
          centered={true}
          onHide={hideDelegation}
          className="transfer-dialog"
          size="lg"
        >
          <Modal.Header closeButton={true}>
            <ModalTitle />
          </Modal.Header>
          <ModalBody>
            <ResourceCreditsDelegation
              {...props}
              activeUser={activeUser}
              resourceCredit={resourceCredit}
              hideDelegation={hideDelegation}
              toFromList={toFromList}
              amountFromList={amountFromList}
              delegateeData={delegateeData}
            />
          </ModalBody>
        </Modal>

        <Modal
          animation={false}
          show={showConfirmDelete}
          centered={true}
          onHide={hideConfirmDelete}
          className="transfer-dialog"
          // size="lg"
        >
          <Modal.Header closeButton={true}>
            <ModalTitle />
          </Modal.Header>
          <ModalBody>
            <ConfirmDelete
              activeUser={activeUser}
              to={toFromList}
              hideConfirmDelete={hideConfirmDelete}
            />
          </ModalBody>
        </Modal>
      </div>
    </div>
  );
};
