import React from "react";

import { History } from "history";

import { AssetSymbol } from "@hiveio/dhive";

import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import { DynamicProps } from "../../store/dynamic-props/types";
import { OperationGroup, Transactions } from "../../store/transactions/types";
import { ActiveUser } from "../../store/active-user/types";

import BaseComponent from "../base";
import Tooltip from "../tooltip";
import FormattedCurrency from "../formatted-currency";
import TransactionList from "../transactions";
import DelegatedVesting from "../delegated-vesting";
import ReceivedVesting from "../received-vesting";
import ConversionRequests from "../converts";
import CollateralizedConversionRequests from "../converts-collateralized";
import SavingsWithdraw from "../savings-withdraw";
import OpenOrdersList from "../open-orders-list";

import DropDown from "../dropdown";
import Transfer, { TransferAsset, TransferMode } from "../transfer";
import { error, success } from "../feedback";
import WalletMenu from "../wallet-menu";
import WithdrawRoutes from "../withdraw-routes";

import HiveWallet from "../../helper/hive-wallet";

import { vestsToHp } from "../../helper/vesting";

import {
  getAccount,
  getCollateralizedConversionRequests,
  getConversionRequests,
  getOpenOrder,
  getSavingsWithdrawFrom
} from "../../api/hive";

import { claimRewardBalance, formatError } from "../../api/operations";

import formattedNumber from "../../util/formatted-number";

import parseAsset from "../../helper/parse-asset";

import { _t } from "../../i18n";

import { plusCircle } from "../../img/svg";
import { dateToFullRelative, dayDiff, hourDiff, secondDiff } from "../../helper/parse-date";
import "./_index.scss";

interface Props {
  history: History;
  global: Global;
  dynamicProps: DynamicProps;
  activeUser: ActiveUser | null;
  transactions: Transactions;
  account: Account;
  signingKey: string;
  addAccount: (data: Account) => void;
  updateActiveUser: (data?: Account) => void;
  setSigningKey: (key: string) => void;
  fetchTransactions: (username: string, group?: OperationGroup | "") => void;
  updateWalletValues: () => void;
}

interface State {
  delegatedList: boolean;
  convertList: boolean;
  cconvertList: boolean;
  receivedList: boolean;
  savingsWithdrawList: boolean;
  openOrdersList: boolean;
  tokenType: AssetSymbol;
  claiming: boolean;
  claimed: boolean;
  transfer: boolean;
  withdrawRoutes: boolean;
  transferMode: null | TransferMode;
  transferAsset: null | TransferAsset;
  converting: number;
  cconverting: number;
  withdrawSavings: { hbd: string | number; hive: string | number };
  openOrders: { hbd: string | number; hive: string | number };
  aprs: { hbd: string | number; hp: string | number };
}

export class WalletHive extends BaseComponent<Props, State> {
  state: State = {
    delegatedList: false,
    receivedList: false,
    convertList: false,
    cconvertList: false,
    savingsWithdrawList: false,
    openOrdersList: false,
    tokenType: "HBD",
    claiming: false,
    claimed: false,
    transfer: false,
    withdrawRoutes: false,
    transferMode: null,
    transferAsset: null,
    converting: 0,
    cconverting: 0,
    withdrawSavings: { hbd: 0, hive: 0 },
    openOrders: { hbd: 0, hive: 0 },
    aprs: { hbd: 0, hp: 0 }
  };

  componentDidMount() {
    this.fetchConvertingAmount();
    this.fetchCollateralizedConvertingAmount();
    this.fetchWithdrawFromSavings();
    this.getOrders();
  }

