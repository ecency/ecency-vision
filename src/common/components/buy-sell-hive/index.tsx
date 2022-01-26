import React, { Component } from "react";

import { PrivateKey } from "@hiveio/dhive";

import numeral from "numeral";

import moment from "moment";

import isEqual from "react-fast-compare";

import {
  Modal,
  Form,
  Row,
  Col,
  InputGroup,
  FormControl,
  Button,
} from "react-bootstrap";

import badActors from "@hiveio/hivescript/bad-actors.json";

import { Global } from "../../store/global/types";
import { DynamicProps } from "../../store/dynamic-props/types";
import { Account } from "../../store/accounts/types";
import { ActiveUser } from "../../store/active-user/types";
import {
  DelegateVestingShares,
  Transactions,
} from "../../store/transactions/types";

import BaseComponent from "../base";
import LinearProgress from "../linear-progress";
import UserAvatar from "../user-avatar";
import SuggestionList from "../suggestion-list";
import KeyOrHot from "../key-or-hot";
import { error } from "../feedback";

import HiveWallet from "../../helper/hive-wallet";
import amountFormatCheck from "../../helper/amount-format-check";
import parseAsset from "../../helper/parse-asset";
import { vestsToHp, hpToVests } from "../../helper/vesting";

import {
  DelegatedVestingShare,
  getAccount,
  getAccountFull,
  getVestingDelegations,
} from "../../api/hive";

import {
  transfer,
  transferHot,
  transferKc,
  transferPoint,
  transferPointHot,
  transferPointKc,
  transferToSavings,
  transferToSavingsHot,
  transferToSavingsKc,
  transferFromSavings,
  transferFromSavingsHot,
  transferFromSavingsKc,
  transferToVesting,
  transferToVestingHot,
  transferToVestingKc,
  convert,
  convertHot,
  convertKc,
  delegateVestingShares,
  delegateVestingSharesHot,
  delegateVestingSharesKc,
  withdrawVesting,
  withdrawVestingHot,
  withdrawVestingKc,
  formatError,
} from "../../api/operations";

import { _t } from "../../i18n";
import { Tsx } from "../../i18n/helper";

import { arrowRightSvg } from "../../img/svg";
import formattedNumber from "../../util/formatted-number";
import activeUser from "../../store/active-user";

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
  onConfirm: (e: any) => void;
  onHide: () => void;
  values: { total: number; amount: number; price: number; available: number };
}

interface State {
  step: 1 | 2;
}

export class BuySellHive extends BaseComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      step: 1,
    };
  }

  render() {
    const { step } = this.state;
    const {
      values: { amount, price, total, available },
      onHide,
    } = this.props;

    const formHeader1 = (
      <div className="d-flex align-items-center border-bottom pb-3">
        <div className="step-no ml-3">1</div>
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
                  Cancel transaction
                </Button>
                <Button onClick={() => this.setState({ step: 2 })}>
                  Proceed
                </Button>
              </div>
            </div>
          )}
        </div>
      );
    }

    return <></>;
  }
}

export default class BuySellHiveDialog extends Component<Props> {
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
