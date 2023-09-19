import React, { Component } from "react";
import { Col, Row } from "react-bootstrap";
import { PrivateKey } from "@hiveio/dhive";
import { Global } from "../../store/global/types";
import { ActiveUser } from "../../store/active-user/types";
import BaseComponent from "../base";
import KeyOrHot from "../key-or-hot";
import Tooltip from "../tooltip";
import { error } from "../feedback";
import { _t } from "../../i18n";
import { getWithdrawRoutes, WithdrawRoute } from "../../api/hive";
import {
  formatError,
  setWithdrawVestingRoute,
  setWithdrawVestingRouteHot,
  setWithdrawVestingRouteKc
} from "../../api/operations";
import { deleteForeverSvg } from "../../img/svg";
import { handleInvalid, handleOnInput } from "../../util/input-util";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import { FormControl } from "@ui/input";
import { Button } from "@ui/button";
import { Form } from "@ui/form";
import { Table, Td, Th, Tr } from "@ui/table";

interface Props {
  global: Global;
  activeUser: ActiveUser;
  signingKey: string;
  setSigningKey: (key: string) => void;
  onHide: () => void;
}

interface State {
  routes: WithdrawRoute[];
  mode: "" | "sign";
  inProgress: boolean;
  account: string;
  percent: string;
  auto: "yes" | "no";
}

const pureState = (): State => {
  return {
    routes: [],
    mode: "",
    inProgress: false,
    account: "",
    percent: "10",
    auto: "yes"
  };
};

export class WithdrawRoutes extends BaseComponent<Props, State> {
  state: State = {
    ...pureState(),
    routes: []
  };

  form = React.createRef<HTMLFormElement>();

  componentDidMount() {
    this.fetchRoutes().then();
  }

  fetchRoutes = () => {
    const { activeUser } = this.props;

    return getWithdrawRoutes(activeUser.username).then((routes) => {
      this.stateSet({ routes });
    });
  };

  onInput = (e: React.ChangeEvent<any>): void => {
    const { target: el } = e;
    const { name: key, value } = el;

    // @ts-ignore
    this.stateSet({ [key]: value });
  };

  sign = (key: PrivateKey) => {
    const { activeUser } = this.props;
    const { account, percent, auto } = this.state;
    this.stateSet({ inProgress: true });

    setWithdrawVestingRoute(
      activeUser.username,
      key,
      account,
      Number(percent) * 100,
      auto === "yes"
    )
      .then(() => this.stateSet(pureState()))
      .then(() => this.fetchRoutes())
      .catch((err) => {
        error(...formatError(err));
        this.stateSet({ inProgress: false });
      });
  };

  signHs = () => {
    const { activeUser } = this.props;
    const { account, percent, auto } = this.state;

    setWithdrawVestingRouteHot(activeUser.username, account, Number(percent) * 100, auto === "yes");
    this.stateSet(pureState());
  };

  signKS = () => {
    const { activeUser } = this.props;
    const { account, percent, auto } = this.state;

    this.stateSet({ inProgress: true });
    setWithdrawVestingRouteKc(activeUser.username, account, Number(percent) * 100, auto === "yes")
      .then(() => this.stateSet(pureState()))
      .then(() => this.fetchRoutes())
      .catch((err) => {
        error(...formatError(err));
        this.stateSet({ inProgress: false });
      });
  };

  render() {
    const { routes, mode, inProgress, account, percent, auto } = this.state;

    if (mode === "sign") {
      return (
        <>
          {KeyOrHot({
            ...this.props,
            inProgress,
            onKey: this.sign,
            onHot: this.signHs,
            onKc: this.signKS
          })}

          <p className="text-center">
            <a
              onClick={(e) => {
                e.preventDefault();
                this.stateSet({ mode: "" });
              }}
              href="#"
            >
              {_t("g.back")}
            </a>
          </p>
        </>
      );
    }

    return (
      <>
        <Form
          ref={this.form}
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (!this.form.current?.checkValidity()) {
              return;
            }

            this.stateSet({ mode: "sign" });
          }}
        >
          <div className="mb-4">
            <label>{_t("withdraw-routes.account")}</label>
            <FormControl
              type="text"
              required={true}
              minLength={3}
              maxLength={20}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              value={account}
              name="account"
              onChange={this.onInput}
              onInvalid={(e: any) => handleInvalid(e, "withdraw-routes.", "validation-account")}
              onInput={handleOnInput}
            />
          </div>
          <Row>
            <Col md={3} className="mb-4">
              <label>{_t("withdraw-routes.percent")}</label>
              <FormControl
                type="number"
                min={0}
                max={100}
                required={true}
                value={percent}
                name="percent"
                onChange={this.onInput}
                onInvalid={(e: any) => handleInvalid(e, "withdraw-routes.", "validation-percent")}
                onInput={handleOnInput}
              />
            </Col>
            <Col md={7} className="mb-4">
              <label>{_t("withdraw-routes.auto-power-up")}</label>
              <FormControl type="select" value={auto} name="auto" onChange={this.onInput}>
                <option value="yes">{_t("g.yes")}</option>
                <option value="no">{_t("g.no")}</option>
              </FormControl>
            </Col>
            <Col md={2} className="d-mflex items-end justify-center mb-4">
              <Button type="submit" size="sm">
                {_t("g.add")}
              </Button>
            </Col>
          </Row>
        </Form>

        {routes.length > 0 && (
          <Table full={true} className="route-table">
            <thead>
              <Tr>
                <Th className="border p-2">{_t("withdraw-routes.account")}</Th>
                <Th className="border p-2">{_t("withdraw-routes.percent")}</Th>
                <Th className="border p-2">{_t("withdraw-routes.auto-power-up")}</Th>
                <Th className="border p-2" />
              </Tr>
            </thead>
            <tbody>
              {routes.map((r) => {
                return (
                  <Tr key={r.id}>
                    <Td className="border p-2">{r.to_account}</Td>
                    <Td className="border p-2">{`${r.percent / 100}%`}</Td>
                    <Td className="border p-2">{r.auto_vest ? _t("g.yes") : _t("g.no")}</Td>
                    <Td className="border p-2">
                      <Tooltip content={_t("g.delete")}>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();

                            this.stateSet({
                              account: r.to_account,
                              percent: "0",
                              auto: "no",
                              mode: "sign"
                            });
                          }}
                        >
                          {deleteForeverSvg}
                        </a>
                      </Tooltip>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </>
    );
  }
}

export default class WithdrawRoutesDialog extends Component<Props> {
  render() {
    const { onHide } = this.props;
    return (
      <Modal
        animation={false}
        show={true}
        centered={true}
        onHide={onHide}
        className="withdraw-routes-dialog"
      >
        <ModalHeader closeButton={true}>
          <ModalTitle>{_t("withdraw-routes.title")}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <WithdrawRoutes {...this.props} />
        </ModalBody>
      </Modal>
    );
  }
}
