import React from "react";
import { PurchaseQrBuilder } from "./purchase-qr-builder";
import "./purchase-qr-dialog.scss";
import { ActiveUser } from "../../store/active-user/types";
import { Location } from "history";
import { PurchaseTypes } from "./purchase-types";
import { _t } from "../../i18n";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "../modal";

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
      onHide={() => setShow(false)}
      keyboard={false}
      className="purchase-qr-dialog"
    >
      <ModalHeader closeButton={true}>
        <ModalTitle>
          {type === PurchaseTypes.POINTS ? _t("purchase-qr.title-points") : _t("purchase-qr.title")}
        </ModalTitle>
      </ModalHeader>
      <ModalBody>
        <PurchaseQrBuilder
          activeUser={activeUser}
          location={location}
          queryType={type || PurchaseTypes.BOOST}
        />
      </ModalBody>
    </Modal>
  );
};
