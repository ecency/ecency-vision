import React, { useEffect, useRef, useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { _t } from '../../i18n';
import SuggestionList from '../suggestion-list';
import userAvatar from '../user-avatar';
import { lookupAccounts } from '../../api/hive';
import { error } from '../feedback';
import { formatError } from '../../api/operations';
import qrcode from 'qrcode';

export const PurchaseQrBuilder = () => {
  const [username, setUsername] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [usernameData, setUsernameData] = useState<string[]>([]);
  const [isUsernameDataLoading, setIsUsernameDataLoading] = useState(false);
  const [timer, setTimer] = useState<any>(null);
  const qrImgRef = useRef<HTMLImageElement | undefined>();
  const [isQrShow, setIsQrShow] = useState(false);

  useEffect(() => {
    if (!usernameInput) {
      setUsername('');
      setIsQrShow(false);
    }
    fetchUsernameData(usernameInput);
  }, [usernameInput]);

  useEffect(() => {
    if (username) {
      compileQR(`${window.location.hostname}/purchase?username=${username}&type=boost`);
    }
  }, [username]);

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

    if (usernameInput === '') {
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

  return <div className="d-flex flex-column align-items-center my-5 px-3 text-center">
    <h2>{isQrShow ? _t('purchase-qr.scan-code') : _t('purchase-qr.select-user')}</h2>
    <div className="mt-4">
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
            placeholder={_t('transfer.to-placeholder')}
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
          />
        </InputGroup>
      </SuggestionList>
    </div>
    <img ref={qrImgRef as any} alt="Boost QR Code" className="mt-5" style={{ display: isQrShow ? 'block' : 'none' }} />
  </div>
}