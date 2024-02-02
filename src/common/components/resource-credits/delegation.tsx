import React, { useCallback, useEffect, useState } from "react";
import _ from "lodash";
import badActors from "@hiveio/hivescript/bad-actors.json";
import LinearProgress from "../linear-progress";
import UserAvatar from "../user-avatar";
import { error } from "../feedback";
import "./delegation.scss";
import { delegateRC, formatError } from "../../api/operations";
import { getAccount } from "../../api/hive";
import { arrowRightSvg } from "../../img/svg";
import { _t } from "../../i18n";
import { Button, Form, FormControl, InputGroup } from "react-bootstrap";
import { getRcOperationStats } from "../../api/hive";

export const ResourceCreditsDelegation = (props: any) => {
  const { resourceCredit, activeUser, hideDelegation, toFromList, amountFromList, delegateeData } =
    props;

  const [to, setTo] = useState<string>(toFromList || "");
  const [amount, setAmount] = useState<any>(amountFromList || "");
  const [inProgress, setInProgress] = useState<boolean>(false);
  const [step, setStep] = useState<any>(1);
  const [amountError, setAmountError] = useState<string>("");
  const [toError, setToError] = useState<string>("");
  const [toWarning, setToWarning] = useState<string>("");
  const [toData, setToData] = useState<any>(delegateeData || "");
  const [convertedValue, setConvertedValue] = useState<any>(null);
  const [commentAmount, setCommentAmount] = useState(0);
  const [voteAmount, setVoteAmount] = useState(0);
  const [transferAmount, setTransferAmount] = useState(0);
  const [customJsonAmount, setCustomJsonAmount] = useState(0);
  const [claimAccountAmount, setClaimAccountAmount] = useState(0);

  const pointValues = [0, 25, 50, 75, 100];

  const [fillWidth, setFillWidth] = useState(0);

  const [convertedVal, setConvertedVal] = useState<any>(null);

  useEffect(() => {
    rcOperationsCost()
  }, [amount])

  const convertToBillions = (input: string) => {
    const inputNumber = parseFloat(input);
    let  resultDivided;

    if (!isNaN(inputNumber)) {
       resultDivided = inputNumber / 1e9;
      console.log("resultDivided", resultDivided!.toFixed(2) + "B")
    } else {
      setConvertedValue("null");
    }
    return resultDivided!?.toFixed(2) + "B";
  };

  const toChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setInProgress(true);
    setTo(value);
    delayedSearch(value);
  };

  const amountChanged = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    console.log(Number(value))

    const sonvertedAmount = (parseFloat(value) * 1e9).toFixed(2)
    setConvertedVal(sonvertedAmount)
    
    setAmount(Number(value));
    updateOnAmount(Number(value))
    console.log(amount)
    if (
      sonvertedAmount === "" ||
      (Number(sonvertedAmount) >= 5000000000 && Number(sonvertedAmount) < Number(resourceCredit)) ||
      sonvertedAmount === "0"
    ) {
      setAmountError("");
    } else if (Number(sonvertedAmount) < 5000000000) {
      setAmountError(_t("rc-info.minimum-rc-error"));
    } else if (Number(sonvertedAmount) > Number(resourceCredit)) {
      setAmountError(_t("rc-info.insufficient-rc-error"));
      return;
    }
  };

  const next = () => {
    setInProgress(false);
    setStep(2);
  };

  const back = () => {
    setStep(1);
  };

  const signTransaction = () => {
    const { activeUser } = props;
    console.log(activeUser)
    const username = activeUser?.username!;
    const max_rc = `${parseFloat(amount) * 1e9}` ;
    delegateRC(username, to, max_rc)
      .then((res: any) => {
        return res;
      })
      .catch((e: any) => {
        console.log({ e });
        return e;
      });
    hideDelegation();
    return;
  };

  const rcOperationsCost = async () => {
    const rcStats: any = await getRcOperationStats();
    const operationCosts = rcStats.rc_stats.ops;
    const commentCost = operationCosts.comment_operation.avg_cost;
    const transferCost = operationCosts.transfer_operation.avg_cost;
    const voteCost = operationCosts.vote_operation.avg_cost;
    const customJsonOperationsCosts = operationCosts.custom_json_operation.avg_cost;
    const createClaimAccountCost = Number(operationCosts.claim_account_operation.avg_cost);

    const commentCount: number = Math.ceil(Number(amount) * 1e9 / commentCost);
    const votetCount: number = Math.ceil(Number(amount) * 1e9 / voteCost);
    const transferCount: number = Math.ceil(Number(amount) * 1e9 / transferCost);
    const customJsonCount: number = Math.ceil(Number(amount) * 1e9 / customJsonOperationsCosts
    );
    const createClaimAccountCount: number = Math.floor(
      Number(amount) / createClaimAccountCost
    );
    setCommentAmount(commentCount);
    setVoteAmount(votetCount);
    setTransferAmount(transferCount);
    setCustomJsonAmount(customJsonCount);
    setClaimAccountAmount(createClaimAccountCount);
  };

  const canSubmit =
    (toData || delegateeData) &&
    !toError &&
    !inProgress &&
    !amountError &&
    !!convertedVal &&
    (Number(convertedVal) === 0 || Number(convertedVal) >= 5000000000) &&
    Number(amount) < Number(resourceCredit);

  const handleTo = async (value: string) => {
    setInProgress(true);

    if (value === "") {
      setToWarning("");
      setToError("");
      setToData(null);
      return;
    }
    if (badActors.includes(value)) {
      setToWarning(_t("transfer.to-bad-actor"));
    } else {
      setToWarning("");
    }
    setToData(null);
    if (value.includes(",")) {
      setToData(value);
      setToError("");
      setInProgress(false);
      return true;
    } else {
      return getAccount(value)
        .then((resp) => {
          if (resp) {
            setToError("");
            setToData(resp);
          } else {
            setToError(_t("transfer.to-not-found"));
          }
          return resp;
        })
        .catch((err: any) => {
        //   error(...formatError(err));
        console.log(err)
        })
        .finally(() => {
          setInProgress(false);
        });
    }
  };

  const delayedSearch = useCallback(_.debounce(handleTo, 3000, { leading: true }), []);

  const formHeader1 = (
    <div className="transaction-form-header">
      <div className="step-no">1</div>
      <div className="box-titles">
        <div className="main-title">{_t("rc-info.delegate-title")}</div>
        <div className="sub-title">{_t("rc-info.delegate-sub-title")}</div>
      </div>
    </div>
  );

  const formHeader2 = (
    <div className="transaction-form-header">
      <div className="step-no">2</div>
      <div className="box-titles">
        <div className="main-title">{_t("transfer.confirm-title")}</div>
        <div className="sub-title">{_t("transfer.confirm-sub-title")}</div>
      </div>
    </div>
  );

  const handlePointClick = (event:any, index: number, percentage: number) => {
    event.stopPropagation();
    setFillWidth(percentage);
    const formartInput = (((percentage / 100) * resourceCredit) / 1e9).toFixed(0)
    console.log(percentage)
    setAmount(formartInput)
  };

  const handleProgressLineClick = (event: any) => {
    const clickedPosition = (event.nativeEvent.offsetX / event.currentTarget.clientWidth) * 100;
    console.log(clickedPosition)
    event.stopPropagation()

    const formmattedInput = ((clickedPosition / 100) * resourceCredit / 1e9).toFixed(0);
    setFillWidth(clickedPosition);
    setAmount(formmattedInput);
  };

  const updateOnAmount = (a: number) => {
    const rcPercent = (a * 1e9) / resourceCredit * 100
    setFillWidth(rcPercent)
  }

  return (
    <div className="transfer-dialog-content">
      {step === 1 && (
        <div className={`transaction-form ${inProgress ? "in-progress" : ""} d-flex flex-column`}>
          {formHeader1}
          {inProgress && <LinearProgress />}
          <Form className="transaction-form-body">
            <div className="grid grid-cols-12 mb-4">
              <div className="col-span-12 sm:col-span-2 mt-3">
                <label>{_t("transfer.from")}</label>
              </div>
              <div className="col-span-12 sm:col-span-10">
                <InputGroup>
                  <FormControl type="text" value={activeUser?.username} readOnly={true} />
                </InputGroup>
              </div>
            </div>

            <div className="grid grid-cols-12 mb-4">
              <div className="col-span-12 sm:col-span-2 mt-3">
                <label>{_t("transfer.to")}</label>
              </div>
              <div className="col-span-12 sm:col-span-10">
                {/* <SuggestionList > */}
                <InputGroup>
                  <FormControl
                    type="text"
                    autoFocus={to === ""}
                    placeholder={_t("transfer.to-placeholder")}
                    value={to}
                    onChange={toChanged}
                    className={toError ? "is-invalid" : ""}
                  />
                </InputGroup>
                {/* </SuggestionList> */}

                {toWarning && (
                  <small className="text-warning-default tr-form-text">{toWarning}</small>
                )}
                {toError && <small className="text-red tr-form-text">{toError}</small>}
              </div>
            </div>

            <div className="grid grid-cols-12">
              <div className="col-span-12 sm:col-span-2 mt-3">
                <label>{_t("transfer.amount")} (Bn) Minimum Rc that can be delegated is 5Bn</label>
              </div>
              <div className="col-span-12 sm:col-span-10">
                <InputGroup>
                  <FormControl
                    type="text"
                    placeholder={_t("transfer.amount-placeholder")}
                    value={amount}
                    onChange={amountChanged}
                    className={
                      Number(amount) > Number(resourceCredit) && amountError ? "is-invalid" : ""
                    }
                  />
                </InputGroup>
              </div>
            </div>

            {amount < 5000000000 && <small className="text-red tr-form-text">{amountError}</small>}
            {amount > Number(resourceCredit) && (
              <small className="text-red tr-form-text">{amountError}</small>
            )}

            <div className="operation-amount d-flex">
              <span className="operations">Posts/Comment: {commentAmount}</span>
              <span className="operations">Votes: {voteAmount}</span>
              <span className="operations">Transfers: {transferAmount}</span>
              <span className="operations">Reblogs/ Follows: {customJsonAmount}</span>
            </div>

            <div className="d-flex rc-progress-line" onClick={handleProgressLineClick}>
              <div className="rc-fill" style={{ width: `${fillWidth}%` }}></div>

              <div className="rc-points" 
              onClick={(e) => handlePointClick(e, 0, 0)}
              ></div>
              <div className="rc-points"
              onClick={(e) => handlePointClick(e, 1, 25)}
              ></div>
              <div className="rc-points" 
              onClick={(e) => handlePointClick(e, 2, 50)}
              ></div>
              <div className="rc-points"  
              onClick={(e) => handlePointClick(e, 3, 75)}
              ></div>
              <div className="rc-points"  
              onClick={(e) => handlePointClick(e, 4, 100)}
              ></div>
              
            </div>

            <div className="grid grid-cols-12">
              <div className="col-span-12 lg:col-span-10 lg:col-start-3">
                <div className="balance space-3">
                  <span className="balance-label">{_t("transfer.balance")}</span>
                  <span>{`: ${convertToBillions(resourceCredit)}`}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 mb-4">
              <div className="col-span-12 sm:col-span-10 sm:col-start-3">
                <Button disabled={!canSubmit} onClick={next}>
                  {_t("g.next")}
                </Button>
              </div>
            </div>
          </Form>
        </div>
      )}

      {step === 2 && (
        <div className="transaction-form">
          {formHeader2}
          <div className="transaction-form-body">
            <div className="confirmation">
              <div className="confirm-title">Delegate</div>
              <div className="users">
                <div className="from-user">
                  <UserAvatar username={activeUser?.username} size="large" />
                  <span>{activeUser?.username}</span>
                </div>
                {
                  <>
                    <div className="arrow">{arrowRightSvg}</div>
                    <div className="to-user">
                      <UserAvatar username={to} size="large" />
                      <span>{to}</span>
                    </div>
                  </>
                }
              </div>
              <div className="amount">{amount}Bn RC</div>
            </div>
            <div className="flex justify-center">
              <Button  disabled={inProgress} onClick={back}>
                {_t("g.back")}
              </Button>
              <span className="hr-6px-btn-spacer" />
              <Button disabled={inProgress} onClick={signTransaction}>
                {_t("transfer.confirm")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
