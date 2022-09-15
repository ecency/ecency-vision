import React from 'react';
import { _t } from '../../i18n';
import { WalletSpkActivePowerDown } from './wallet-spk-active-power-down';
import { WalletSpkSection } from './wallet-spk-section';
import { Props } from './index';

interface ComponentProps {
  headBlock: number;
  powerDownList: string[];
  onStop: () => void;
  larynxPowerRate: string;
  larynxPowerBalance: string;
  larynxPowerTotal: string;
  isActiveUserWallet: boolean;
  onDelegate: () => void;
  onPowerDown: () => void;
}

export const WalletSpkLarynxPower = (props: Props & ComponentProps) => {
  return <WalletSpkSection
    {...props}
    title={_t('wallet.spk.larynx-power')}
    description={_t('wallet.spk.larynx-power-description')}
    slot={<>
      <div className="description menu">
        <p>{_t('wallet.spk.larynx-power-benefits.title')}</p>
        <ul>
          <li>{_t('wallet.spk.larynx-power-benefits.1')}</li>
          <li>{_t('wallet.spk.larynx-power-benefits.2')}</li>
          <li>{_t('wallet.spk.larynx-power-benefits.3')}</li>
          <li>{_t('wallet.spk.larynx-power-benefits.4')}</li>
          <li>{_t('wallet.spk.larynx-power-benefits.5')}</li>
        </ul>
      </div>
      {props.isActiveUserWallet ? <WalletSpkActivePowerDown
        headBlock={props.headBlock}
        powerUpList={props.powerDownList}
        onStop={props.onStop}
      /> : <></>}
    </>}
    amountSlot={<div><div>{props.larynxPowerBalance} LP</div>
      {props.larynxPowerTotal ? <div>{props.larynxPowerTotal} DLP</div> : <></>}
    </div>}
    showItems={props.isActiveUserWallet}
    items={[
      {
        label: _t('wallet.delegate'),
        onClick: props.onDelegate
      },
      {
        label: _t('wallet.power-down'),
        onClick: props.onPowerDown
      }
    ]}
  />
}