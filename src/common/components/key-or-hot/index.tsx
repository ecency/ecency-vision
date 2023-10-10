import React, { Component } from "react";
import { cryptoUtils, PrivateKey } from "@hiveio/dhive";
import { ActiveUser } from "../../store/active-user/types";
import { Global } from "../../store/global/types";
import OrDivider from "../or-divider";
import { error } from "../feedback";
import { _t } from "../../i18n";
import { keySvg } from "../../img/svg";
import "./index.scss";
import { FormControl, InputGroup } from "@ui/input";
import { Button } from "@ui/button";
import { Form } from "@ui/form";

interface Props {
  global: Global;
  activeUser: ActiveUser | null;
  signingKey: string;
  setSigningKey: (key: string) => void;
  inProgress: boolean;
  onKey: (key: PrivateKey) => void;
  onHot?: () => void;
  onKc?: () => void;
  keyOnly?: boolean;
}

interface State {
  key: string;
}

export class KeyOrHot extends Component<Props, State> {
  state: State = {
    key: this.props.signingKey || ""
  };

  keyChanged = (e: React.ChangeEvent<HTMLInputElement>): void => {
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
      pKey = PrivateKey.fromLogin(activeUser!.username, key, "active");
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
            <InputGroup
              prepend={keySvg}
              append={
                <Button disabled={inProgress} onClick={this.keyEntered}>
                  {_t("key-or-hot.sign")}
                </Button>
              }
            >
              <FormControl
                value={key}
                type="password"
                autoFocus={true}
                autoComplete="off"
                placeholder={_t("key-or-hot.key-placeholder")}
                onChange={this.keyChanged}
              />
            </InputGroup>
          </Form>
          {this.props.keyOnly ? (
            <></>
          ) : (
            <>
              <OrDivider />
              <div className="hs-sign">
                <Button
                  outline={true}
                  onClick={this.hotClicked}
                  icon={<img src={hsLogo} className="hs-logo" alt="hivesigner" />}
                  iconPlacement="left"
                >
                  {_t("key-or-hot.with-hivesigner")}
                </Button>
              </div>

              {global.hasKeyChain && (
                <div className="kc-sign">
                  <Button
                    outline={true}
                    onClick={this.kcClicked}
                    icon={<img src={keyChainLogo} className="kc-logo" alt="keychain" />}
                    iconPlacement="left"
                  >
                    {_t("key-or-hot.with-keychain")}
                  </Button>
                </div>
              )}
            </>
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
    onKc: p.onKc,
    keyOnly: p.keyOnly
  };

  return <KeyOrHot {...props} />;
};
