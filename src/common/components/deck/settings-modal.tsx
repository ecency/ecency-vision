import React from "react";
import {
  Button,
  Form,
  FormControl,
  InputGroup,
  Modal,
  Row,
} from "react-bootstrap";

export const DeckSettings = ({ title, ...props }: any) => {
  const onSave = () => {
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
              aria-label="Default"
              aria-describedby="inputGroup-sizing-default"
              type="number"
              placeholder="Data reload time"
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
