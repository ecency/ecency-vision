import { Modal } from 'react-bootstrap';
import { _t } from '../../i18n';
import React from 'react';
import { PurchaseQrBuilder } from './purchase-qr-builder';

interface Props {
  show: boolean;
  setShow: (val: boolean) => void;
}

export const PurchaseQrDialog = ({ show, setShow }: Props) => {
  return <Modal animation={false} show={show} centered={true} onHide={setShow} keyboard={false}
                className="edit-history-dialog">
    <Modal.Header closeButton={true}>
      <Modal.Title>{_t('purchase-qr.title')}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <PurchaseQrBuilder />
    </Modal.Body>
  </Modal>
}