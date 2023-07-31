import React, { Component } from "react";

import { cryptoUtils, PrivateKey } from "@hiveio/dhive";

import numeral from "numeral";

import isEqual from "react-fast-compare";

import { Button, Col, Form, FormControl, InputGroup, Row } from "react-bootstrap";

import badActors from "@hiveio/hivescript/bad-actors.json";

import { Global } from "../../store/global/types";
import { DynamicProps } from "../../store/dynamic-props/types";
import { Account } from "../../store/accounts/types";
import { ActiveUser } from "../../store/active-user/types";
import { DelegateVestingShares, Transactions } from "../../store/transactions/types";

import BaseComponent from "../base";
import LinearProgress from "../linear-progress";
import UserAvatar from "../user-avatar";
import SuggestionList from "../suggestion-list";
import KeyOrHot from "../key-or-hot";
import { error } from "../feedback";

import HiveWallet from "../../helper/hive-wallet";
import amountFormatCheck from "../../helper/amount-format-check";
import parseAsset from "../../helper/parse-asset";
import { vestsToHp } from "../../helper/vesting";

import { getAccount, getAccountFull } from "../../api/hive";

import {
  delegateHiveEngineHs,
  delegateHiveEngineKc,
  delegateHiveEngineKey,
  formatError,
  stakeHiveEngineHs,
  stakeHiveEngineKc,
  stakeHiveEngineKey,
  transferHiveEngineHs,
  transferHiveEngineKc,
  transferHiveEngineKey,
  undelegateHiveEngineHs,
  undelegateHiveEngineKc,
  undelegateHiveEngineKey,
  unstakeHiveEngineHs,
  unstakeHiveEngineKc,
  unstakeHiveEngineKey
} from "../../api/operations";

import { _t } from "../../i18n";
import { Tsx } from "../../i18n/helper";

import { arrowRightSvg } from "../../img/svg";
import formattedNumber from "../../util/formatted-number";
import { dateToFullRelative } from "../../helper/parse-date";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader } from "../modal";

export type TransferMode = "transfer" | "delegate" | "undelegate" | "stake" | "unstake";

class FormText extends Component<{
  msg: string;
  type: "danger" | "warning" | "muted";
}> {
  render() {
    return (
      <Row>
        <Col md={{ span: 10, offset: 2 }}>
          <Form.Text className={`text-${this.props.type} tr-form-text`}>{this.props.msg}</Form.Text>
        </Col>
      </Row>
    );
  }
}

interface Props {
  global: Global;
  dynamicProps: DynamicProps;
  mode: TransferMode;
  asset: string;
  assetBalance: number;
  to?: string;
  amount?: string;
  memo?: string;
  activeUser: ActiveUser;
  transactions: Transactions;
  signingKey: string;
  account: Account;
  addAccount: (data: Account) => void;
  updateActiveUser: (data?: Account) => void;
  setSigningKey: (key: string) => void;
  fetchPoints: (username: string, type?: number) => void;
  updateWalletValues: () => void;
  onHide: () => void;
}

interface State {
  step: 1 | 2 | 3 | 4;
  asset: string;
  assetBalance: number;
  precision: number;
  delegationList: DelegateVestingShares[];
  to: string;
  toData: Account | null;
  toError: string;
  memoError: string;
  toWarning: string;
  amount: string;
  amountError: string;
  memo: string;
  inProgress: boolean;
}

const pureState = (props: Props): State => {
  let _to: string = "";
  let _toData: Account | null = null;

  // if ([ "delegate", "undelegate", "stake", "unstake"].includes(props.mode)) {
  //     _to = props.activeUser.username;
  //     _toData = props.activeUser.data
  // }

  return {
    step: 1,
    asset: props.asset,
    assetBalance: props.assetBalance,
    precision: (props.assetBalance + "").split(".")[1]?.length || 3,
    to: props.to || _to,
    toData: props.to ? { name: props.to } : _toData,
    toError: "",
    memoError: "",
    toWarning: "",
    amount: props.amount || "0.001",
    amountError: "",
    memo: props.memo || "",
    inProgress: false,
    delegationList: []
  };
};

export class Transfer extends BaseComponent<Props, State> {
  state: State = pureState(this.props);

  _timer: any = null;

  componentDidMount() {
    this.checkAmount();
    const { updateActiveUser } = this.props;
    updateActiveUser();
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    if (!isEqual(this.props.activeUser, prevProps.activeUser)) {
      this.checkAmount();
    }
  }

