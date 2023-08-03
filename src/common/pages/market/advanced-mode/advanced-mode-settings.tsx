import { Button, FormControl, FormGroup, FormLabel } from "react-bootstrap";
import React, { useState } from "react";
import { settingsSvg } from "../../../img/svg";
import { _t } from "../../../i18n";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@ui/modal";

interface Props {
  updateRate: number;
  setUpdateRate: (value: number) => void;
}

export const AdvancedModeSettings = ({ updateRate, setUpdateRate }: Props) => {
  const [show, setShow] = useState(false);
  const [rate, setRate] = useState(updateRate / 1000);

  return (
    <>
      <Button variant="link" onClick={() => setShow(true)}>
        {settingsSvg}
      </Button>
      <Modal animation={true} show={show} centered={true} onHide={() => setShow(false)}>
        <ModalHeader closeButton={true}>
          <b>{_t("g.settings")}</b>
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <FormLabel>
              <small>Update rate(seconds)</small>
            </FormLabel>
            <FormControl
              type="number"
              value={rate}
              onChange={(e) => setRate(+e.target.value)}
              min={5}
              max={300}
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="primary"
            disabled={rate < 5 || rate >= 300}
            onClick={() => {
              if (rate < 5 || rate >= 300) {
                return;
              }

              setUpdateRate(rate * 1000);
              setShow(false);
            }}
          >
            {_t("g.save")}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};
