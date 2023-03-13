import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { _t } from "../../i18n";
import { findRcAccounts } from "../../api/hive";
import { ResourceCreditsDelegation } from "../rc-delegation";
import { RcDelegationsList } from "../rc-delegations-list";
import { rcFormatter } from "../../util/formatted-number";
import { ConfirmDelete } from "../rc-delegations-list";
import { getRcOperationStats } from "../../api/hive";
import RcProgressCircle from "../rc-progress-circle";
import "./_index.scss";

export const ResourceCreditsInfo = (props: any) => {
  const { rcPercent, account, activeUser } = props;

  const radius = 70;
  const dasharray = 440;
  const unUsedOffset = (rcPercent / 100) * dasharray;
  const usedOffset = ((100 - rcPercent) / 100) * dasharray;

  const [showRcInfo, setShowRcInfo] = useState(false);
  const [delegated, setDelegated] = useState();
  const [receivedDelegation, setReceivedDelegation] = useState();
  const [resourceCredit, setresourceCredit] = useState<any>();
  const [showDelegationModal, setShowDelegationModal] = useState(false);
  const [showDelegationsList, setShowDelegationsList] = useState(false);
  const [listMode, setListMode] = useState("");
  const [toFromList, setToFromList] = useState("");
  const [amountFromList, setAmountFromList]: any = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [delegateeData, setDelegateeData] = useState("");
  const [commentAmount, setCommentAmount] = useState(null);
  const [voteAmount, setVoteAmount] = useState(null);
  const [transferAmount, setTransferAmount] = useState(null);
  const [customJsonAmount, setCustomJsonAmount] = useState(null);

  useEffect(() => {
    findRcAccounts(account.name)
      .then((r) => {
        const outGoing = r.map((a: any) => a.delegated_rc);
        const delegated = outGoing[0];
        const formatOutGoing: any = rcFormatter(delegated);
        setDelegated(formatOutGoing);
        const availableResourceCredit: any = r.map((a: any) => a.rc_manabar.current_mana);
        setresourceCredit(availableResourceCredit);
        const inComing: any = r.map((a: any) => Number(a.received_delegated_rc));
        const formatIncoming = rcFormatter(inComing);
        setReceivedDelegation(formatIncoming);

        const rcOperationsCost = async () => {
          const rcStats: any = await getRcOperationStats();
          const operationCosts = rcStats.rc_stats.ops;
          const commentCost = operationCosts.comment_operation.avg_cost;
          const transferCost = operationCosts.transfer_operation.avg_cost;
          const voteCost = operationCosts.vote_operation.avg_cost;
          const customJsonOperationsCosts = operationCosts.custom_json_operation.avg_cost;

          const commentCount: any = Math.ceil(Number(availableResourceCredit[0]) / commentCost);
          const votetCount: any = Math.ceil(Number(availableResourceCredit[0]) / voteCost);
          const transferCount: any = Math.ceil(Number(availableResourceCredit[0]) / transferCost);
          const customJsonCount: any = Math.ceil(
            Number(availableResourceCredit[0]) / customJsonOperationsCosts
          );
          setCommentAmount(commentCount);
          setVoteAmount(votetCount);
          setTransferAmount(transferCount);
          setCustomJsonAmount(customJsonCount);
        };
        rcOperationsCost();
      })
      .catch(console.log);
  }, []);

  const showModal = () => {
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

  return (
    <div>
      <div className="cursor-pointer d-flex flex-column mb-1" onClick={showModal}>
        <div className="progress">
          <div
            className="progress-bar progress-bar-success"
            role="progressbar"
            style={{ width: `${rcPercent}%` }}
          >
            {_t("rc-info.available")}
          </div>
          <div
            className="progress-bar used"
            role="progressbar"
            style={{ width: `${100 - rcPercent}%` }}
          >
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
        keyboard={false}
        className="purchase-qr-dialog"
        dialogClassName="modal-90w"
      >
        <Modal.Header closeButton={true}>
          <Modal.Title>
            <div className="rc-header">
              <span>{_t("rc-info.resource-credits")}</span>
              <div className="about-rc">
                <span>{`${_t("rc-info.check-faq")} `}</span>
                <a href={_t("rc-info.learn-more")}>{_t("rc-info.faq-link")}</a>
              </div>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="rc-infocontainer">
            <div className="percent">
              <div className="circle">
                <div className="outer-circle progress">
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
                    {`${_t("rc-info.rc-used")}: ${rcFormatter(
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

              <div className="line-break">
                <hr />
              </div>

              <div className="extra-details">
                <p>{_t("rc-info.extra-details-heading")}</p>
                <div className="extras">
                  <ul>
                    <li>{`${_t("rc-info.comments-posts")} ${commentAmount}`}</li>
                    <li>{`${_t("rc-info.votes")} ${voteAmount}`}</li>
                    <li>{`${_t("rc-info.transfers")} ${transferAmount}`}</li>
                    <li>{`${_t("rc-info.reblogs-follows")} ${customJsonAmount}`}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-center mt-3">
            {activeUser && (
              <Button onClick={showDelegation}>{_t("rc-info.delegation-button")}</Button>
            )}
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        onHide={hideList}
        show={showDelegationsList}
        centered={true}
        animation={false}
        size="lg"
      >
        <Modal.Header closeButton={true}>
          <Modal.Title>
            {listMode === "in" ? _t("rc-info.incoming") : _t("rc-info.outgoing")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
        </Modal.Body>
      </Modal>

      <div>
        <Modal
          animation={false}
          show={showDelegationModal}
          centered={true}
          onHide={hideDelegation}
          keyboard={false}
          className="transfer-dialog modal-thin-header"
          size="lg"
        >
          <Modal.Header closeButton={true}>
            <Modal.Title />
          </Modal.Header>
          <Modal.Body>
            <ResourceCreditsDelegation
              {...props}
              activeUser={activeUser}
              resourceCredit={resourceCredit}
              hideDelegation={hideDelegation}
              toFromList={toFromList}
              amountFromList={amountFromList}
              delegateeData={delegateeData}
            />
          </Modal.Body>
        </Modal>

        <Modal
          animation={false}
          show={showConfirmDelete}
          centered={true}
          onHide={hideConfirmDelete}
          keyboard={false}
          className="transfer-dialog modal-thin-header"
          // size="lg"
        >
          <Modal.Header closeButton={true}>
            <Modal.Title />
          </Modal.Header>
          <Modal.Body>
            <ConfirmDelete
              activeUser={activeUser}
              to={toFromList}
              hideConfirmDelete={hideConfirmDelete}
            />
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};
