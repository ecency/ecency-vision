import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Form, InputGroup } from 'react-bootstrap';
import { _t } from '../../i18n';
import { lookupAccounts } from '../../api/hive';
import { error, success } from '../feedback';
import { formatError } from '../../api/operations';
import qrcode from 'qrcode';
import { copyContent } from '../../img/svg';
import { ActiveUser } from '../../store/active-user/types';
import defaults from '../../constants/defaults.json';
import { PurchaseQrUsername } from './purchase-qr-username';
import { PurchaseTypes } from './purchase-types';
import { PurchaseQrTypes } from './purchase-qr-types';
import { Location } from 'history';

interface Props {
  activeUser: ActiveUser | null;
  location?: Location;
  queryType?: PurchaseTypes;
}

export const PurchaseQrBuilder = ({ activeUser, queryType }: Props) => {
  const [username, setUsername] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [usernameData, setUsernameData] = useState<string[]>([]);
  const [isUsernameDataLoading, setIsUsernameDataLoading] = useState(false);
  const [timer, setTimer] = useState<any>(null);
  const qrImgRef = useRef<HTMLImageElement | undefined>();
  const [isQrShow, setIsQrShow] = useState(false);
  const [isActiveUserSet, setIsActiveUserSet] = useState(false);
  const [type, setType] = useState(PurchaseTypes.BOOST);
  const [pointsValue, setPointsValue] = useState('999points');

  useEffect(() => {
    if (queryType) {
      setType(queryType);
    }
  }, [queryType]);

  useEffect(() => {
    if (!usernameInput) {
      setUsername('');
      setIsQrShow(false);
    }
    fetchUsernameData(usernameInput);
  }, [usernameInput]);

  useEffect(() => {
    if (username) {
      compileQR(getURL());
    }
  }, [username, type, pointsValue]);

  useEffect(() => {
    if (activeUser) {
      setIsActiveUserSet(true);
      setUsername(activeUser.username);
      setUsernameInput(activeUser.username);
      compileQR(getURL());
    }
  }, [activeUser]);

  const fetchUsernameData = (query: string) => {
    if (timer) {
      clearTimeout(timer);
    }

    if (usernameInput === '' || isActiveUserSet) {
      setIsActiveUserSet(false);
      setIsUsernameDataLoading(false);
      return;
    }

    setIsUsernameDataLoading(true);
    setTimer(setTimeout(() => getUsernameData(query), 500));
  };

  const getUsernameData = async (query: string) => {
    try {
      const resp = await lookupAccounts(query, 5);
      if (resp) {
        setUsernameData(resp);
      }
    } catch (e) {
      error(...formatError(e));
    } finally {
      setIsUsernameDataLoading(false);
    }
  }

  const compileQR = async (url: string) => {
    if (qrImgRef.current) {
      qrImgRef.current.src = await qrcode.toDataURL(url, { width: 300 });
      setIsQrShow(true);
    }
  };

  const copyToClipboard = (text: string) => {
    const textField = document.createElement('textarea');
    textField.innerText = text;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand('copy');
    textField.remove();
    success(_t('purchase-qr.copied'));
  };

  const getURL = () =>`${defaults.base}/purchase?username=${username}&type=${type}&product_id=${pointsValue}`;

  return <div className="d-flex flex-column align-items-center my-3 px-3 text-center">
    <h2>{isQrShow ? _t('purchase-qr.scan-code') : _t('purchase-qr.select-user')}</h2>
    <div className="w-100 mt-4">
      <PurchaseQrUsername
        usernameData={usernameData}
        usernameInput={usernameInput}
        setUsernameInput={setUsernameInput}
        isUsernameDataLoading={isUsernameDataLoading}
        setUsername={setUsername}
      />
      {type === PurchaseTypes.POINTS ? <PurchaseQrTypes
        className="mt-3"
        value={pointsValue}
        setValue={(v: string) => setPointsValue(v)}
      /> : <></>}
    </div>
    <img ref={qrImgRef as any} alt="Boost QR Code" className="my-4" style={{ display: isQrShow ? 'block' : 'none' }} />
    {isQrShow ? <Form.Group className="w-100">
      <InputGroup
        onClick={() => copyToClipboard(getURL())}
      >
        <Form.Control
          value={getURL()}
          disabled={true}
          className="text-primary pointer"
        />
        <InputGroup.Append>
          <Button
            variant="primary"
            size="sm"
            className="copy-to-clipboard"
            onClick={() => copyToClipboard(getURL())}
          >
            {copyContent}
          </Button>
        </InputGroup.Append>
      </InputGroup>
    </Form.Group> : <></>}
    {type === PurchaseTypes.BOOST && isQrShow ?
      <Alert variant={"primary"} className="text-left mt-3 mb-0 text-small">{_t('purchase-qr.boost-info')}</Alert> :
      <></>}
  </div>
}