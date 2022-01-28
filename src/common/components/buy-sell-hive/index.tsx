import React, { Component,  } from "react";
import {addUser} from "../../store/users";
import {setActiveUser, updateActiveUser} from "../../store/active-user";

import {
  Modal,
  Form,
  Row,
  Col,
  Button,
} from "react-bootstrap";

import { Global } from "../../store/global/types";
import { ActiveUser } from "../../store/active-user/types";

import BaseComponent from "../base";
import { error } from "../feedback";


import {
  getAccountFull,
} from "../../api/hive";

import {
  formatError, limitOrderCreateHotKeyChain, limitOrderCreateHS,
} from "../../api/operations";

import { _t } from "../../i18n";
import keyOrHot from "../key-or-hot";
import { activeUserInstance } from "../../helper/test-helper";
import { AnyAction, bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
import { AppState } from "../../store";
import { PageProps } from "../../pages/common";

export type TransferMode =
  | "transfer"
  | "transfer-saving"
  | "withdraw-saving"
  | "convert"
  | "power-up"
  | "power-down"
  | "delegate";
export type TransferAsset = "HIVE" | "HBD" | "HP" | "POINT";

interface AssetSwitchProps {
  options: TransferAsset[];
  selected: TransferAsset;
  onChange: (i: TransferAsset) => void;
}

class AssetSwitch extends Component<AssetSwitchProps> {
  clicked = (i: TransferAsset) => {
    this.setState({ selected: i });
    const { onChange } = this.props;
    onChange(i);
  };

  render() {
    const { options, selected } = this.props;

    return (
      <div className="asset-switch">
        {options.map((opt) => (
          <a
            key={opt}
            onClick={() => this.clicked(opt)}
            className={`asset ${selected === opt ? "selected" : ""}`}
          >
            {opt}
          </a>
        ))}
      </div>
    );
  }
}

class FormText extends Component<{
  msg: string;
  type: "danger" | "warning" | "muted";
}> {
  render() {
    return (
      <Row>
        <Col md={{ span: 10, offset: 2 }}>
          <Form.Text className={`text-${this.props.type} tr-form-text`}>
            {this.props.msg}
          </Form.Text>
        </Col>
      </Row>
    );
  }
}

export enum TransactionType {
  None = 0,
  Sell = 2,
  Buy = 1,
}

interface Props {
  type: TransactionType;
  onConfirm: Promise<void>;
  onHide: () => void;
  values: { total: number; amount: number; price: number; available: number };
  global: Global,
  activeUser: ActiveUser,
  addAccount: (arg: any) => void,
  updateActiveUser: (arg: any) => void
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

  onClickKey = (authType?:string) => {
    this.setState({inProgress: true})
    const {activeUser, values: {total, amount}, onHide } = this.props
    let promise: Promise<any>;
    promise = authType ==='hs' ? limitOrderCreateHS(activeUser!.username, total, amount) 
    : authType === "kc" ? limitOrderCreateHotKeyChain(activeUser!.username, total, amount) 
    : this.props.onConfirm();
    if(!authType){
    promise.then(() => getAccountFull(this.props.activeUser!.username))
            .then((a) => {
                const {addAccount, updateActiveUser} = this.props;
                // refresh
                addAccount(a);
                // update active
                updateActiveUser(a);
                this.stateSet({step: 3});
                this.setState({inProgress: false})
            })
            .catch(err => {
                error(formatError(err));
                this.setState({inProgress: false})
            });}
    onHide()
  }

  render() {
    const { step, inProgress } = this.state;
    const {
      values: { amount, price, total, available },
      onHide,
      global
    } = this.props;

    const formHeader1 = (
      <div className="d-flex align-items-center border-bottom pb-3">
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
            <div className="mt-5 w-75 text-center sub-title text-wrap">
              {available < total
                ? "Your total amount exceeds your available balance. Please recharge and try again."
                : TransactionType.Buy
                ? `You're buying ${amount} HIVEs for ${price} and your total is ${total} HBDs. Your available remaining amount will be ${
                    available - total
                  } HBDs`
                : ``}
            </div>
          </div>
          {available < total ? (
            <></>
          ) : (
            <div className="d-flex justify-content-end mt-5">
              <div className="d-flex">
                <Button variant="secondary" className="mr-3" onClick={onHide}>
                  {_t("g.cancel")}
                </Button>
                <Button onClick={() => this.setState({ step: 2 })}>
                {_t("g.continue")}
                </Button>
              </div>
            </div>
          )}
        </div>
      );
    }

    if(step === 2) {
      return <div className="transaction-form">
          {formHeader1}
          <div className="transaction-form">
              {keyOrHot({
                  inProgress,
                  onHot: () => this.onClickKey('hs'),
                  onKey: ()=> this.onClickKey(),
                  onKc: ()=> this.onClickKey("kc"),
                  global: global,
                  activeUser: activeUserInstance,
                  signingKey: 'string',
                  setSigningKey: (key: string) => {}
              })}
              <p className="text-center">
                  <a href="#" onClick={(e) => {
                      e.preventDefault();

                      this.stateSet({step: 1});
                  }}>{_t("g.back")}</a>
              </p>
          </div>
      </div>}

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
        keyboard={false}
        className="transfer-dialog modal-thin-header"
        size="lg"
      >
        <Modal.Header closeButton={true} />
        <Modal.Body>
          <BuySellHive {...this.props} />
        </Modal.Body>
      </Modal>
    );
  }
}
const mapStateToProps = (state: AppState) => ({
    global: state.global,
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) =>
    bindActionCreators(
        {
            addUser,
            setActiveUser,
            updateActiveUser,
        },
        dispatch
    );

export default connect(mapStateToProps, mapDispatchToProps)(BuySellHiveDialog);