import React, { useCallback, useState } from "react";
import _ from "lodash";
import badActors from "@hiveio/hivescript/bad-actors.json";
import LinearProgress from "../linear-progress";
import UserAvatar from "../user-avatar";
import { error } from "../feedback";
import { delegateRC, formatError } from "../../api/operations";
import { getAccount } from "../../api/hive";
import { arrowRightSvg } from "../../img/svg";
import { _t } from "../../i18n";
import { FormControl, InputGroup } from "@ui/input";
import { Button } from "@ui/button";
import { Form } from "@ui/form";

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

  const toChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setInProgress(true);
    setTo(value);
    delayedSearch(value);
  };

  const amountChanged = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value: amount } = e.target;
    setAmount(amount);
    if (
      amount === "" ||
      (Number(amount) >= 5000000000 && Number(amount) < Number(resourceCredit)) ||
      amount === "0"
    ) {
      setAmountError("");
    } else if (Number(amount) < 5000000000) {
      setAmountError(_t("rc-info.minimum-rc-error"));
    } else if (Number(amount) > Number(resourceCredit)) {
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
    const username = activeUser?.username!;
    const max_rc = `${amount}`;
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

  const canSubmit =
    (toData || delegateeData) &&
    !toError &&
    !inProgress &&
    !amountError &&
    !!amount &&
    (Number(amount) === 0 || Number(amount) >= 5000000000) &&
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
        .catch((err) => {
          error(...formatError(err));
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

  return (
    <div className="transfer-dialog-content">
      {step === 1 && (
        <div className={`transaction-form ${inProgress ? "in-progress" : ""}`}>
          {formHeader1}
          {inProgress && <LinearProgress />}
          <Form className="transaction-form-body">
            <div className="grid grid-cols-12 mb-4">
              <div className="col-span-12 sm:col-span-2">
                <label>{_t("transfer.from")}</label>
              </div>
              <div className="col-span-12 sm:col-span-2">
                <InputGroup prepend="@">
                  <FormControl type="text" value={activeUser.username} readOnly={true} />
                </InputGroup>
              </div>
            </div>

            <div className="grid grid-cols-12 mb-4">
              <div className="col-span-12 sm:col-span-2">
                <label>{_t("transfer.to")}</label>
              </div>
              <div className="col-span-12 sm:col-span-2">
                {/* <SuggestionList > */}
                <InputGroup prepend="@">
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
              </div>
            </div>
            {toWarning && <FormText msg={toWarning} type="danger" />}
            {toError && <FormText msg={toError} type="danger" />}

            <div className="grid grid-cols-12">
              <div className="col-span-12 sm:col-span-2">
                <label>{_t("transfer.amount")}</label>
              </div>
              <div className="col-span-12 sm:col-span-10 flex items-center">
                <InputGroup prepend="#">
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

            {amount < 5000000000 && <FormText msg={amountError} type="danger" />}
            {amount > Number(resourceCredit) && <FormText msg={amountError} type="danger" />}

            <div className="grid grid-cols-12">
              <div className="col-span-12 lg:col-span-10 lg:col-start-3">
                <div className="balance space-3">
                  <span className="balance-label">{_t("transfer.balance")}</span>
                  <span>{`: ${resourceCredit}`}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 mb-4">
              <div className="col-span-12 sm:col-span-10 sm:col-start-2">
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
                  <UserAvatar username={activeUser.username} size="large" />
                </div>
                {
                  <>
                    <div className="arrow">{arrowRightSvg}</div>
                    <div className="to-user">
                      <UserAvatar username={to} size="large" />
                    </div>
                  </>
                }
              </div>
              <div className="amount">{amount} RC</div>
            </div>
            <div className="flex justify-center">
              <Button appearance="secondary" outline={true} disabled={inProgress} onClick={back}>
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

const FormText = (props: { msg: any; type: any }) => {
  const { msg, type } = props;
  return (
    <div className="grid grid-cols-12">
      <div className="col-span-12 md:col-span-10 md:col-start-2">
        <small className={`text-${type} tr-form-text`}>{msg}</small>
      </div>
    </div>
  );
};
