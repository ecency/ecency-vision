import React, { Component } from "react";

import { Button, Form, FormControl, InputGroup } from "react-bootstrap";

import { cryptoUtils, PrivateKey } from "@hiveio/dhive";

import { ActiveUser } from "../../store/active-user/types";
import { Global } from "../../store/global/types";

import OrDivider from "../or-divider";
import { error } from "../feedback";

import { _t } from "../../i18n";

import { keySvg } from "../../img/svg";

interface Props {
  global: Global;
  activeUser: ActiveUser;
  signingKey: string;
  setSigningKey: (key: string) => void;
  inProgress: boolean;
  onKey: (key: PrivateKey) => void;
  onHot?: () => void;
  onKc?: () => void;
}

interface State {
  key: string;
}

export class KeyOrHot extends Component<Props, State> {
  state: State = {
    key: this.props.signingKey
  };

  keyChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>): void => {
    const { value: key } = e.target;
    this.setState({ key });
  };

  keyEntered = () => {
    const { activeUser } = this.props;
    const { key } = this.state;

    let pKey: PrivateKey;

    if (cryptoUtils.isWif(key)) {
      // wif
      try {
        pKey = PrivateKey.fromString(key);
      } catch (e) {
        error("Invalid active private key!");
        return;
      }
    } else {
      // master key
      pKey = PrivateKey.fromLogin(activeUser.username, key, "active");
    }

    const { onKey, setSigningKey } = this.props;

    setSigningKey(key);

    onKey(pKey);
  };

  hotClicked = () => {
    const { onHot } = this.props;
    if (onHot) {
      onHot();
    }
  };

  kcClicked = () => {
    const { onKc } = this.props;
    if (onKc) {
      onKc();
    }
  };

  render() {
    const { inProgress, global } = this.props;
    const { key } = this.state;
    const hsLogo = global.isElectron
      ? "./img/hive-signer.svg"
      : require("../../img/hive-signer.svg");
    const keyChainLogo = global.isElectron
      ? "./img/keychain.png"
      : require("../../img/keychain.png");

    return (
      <>
        <div className="key-or-hot">
          <Form
            onSubmit={(e: React.FormEvent) => {
              e.preventDefault();
            }}
          >
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text>{keySvg}</InputGroup.Text>
              </InputGroup.Prepend>
              <Form.Control
                value={key}
                type="password"
                autoFocus={true}
                autoComplete="off"
                placeholder={_t("key-or-hot.key-placeholder")}
                onChange={this.keyChanged}
              />
              <InputGroup.Append>
                <Button disabled={inProgress} onClick={this.keyEntered}>
                  {_t("key-or-hot.sign")}
                </Button>
              </InputGroup.Append>
            </InputGroup>
          </Form>
          <OrDivider />
          <div className="hs-sign">
            <Button variant="outline-primary" onClick={this.hotClicked}>
              <img src={hsLogo} className="hs-logo" alt="hivesigner" />{" "}
              {_t("key-or-hot.with-hivesigner")}
            </Button>
          </div>

          {global.hasKeyChain && (
            <div className="kc-sign">
              <Button variant="outline-primary" onClick={this.kcClicked}>
                <img src={keyChainLogo} className="kc-logo" alt="keychain" />{" "}
                {_t("key-or-hot.with-keychain")}
              </Button>
            </div>
          )}
        </div>
      </>
    );
  }
}

export default (p: Props) => {
  const props = {
    global: p.global,
    activeUser: p.activeUser,
    signingKey: p.signingKey,
    setSigningKey: p.setSigningKey,
    inProgress: p.inProgress,
    onKey: p.onKey,
    onHot: p.onHot,
    onKc: p.onKc
  };

  return <KeyOrHot {...props} />;
};
