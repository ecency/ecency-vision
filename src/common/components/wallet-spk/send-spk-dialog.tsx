import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { ActiveUser } from '../../store/active-user/types';
import './wallet-spk-dialog.scss';
import { Account } from '../../store/accounts/types';
import { WalletSpkSteps } from './wallet-spk-steps';
import { SendSpkDialogForm } from './dialog-steps/send-spk-dialog-form';
import { SendSpkDialogDelegateForm } from './dialog-steps/send-spk-dialog-delegate-form';
import { SendSpkDialogConfirm } from './dialog-steps/send-spk-dialog-confirm';
import { Global } from '../../store/global/types';
import numeral from 'numeral';
import { SendSpkDialogSign } from './dialog-steps/send-spk-dialog-sign';
import { SendSpkSuccess } from './dialog-steps/send-spk-success';
import { Transactions } from '../../store/transactions/types';
import { SendSpkDialogClaimForm } from './dialog-steps/send-spk-dialog-claim-form';

interface Props {
  global: Global;
  show: boolean;
  setShow: (value: boolean) => void;
  activeUser: ActiveUser | null;
  balance: string;
  account: Account;
  addAccount: (account: Account) => void;
  updateActiveUser: (account: Account) => void;
  onFinish: () => void;
  transactions: Transactions;
  asset: 'SPK' | 'LARYNX' | 'LP';
  type: 'transfer' | 'delegate' | 'claim';
  prefilledTo?: string;
}

export const SendSpkDialog = ({ global, show, setShow, activeUser, balance, addAccount, updateActiveUser, onFinish, transactions, asset, type, prefilledTo }: Props) => {
  const [username, setUsername] = useState(prefilledTo || '');
  const [amount, setAmount] = useState('0');
  const [memo, setMemo] = useState('');
  const [stepIndex, setStepIndex] = useState(0);

  const precision = (balance + "").split(".")[1]?.length || 3;

  const getTitle = () => {
    if (type === 'delegate') return 'wallet.spk.delegate.title';
    if (type === 'transfer') return 'wallet.spk.send.title';
    if (type === 'claim') return 'wallet.spk.claim.title';
    return '';
  };

  const getSubTitle = () => {
    if (type === 'delegate') return 'wallet.spk.delegate.subtitle';
    if (type === 'transfer') return 'wallet.spk.send.subtitle';
    return '';
  }

  const steps = [
    {
      title: getTitle(),
      subtitle: getSubTitle(),
      submit: () => {
        // make sure 3 decimals in amount
        const fixedAmount = formatNumber(amount, precision);
        setAmount(fixedAmount);
        setStepIndex(stepIndex + 1);
      }
    },
    {
      title: 'transfer.confirm-title',
      subtitle: 'transfer.confirm-sub-title',
      submit: () => {
        setStepIndex(stepIndex + 1);
      }
    },
    {
      title: 'trx-common.sign-title',
      subtitle: 'trx-common.sign-sub-title',
      submit: () => {}
    },
    {
      title: 'trx-common.success-title',
      subtitle: 'trx-common.success-sub-title',
      submit: () => {}
    }
  ];

  const formatNumber = (num: number | string, precision: number) => {
    const format = `0.${"0".repeat(precision)}`;

    return numeral(num).format(format, Math.floor); // round to floor
  };

  const clear = () => {
    setUsername(prefilledTo || '');
    setAmount('0');
    setMemo('');
    setStepIndex(0);
  }

  return <Modal
    animation={false}
    show={show}
    centered={true}
    onHide={() => {
      setShow(false);
      clear();
    }}
    keyboard={false}
    size="lg"
    className="send-spk-dialog modal-thin-header transfer-dialog-content">
    <Modal.Header closeButton={true}/>
    <Modal.Body>
      <WalletSpkSteps steps={steps} stepIndex={stepIndex}>
        <>
          {stepIndex === 0 && type === 'transfer' ? <SendSpkDialogForm
            transactions={transactions}
            username={username}
            activeUser={activeUser}
            amount={amount}
            balance={balance}
            memo={memo}
            setMemo={setMemo}
            setUsername={setUsername}
            setAmount={setAmount}
            submit={() => steps[stepIndex]?.submit()}
            asset={asset}
          /> : <></>}

          {stepIndex === 0 && type === 'delegate' ? <SendSpkDialogDelegateForm
            transactions={transactions}
            username={username}
            activeUser={activeUser}
            amount={amount}
            balance={balance}
            memo={memo}
            setMemo={setMemo}
            setUsername={setUsername}
            setAmount={setAmount}
            submit={() => steps[stepIndex]?.submit()}
            asset={asset}
          /> : <></>}

          {stepIndex ===0 && type === 'claim' ? <SendSpkDialogClaimForm
            activeUser={activeUser}
            submit={() => steps[stepIndex]?.submit()}
          /> : <></>}

          {stepIndex === 1 ? <SendSpkDialogConfirm
            global={global}
            title={`${type}-title`}
            activeUser={activeUser}
            showTo={type !== 'claim'}
            to={username}
            memo={memo}
            amount={amount}
            asset={asset}
            back={() => setStepIndex(stepIndex - 1)}
            confirm={() => steps[stepIndex]?.submit()}
          /> : <></>}
          {stepIndex === 2 ? <SendSpkDialogSign
            global={global}
            asset={asset}
            mode={type}
            memo={memo}
            activeUser={activeUser}
            onBack={() => setStepIndex(stepIndex - 1)}
            setNextStep={() => setStepIndex(stepIndex + 1)}
            to={username}
            amount={amount}
            addAccount={addAccount}
            updateActiveUser={updateActiveUser}
          /> : <></>}
          {stepIndex === 3 ? <SendSpkSuccess
            amount={amount}
            activeUser={activeUser}
            asset={asset}
            reset={() => clear()}
            onFinish={() => {
              setShow(false);
              clear();
              onFinish();
            }}
            to={username}
            mode={type}
          /> : <></>}
        </>
      </WalletSpkSteps>
    </Modal.Body>
  </Modal>
}