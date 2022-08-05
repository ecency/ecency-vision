import { Modal } from 'react-bootstrap';
import { _t } from '../../i18n';
import React from 'react';
import { PurchaseQrBuilder } from './purchase-qr-builder';
import './purchase-qr-dialog.scss';
import { ActiveUser } from '../../store/active-user/types';
import { Location } from 'history';

interface Props {
  show: boolean;
  setShow: (val: boolean) => void;
  activeUser: ActiveUser | null;
  location: Location;
}

export const PurchaseQrDialog = ({ show, setShow, activeUser }: Props) => {
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
      <PurchaseQrBuilder activeUser={activeUser} />
    </Modal.Body>
  </Modal>
}