import React, { useState } from 'react';
import { Button, Form, InputGroup, Modal } from 'react-bootstrap';
import { _t } from '../../i18n';
import { SearchByUsername } from '../search-by-username';
import { ActiveUser } from '../../store/active-user/types';
import './wallet-spk-dialog.scss';
import { sendSpk } from '../../api/spk-api';
import { Account } from '../../store/accounts/types';

interface Props {
  show: boolean;
  setShow: (value: boolean) => void;
  activeUser: ActiveUser | null;
  balance: number;
  account: Account;
}

export const SendSpkDialog = ({ show, setShow, activeUser, balance, account }: Props) => {
  const [username, setUsername] = useState('');
  const [amount, setAmount] = useState(0);
  const [memo, setMemo] = useState('');

  const send = async () => {
    await sendSpk(account.name, username, amount, memo);
  }

  return <Modal
    animation={false}
    show={show}
    centered={true}
    onHide={setShow}
    keyboard={false}
    className="send-spk-dialog">
    <Modal.Header closeButton={true}>
      <Modal.Title>{_t('wallet.spk.send-spk')}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form.Group className={'mb-3'}>
        <Form.Label>{_t('wallet.spk.send.from')}</Form.Label>
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
      </Form.Group>

      <Form.Group className={'mb-3'}>
        <Form.Label>{_t('wallet.spk.send.to')}</Form.Label>
        <SearchByUsername
          activeUser={activeUser}
          excludeActiveUser={true}
          setUsername={setUsername}
        />
      </Form.Group>

      <Form.Group className={'mb-3'}>
        <Form.Label>{_t('wallet.spk.send.amount')}({_t('wallet.spk.send.balance')} {balance} SPK)</Form.Label>
        <InputGroup>
          <Form.Control
            type="number"
            autoFocus={true}
            placeholder=""
            value={amount}
            onChange={((event) => setAmount(+event.target.value))}
          />
          <InputGroup.Append>
            <InputGroup.Text>SPK</InputGroup.Text>
          </InputGroup.Append>
        </InputGroup>
      </Form.Group>

      <Form.Group className={'mb-3'}>
        <Form.Label>Memo({_t('wallet.spk.send.optional')})</Form.Label>
        <Form.Control
          type="text"
          autoFocus={true}
          placeholder=""
          value={memo}
          onChange={((event) => setMemo(event.target.value))}
        />
      </Form.Group>

      <Form.Group className={'justify-content-end d-flex'}>
        <Button
          disabled={!amount || !username}
          variant={'primary'}
          onClick={send}
        >{_t('wallet.spk.send.button')}</Button>
      </Form.Group>
    </Modal.Body>
  </Modal>
}