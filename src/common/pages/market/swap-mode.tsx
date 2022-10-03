import React from "react";
import { MarketSwapForm } from "../../components/market-swap-form";
import { Col, Row } from "react-bootstrap";
import { PageProps } from "../common";

export const SwapMode = (props: PageProps) => {
  return (
    <Row className="justify-content-center">
      <Col xs={12} sm={10} md={8} lg={6}>
        <MarketSwapForm />
      </Col>
    </Row>
  );
};
