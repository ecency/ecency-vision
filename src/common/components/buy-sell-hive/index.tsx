import React, { Component } from "react";
import { addUser } from "../../store/users";
import { setActiveUser, updateActiveUser } from "../../store/active-user";
import { setSigningKey } from "../../store/signing-key";
import { addAccount } from "../../store/accounts";
import { Global } from "../../store/global/types";
import { ActiveUser } from "../../store/active-user/types";
import BaseComponent from "../base";
import { error } from "../feedback";
import { getAccountFull } from "../../api/hive";
import {
  formatError,
  limitOrderCancel,
  limitOrderCancelHot,
  limitOrderCancelKc,
  limitOrderCreate,
  limitOrderCreateHot,
  limitOrderCreateKc
} from "../../api/operations";
import { _t } from "../../i18n";
import KeyOrHot from "../key-or-hot";
import { AnyAction, bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
import { AppState } from "../../store";
import { PrivateKey } from "@hiveio/dhive";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader } from "@ui/modal";
import { Button } from "@ui/button";

export enum TransactionType {
  None = 0,
  Sell = 2,
  Buy = 1,
  Cancel = 3
}

interface Props {
  type: TransactionType;
  onHide: () => void;
  values?: { total: number; amount: number; price: number; available: number };
  global: Global;
  activeUser: ActiveUser;
  addAccount: (arg: any) => void;
  updateActiveUser: (arg: any) => void;
  signingKey: string;
  setSigningKey: (key: string) => void;
  onTransactionSuccess: () => void;
  orderid?: any;
}

interface State {
  step: 1 | 2 | 3;
  inProgress: boolean;
}

export class BuySellHive extends BaseComponent<any, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      step: 1,
      inProgress: false
    };
  }

  updateAll = (a: any) => {
    const { addAccount, updateActiveUser, onTransactionSuccess } = this.props;
    // refresh
    addAccount(a);
    // update active
    updateActiveUser(a);
    this.setState({ inProgress: false, step: 3 });
    onTransactionSuccess();
  };

  promiseCheck = (p: any) => {
    const { onHide } = this.props;
    p &&
      p
        .then(() => getAccountFull(this.props.activeUser!.username))
        .then((a: any) => this.updateAll(a))
        .catch((err: any) => {
          error(...formatError(err));
          this.setState({ inProgress: false });
          onHide();
        });
  };

  sign = (key: PrivateKey) => {
    this.setState({ inProgress: true });
    const { activeUser, Ttype, orderid } = this.props;
    if (Ttype === TransactionType.Cancel && orderid) {
      this.promiseCheck(limitOrderCancel(activeUser!.username, key, orderid));
    } else {
      const {
        values: { total, amount }
      } = this.props;
      this.promiseCheck(limitOrderCreate(activeUser!.username, key, total, amount, Ttype));
    }
  };

  signHs = () => {
    this.setState({ inProgress: true });
    const { activeUser, Ttype, orderid } = this.props;
    if (Ttype === TransactionType.Cancel && orderid) {
      this.promiseCheck(limitOrderCancelHot(activeUser!.username, orderid));
    } else {
      const {
        values: { total, amount }
      } = this.props;
      this.promiseCheck(limitOrderCreateHot(activeUser!.username, total, amount, Ttype));
    }
  };

  signKc = () => {
    this.setState({ inProgress: true });
    const { activeUser, Ttype, orderid } = this.props;
    if (Ttype === TransactionType.Cancel && orderid) {
      this.promiseCheck(limitOrderCancelKc(activeUser!.username, orderid));
    } else {
      const {
        values: { total, amount }
      } = this.props;
      this.promiseCheck(limitOrderCreateKc(activeUser!.username, total, amount, Ttype));
    }
  };

  finish = () => {
    const { onHide, onTransactionSuccess } = this.props;
    onTransactionSuccess();
    onHide();
  };

  render() {
    const { step, inProgress } = this.state;
    const {
      values: { amount, price, total, available } = {
        amount: 0,
        price: 0,
        total: 0,
        available: 0
      },
      onHide,
      global,
      activeUser,
      signingKey,
      setSigningKey,
      Ttype,
      orderid
    } = this.props;

    const formHeader1 = (
      <div className="d-flex align-items-center border-b border-[--border-color] pb-3">
        <div className="step-no ml-3">{step}</div>
        <div className="flex-grow-1">
          <div className="main-title">{_t("transfer.confirm-title")}</div>
          <div className="sub-title">{_t("transfer.confirm-sub-title")}</div>
        </div>
      </div>
    );

    if (step === 1) {
      return (
        <div className="mb-3">
          {formHeader1}
          <div className="d-flex justify-content-center">
            {Ttype === TransactionType.Cancel ? (
              <div className="mt-5 w-75 text-center sub-title text-wrap">
                {_t("market.confirm-cancel", { orderid: orderid })}
              </div>
            ) : (
              <div className="mt-5 w-75 text-center sub-title text-wrap">
                {available < (Ttype === TransactionType.Buy ? total : amount)
                  ? _t("market.transaction-low")
                  : _t("market.confirm-buy", {
                      amount,
                      price,
                      total,
                      balance: parseFloat((available - total) as any).toFixed(3)
                    })}
              </div>
            )}
          </div>
          {available < (Ttype === TransactionType.Buy ? total : amount) ? (
            <></>
          ) : (
            <div className="d-flex justify-content-end mt-5">
              <div className="d-flex">
                <Button appearance="secondary" className="mr-3" onClick={onHide}>
                  {_t("g.cancel")}
                </Button>
                <Button
                  onClick={() => this.setState({ step: 2 })}
                  appearance={Ttype === TransactionType.Cancel ? "danger" : "primary"}
                >
                  {_t("g.continue")}
                </Button>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="transaction-form">
          {formHeader1}
          <div className="transaction-form">
            {KeyOrHot({
              global,
              activeUser,
              signingKey,
              setSigningKey,
              inProgress,
              onHot: this.signHs,
              onKey: this.sign,
              onKc: this.signKc
            })}
            <p className="text-center">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();

                  this.stateSet({ step: 1 });
                }}
              >
                {_t("g.back")}
              </a>
            </p>
          </div>
        </div>
      );
    }

    if (step === 3) {
      const formHeader4 = (
        <div className="transaction-form-header">
          <div className="step-no">{step}</div>
          <div className="box-titles">
            <div className="main-title">{_t("trx-common.success-title")}</div>
            <div className="sub-title">{_t("trx-common.success-sub-title")}</div>
          </div>
        </div>
      );
      return (
        <div className="transaction-form">
          {formHeader4}
          <div className="transaction-form-body d-flex flex-column align-items-center">
            <div className="my-5 w-75 text-center sub-title text-wrap">
              {_t("market.transaction-succeeded")}
            </div>
            <div className="d-flex justify-content-center">
              <span className="hr-6px-btn-spacer" />
              <Button onClick={this.finish}>{_t("g.finish")}</Button>
            </div>
          </div>
        </div>
      );
    }

    return <></>;
  }
}

class BuySellHiveDialog extends Component<any> {
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
          <BuySellHive {...this.props} />
        </ModalBody>
      </Modal>
    );
  }
}

const mapStateToProps = (state: AppState) => ({
  global: state.global
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) =>
  bindActionCreators(
    {
      addUser,
      setActiveUser,
      updateActiveUser,
      addAccount,
      setSigningKey
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(BuySellHiveDialog);
