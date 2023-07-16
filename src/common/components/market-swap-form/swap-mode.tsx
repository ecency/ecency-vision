import React from "react";
import { MarketSwapForm } from "./index";
import { Button, Col, Row } from "react-bootstrap";
import { _t } from "../../i18n";
import { Link } from "react-router-dom";
import { MarketSwapActiveOrders } from "../market-swap-active-orders";
import { useMappedStore } from "../../store/use-mapped-store";
import "./_swap-mode.scss";

interface Props {
  inline?: boolean;
}

export const SwapMode = ({ inline = false }: Props) => {
  const {
    activeUser,
    global,
    addAccount,
    updateActiveUser,
    signingKey,
    setSigningKey,
    toggleUIProp
  } = useMappedStore();

  const form = (
    <>
      {activeUser ? <MarketSwapActiveOrders global={global} activeUser={activeUser} /> : <></>}

      <MarketSwapForm
        padding={inline ? "p-0" : undefined}
        activeUser={activeUser}
        global={global}
        addAccount={addAccount}
        updateActiveUser={updateActiveUser}
        signingKey={signingKey}
        setSigningKey={setSigningKey}
      />
      {!activeUser && (
        <div className="auth-required d-flex justify-content-center align-items-center flex-column">
          <div className="font-weight-bold mb-3">{_t("market.auth-required-title")}</div>
          <div className="mb-3">{_t("market.auth-required-desc")}</div>
          <div className="d-flex">
            <Button
              variant="outline-primary"
              className="mr-2"
              onClick={() => toggleUIProp("login")}
            >
              {_t("g.login")}
            </Button>
            <Link to="/signup">
              <Button variant="primary">{_t("g.signup")}</Button>
            </Link>
          </div>
        </div>
      )}
    </>
  );

  return inline ? (
    <div className={"swap-form-container " + (inline ? "inline" : "")}>{form}</div>
  ) : (
    <Row className="justify-content-center pb-5">
      <Col xs={12} md={10} lg={8} xl={6}>
        {form}
      </Col>
    </Row>
  );
};
