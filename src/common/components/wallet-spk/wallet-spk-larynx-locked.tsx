import { _t } from '../../i18n';
import { WalletSpkSection } from './wallet-spk-section';
import React from 'react';
import { Props } from './index';

interface ComponentProps {
  larynxLockedBalance: string;
}

export const WalletSpkLarynxLocked = (props: Props & ComponentProps) => {
  return <WalletSpkSection
    {...props}
    title={_t('wallet.spk.larynx-locked')}
    description={_t('wallet.spk.larynx-locked-description')}
    slot={<div className="description menu">
      <p>{_t('wallet.spk.larynx-locked-benefits.title')}</p>
      <ul>
        <li>{_t('wallet.spk.larynx-locked-benefits.1')}</li>
        <li>{_t('wallet.spk.larynx-locked-benefits.2')}</li>
        <li>{_t('wallet.spk.larynx-locked-benefits.3')}</li>
        <li>{_t('wallet.spk.larynx-locked-benefits.4')}</li>
        <li>{_t('wallet.spk.larynx-locked-benefits.5')}</li>
      </ul>
    </div>}
    amountSlot={<>{props.larynxLockedBalance} LARYNX</>}
    items={[]}
  />
}