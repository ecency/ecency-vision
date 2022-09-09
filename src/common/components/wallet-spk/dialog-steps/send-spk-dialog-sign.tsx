import React, { useState } from 'react';
import KeyOrHot from '../../key-or-hot';
import { Global } from '../../../store/global/types';
import { ActiveUser } from '../../../store/active-user/types';
import { Button } from 'react-bootstrap';
import { _t } from '../../../i18n';
import { formatError } from '../../../api/operations';
import { getAccountFull } from '../../../api/hive';
import { error } from '../../feedback';
import { PrivateKey } from '@hiveio/dhive';
import { Account } from '../../../store/accounts/types';
import { sendSpk, transferSpkByKc, transferSpkByKey } from '../../../api/spk-api';

interface Props {
  global: Global;
  activeUser: ActiveUser | null;
  onBack: () => void;
  amount: string;
  asset: string;
  memo: string;
  mode: 'transfer' | 'delegate' | 'undelegate' | 'stake' | 'unstake';
  setNextStep: () => void;
  to: string;
  addAccount: (account: Account) => void;
  updateActiveUser: (account: Account) => void;
  username: string;
}

export const SendSpkDialogSign = ({ global, activeUser, onBack, amount, asset, memo, mode, setNextStep, to, addAccount, updateActiveUser, username }: Props) => {
  const [inProgress, setInProgress] = useState(false);
  const [signingKey, setSigningKey] = useState('');

  const sign = async (key: PrivateKey) => {
    const username = activeUser?.username!;

    let promise: Promise<any>;
    switch (mode) {
      case 'transfer':
        // Perform HE operation
        promise = transferSpkByKey(username, key, to, amount, memo);
        break;
      case 'delegate':
        break;
      case 'undelegate':
        break;
      case 'stake':
        break;
      case 'unstake':
        break;
      default:
        return;
    }

    await afterSign();
  }

  const signHs = () => {
    sendSpk(activeUser!.username, username, amount, memo);
  }

  const signKs = async () => {
    const username = activeUser?.username!;

    let promise: Promise<any>;
    switch (mode) {
      case 'transfer':
        // Perform HE operation
        promise = transferSpkByKc(username, to, amount, memo);
        break;
      case 'delegate':
        break;
      case 'undelegate':
        break;
      case 'stake':
        break;
      case 'unstake':
        break;
      default:
        return;
    }

    await afterSign();
  }

  const afterSign = async () => {
    setInProgress(true);
    try {
      // @ts-ignore
      await promise;
      const a = await getAccountFull(activeUser!.username);
      addAccount(a);
      updateActiveUser(a);
      setNextStep();
    } catch (e) {
      error(...formatError(e));
    } finally {
      setInProgress(false);
    }
  }

  return <div className="d-flex flex-column align-items-center">
    <KeyOrHot
      global={global}
      activeUser={activeUser!}
      signingKey={signingKey}
      setSigningKey={setSigningKey}
      inProgress={inProgress}
      onKey={(key: PrivateKey) => sign(key)}
      onHot={signHs}
      onKc={signKs}
    />

    <Button variant="outline-secondary" disabled={inProgress} onClick={() => onBack()}>
      {_t('g.back')}
    </Button>
  </div>
}