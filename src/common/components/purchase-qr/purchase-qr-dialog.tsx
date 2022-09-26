import { Modal } from "react-bootstrap";
import React from "react";
import { PurchaseQrBuilder } from "./purchase-qr-builder";
import "./purchase-qr-dialog.scss";
import { ActiveUser } from "../../store/active-user/types";
import { Location } from "history";
import { PurchaseTypes } from "./purchase-types";
import { _t } from "../../i18n";

interface Props {
  show: boolean;
  setShow: (val: boolean) => void;
  activeUser: ActiveUser | null;
  location?: Location;
  type?: PurchaseTypes;
}

export const PurchaseQrDialog = ({ show, setShow, activeUser, location, type }: Props) => {
  return (
    <Modal
      animation={false}
      show={show}
      centered={true}
      onHide={setShow}
      keyboard={false}
      className="purchase-qr-dialog"
    >
      <Modal.Header closeButton={true}>
        <Modal.Title>
          {type === PurchaseTypes.POINTS ? _t("purchase-qr.title-points") : _t("purchase-qr.title")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <PurchaseQrBuilder
          activeUser={activeUser}
          location={location}
          queryType={type || PurchaseTypes.BOOST}
        />
      </Modal.Body>
    </Modal>
  );
};
