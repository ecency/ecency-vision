import React from "react";
import { MarketSwapForm } from "../../components/market-swap-form";
import { Col, Row } from "react-bootstrap";
import { PageProps } from "../common";

export const SwapMode = (props: PageProps) => {
  return (
    <Row className="justify-content-center pb-5">
      <Col xs={12} md={10} lg={8} xl={6}>
        <MarketSwapForm
          activeUser={props.activeUser}
          global={props.global}
          addAccount={props.addAccount}
          updateActiveUser={props.updateActiveUser}
        />
      </Col>
    </Row>
  );
};