  getCurrentHpApr = (gprops: DynamicProps) => {
    // The inflation was set to 9.5% at block 7m
    const initialInflationRate = 9.5;
    const initialBlock = 7000000;

    // It decreases by 0.01% every 250k blocks
    const decreaseRate = 250000;
    const decreasePercentPerIncrement = 0.01;

    // How many increments have happened since block 7m?
    const headBlock = gprops.headBlock;
    const deltaBlocks = headBlock - initialBlock;
    const decreaseIncrements = deltaBlocks / decreaseRate;

    // Current inflation rate
    let currentInflationRate =
      initialInflationRate - decreaseIncrements * decreasePercentPerIncrement;

    // Cannot go lower than 0.95%
    if (currentInflationRate < 0.95) {
      currentInflationRate = 0.95;
    }

    // Now lets calculate the "APR"
    const vestingRewardPercent = gprops.vestingRewardPercent / 10000;
    const virtualSupply = gprops.virtualSupply;
    const totalVestingFunds = gprops.totalVestingFund;
    return (virtualSupply * currentInflationRate * vestingRewardPercent) / totalVestingFunds;
  };

  fetchConvertingAmount = async () => {
    const { account, dynamicProps } = this.props;
    const { aprs } = this.state;
    const { hbdInterestRate } = dynamicProps;

    let hp = this.getCurrentHpApr(dynamicProps).toFixed(3);
    this.setState({ aprs: { ...aprs, hbd: hbdInterestRate / 100, hp } });

    const crd = await getConversionRequests(account.name);
    if (crd.length === 0) {
      return;
    }

    let converting = 0;
    crd.forEach((x) => {
      converting += parseAsset(x.amount).amount;
    });
    this.stateSet({ converting });
  };

  fetchCollateralizedConvertingAmount = async () => {
    const { account } = this.props;

    const ccrd = await getCollateralizedConversionRequests(account.name);
    if (ccrd.length === 0) {
      return;
    }

    let cconverting = 0;
    ccrd.forEach((x) => {
      cconverting += parseAsset(x.collateral_amount).amount;
    });
    this.stateSet({ cconverting });
  };

  fetchWithdrawFromSavings = async () => {
    const { account } = this.props;

    const swf = await getSavingsWithdrawFrom(account.name);
    if (swf.length === 0) {
      return;
    }

    let withdrawSavings = { hbd: 0, hive: 0 };
    swf.forEach((x) => {
      const aa = x.amount;
      if (aa.includes("HIVE")) {
        withdrawSavings.hive += parseAsset(x.amount).amount;
      } else {
        withdrawSavings.hbd += parseAsset(x.amount).amount;
      }
    });

    this.stateSet({ withdrawSavings });
  };

  getOrders = async () => {
    const { account } = this.props;

    const oo = await getOpenOrder(account.name);
    if (oo.length === 0) {
      return;
    }

    let openOrders = { hive: 0, hbd: 0 };
    oo.forEach((x) => {
      const bb = x.sell_price.base;
      if (bb.includes("HIVE")) {
        openOrders.hive += parseAsset(bb).amount;
      } else {
        openOrders.hbd += parseAsset(bb).amount;
      }
    });

    this.stateSet({ openOrders });
  };

  toggleDelegatedList = () => {
    const { delegatedList } = this.state;
    this.stateSet({ delegatedList: !delegatedList });
  };

  toggleConvertList = () => {
    const { convertList } = this.state;
    this.stateSet({ convertList: !convertList });
  };

  toggleCConvertList = () => {
    const { cconvertList } = this.state;
    this.stateSet({ cconvertList: !cconvertList });
  };

  toggleSavingsWithdrawList = (tType: AssetSymbol) => {
    const { savingsWithdrawList } = this.state;
    this.stateSet({ savingsWithdrawList: !savingsWithdrawList, tokenType: tType });
  };

  toggleOpenOrdersList = (tType: AssetSymbol) => {
    const { openOrdersList } = this.state;
    this.stateSet({ openOrdersList: !openOrdersList, tokenType: tType });
  };

  toggleReceivedList = () => {
    const { receivedList } = this.state;
    this.stateSet({ receivedList: !receivedList });
  };

  toggleWithdrawRoutes = () => {
    const { withdrawRoutes } = this.state;
    this.stateSet({ withdrawRoutes: !withdrawRoutes });
  };

  toggleClaimInterest = () => {
    this.openTransferDialog("claim-interest", "HBD");
  };

