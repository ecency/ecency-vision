import React, { Component } from "react";
import WalletMenu from "../wallet-menu";
import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import { _t } from "../../i18n";
import {
  claimAirdropLarynxRewards,
  claimLarynxRewards,
  getHivePrice,
  getMarkets,
  getSpkWallet,
  Market,
  rewardSpk,
  SpkApiWallet
} from "../../api/spk-api";
import { WalletSpkSection } from "./wallet-spk-section";
import { SendSpkDialog } from "./send-spk-dialog";
import { ActiveUser } from "../../store/active-user/types";
import { History } from "history";
import { Transactions } from "../../store/transactions/types";
import { WalletSpkLarynxPower } from "./wallet-spk-larynx-power";
import { WalletSpkLarynxLocked } from "./wallet-spk-larynx-locked";
import { WalletSpkUnclaimedPoints } from "./wallet-spk-unclaimed-points";
import { WalletSpkDelegatedPowerDialog } from "./wallet-spk-delegated-power-dialog";
import { error, success } from "../feedback";
import { formatError } from "../../api/operations";
import { getEstimatedBalance } from "./util";

export interface Props {
  global: Global;
  account: Account;
  activeUser: ActiveUser | null;
  addAccount: (account: Account) => void;
  updateActiveUser: (account: Account) => void;
  history: History;
  transactions: Transactions;
  isActiveUserWallet: boolean;
}

export interface State {
  tokenBalance: string;
  larynxAirBalance: string;
  larynxTokenBalance: string;
  activeUserTokenBalance: string;
  activeUserLarynxTokenBalance: string;
  larynxPowerBalance: string;
  estimatedBalance: string;
  larynxPowerRate: string;
  larynxGrantedPower: string;
  larynxGrantingPower: string;
  larynxLockedBalance: string;
  sendSpkShow: boolean;
  delegatedPowerDialogShow: boolean;
  delegatingPowerDialogShow: boolean;
  selectedAsset: "SPK" | "LARYNX" | "LP";
  selectedType: "transfer" | "delegate" | "powerup" | "powerdown" | "lock" | "unlock";
  claim: string;
  claiming: boolean;
  headBlock: number;
  powerDownList: string[];
  prefilledAmount: string;
  markets: Market[];
  isNode: boolean;
  delegatedItems: [string, number][];
  delegatingItems: [string, number][];
  rateLPow: string;
  rateLDel: string;
}

