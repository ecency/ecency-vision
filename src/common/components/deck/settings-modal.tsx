import React, { useState } from "react";
import {
  Button,
  Form,
  FormControl,
  InputGroup,
  Modal,
  Row,
} from "react-bootstrap";
import * as ls from "../../util/local-storage";
import { success } from "../feedback";

export const DeckSettings = ({ title, ...props }: any) => {
    let cachedDeckReloadTime = ls.get(`reload-deck-${title}`)
  const [reloadHours, setReloadHours] = useState(cachedDeckReloadTime || "");
  const onSave = () => {
    ls.set(`reload-deck-${title}`, reloadHours);
    success(`Data reload time for ${title} saved successfully.`)
    props.onHide();
  };

  return (
    <Modal {...props} aria-labelledby="contained-modal-title-vcenter">
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Settings for {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="show-grid">
        <Form.Label htmlFor="inputPassword5">Data reload time</Form.Label>
        <Row className="m-0">
          <InputGroup className="mb-3">
            <FormControl
              autoFocus={true}
              type="number"
              placeholder="e.g. 11"
              value={reloadHours}
              onChange={(e: any) => setReloadHours(e.target.value)}
            />
            <InputGroup.Text
              id="inputGroup-sizing-default"
              className="rounded-0"
            >
              Hours
            </InputGroup.Text>
          </InputGroup>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onSave}>Save</Button>
      </Modal.Footer>
    </Modal>
  );
};
