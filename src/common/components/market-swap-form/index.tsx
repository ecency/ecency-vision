import React, { useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { _t } from "../../i18n";
import { swapSvg } from "../../img/svg";

export const MarketSwapForm = () => {
  const [from, setFrom] = useState("");
  const [fromAsset, setFromAsset] = useState("HIVE");
  const [to, setTo] = useState("");
  const [toAsset, setToAsset] = useState("HBD($)");
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className="market-swap-form p-3">
      <Form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <Form.Group className="px-3 pt-3 pb-5 mb-0 border">
          <Form.Label>{_t("market.from")}</Form.Label>
          <InputGroup>
            <Form.Control
              size="lg"
              value={from}
              placeholder="0.0"
              onChange={(e) => setFrom(e.target.value)}
            />
            <InputGroup.Text className="rounded-left">{fromAsset}</InputGroup.Text>
          </InputGroup>
        </Form.Group>
        <div className="swap-button-container">
          <div className="overlay">
            <Button variant="" className="swap-button border">
              {swapSvg}
            </Button>
          </div>
        </div>
        <Form.Group className="px-3 pt-3 pb-5 border">
          <Form.Label>{_t("market.to")}</Form.Label>
          <InputGroup>
            <Form.Control
              size="lg"
              value={to}
              placeholder="0.0"
              onChange={(e) => setTo(e.target.value)}
            />
            <InputGroup.Text className="rounded-left">{toAsset}</InputGroup.Text>
          </InputGroup>
        </Form.Group>
        <Button size="lg" block={true} type="submit" disabled={disabled || loading}>
          {loading ? _t("market.swapping") : _t("market.swap")}
        </Button>
      </Form>
    </div>
  );
};
