import React, { useEffect, useRef, useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { _t } from '../../i18n';
import SuggestionList from '../suggestion-list';
import userAvatar from '../user-avatar';
import { lookupAccounts } from '../../api/hive';
import { error, success } from '../feedback';
import { formatError } from '../../api/operations';
import qrcode from 'qrcode';
import { copyContent } from '../../img/svg';
import { ActiveUser } from '../../store/active-user/types';
import defaults from "../../constants/defaults.json";

interface Props {
  activeUser: ActiveUser | null;
}

export const PurchaseQrBuilder = ({ activeUser }: Props) => {
  const [username, setUsername] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [usernameData, setUsernameData] = useState<string[]>([]);
  const [isUsernameDataLoading, setIsUsernameDataLoading] = useState(false);
  const [timer, setTimer] = useState<any>(null);
  const qrImgRef = useRef<HTMLImageElement | undefined>();
  const [isQrShow, setIsQrShow] = useState(false);
  const [isActiveUserSet, setIsActiveUserSet] = useState(false);

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
  }, [username]);

  useEffect(() => {
    if (activeUser) {
      setIsActiveUserSet(true);
      setUsername(activeUser.username);
      setUsernameInput(activeUser.username);
      compileQR(getURL());
    }
  }, [activeUser]);

  const suggestionProps = {
    renderer: (i: any) => {
      return (
        <>
          {userAvatar({
            username: i.name || i,
            size: 'medium',
            global: {} as any,
          })}{' '}
          <span style={{ marginLeft: '4px' }}>{i}</span>
        </>
      );
    },
    onSelect: (selectedText: any) => {
      setUsername(selectedText);
    }
  };

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
      error(formatError(e));
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

  const getURL = () =>`${defaults.base}/purchase?username=${username}&type=boost`;

  return <div className="d-flex flex-column align-items-center my-5 px-3 text-center">
    <h2>{isQrShow ? _t('purchase-qr.scan-code') : _t('purchase-qr.select-user')}</h2>
    <div className="w-100 mt-4">
      <SuggestionList items={usernameData} {...suggestionProps}>
        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text>
              {isUsernameDataLoading ? (
                <div
                  className="spinner-border text-primary spinner-border-sm"
                  role="status"
                >
                  <span className="sr-only">{_t('g.loading')}</span>
                </div>
              ) : (
                '@'
              )}
            </InputGroup.Text>
          </InputGroup.Prepend>
          <Form.Control
            type="text"
            autoFocus={true}
            placeholder=""
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
          />
        </InputGroup>
      </SuggestionList>
    </div>
    <img ref={qrImgRef as any} alt="Boost QR Code" className="my-4" style={{ display: isQrShow ? 'block' : 'none' }} />
    {isQrShow ? <Form.Group className="w-100">
      <InputGroup
        className="mb-3"
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
  </div>
}