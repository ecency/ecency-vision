import React from 'react';
import WalletMenu from '../wallet-menu';
import { Global } from '../../store/global/types';
import { Account } from '../../store/accounts/types';
import { _t } from '../../i18n';

interface Props {
  global: Global;
  account: Account;
}

export const WalletSpk = ({ global, account }: Props) => {
  return <div className="wallet-hive">
    <div className="wallet-main">
      <div className="wallet-info">
        <div className="balance-row hive">
          <div className="balance-info">
            <div className="title">{_t("wallet.spk.token")}</div>
            <div className="description">{_t("wallet.spk.token-description")}</div>
          </div>
          <div className="balance-values">
            <div className="amount">123</div>
          </div>
        </div>

        <div className="balance-row hive alternative">
          <div className="balance-info">
            <div className="title">{_t("wallet.spk.larynx-air")}</div>
            <div className="description">{_t("wallet.spk.larynx-air-description")}</div>
            <div className="warning">{_t("wallet.spk.larynx-air-warning")}</div>
          </div>
          <div className="balance-values">
            <div className="amount">123</div>
          </div>
        </div>

        <div className="balance-row hive">
          <div className="balance-info">
            <div className="title">{_t("wallet.spk.larynx-token")}</div>
            <div className="description">{_t("wallet.spk.larynx-token-description")}</div>
          </div>
          <div className="balance-values">
            <div className="amount">123</div>
          </div>
        </div>

        <div className="balance-row hive alternative">
          <div className="balance-info">
            <div className="title">{_t("wallet.spk.larynx-power")}</div>
            <div className="description">{_t("wallet.spk.larynx-power-description")}</div>
            <div className="menu">
              <p>{_t("wallet.spk.larynx-power-benefits.title")}</p>
              <ul>
                <li>{_t("wallet.spk.larynx-power-benefits.1")}</li>
                <li>{_t("wallet.spk.larynx-power-benefits.2")}</li>
                <li>{_t("wallet.spk.larynx-power-benefits.3")}</li>
                <li>{_t("wallet.spk.larynx-power-benefits.4")}</li>
                <li>{_t("wallet.spk.larynx-power-benefits.5")}</li>
              </ul>
            </div>
          </div>
          <div className="balance-values">
            <div className="amount">123</div>
          </div>
        </div>

        <div className="balance-row hive">
          <div className="balance-info">
            <div className="title">{_t("wallet.spk.account-value")}</div>
            <div className="description">{_t("wallet.account-value-description")}</div>
          </div>
          <div className="balance-values">
            <div className="amount">123</div>
          </div>
        </div>
      </div>
      <WalletMenu global={global} username={account.name} active="spk"/>
    </div>
  </div>
}