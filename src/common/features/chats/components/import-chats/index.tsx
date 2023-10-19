import React, { useContext, useEffect, useState } from "react";
import { getPublicKey } from "../../../../../lib/nostr-tools/keys";
import { _t } from "../../../../i18n";
import { keySvg } from "../../../../img/svg";
import { useMappedStore } from "../../../../store/use-mapped-store";
import OrDivider from "../../../../components/or-divider";
import * as ls from "../../../../util/local-storage";
import { ChatContext } from "../../chat-context-provider";
import { setNostrkeys } from "../../../../../managers/message-manager";

import "./index.scss";
import LinearProgress from "../../../../components/linear-progress";
import ChatsConfirmationModal from "../chats-confirmation-modal";
import { Button } from "@ui/button";
import { Form } from "@ui/form";
import { FormControl, InputGroup } from "@ui/input";

export default function ImportChats() {
  const { activeUser } = useMappedStore();

  const [importPrivKey, setImportPrivKey] = useState(false);
  const [error, setError] = useState("");
  const [inProgress, setInProgress] = useState(false);
  const [privKey, setPrivKey] = useState("");
  const [step, setStep] = useState(0);

  const { activeUserKeys, hasUserJoinedChat, setChatPrivKey, joinChat } = useContext(ChatContext);

  const handleImportChatSubmit = () => {
    try {
      setInProgress(true);
      const pubKey = getPublicKey(privKey);
      if (pubKey === activeUserKeys?.pub) {
        setChatPrivKey(privKey);
        ls.set(`${activeUser?.username}_nsPrivKey`, privKey);
        const keys = {
          pub: activeUserKeys?.pub!,
          priv: privKey
        };
        setNostrkeys(keys);
        setImportPrivKey(false);
        setChatPrivKey(privKey);
      } else {
        setImportPrivKey(true);
        setError("Invalid Private key");
      }
    } catch (error) {
      setImportPrivKey(true);
      setError("Invalid Private key");
    } finally {
      setInProgress(false);
    }
  };

  useEffect(() => {
    if (hasUserJoinedChat) {
      setStep(0);
    }
  }, [hasUserJoinedChat]);

  return (
    <>
      <div className="import-chats">
        <div className="import-chats-container">
          <div className="d-flex justify-content-center import-chat-btn">
            <Button onClick={() => setImportPrivKey(!importPrivKey)}>
              {_t("chat.import-chat")}
            </Button>
          </div>
          {importPrivKey && (
            <div className="private-key" style={{ margin: "15px 10px" }}>
              <Form onSubmit={(e: React.FormEvent) => e.preventDefault()}>
                <InputGroup
                  prepend={keySvg}
                  append={<Button onClick={handleImportChatSubmit}>{_t("chat.submit")}</Button>}
                >
                  <FormControl
                    value={privKey}
                    type="password"
                    autoFocus={true}
                    autoComplete="off"
                    placeholder={_t("chat.enter-private-key")}
                    onChange={(e) => setPrivKey(e.target.value)}
                  />
                </InputGroup>
                {inProgress && <LinearProgress />}
                {error && <div className="text-danger">{error}</div>}
              </Form>
            </div>
          )}
          {<OrDivider />}
          <div className="flex justify-center">
            <Button onClick={() => setStep(1)}>{_t("chat.create-new-account")}</Button>
          </div>
        </div>
      </div>
      {step !== 0 && (
        <ChatsConfirmationModal
          actionType={"Warning"}
          content={"creating new account will reset your chats"}
          onClose={() => {
            setStep(0);
          }}
          onConfirm={() => {
            joinChat();
          }}
        />
      )}
    </>
  );
}
