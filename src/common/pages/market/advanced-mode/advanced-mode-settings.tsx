import { Button, FormControl, FormGroup, FormLabel, Modal } from "react-bootstrap";
import React, { useState } from "react";
import { settingsSvg } from "../../../img/svg";
import { _t } from "../../../i18n";

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
      <Modal
        animation={true}
        show={show}
        centered={true}
        onHide={() => setShow(false)}
        keyboard={false}
      >
        <Modal.Header closeButton={true}>
          <b>{_t("g.settings")}</b>
        </Modal.Header>
        <Modal.Body>
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
        </Modal.Body>
        <Modal.Footer>
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
        </Modal.Footer>
      </Modal>
    </>
  );
};
