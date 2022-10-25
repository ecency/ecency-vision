import React from "react";
import { MarketSwapForm } from "../../components/market-swap-form";
import { Button, Col, Row } from "react-bootstrap";
import { PageProps } from "../common";
import { _t } from "../../i18n";
import { Link } from "react-router-dom";

export const SwapMode = (props: PageProps) => {
  return (
    <Row className="justify-content-center pb-5">
      <Col xs={12} md={10} lg={8} xl={6}>
        <MarketSwapForm
          activeUser={props.activeUser}
          global={props.global}
          addAccount={props.addAccount}
          updateActiveUser={props.updateActiveUser}
          signingKey={props.signingKey}
          setSigningKey={props.setSigningKey}
        />
        {!props.activeUser ? (
          <div className="auth-required d-flex justify-content-center align-items-center flex-column">
            <div className="font-weight-bold mb-3">{_t("market.auth-required-title")}</div>
            <div className="mb-3">{_t("market.auth-required-desc")}</div>
            <div className="d-flex">
              <Button
                variant="outline-primary"
                className="mr-2"
                onClick={() => props.toggleUIProp("login")}
              >
                {_t("g.login")}
              </Button>
              <Link to="/signup">
                <Button variant="primary">{_t("g.signup")}</Button>
              </Link>
            </div>
          </div>
        ) : (
          <></>
        )}
      </Col>
    </Row>
  );
};
