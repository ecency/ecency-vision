import { Modal } from 'react-bootstrap';
import { _t } from '../../i18n';
import React, { useEffect, useState } from 'react';
import { PurchaseQrBuilder } from './purchase-qr-builder';
import './purchase-qr-dialog.scss';
import { ActiveUser } from '../../store/active-user/types';
import { Location } from 'history';
import queryString from 'query-string';
import routes from '../../routes';

interface Props {
  show: boolean;
  setShow: (val: boolean) => void;
  activeUser: ActiveUser | null;
  location: Location;
}

export const PurchaseQrDialog = ({ show, setShow, activeUser, location }: Props) => {
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    const params = queryString.parse(location.search);
    const hasAtLeastOneShow = Array.from(document.querySelectorAll('.purchase-qr-dialog').values())
      .some(dialog => (dialog as HTMLElement).style.display === 'block');
    if (location.pathname === routes.PURCHASE && params.username && !hasAtLeastOneShow) {
      setUsername(params.username as string);
      setShow(true);
    }
  }, [location]);

  return <Modal
    animation={false}
    show={show}
    centered={true}
    onHide={setShow}
    keyboard={false}
    className="purchase-qr-dialog">
    <Modal.Header closeButton={true}>
      <Modal.Title>{_t('purchase-qr.title')}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <PurchaseQrBuilder activeUser={username ? { username } as ActiveUser : activeUser} />
    </Modal.Body>
  </Modal>
}