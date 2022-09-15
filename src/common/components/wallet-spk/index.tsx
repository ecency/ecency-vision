import React, { Component } from "react";
import WalletMenu from "../wallet-menu";
import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import { _t } from "../../i18n";
import { getHivePrice, getMarkets, getSpkWallet, Market, rewardSpk } from "../../api/spk-api";
import { WalletSpkSection } from "./wallet-spk-section";
import { SendSpkDialog } from "./send-spk-dialog";
import { ActiveUser } from "../../store/active-user/types";
import { History } from "history";
import { Transactions } from "../../store/transactions/types";
import { WalletSpkLarynxPower } from "./wallet-spk-larynx-power";
import { WalletSpkLarynxLocked } from "./wallet-spk-larynx-locked";
import { WalletSpkUnclaimedPoints } from "./wallet-spk-unclaimed-points";
import { WalletSpkDelegatedPowerDialog } from "./wallet-spk-delegated-power-dialog";

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

interface State {
  tokenBalance: string;
  larynxAirBalance: string;
  larynxTokenBalance: string;
  larynxPowerBalance: string;
  estimatedBalance: string;
  larynxPowerRate: string;
  larynxPowerTotal: string;
  larynxLockedBalance: string;
  sendSpkShow: boolean;
  delegatedPowerDialogShow: boolean;
  selectedAsset: "SPK" | "LARYNX" | "LP";
  selectedType: "transfer" | "delegate" | "claim" | "powerup" | "powerdown";
  claim: string;
  headBlock: number;
  powerDownList: string[];
  prefilledAmount: string;
  markets: Market[];
  isNode: boolean;
  delegatedItems: [string, number][];
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
      estimatedBalance: "0",
      larynxPowerRate: "0",
      larynxPowerTotal: "",
      larynxLockedBalance: "",
      sendSpkShow: false,
      delegatedPowerDialogShow: false,
      selectedAsset: "SPK",
      selectedType: "transfer",
      claim: "0",
      headBlock: 0,
      powerDownList: [],
      prefilledAmount: "",
      markets: [],
      isNode: false,
      delegatedItems: [],
      rateLPow: "0.0001",
      rateLDel: "0.00015"
    };
  }

  componentDidMount() {
    this.fetch();
  }

  async fetch() {
    try {
      const wallet = await getSpkWallet(this.props.account.name);
      const format = (value: number) => value.toFixed(3);
      this.setState({
        tokenBalance: format(wallet.spk / 1000),
        larynxAirBalance: format(wallet.drop.availible.amount / 1000),
        larynxTokenBalance: format(wallet.balance / 1000),
        larynxPowerBalance: format(wallet.poweredUp / 1000),
        larynxPowerTotal: wallet.granted?.t ? format(wallet.granted.t / 1000) : "",
        larynxLockedBalance: wallet.gov > 0 ? format(wallet.gov / 1000) : "",
        claim: format(wallet.claim / 1000),
        larynxPowerRate: "0.010",
        headBlock: wallet.head_block,
        powerDownList: Object.values(wallet.power_downs),
        delegatedItems: Object.entries(wallet.granted).filter(([name]) => name !== "t")
      });

      const hivePrice = await getHivePrice();
      this.setState({
        estimatedBalance: (
          ((wallet.gov + wallet.poweredUp + wallet.claim + wallet.spk + wallet.balance) / 1000) *
          +wallet.tick *
          hivePrice.hive.usd
        ).toFixed(2)
      });

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

  render() {
    let balance = "0";

    switch (this.state.selectedAsset) {
      case "SPK":
        balance = this.state.tokenBalance;
        break;
      case "LARYNX":
        if (this.state.selectedType === "transfer") {
          balance = this.state.larynxTokenBalance;
        } else if (this.state.selectedType === "delegate") {
          balance = this.state.larynxPowerBalance;
        } else if (this.state.selectedType === "powerup") {
          balance = this.state.larynxTokenBalance;
        }
        break;
      case "LP":
        if (this.state.selectedType === "powerdown") {
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
                onClaim={() =>
                  this.setState({
                    sendSpkShow: true,
                    selectedAsset: "LARYNX",
                    selectedType: "claim"
                  })
                }
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
                {
                  label: _t("wallet.power-up"),
                  onClick: () =>
                    this.setState({
                      sendSpkShow: true,
                      selectedAsset: "LARYNX",
                      selectedType: "powerup"
                    })
                }
              ]}
            />
            {this.state.larynxLockedBalance && this.state.isNode ? (
              <WalletSpkLarynxLocked
                {...this.props}
                larynxLockedBalance={this.state.larynxLockedBalance}
              />
            ) : (
              <></>
            )}
            <WalletSpkLarynxPower
              {...this.props}
              rateLDel={this.state.rateLDel}
              rateLPow={this.state.rateLPow}
              larynxPowerTotal={this.state.larynxPowerTotal}
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
            />
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
      </div>
    );
  }
}

export default (props: Props) => {
  return <WalletSpk {...props} />;
};