  formatNumber = (num: number | string, precision: number) => {
    const format = `0.${"0".repeat(precision)}`;

    return numeral(num).format(format, Math.floor); // round to floor
  };

  assetChanged = (asset: string) => {
    this.stateSet({ asset }, () => {
      this.checkAmount();
    });
  };

  toChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
    const { value: to } = e.target;
    this.stateSet({ to }, this.handleTo);
  };

  toSelected = (to: string) => {
    this.stateSet({ to }, this.handleTo);
  };

  amountChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>): void => {
    const { value: amount } = e.target;
    this.stateSet({ amount }, () => {
      this.checkAmount();
    });
  };

  memoChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>): void => {
    const { value: memo } = e.target;
    const mError = cryptoUtils.isWif(memo);
    if (mError) this.setState({ memoError: _t("transfer.memo-error") });
    this.stateSet({ memo });
  };

  handleTo = () => {
    const { to } = this.state;

    if (this._timer) {
      clearTimeout(this._timer);
    }

    if (to === "") {
      this.stateSet({ toWarning: "", toError: "", toData: null });
      return;
    }

    this._timer = setTimeout(() => {
      if (badActors.includes(to)) {
        this.stateSet({ toWarning: _t("transfer.to-bad-actor") });
      } else {
        this.stateSet({ toWarning: "" });
      }

      this.stateSet({ inProgress: true, toData: null });
      const {
        activeUser,
        mode,
        dynamicProps: { hivePerMVests }
      } = this.props;

      return getAccount(to)
        .then((resp) => {
          if (resp) {
            this.stateSet({ toError: "", toData: resp });
          } else {
            this.stateSet({
              toError: _t("transfer.to-not-found")
            });
          }

          return resp;
        })
        .catch((err) => {
          error(...formatError(err));
        })
        .finally(() => {
          this.stateSet({ inProgress: false });
        });
    }, 500);
  };

  checkAmount = () => {
    const { amount, precision } = this.state;

    if (amount === "") {
      this.stateSet({ amountError: "" });
      return;
    }

    if (!amountFormatCheck(amount)) {
      this.stateSet({ amountError: _t("transfer.wrong-amount") });
      return;
    }

    const dotParts = amount.split(".");
    if (dotParts.length > 1) {
      const _precision = dotParts[1];
      if (_precision.length > precision) {
        this.stateSet({ amountError: _t("transfer.amount-precision-error") });
        return;
      }
    }

    if (parseFloat(amount) > this.state.assetBalance) {
      this.stateSet({ amountError: _t("trx-common.insufficient-funds") });
      return;
    }

    this.stateSet({ amountError: "" });
  };

  copyBalance = () => {
    const amount = this.formatBalance(this.state.assetBalance);
    this.stateSet({ amount }, () => {
      this.checkAmount();
    });
  };

  formatBalance = (balance: number): string => {
    const { precision } = this.state;
    return this.formatNumber(balance, precision);
  };

  canSubmit = () => {
    const { toData, toError, amountError, memoError, inProgress, amount } = this.state;
    if (this.props.mode === "unstake") return parseFloat(amount) > 0;
    return (
      toData && !toError && !amountError && !memoError && !inProgress && parseFloat(amount) > 0
    );
  };

  next = () => {
    // make sure 3 decimals in amount
    const { amount, precision } = this.state;
    const fixedAmount = this.formatNumber(amount, precision);

    this.stateSet({ step: 2, amount: fixedAmount });
  };

  nextPowerDown = () => {
    this.stateSet({ step: 2, amount: "0.000" });
  };

  back = () => {
    this.stateSet({ step: 1 });
  };

  confirm = () => {
    this.stateSet({ step: 3 });
  };

  sign = (key: PrivateKey) => {
    const { activeUser, mode } = this.props;
    const { to, amount, asset, memo } = this.state;
    const fullAmount = `${amount}`;
    const username = activeUser?.username!;

    let promise: Promise<any>;
    switch (mode) {
      case "transfer": {
        // Perform HE operation
        promise = transferHiveEngineKey(username, key, asset, to, fullAmount, memo);
        break;
      }
      case "delegate": {
        // Perform HE operation
        promise = delegateHiveEngineKey(username, key, asset, to, fullAmount);
        break;
      }
      case "undelegate": {
        // Perform HE operation
        promise = undelegateHiveEngineKey(username, key, asset, to, fullAmount);
        break;
      }
      case "stake": {
        // Perform HE operation
        promise = stakeHiveEngineKey(username, key, asset, to, fullAmount);
        break;
      }
      case "unstake": {
        // Perform HE operation
        promise = unstakeHiveEngineKey(username, key, asset, to, fullAmount);
        break;
      }
      default:
        return;
    }

    this.stateSet({ inProgress: true });

    promise
      .then(() => getAccountFull(activeUser.username))
      .then((a) => {
        const { addAccount, updateActiveUser } = this.props;
        // refresh
        addAccount(a);
        // update active
        updateActiveUser(a);
        this.stateSet({ step: 4, inProgress: false });
      })
      .catch((err) => {
        error(...formatError(err));
        this.stateSet({ inProgress: false });
      });
  };

  signHs = () => {
    const { activeUser, mode, onHide } = this.props;
    const { to, amount, asset, memo } = this.state;
    const fullAmount = `${amount}`;
    const username = activeUser?.username!;

    let promise: Promise<any>;

    switch (mode) {
      case "transfer": {
        promise = transferHiveEngineHs(username, to, asset, fullAmount, memo);
        break;
      }
      case "delegate": {
        promise = delegateHiveEngineHs(username, to, asset, fullAmount);
        break;
      }
      case "undelegate": {
        promise = undelegateHiveEngineHs(username, to, asset, fullAmount);
        break;
      }
      case "stake": {
        promise = stakeHiveEngineHs(username, to, asset, fullAmount);
        break;
      }
      case "unstake": {
        promise = unstakeHiveEngineHs(username, to, asset, fullAmount);
        break;
      }
      default:
        return;
    }

    onHide();
  };

  signKs = () => {
    const { activeUser, mode } = this.props;
    const { to, amount, asset, memo } = this.state;
    const fullAmount = `${amount}`;
    const username = activeUser?.username!;

    let promise: Promise<any>;
    switch (mode) {
      case "transfer": {
        promise = transferHiveEngineKc(username, to, asset, fullAmount, memo);
        break;
      }
      case "delegate": {
        promise = delegateHiveEngineKc(username, to, asset, fullAmount);
        break;
      }
      case "undelegate": {
        promise = undelegateHiveEngineKc(username, to, asset, fullAmount);
        break;
      }
      case "stake": {
        promise = stakeHiveEngineKc(username, to, asset, fullAmount);
        break;
      }
      case "unstake": {
        promise = unstakeHiveEngineKc(username, to, asset, fullAmount);
        break;
      }
      default:
        return;
    }

    this.stateSet({ inProgress: true });
    promise
      .then(() => getAccountFull(activeUser.username))
      .then((a) => {
        const { addAccount, updateActiveUser } = this.props;
        // refresh
        addAccount(a);
        // update active
        updateActiveUser(a);
        this.stateSet({ step: 4, inProgress: false });
      })
      .catch((err) => {
        error(...formatError(err));
        this.stateSet({ inProgress: false });
      });
  };

  finish = () => {
    const { onHide, mode, asset, account, activeUser, fetchPoints, updateWalletValues } =
      this.props;
    if (account && activeUser && account.name !== activeUser.username) {
      updateWalletValues();
    }
    // const {onHide} = this.props;
    onHide();
  };

  reset = () => {
    this.stateSet(pureState(this.props));
  };

  render() {
    const { global, mode, activeUser, transactions, dynamicProps } = this.props;
    const {
      step,
      asset,
      to,
      toError,
      toWarning,
      amount,
      precision,
      amountError,
      memoError,
      memo,
      inProgress,
      toData,
      delegationList
    } = this.state;
    const { hivePerMVests } = dynamicProps;

    const recent = [
      ...new Set(
        transactions.list
          .filter(
            (x) =>
              (x.type === "transfer" && x.from === activeUser.username) ||
              (x.type === "delegate_vesting_shares" && x.delegator === activeUser.username)
          )
          .map((x) =>
            x.type === "transfer" ? x.to : x.type === "delegate_vesting_shares" ? x.delegatee : ""
          )
          .filter((x) => {
            if (to.trim() === "") {
              return true;
            }

            return x.indexOf(to) !== -1;
          })
          .reverse()
          .slice(0, 5)
      )
    ];

    const suggestionProps = {
      header: _t("transfer.recent-transfers"),
      renderer: (i: string) => {
        return (
          <>
            <UserAvatar username={i} size="medium" />
            <span style={{ marginLeft: "4px" }}>{i}</span>
          </>
        );
      },
      onSelect: this.toSelected
    };

    const showTo = ["transfer", "delegate", "undelegate", "stake"].includes(mode);
    const showMemo = ["transfer"].includes(mode);

    const delegateAccount =
      delegationList &&
      delegationList.length > 0 &&
      delegationList!.find(
        (item) =>
          (item as DelegateVestingShares).delegatee === to &&
          (item as DelegateVestingShares).delegator === activeUser.username
      );
    const previousAmount = delegateAccount
      ? Number(
          formattedNumber(
            vestsToHp(Number(parseAsset(delegateAccount!.vesting_shares).amount), hivePerMVests)
          )
        )
      : "";

    let balance: string | number = this.props.assetBalance;
    if (previousAmount) {
      balance = Number(balance) + previousAmount;
      balance = Number(balance).toFixed(precision);
    }

    const titleLngKey = mode === "transfer" ? `${mode}-title` : `${mode}-hive-engine-title`;
    const subTitleLngKey =
      mode === "transfer" ? `${mode}-sub-title` : `${mode}-hive-engine-sub-title`;
    const summaryLngKey = `${mode}-summary`;

    const formHeader1 = (
      <div className="transaction-form-header">
        <div className="step-no">1</div>
        <div className="box-titles">
          <div className="main-title">{_t(`transfer.${titleLngKey}`)}</div>
          <div className="sub-title">{_t(`transfer.${subTitleLngKey}`)}</div>
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

    const formHeader3 = (
      <div className="transaction-form-header">
        <div className="step-no">3</div>
        <div className="box-titles">
          <div className="main-title">{_t("trx-common.sign-title")}</div>
          <div className="sub-title">{_t("trx-common.sign-sub-title")}</div>
        </div>
      </div>
    );

    const formHeader4 = (
      <div className="transaction-form-header">
        <div className="step-no">4</div>
        <div className="box-titles">
          <div className="main-title">{_t("trx-common.success-title")}</div>
          <div className="sub-title">{_t("trx-common.success-sub-title")}</div>
        </div>
      </div>
    );

    // Powering down
    if (step === 1 && mode === "unstake") {
      const w = new HiveWallet(activeUser.data, dynamicProps);
      if (w.isPoweringDown) {
        return (
          <div className="transfer-dialog-content">
            <div className="transaction-form">
              {formHeader1}
              <div className="transaction-form-body powering-down">
                <p>{_t("transfer.powering-down")}</p>
                <p>
                  {" "}
                  {_t("wallet.next-power-down", {
                    time: dateToFullRelative(w.nextVestingWithdrawalDate.toString()),
                    amount: `${this.formatNumber(
                      w.nextVestingSharesWithdrawalHive,
                      precision
                    )} ${asset}`,
                    weeks: w.weeksLeft
                  })}
                </p>
                <p>
                  <Button onClick={this.nextPowerDown} variant="danger">
                    {_t("transfer.stop-power-down")}
                  </Button>
                </p>
              </div>
            </div>
          </div>
        );
      }
    }

    return (
      <div className="transfer-dialog-content">
        {step === 1 && (
          <div className={`transaction-form ${inProgress ? "in-progress" : ""}`}>
            {formHeader1}
            {inProgress && <LinearProgress />}
            <Form className="transaction-form-body">
              {mode !== "undelegate" && (
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
              )}

              {showTo && (
                <>
                  <Form.Group as={Row}>
                    <Form.Label column={true} sm="2">
                      {mode === "undelegate" ? _t("transfer.from") : _t("transfer.to")}
                    </Form.Label>
                    <Col sm="10">
                      <SuggestionList items={recent} {...suggestionProps}>
                        <InputGroup>
                          <InputGroup.Prepend>
                            <InputGroup.Text>@</InputGroup.Text>
                          </InputGroup.Prepend>
                          <Form.Control
                            type="text"
                            autoFocus={to === ""}
                            placeholder={_t("transfer.to-placeholder")}
                            value={to}
                            onChange={this.toChanged}
                            className={toError ? "is-invalid" : ""}
                          />
                        </InputGroup>
                      </SuggestionList>
                    </Col>
                  </Form.Group>
                  {toWarning && <FormText msg={toWarning} type="danger" />}
                  {toError && <FormText msg={toError} type="danger" />}
                </>
              )}

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
                      onChange={this.amountChanged}
                      className={amount > balance && amountError ? "is-invalid" : ""}
                      autoFocus={mode !== "transfer"}
                    />
                    <span className="balance-num align-self-center ml-1">{asset}</span>
                  </InputGroup>
                </Col>
              </Form.Group>

              {amountError && amount > balance && <FormText msg={amountError} type="danger" />}

              <Row>
                <Col lg={{ span: 10, offset: 2 }}>
                  <div className="balance">
                    <span className="balance-label">
                      {_t("transfer.balance")}
                      {": "}
                    </span>
                    <span className="balance-num" onClick={this.copyBalance}>
                      {this.props.assetBalance} {asset}
                    </span>
                    {asset === "HP" && (
                      <div className="balance-hp-hint">{_t("transfer.available-hp-hint")}</div>
                    )}
                  </div>
                  {to.length > 0 && Number(amount) > 0 && toData?.__loaded && mode === "delegate" && (
                    <div className="text-muted mt-1 override-warning">
                      {_t("transfer.override-warning-1")}
                      {delegateAccount && (
                        <>
                          <br />
                          {_t("transfer.override-warning-2", {
                            account: to,
                            previousAmount: previousAmount
                          })}
                        </>
                      )}
                    </div>
                  )}
                  {(() => {
                    if (mode === "unstake") {
                      const hive = Math.round((Number(amount) / 13) * 1000) / 1000;
                      if (!isNaN(hive) && hive > 0) {
                        return (
                          <div className="power-down-estimation">
                            {_t("transfer.power-down-estimated", {
                              n: `${this.formatNumber(hive, precision)} ${asset}`
                            })}
                          </div>
                        );
                      }
                    }
                    return null;
                  })()}
                </Col>
              </Row>

              {showMemo && (
                <>
                  <Form.Group as={Row}>
                    <Form.Label column={true} sm="2">
                      {_t("transfer.memo")}
                    </Form.Label>
                    <Col sm="10">
                      <Form.Control
                        placeholder={_t("transfer.memo-placeholder")}
                        value={memo}
                        onChange={this.memoChanged}
                      />
                    </Col>
                  </Form.Group>
                  <FormText msg={_t("transfer.memo-help")} type="muted" />
                  {memoError && <FormText msg={memoError} type="danger" />}
                </>
              )}

              <Form.Group as={Row}>
                <Col sm={{ span: 10, offset: 2 }}>
                  {/* Changed && to || since it just allows the form to submit anyway initially */}
                  <Button onClick={this.next} disabled={!this.canSubmit() || amount > balance}>
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
                <div className="confirm-title">{_t(`transfer.${titleLngKey}`)}</div>
                <div className="users">
                  <div className="from-user">
                    <UserAvatar username={activeUser.username} size="large" />
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
              <div className="d-flex justify-content-center">
                <Button variant="outline-secondary" disabled={inProgress} onClick={this.back}>
                  {_t("g.back")}
                </Button>
                <span className="hr-6px-btn-spacer" />
                <Button disabled={inProgress} onClick={this.confirm}>
                  {inProgress && <span>spinner</span>}
                  {_t("transfer.confirm")}
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="transaction-form">
            {formHeader3}
            <div className="transaction-form">
              {KeyOrHot({
                ...this.props,
                inProgress,
                onKey: this.sign,
                onHot: this.signHs,
                onKc: this.signKs
              })}
              <p className="text-center">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();

                    this.stateSet({ step: 2 });
                  }}
                >
                  {_t("g.back")}
                </a>
              </p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="transaction-form">
            {formHeader4}
            <div className="transaction-form-body">
              <Tsx
                k={`transfer.${summaryLngKey}`}
                args={{ amount: `${amount} ${asset}`, from: activeUser.username, to }}
              >
                <div className="success" />
              </Tsx>
              <div className="d-flex justify-content-center">
                <Button variant="outline-secondary" onClick={this.reset}>
                  {_t("transfer.reset")}
                </Button>
                <span className="hr-6px-btn-spacer" />
                <Button onClick={this.finish}>{_t("g.finish")}</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default class TransferDialog extends Component<Props> {
  render() {
    const { onHide } = this.props;
    return (
      <Modal
        animation={false}
        show={true}
        centered={true}
        onHide={onHide}
        className="transfer-dialog modal-thin-header"
        size="lg"
      >
        <ModalHeader closeButton={true} />
        <ModalBody>
          <Transfer {...this.props} />
        </ModalBody>
      </Modal>
    );
  }
}
