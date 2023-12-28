import React, { useState } from "react";
import { cryptoUtils, PrivateKey } from "@hiveio/dhive";
import OrDivider from "../or-divider";
import { error } from "../feedback";
import "./index.scss";
import { FormControl, InputGroup } from "@ui/input";
import { Button } from "@ui/button";
import { Form } from "@ui/form";
import { keySvg } from "@ui/svg";
import { useGlobalStore } from "@/core/global-store";
import i18next from "i18next";

interface Props {
  inProgress: boolean;
  onKey: (key: PrivateKey) => void;
  onHot?: () => void;
  onKc?: () => void;
  keyOnly?: boolean;
}

export function KeyOrHot({ inProgress, onKey, onHot, onKc, keyOnly }: Props) {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const hasKeyChain = useGlobalStore((state) => state.hasKeyChain);
  const signingKey = useGlobalStore((state) => state.signingKey);
  const setSigningKey = useGlobalStore((state) => state.setSigningKey);

  const [key, setKey] = useState(signingKey || "");

  const keyEntered = () => {
    let pKey: PrivateKey;

    if (cryptoUtils.isWif(key)) {
      try {
        pKey = PrivateKey.fromString(key);
      } catch (e) {
        error("Invalid active private key!");
        return;
      }
    } else {
      pKey = PrivateKey.fromLogin(activeUser!.username, key, "active");
    }

    setSigningKey(key);

    onKey(pKey);
  };

  const hsLogo = require("../../../assets/img/hive-signer.svg");
  const keyChainLogo = require("../../../assets/img/keychain.png");

  return (
    <>
      <div className="key-or-hot">
        <Form onSubmit={(e: React.FormEvent) => e.preventDefault()}>
          <InputGroup
            prepend={keySvg}
            append={
              <Button disabled={inProgress} onClick={keyEntered}>
                {i18next.t("key-or-hot.sign")}
              </Button>
            }
          >
            <FormControl
              value={key}
              type="password"
              autoFocus={true}
              autoComplete="off"
              placeholder={i18next.t("key-or-hot.key-placeholder")}
              onChange={(e) => setKey(e.target.value)}
            />
          </InputGroup>
        </Form>
        {keyOnly ? (
          <></>
        ) : (
          <>
            <OrDivider />
            <div className="hs-sign">
              <Button
                outline={true}
                onClick={() => onHot?.()}
                icon={<img src={hsLogo} className="hs-logo" alt="hivesigner" />}
                iconPlacement="left"
              >
                {i18next.t("key-or-hot.with-hivesigner")}
              </Button>
            </div>

            {hasKeyChain && (
              <div className="kc-sign">
                <Button
                  outline={true}
                  onClick={() => onKc?.()}
                  icon={<img src={keyChainLogo} className="kc-logo" alt="keychain" />}
                  iconPlacement="left"
                >
                  {i18next.t("key-or-hot.with-keychain")}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
