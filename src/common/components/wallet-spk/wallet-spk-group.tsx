import { Col, Row } from "react-bootstrap";
import { _t } from "../../i18n";
import React from "react";

interface Props {
  label: string;
  children: JSX.Element;
}

export const WalletSpkGroup = ({ label, children }: Props) => {
  return (
    <Row className="mb-3">
      <Col sm={2}>
        <label>{_t(label)}</label>
      </Col>
      <Col sm={10}>{children}</Col>
    </Row>
  );
};
