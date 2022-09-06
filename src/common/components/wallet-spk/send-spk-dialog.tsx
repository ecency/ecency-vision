import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { ActiveUser } from '../../store/active-user/types';
import './wallet-spk-dialog.scss';
import { Account } from '../../store/accounts/types';
import { WalletSpkSteps } from './wallet-spk-steps';
import { SendSpkDialogForm } from './dialog-steps/send-spk-dialog-form';
import { SendSpkDialogConfirm } from './dialog-steps/send-spk-dialog-confirm';
import { Global } from '../../store/global/types';
import numeral from 'numeral';
import { SendSpkDialogSign } from './dialog-steps/send-spk-dialog-sign';
import { SendSpkSuccess } from './dialog-steps/send-spk-success';
import { Transactions } from '../../store/transactions/types';

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
}

export const SendSpkDialog = ({ global, show, setShow, activeUser, balance, addAccount, updateActiveUser, onFinish, transactions }: Props) => {
  const [username, setUsername] = useState('');
  const [amount, setAmount] = useState('0');
  const [memo, setMemo] = useState('');
  const [stepIndex, setStepIndex] = useState(0);

  const precision = (balance + "").split(".")[1]?.length || 3;
  const steps = [
    {
      title: 'wallet.spk.send.title',
      subtitle: 'wallet.spk.send.subtitle',
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
    setUsername('');
    setAmount('');
    setMemo('');
    setStepIndex(0);
  }

  return <Modal
    animation={false}
    show={show}
    centered={true}
    onHide={setShow}
    keyboard={false}
    size="lg"
    className="send-spk-dialog modal-thin-header transfer-dialog-content">
    <Modal.Header closeButton={true}/>
    <Modal.Body>
      <WalletSpkSteps steps={steps} stepIndex={stepIndex}>
        <>
          {stepIndex === 0 ? <SendSpkDialogForm
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
            asset="SPK"
          /> : <></>}

          {stepIndex === 1 ? <SendSpkDialogConfirm
            global={global}
            title="transfer-title"
            activeUser={activeUser}
            showTo={true}
            to={username}
            memo={memo}
            amount={amount}
            asset="SPK"
            back={() => setStepIndex(stepIndex - 1)}
            confirm={() => steps[stepIndex]?.submit()}
          /> : <></>}
          {stepIndex === 2 ? <SendSpkDialogSign
            username={username}
            global={global}
            asset="SPK"
            mode="transfer"
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
            asset="SPK"
            reset={() => clear()}
            onFinish={() => {
              setShow(false);
              clear();
              onFinish();
            }}
            to={username}
            mode="transfer"
          /> : <></>}
        </>
      </WalletSpkSteps>
    </Modal.Body>
  </Modal>
}