class WalletSpk extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      tokenBalance: "0",
      larynxAirBalance: "0",
      larynxPowerBalance: "0",
      larynxTokenBalance: "0",
      activeUserTokenBalance: "0",
      activeUserLarynxTokenBalance: "0",
      estimatedBalance: "0",
      larynxPowerRate: "0",
      larynxGrantedPower: "",
      larynxGrantingPower: "",
      larynxLockedBalance: "",
      sendSpkShow: false,
      delegatedPowerDialogShow: false,
      delegatingPowerDialogShow: false,
      selectedAsset: "SPK",
      selectedType: "transfer",
      claim: "0",
      claiming: false,
      headBlock: 0,
      powerDownList: [],
      prefilledAmount: "",
      markets: [],
      isNode: false,
      delegatedItems: [],
      delegatingItems: [],
      rateLPow: "0.0001",
      rateLDel: "0.00015"
    };
  }

  componentDidMount() {
    this.fetch();
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
    if (
      this.props.activeUser &&
      prevProps.activeUser?.username !== this.props.activeUser?.username
    ) {
      this.fetchActiveUserWallet();
    }
  }

  claimRewards = () => {
    const { activeUser } = this.props;
    const { claiming } = this.state;

    if (claiming || !activeUser) {
      return;
    }

    this.setState({ claiming: true });

    return claimLarynxRewards(activeUser.username)
      .then((account) => {
        success(_t("wallet.claim-reward-balance-ok"));
      })
      .then(() => {
        this.setState({ claim: "0" });
      })
      .catch((err) => {
        console.log(err);
        error(...formatError(err));
      })
      .finally(() => {
        this.setState({ claiming: false });
      });
  };

  async fetch() {
    try {
      const wallet = await getSpkWallet(this.props.account.name);
      const format = (value: number) => value.toFixed(3);

      this.setState({
        tokenBalance: format(wallet.spk / 1000),
        larynxAirBalance: format(wallet.drop.availible.amount / 1000),
        larynxTokenBalance: format(wallet.balance / 1000),
        larynxPowerBalance: format(wallet.poweredUp / 1000),
        larynxGrantedPower: wallet.granted?.t ? format(wallet.granted.t / 1000) : "",
        larynxGrantingPower: wallet.granting?.t ? format(wallet.granting.t / 1000) : "",
        larynxLockedBalance: wallet.gov > 0 ? format(wallet.gov / 1000) : "",
        claim: format(wallet.claim / 1000),
        larynxPowerRate: "0.010",
        headBlock: wallet.head_block,
        powerDownList: Object.values(wallet.power_downs),
        delegatedItems: Object.entries(wallet.granted).filter(([name]) => name !== "t"),
        delegatingItems: Object.entries(wallet.granting).filter(([name]) => name !== "t")
      });

      this.fetchActiveUserWallet();
      this.setState({ estimatedBalance: await getEstimatedBalance(wallet) });

      const { raw, list } = await getMarkets();
      this.setState({
        markets: list,
        isNode: list.some((market) => market.name === this.props.account?.name),
        rateLPow: format(parseFloat(raw.stats.spk_rate_lpow) * 100),
        rateLDel: format(parseFloat(raw.stats.spk_rate_ldel) * 100),
        tokenBalance: format(
          (wallet.spk +
            rewardSpk(
              wallet,
              raw.stats || {
                spk_rate_lgov: "0.001",
                spk_rate_lpow: this.state.rateLPow,
                spk_rate_ldel: this.state.rateLDel
              }
            )) /
            1000
        )
      });
    } catch (e) {
      console.error(e);
    }
  }

  async fetchActiveUserWallet() {
    const format = (value: number) => value.toFixed(3);
    if (!this.props.isActiveUserWallet && this.props.activeUser) {
      const activeUserWallet = await getSpkWallet(this.props.activeUser?.username);
      this.setState({
        activeUserTokenBalance: format(activeUserWallet.spk / 1000),
        activeUserLarynxTokenBalance: format(activeUserWallet.balance / 1000)
      });
    }
  }

  render() {
    let balance = "0";

    switch (this.state.selectedAsset) {
      case "SPK":
        balance = +this.props.isActiveUserWallet
          ? this.state.tokenBalance
          : this.state.activeUserTokenBalance;
        break;
      case "LARYNX":
        if (["transfer", "powerup", "lock"].includes(this.state.selectedType)) {
          balance = +this.props.isActiveUserWallet
            ? this.state.larynxTokenBalance
            : this.state.activeUserLarynxTokenBalance;
        } else if (this.state.selectedType === "delegate") {
          balance = this.state.larynxPowerBalance;
        } else if (this.state.selectedType === "unlock") {
          balance = this.state.larynxLockedBalance;
        }
        break;
      case "LP":
        if (this.state.selectedType === "powerdown" || this.state.selectedType === "delegate") {
          balance = this.state.larynxPowerBalance;
        }
    }

    return (
      <div className="wallet-ecency wallet-spk">
        <div className="wallet-main">
          <div className="wallet-info">
            {+this.state.claim > 0 ? (
              <WalletSpkUnclaimedPoints
                claim={this.state.claim}
                claiming={false}
                asset={"LARYNX"}
                isActiveUserWallet={this.props.isActiveUserWallet}
                onClaim={() => this.claimRewards()}
              />
            ) : (
              <></>
            )}
            <WalletSpkSection
              {...this.props}
              title={_t("wallet.spk.token")}
              description={_t("wallet.spk.token-description")}
              amountSlot={<>{this.state.tokenBalance} SPK</>}
              items={[
                {
                  label: _t("wallet.transfer"),
                  onClick: () =>
                    this.setState({
                      sendSpkShow: true,
                      selectedAsset: "SPK",
                      selectedType: "transfer"
                    })
                }
              ]}
            />
            <WalletSpkSection
              {...this.props}
              isAlternative={true}
              title={_t("wallet.spk.larynx-token")}
              description={_t("wallet.spk.larynx-token-description")}
              amountSlot={<>{this.state.larynxTokenBalance} LARYNX</>}
              items={[
                {
                  label: _t("wallet.transfer"),
                  onClick: () =>
                    this.setState({
                      sendSpkShow: true,
                      selectedAsset: "LARYNX",
                      selectedType: "transfer"
                    })
                },
                ...(this.props.isActiveUserWallet
                  ? [
                      {
                        label: _t("wallet.power-up"),
                        onClick: () =>
                          this.setState({
                            sendSpkShow: true,
                            selectedAsset: "LARYNX",
                            selectedType: "powerup"
                          })
                      }
                    ]
                  : []),
                ...(this.props.isActiveUserWallet && +this.state.larynxTokenBalance > 0
                  ? [
                      {
                        label: _t("wallet.spk.lock.button"),
                        onClick: () =>
                          this.setState({
                            sendSpkShow: true,
                            selectedAsset: "LARYNX",
                            selectedType: "lock"
                          })
                      }
                    ]
                  : [])
              ]}
            />
            <WalletSpkLarynxPower
              {...this.props}
              rateLDel={this.state.rateLDel}
              rateLPow={this.state.rateLPow}
              larynxGrantedPower={this.state.larynxGrantedPower}
              larynxGrantingPower={this.state.larynxGrantingPower}
              headBlock={this.state.headBlock}
              powerDownList={this.state.powerDownList}
              onStop={() =>
                this.setState({
                  sendSpkShow: true,
                  selectedAsset: "LP",
                  selectedType: "powerdown",
                  prefilledAmount: "0"
                })
              }
              larynxPowerRate={this.state.larynxPowerRate}
              larynxPowerBalance={this.state.larynxPowerBalance}
              onDelegate={() =>
                this.setState({ sendSpkShow: true, selectedAsset: "LP", selectedType: "delegate" })
              }
              onPowerDown={() =>
                this.setState({ sendSpkShow: true, selectedAsset: "LP", selectedType: "powerdown" })
              }
              onDlpClick={() => this.setState({ delegatedPowerDialogShow: true })}
              onDlipClick={() => this.setState({ delegatingPowerDialogShow: true })}
            />
            {this.state.larynxLockedBalance && this.state.isNode ? (
              <WalletSpkLarynxLocked
                {...this.props}
                showActions={this.props.isActiveUserWallet && +this.state.larynxLockedBalance > 0}
                onUnlock={() =>
                  this.setState({
                    sendSpkShow: true,
                    selectedAsset: "LARYNX",
                    selectedType: "unlock"
                  })
                }
                larynxLockedBalance={this.state.larynxLockedBalance}
              />
            ) : (
              <></>
            )}
            <WalletSpkSection
              {...this.props}
              isAlternative={true}
              items={[]}
              title={_t("wallet.spk.account-value")}
              description={_t("wallet.spk.account-value-description")}
              amountSlot={<div className="amount amount-bold">${this.state.estimatedBalance}</div>}
            />
          </div>
          <WalletMenu global={this.props.global} username={this.props.account.name} active="spk" />
        </div>

        <SendSpkDialog
          markets={this.state.markets}
          prefilledAmount={this.state.prefilledAmount}
          prefilledTo={this.props.isActiveUserWallet ? "" : this.props.account.name}
          type={this.state.selectedType}
          asset={this.state.selectedAsset}
          transactions={this.props.transactions}
          global={this.props.global}
          account={this.props.account}
          show={this.state.sendSpkShow}
          setShow={(v: boolean) => this.setState({ sendSpkShow: v })}
          activeUser={this.props.activeUser}
          balance={balance}
          addAccount={this.props.addAccount}
          updateActiveUser={this.props.updateActiveUser}
          onFinish={() => this.fetch()}
        />

        <WalletSpkDelegatedPowerDialog
          show={this.state.delegatedPowerDialogShow}
          setShow={(value: boolean) => this.setState({ delegatedPowerDialogShow: value })}
          items={this.state.delegatedItems}
          global={this.props.global}
          history={this.props.history}
          addAccount={this.props.addAccount}
        />
        <WalletSpkDelegatedPowerDialog
          show={this.state.delegatingPowerDialogShow}
          setShow={(value: boolean) => this.setState({ delegatingPowerDialogShow: value })}
          items={this.state.delegatingItems}
          global={this.props.global}
          history={this.props.history}
          addAccount={this.props.addAccount}
        />
      </div>
    );
  }
}

export default (props: Props) => {
  return <WalletSpk {...props} />;
};
