import React, { Component } from "react";
import { Global } from "../../store/global/types";
import { DynamicProps } from "../../store/dynamic-props/types";
import { ActiveUser } from "../../store/active-user/types";
import { Transactions } from "../../store/transactions/types";
import { Account } from "../../store/accounts/types";
import BaseComponent from "../base";
import { Transfer, TransferAsset } from "../transfer";
import { calcPoints } from "../../api/private-api";
import { _t } from "../../i18n";
import _c from "../../util/fix-class-names";
import formattedNumber from "../../util/formatted-number";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader } from "@ui/modal";
import { FormControl } from "@ui/input";
import { Button } from "@ui/button";

interface Props {
  global: Global;
  dynamicProps: DynamicProps;
  activeUser: ActiveUser;
  transactions: Transactions;
  signingKey: string;
  account: Account;
  updateWalletValues: () => void;
  addAccount: (data: Account) => void;
  updateActiveUser: (data?: Account) => void;
  setSigningKey: (key: string) => void;
  onHide: () => void;
}

interface State {
  submitted: boolean;
  asset: TransferAsset;
  amount: number;
  points: number;
  usd: number;
}

export class Purchase extends BaseComponent<Props, State> {
  state: State = {
    submitted: false,
    asset: "HIVE",
    amount: 250,
    points: 0,
    usd: 0
  };

  _timer: any = null;

  componentDidMount() {
    this.calc();
  }

  setAsset = (asset: TransferAsset) => {
    this.stateSet({ asset }, () => {
      this.calc();
    });
  };

  sliderChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = Number(e.target.value);
    this.stateSet({ amount });

    clearTimeout(this._timer);
    this._timer = setTimeout(() => this.calc(), 500);
  };

  calc = () => {
    const { activeUser } = this.props;
    const { asset, amount } = this.state;
    const sAmount = `${amount} ${asset}`;

    calcPoints(activeUser.username, sAmount).then((resp) => {
      this.stateSet({ usd: resp.usd, points: resp.estm });
    });
  };

  submit = () => {
    this.stateSet({ submitted: true });
  };

  render() {
    const { asset, amount, points, usd, submitted } = this.state;

    if (submitted) {
      return (
        <Transfer
          {...this.props}
          asset={asset}
          mode="transfer"
          amount={`${amount}`}
          to="esteem.app"
          memo="points"
        />
      );
    }

    return (
      <div className="purchase-dialog-content">
        <div className="curr-select">
          <div className="curr-label">{_t("purchase.select-asset")}</div>
          <div className="nav nav-pills">
            <div className="nav-item">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  this.setAsset("HIVE");
                }}
                className={_c(`nav-link ${asset === "HIVE" ? "active" : ""}`)}
              >
                HIVE
              </a>
            </div>
            <div className="nav-item">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  this.setAsset("HBD");
                }}
                className={_c(`nav-link ${asset === "HBD" ? "active" : ""}`)}
              >
                HBD
              </a>
            </div>
          </div>
        </div>
        <div className="input-amounts">
          <div className="asset-amount">
            {`${formattedNumber(amount, { fractionDigits: 3 })} ${asset}`}
          </div>

          <div className="usd-amount">
            {formattedNumber(usd, { fractionDigits: 3 })} {"$"}
          </div>
        </div>
        <div className="slider-area">
          <FormControl
            type="range"
            autoFocus={true}
            step={0.001}
            min={1}
            max={10000}
            value={amount}
            onChange={this.sliderChanged}
          />
          <small className="text-gray-600">{_t("purchase.slider-hint")}</small>
        </div>
        <div className="point-amount">
          {formattedNumber(points, { fractionDigits: 3 })} {"POINTS"}
        </div>
        <div className="text-center flex flex-col items-center">
          <Button onClick={this.submit}>{_t("purchase.submit")}</Button>
          <span className="flex text-gray-600 mt-3 items-center">
            <h4 className="text-white my-0 mr-1">&#9432;</h4> {_t("purchase.purchase-message")}
          </span>
        </div>
      </div>
    );
  }
}

export default class PurchaseDialog extends Component<Props> {
  render() {
    const { onHide } = this.props;
    return (
      <Modal
        animation={false}
        show={true}
        centered={true}
        onHide={onHide}
        className="purchase-dialog"
        size="lg"
      >
        <ModalHeader thin={true} closeButton={true} />
        <ModalBody>
          <Purchase {...this.props} />
        </ModalBody>
      </Modal>
    );
  }
}
