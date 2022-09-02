import { WalletSpkGroup } from '../wallet-spk-group';
import { Alert, Button, Form, InputGroup } from 'react-bootstrap';
import { SearchByUsername } from '../../search-by-username';
import { _t } from '../../../i18n';
import React from 'react';
import { ActiveUser } from '../../../store/active-user/types';

interface Props {
  activeUser: ActiveUser | null;
  username: string;
  amount: string;
  balance: number;
  memo: string;
  setMemo: (value: string) => void;
  setUsername: (value: string) => void;
  setAmount: (value: string) => void;
  submit: Function;
}

export const SendSpkDialogForm = ({ activeUser, amount, setUsername, setAmount, balance, memo, setMemo, submit, username }: Props) => {
  return <>
    <WalletSpkGroup label="wallet.spk.send.from">
      <InputGroup>
        <InputGroup.Prepend>
          <InputGroup.Text>@</InputGroup.Text>
        </InputGroup.Prepend>
        <Form.Control
          type="text"
          autoFocus={true}
          placeholder=""
          value={activeUser!.username}
          onChange={() => {
          }}
        />
      </InputGroup>
    </WalletSpkGroup>
    <WalletSpkGroup label="wallet.spk.send.to">
      <SearchByUsername
        activeUser={activeUser}
        excludeActiveUser={true}
        setUsername={setUsername}
      />
    </WalletSpkGroup>
    <WalletSpkGroup label="wallet.spk.send.amount">
      <InputGroup>
        <Form.Control
          type="text"
          autoFocus={true}
          placeholder=""
          value={amount}
          onChange={((event) => setAmount(event.target.value))}
        />
        <div className="align-self-center ml-1">SPK</div>
      </InputGroup>
    </WalletSpkGroup>
    {+amount > balance ? <Alert className="mt-3" variant={'warning'}>{_t('wallet.spk.send.warning')}</Alert> : <></>}

    <WalletSpkGroup label="wallet.spk.send.memo">
      <Form.Control
        type="text"
        autoFocus={true}
        placeholder=""
        value={memo}
        onChange={((event) => setMemo(event.target.value))}
      />
    </WalletSpkGroup>
    <WalletSpkGroup label="">
      <Button
        disabled={!amount || !username}
        variant={'primary'}
        onClick={() => submit()}
      >{_t('wallet.spk.send.next')}</Button>
    </WalletSpkGroup>
  </>
}