import React, { useState, useCallback } from "react";
import _ from "lodash";
import { Form, Row, Col, InputGroup, FormControl, Button } from "react-bootstrap";
import badActors from "@hiveio/hivescript/bad-actors.json";

import LinearProgress from "../linear-progress";
import UserAvatar from "../user-avatar";
import { error } from "../feedback";

import { delegateRC, formatError } from "../../api/operations";
import { getAccount } from "../../api/hive";

import { arrowRightSvg } from "../../img/svg";
import { _t } from "../../i18n";

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

  const toChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
    const { value } = e.target;
    setInProgress(true);
    setTo(value);
    delayedSearch(value);
  };

  const amountChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>): void => {
    const { value: amount } = e.target;
    setAmount(amount);
    if (
      amount === "" ||
      (Number(amount) >= 5000000000 && Number(amount) < Number(resourceCredit[0]))
    ) {
      setAmountError("");
    } else if (Number(amount) < 5000000000) {
      setAmountError(_t("rc-info.minimum-rc-error"));
    } else if (Number(amount) > Number(resourceCredit[0])) {
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
    Number(amount) >= 5000000000 &&
    Number(amount) < Number(resourceCredit[0]);

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
            <Form.Group as={Row}>
              <Form.Label column={true} sm="2">
                {_t("transfer.from")}
              </Form.Label>
              <Col sm="10">
                <InputGroup>
                  <InputGroup.Prepend>
                    <InputGroup.Text>@</InputGroup.Text>
                  </InputGroup.Prepend>
                  <Form.Control value={activeUser.username} readOnly={true} />
                </InputGroup>
              </Col>
            </Form.Group>

            <>
              <Form.Group as={Row}>
                <Form.Label column={true} sm="2">
                  {_t("transfer.to")}
                </Form.Label>
                <Col sm="10">
                  {/* <SuggestionList > */}
                  <InputGroup>
                    <InputGroup.Prepend>
                      <InputGroup.Text>@</InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control
                      type="text"
                      autoFocus={to === ""}
                      placeholder={_t("transfer.to-placeholder")}
                      value={to}
                      onChange={toChanged}
                      className={toError ? "is-invalid" : ""}
                    />
                  </InputGroup>
                  {/* </SuggestionList> */}
                </Col>
              </Form.Group>
              {toWarning && <FormText msg={toWarning} type="danger" />}
              {toError && <FormText msg={toError} type="danger" />}
            </>

            <Form.Group as={Row}>
              <Form.Label column={true} sm="2">
                {_t("transfer.amount")}
              </Form.Label>
              <Col sm="10" className="d-flex align-items-center">
                <InputGroup>
                  <InputGroup.Prepend>
                    <InputGroup.Text>#</InputGroup.Text>
                  </InputGroup.Prepend>
                  <Form.Control
                    type="text"
                    placeholder={_t("transfer.amount-placeholder")}
                    value={amount}
                    onChange={amountChanged}
                    className={
                      Number(amount) > Number(resourceCredit[0]) && amountError ? "is-invalid" : ""
                    }
                  />
                </InputGroup>
              </Col>
            </Form.Group>

            {amount < 5000000000 && <FormText msg={amountError} type="danger" />}
            {amount > Number(resourceCredit[0]) && <FormText msg={amountError} type="danger" />}

            <Row>
              <Col lg={{ span: 10, offset: 2 }}>
                <div className="balance space-3">
                  <span className="balance-label">{_t("transfer.balance")}</span>
                  <span>{`: ${resourceCredit[0]}`}</span>
                </div>
              </Col>
            </Row>

            <Form.Group as={Row}>
              <Col sm={{ span: 10, offset: 2 }}>
                <Button disabled={!canSubmit} onClick={next}>
                  {_t("g.next")}
                </Button>
              </Col>
            </Form.Group>
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
            <div className="d-flex justify-content-center">
              <Button variant="outline-secondary" disabled={inProgress} onClick={back}>
                {_t("g.back")}
              </Button>
              <span className="hr-6px-btn-spacer" />
              <Button disabled={inProgress} onClick={signTransaction}>
                {inProgress && <span>spinner</span>}
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
    <Row>
      <Col md={{ span: 10, offset: 2 }}>
        <Form.Text className={`text-${type} tr-form-text`}>{msg}</Form.Text>
      </Col>
    </Row>
  );
};