  claimRewardBalance = () => {
    const { activeUser, updateActiveUser } = this.props;
    const { claiming } = this.state;

    if (claiming || !activeUser) {
      return;
    }

    this.stateSet({ claiming: true });

    return getAccount(activeUser?.username!)
      .then((account) => {
        const {
          reward_hive_balance: hiveBalance = account.reward_hive_balance,
          reward_hbd_balance: hbdBalance = account.reward_hbd_balance,
          reward_vesting_balance: vestingBalance
        } = account;

        return claimRewardBalance(
          activeUser?.username!,
          hiveBalance!,
          hbdBalance!,
          vestingBalance!
        );
      })
      .then(() => getAccount(activeUser.username))
      .then((account) => {
        success(_t("wallet.claim-reward-balance-ok"));
        this.stateSet({ claiming: false, claimed: true });
        updateActiveUser(account);
      })
      .catch((err) => {
        error(...formatError(err));
        this.stateSet({ claiming: false });
      });
  };

  openTransferDialog = (mode: TransferMode, asset: TransferAsset) => {
    this.stateSet({ transfer: true, transferMode: mode, transferAsset: asset });
  };

  closeTransferDialog = () => {
    this.stateSet({ transfer: false, transferMode: null, transferAsset: null });
  };

  render() {
    const { global, dynamicProps, account, activeUser, history } = this.props;
    const {
      claiming,
      claimed,
      transfer,
      transferAsset,
      transferMode,
      converting,
      cconverting,
      withdrawSavings,
      aprs: { hbd, hp },
      openOrders,
      tokenType
    } = this.state;

    if (!account?.__loaded) {
      return null;
    }

    const { hivePerMVests, hbdInterestRate } = dynamicProps;
    const isMyPage = activeUser && activeUser.username === account.name;
    const w = new HiveWallet(account, dynamicProps, converting);

    const lastIPaymentRelative =
      account.savings_hbd_last_interest_payment == "1970-01-01T00:00:00"
        ? null
        : dateToFullRelative(account.savings_hbd_last_interest_payment);
    const lastIPaymentDiff = dayDiff(
      account.savings_hbd_last_interest_payment == "1970-01-01T00:00:00"
        ? account.savings_hbd_seconds_last_update
        : account.savings_hbd_last_interest_payment
    );
    const remainingHours =
      720 -
      hourDiff(
        account.savings_hbd_last_interest_payment == "1970-01-01T00:00:00"
          ? account.savings_hbd_seconds_last_update
          : account.savings_hbd_last_interest_payment
      );

    const secondsSincePayment = secondDiff(account.savings_hbd_seconds_last_update);

    const pendingSeconds = w.savingBalanceHbd * secondsSincePayment;
    const secondsToEstimate = w.savingHbdSeconds / 1000 + pendingSeconds;
    const estimatedUIn = (secondsToEstimate / (60 * 60 * 24 * 365)) * (hbdInterestRate / 10000);

    const estimatedInterest = formattedNumber(estimatedUIn, { suffix: "$" });
    const remainingDays = 30 - lastIPaymentDiff;

    const totalHP = formattedNumber(vestsToHp(w.vestingShares, hivePerMVests), { suffix: "HP" });
    const totalDelegated = formattedNumber(vestsToHp(w.vestingSharesDelegated, hivePerMVests), {
      prefix: "-",
      suffix: "HP"
    });

    return (
      <div className="wallet-hive">
        <div className="wallet-main">
          <div className="wallet-info">
            {w.hasUnclaimedRewards && !claimed && (
              <div className="unclaimed-rewards">
                <div className="title">{_t("wallet.unclaimed-rewards")}</div>
                <div className="rewards">
                  {w.rewardHiveBalance > 0 && (
                    <span className="reward-type">{`${w.rewardHiveBalance} HIVE`}</span>
                  )}
                  {w.rewardHbdBalance > 0 && (
                    <span className="reward-type">{`${w.rewardHbdBalance} HBD`}</span>
                  )}
                  {w.rewardVestingHive > 0 && (
                    <span className="reward-type">{`${w.rewardVestingHive} HP`}</span>
                  )}
                  {isMyPage && (
                    <Tooltip content={_t("wallet.claim-reward-balance")}>
                      <a
                        className={`claim-btn ${claiming ? "in-progress" : ""}`}
                        onClick={this.claimRewardBalance}
                      >
                        {plusCircle}
                      </a>
                    </Tooltip>
                  )}
                </div>
              </div>
            )}

            <div className="balance-row hive">
              <div className="balance-info">
                <div className="title">{_t("wallet.hive")}</div>
                <div className="description">{_t("wallet.hive-description")}</div>
              </div>
              <div className="balance-values">
                <div className="amount">
                  {(() => {
                    let dropDownConfig: any;
                    if (isMyPage) {
                      dropDownConfig = {
                        history: this.props.history,
                        label: "",
                        items: [
                          {
                            label: _t("wallet.transfer"),
                            onClick: () => {
                              this.openTransferDialog("transfer", "HIVE");
                            }
                          },
                          {
                            label: _t("wallet.transfer-to-savings"),
                            onClick: () => {
                              this.openTransferDialog("transfer-saving", "HIVE");
                            }
                          },
                          {
                            label: _t("wallet.power-up"),
                            onClick: () => {
                              this.openTransferDialog("power-up", "HIVE");
                            }
                          },
                          {
                            label: _t("market-data.trade"),
                            onClick: () => {
                              this.props.history.push("/market");
                            }
                          }
                        ]
                      };
                    } else if (activeUser) {
                      dropDownConfig = {
                        history: this.props.history,
                        label: "",
                        items: [
                          {
                            label: _t("wallet.transfer"),
                            onClick: () => {
                              this.openTransferDialog("transfer", "HIVE");
                            }
                          }
                        ]
                      };
                    }
                    return (
                      <div className="amount-actions">
                        <DropDown {...dropDownConfig} float="right" />
                      </div>
                    );
                  })()}

                  <span>{formattedNumber(w.balance, { suffix: "HIVE" })}</span>
                </div>
                {cconverting > 0 && (
                  <div className="amount amount-passive converting-hbd">
                    <Tooltip content={_t("wallet.converting-hive-amount")}>
                      <span className="amount-btn" onClick={this.toggleCConvertList}>
                        {"+"} {formattedNumber(cconverting, { suffix: "HIVE" })}
                      </span>
                    </Tooltip>
                  </div>
                )}
                {openOrders && openOrders.hive > 0 && (
                  <div className="amount amount-passive converting-hbd">
                    <Tooltip content={_t("wallet.reserved-amount")}>
                      <span
                        className="amount-btn"
                        onClick={() => this.toggleOpenOrdersList("HIVE")}
                      >
                        {"+"} {formattedNumber(openOrders.hive, { suffix: "HIVE" })}
                      </span>
                    </Tooltip>
                  </div>
                )}
                {withdrawSavings && withdrawSavings.hive > 0 && (
                  <div className="amount amount-passive converting-hbd">
                    <Tooltip content={_t("wallet.withdrawing-amount")}>
                      <span
                        className="amount-btn"
                        onClick={() => this.toggleSavingsWithdrawList("HIVE")}
                      >
                        {"+"} {formattedNumber(withdrawSavings.hive, { suffix: "HIVE" })}
                      </span>
                    </Tooltip>
                  </div>
                )}
              </div>
            </div>

            <div className="balance-row hive-power alternative">
              <div className="balance-info">
                <div className="title">{_t("wallet.hive-power")}</div>
                <div className="description">{_t("wallet.hive-power-description")}</div>
                <div className="description font-weight-bold mt-2">
                  {_t("wallet.hive-power-apr-rate", { value: hp })}
                </div>
              </div>

              <div className="balance-values">
                <div className="amount">
                  {(() => {
                    let dropDownConfig: any;
                    if (isMyPage) {
                      dropDownConfig = {
                        history: this.props.history,
                        label: "",
                        items: [
                          {
                            label: _t("wallet.delegate"),
                            onClick: () => {
                              this.openTransferDialog("delegate", "HP");
                            }
                          },
                          {
                            label: _t("wallet.power-down"),
                            onClick: () => {
                              this.openTransferDialog("power-down", "HP");
                            }
                          },
                          {
                            label: _t("wallet.withdraw-routes"),
                            onClick: () => {
                              this.toggleWithdrawRoutes();
                            }
                          }
                        ]
                      };
                    } else if (activeUser) {
                      dropDownConfig = {
                        history: this.props.history,
                        label: "",
                        items: [
                          {
                            label: _t("wallet.delegate"),
                            onClick: () => {
                              this.openTransferDialog("delegate", "HP");
                            }
                          },
                          {
                            label: _t("wallet.power-up"),
                            onClick: () => {
                              this.openTransferDialog("power-up", "HIVE");
                            }
                          }
                        ]
                      };
                    }
                    return (
                      <div className="amount-actions">
                        <DropDown {...dropDownConfig} float="right" />
                      </div>
                    );
                  })()}
                  {totalHP}
                </div>

                {w.vestingSharesDelegated > 0 && (
                  <div className="amount amount-passive delegated-shares">
                    <Tooltip content={_t("wallet.hive-power-delegated")}>
                      <span className="amount-btn" onClick={this.toggleDelegatedList}>
                        {formattedNumber(vestsToHp(w.vestingSharesDelegated, hivePerMVests), {
                          prefix: "-",
                          suffix: "HP"
                        })}
                      </span>
                    </Tooltip>
                  </div>
                )}

                {(() => {
                  if (w.vestingSharesReceived <= 0) {
                    return null;
                  }

                  const strReceived = formattedNumber(
                    vestsToHp(w.vestingSharesReceived, hivePerMVests),
                    { prefix: "+", suffix: "HP" }
                  );

                  if (global.usePrivate) {
                    return (
                      <div className="amount amount-passive received-shares">
                        <Tooltip content={_t("wallet.hive-power-received")}>
                          <span className="amount-btn" onClick={this.toggleReceivedList}>
                            {strReceived}
                          </span>
                        </Tooltip>
                      </div>
                    );
                  }

                  return (
                    <div className="amount amount-passive received-shares">
                      <Tooltip content={_t("wallet.hive-power-received")}>
                        <span className="amount">{strReceived}</span>
                      </Tooltip>
                    </div>
                  );
                })()}

                {w.nextVestingSharesWithdrawal > 0 && (
                  <div className="amount amount-passive next-power-down-amount">
                    <Tooltip content={_t("wallet.next-power-down-amount")}>
                      <span>
                        {formattedNumber(vestsToHp(w.nextVestingSharesWithdrawal, hivePerMVests), {
                          prefix: "-",
                          suffix: "HP"
                        })}
                      </span>
                    </Tooltip>
                  </div>
                )}

                {(w.vestingSharesDelegated > 0 ||
                  w.vestingSharesReceived > 0 ||
                  w.nextVestingSharesWithdrawal > 0) && (
                  <div className="amount total-hive-power">
                    <Tooltip content={_t("wallet.hive-power-total")}>
                      <span>
                        {formattedNumber(vestsToHp(w.vestingSharesTotal, hivePerMVests), {
                          prefix: "=",
                          suffix: "HP"
                        })}
                      </span>
                    </Tooltip>
                  </div>
                )}
              </div>
            </div>

            <div className="balance-row hive-dollars">
              <div className="balance-info">
                <div className="title">{_t("wallet.hive-dollars")}</div>
                <div className="description">{_t("wallet.hive-dollars-description")}</div>
              </div>
              <div className="balance-values">
                <div className="amount">
                  {(() => {
                    let dropDownConfig: any;
                    if (isMyPage) {
                      dropDownConfig = {
                        history: this.props.history,
                        label: "",
                        items: [
                          {
                            label: _t("wallet.transfer"),
                            onClick: () => {
                              this.openTransferDialog("transfer", "HBD");
                            }
                          },
                          {
                            label: _t("wallet.transfer-to-savings"),
                            onClick: () => {
                              this.openTransferDialog("transfer-saving", "HBD");
                            }
                          },
                          {
                            label: _t("wallet.convert"),
                            onClick: () => {
                              this.openTransferDialog("convert", "HBD");
                            }
                          },
                          {
                            label: _t("market-data.trade"),
                            onClick: () => {
                              this.props.history.push("/market");
                            }
                          }
                        ]
                      };
                    } else if (activeUser) {
                      dropDownConfig = {
                        history: this.props.history,
                        label: "",
                        items: [
                          {
                            label: _t("wallet.transfer"),
                            onClick: () => {
                              this.openTransferDialog("transfer", "HBD");
                            }
                          }
                        ]
                      };
                    }
                    return (
                      <div className="amount-actions">
                        <DropDown {...dropDownConfig} float="right" />
                      </div>
                    );
                  })()}
                  <span>{formattedNumber(w.hbdBalance, { prefix: "$" })}</span>
                </div>

                {converting > 0 && (
                  <div className="amount amount-passive converting-hbd">
                    <Tooltip content={_t("wallet.converting-hbd-amount")}>
                      <span className="amount-btn" onClick={this.toggleConvertList}>
                        {"+"} {formattedNumber(converting, { prefix: "$" })}
                      </span>
                    </Tooltip>
                  </div>
                )}

                {withdrawSavings && withdrawSavings.hbd > 0 && (
                  <div className="amount amount-passive converting-hbd">
                    <Tooltip content={_t("wallet.withdrawing-amount")}>
                      <span
                        className="amount-btn"
                        onClick={() => this.toggleSavingsWithdrawList("HBD")}
                      >
                        {"+"} {formattedNumber(withdrawSavings.hbd, { prefix: "$" })}
                      </span>
                    </Tooltip>
                  </div>
                )}

                {openOrders && openOrders.hbd > 0 && (
                  <div className="amount amount-passive converting-hbd">
                    <Tooltip content={_t("wallet.reserved-amount")}>
                      <span className="amount-btn" onClick={() => this.toggleOpenOrdersList("HBD")}>
                        {"+"} {formattedNumber(openOrders.hbd, { prefix: "$" })}
                      </span>
                    </Tooltip>
                  </div>
                )}
              </div>
            </div>

            <div className="balance-row savings alternative">
              <div className="balance-info">
                <div className="title">{_t("wallet.savings")}</div>
                <div className="description">{_t("wallet.savings-description")}</div>
                <div className="description font-weight-bold mt-2">
                  {_t("wallet.hive-dollars-apr-rate", { value: hbd })}
                </div>
                {estimatedUIn >= 0.001 && (
                  <div className="description font-weight-bold mt-2">
                    {_t("wallet.hive-dollars-apr-claim", { value: lastIPaymentRelative })}{" "}
                    {estimatedInterest}
                  </div>
                )}
                {isMyPage && estimatedUIn >= 0.001 && (
                  <div className="unclaimed-rewards" style={{ marginBottom: "0" }}>
                    <div className="rewards" style={{ height: "40px" }}>
                      <a
                        className={`claim-btn ${remainingHours > 0 ? "disabled" : ""}`}
                        onClick={this.toggleClaimInterest}
                      >
                        {remainingDays > 0
                          ? _t("wallet.hive-dollars-apr-day", { value: remainingDays })
                          : remainingDays == 0 && remainingHours > 0
                          ? _t("wallet.hive-dollars-apr-hour", { value: remainingHours })
                          : _t("wallet.hive-dollars-apr-now")}{" "}
                        {plusCircle}
                      </a>
                    </div>
                  </div>
                )}
              </div>
              <div className="balance-values">
                <div className="amount">
                  {(() => {
                    let dropDownConfig: any;
                    if (isMyPage) {
                      dropDownConfig = {
                        history: this.props.history,
                        label: "",
                        items: [
                          {
                            label: _t("wallet.withdraw-hive"),
                            onClick: () => {
                              this.openTransferDialog("withdraw-saving", "HIVE");
                            }
                          }
                        ]
                      };
                    } else if (activeUser) {
                      dropDownConfig = {
                        history: this.props.history,
                        label: "",
                        items: [
                          {
                            label: _t("wallet.transfer"),
                            onClick: () => {
                              this.openTransferDialog("transfer-saving", "HIVE");
                            }
                          }
                        ]
                      };
                    }
                    return (
                      <div className="amount-actions">
                        <DropDown {...dropDownConfig} float="right" />
                      </div>
                    );
                  })()}
                  <span>{formattedNumber(w.savingBalance, { suffix: "HIVE" })}</span>
                </div>
                <div className="amount">
                  {(() => {
                    let dropDownConfig: any;
                    if (isMyPage) {
                      dropDownConfig = {
                        history: this.props.history,
                        label: "",
                        items: [
                          {
                            label: _t("wallet.withdraw-hbd"),
                            onClick: () => {
                              this.openTransferDialog("withdraw-saving", "HBD");
                            }
                          }
                        ]
                      };
                    } else if (activeUser) {
                      dropDownConfig = {
                        history: this.props.history,
                        label: "",
                        items: [
                          {
                            label: _t("wallet.transfer"),
                            onClick: () => {
                              this.openTransferDialog("transfer-saving", "HBD");
                            }
                          }
                        ]
                      };
                    }
                    return (
                      <div className="amount-actions">
                        <DropDown {...dropDownConfig} float="right" />
                      </div>
                    );
                  })()}

                  <span>{formattedNumber(w.savingBalanceHbd, { suffix: "$" })}</span>
                </div>
              </div>
            </div>

            <div className="balance-row estimated alternative">
              <div className="balance-info">
                <div className="title">{_t("wallet.estimated")}</div>
                <div className="description">{_t("wallet.estimated-description")}</div>
              </div>
              <div className="balance-values">
                <div className="amount amount-bold">
                  <FormattedCurrency {...this.props} value={w.estimatedValue} fixAt={3} />
                </div>
              </div>
            </div>

            {w.isPoweringDown && (
              <div className="next-power-down">
                {_t("wallet.next-power-down", {
                  time: dateToFullRelative(w.nextVestingWithdrawalDate.toString()),
                  amount: formattedNumber(w.nextVestingSharesWithdrawalHive, { suffix: "HIVE" }),
                  weeks: w.weeksLeft
                })}
              </div>
            )}

            {TransactionList({ ...this.props })}
          </div>
          <WalletMenu global={global} username={account.name} active="hive" />
        </div>

        {transfer && (
          <Transfer
            {...this.props}
            activeUser={activeUser!}
            to={isMyPage ? undefined : account.name}
            mode={transferMode!}
            asset={transferAsset!}
            onHide={this.closeTransferDialog}
          />
        )}

        {this.state.delegatedList && (
          <DelegatedVesting
            {...this.props}
            account={account}
            onHide={this.toggleDelegatedList}
            totalDelegated={totalDelegated.replace("- ", "")}
          />
        )}

        {this.state.receivedList && (
          <ReceivedVesting {...this.props} account={account} onHide={this.toggleReceivedList} />
        )}

        {this.state.convertList && (
          <ConversionRequests {...this.props} account={account} onHide={this.toggleConvertList} />
        )}

        {this.state.cconvertList && (
          <CollateralizedConversionRequests
            {...this.props}
            account={account}
            onHide={this.toggleCConvertList}
          />
        )}

        {this.state.savingsWithdrawList && (
          <SavingsWithdraw
            {...this.props}
            tokenType={tokenType}
            account={account}
            onHide={() => this.toggleSavingsWithdrawList("HBD")}
          />
        )}

        {this.state.openOrdersList && (
          <OpenOrdersList
            {...this.props}
            tokenType={tokenType}
            account={account}
            onHide={() => this.toggleOpenOrdersList("HBD")}
          />
        )}

        {this.state.withdrawRoutes && (
          <WithdrawRoutes
            {...this.props}
            activeUser={activeUser!}
            onHide={this.toggleWithdrawRoutes}
          />
        )}
      </div>
    );
  }
}

export default (p: Props) => {
  const props = {
    history: p.history,
    global: p.global,
    dynamicProps: p.dynamicProps,
    activeUser: p.activeUser,
    transactions: p.transactions,
    account: p.account,
    signingKey: p.signingKey,
    addAccount: p.addAccount,
    updateActiveUser: p.updateActiveUser,
    setSigningKey: p.setSigningKey,
    fetchTransactions: p.fetchTransactions,
    updateWalletValues: p.updateWalletValues
  };

  return <WalletHive {...props} />;
};
