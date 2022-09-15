import { Col, Form, Row } from "react-bootstrap";
import { _t } from "../../i18n";
import React from "react";

interface Props {
  label: string;
  children: JSX.Element;
}

export const WalletSpkGroup = ({ label, children }: Props) => {
  return (
    <Form.Group as={Row} className={"mb-3"}>
      <Form.Label column={true} sm={2}>
        {_t(label)}
      </Form.Label>
      <Col sm={10}>{children}</Col>
    </Form.Group>
  );
};
