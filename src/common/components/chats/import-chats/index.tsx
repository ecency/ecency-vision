import React, { useContext, useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { getPublicKey } from "../../../../lib/nostr-tools/keys";
import { _t } from "../../../i18n";
import { keySvg } from "../../../img/svg";
import { useMappedStore } from "../../../store/use-mapped-store";
import OrDivider from "../../or-divider";
import * as ls from "../../../util/local-storage";
import { ChatContext } from "../chat-context-provider";
import { setNostrkeys } from "../../../../managers/message-manager";

import "./index.scss";
import LinearProgress from "../../linear-progress";
import ChatsConfirmationModal from "../chats-confirmation-modal";
import { createNoStrAccount, setProfileMetaData } from "../utils";

export default function ImportChats() {
  const { activeUser } = useMappedStore();

  const [importPrivKey, setImportPrivKey] = useState(false);
  const [error, setError] = useState("");
  const [inProgress, setInProgress] = useState(false);
  const [privKey, setPrivKey] = useState("");
  const [step, setStep] = useState(0);

  const { activeUserKeys, messageServiceInstance, setActiveUserKeys, setChatPrivKey } =
    useContext(ChatContext);

  const handleImportChatSubmit = () => {
    try {
      setInProgress(true);
      const pubKey = getPublicKey(privKey);
      console.log("Public key", pubKey);
      console.log("Active user key", activeUserKeys?.pub);
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

  const handleCreateAccount = async () => {
    console.log("Confrim run");
    const keys = createNoStrAccount();
    ls.set(`${activeUser?.username}_nsPrivKey`, keys.priv);
    setChatPrivKey(keys.priv);
    await setProfileMetaData(activeUser, keys.pub);
    setNostrkeys(keys);
    messageServiceInstance?.updateProfile({
      name: activeUser?.username!,
      about: "",
      picture: ""
    });
    setActiveUserKeys(keys);
  };

  return (
    <>
      <div className="import-chats">
        <div className="import-chats-container">
          <div className="d-flex justify-content-center import-chat-btn">
            <Button variant="primary" onClick={() => setImportPrivKey(!importPrivKey)}>
              {_t("chat.import-chat")}
            </Button>
          </div>
          {importPrivKey && (
            <div className="private-key" style={{ margin: "15px 10px" }}>
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
                    value={privKey}
                    type="password"
                    autoFocus={true}
                    autoComplete="off"
                    placeholder="Chat private key"
                    onChange={(e) => setPrivKey(e.target.value)}
                  />
                  <InputGroup.Append>
                    <Button onClick={handleImportChatSubmit}>{_t("chat.submit")}</Button>
                  </InputGroup.Append>
                </InputGroup>
                {inProgress && <LinearProgress />}
                {error && <Form.Text className="text-danger">{error}</Form.Text>}
              </Form>
            </div>
          )}
          {<OrDivider />}
          <div className="d-flex justify-content-center create-new-chat-btn">
            <Button
              variant="primary"
              onClick={() => {
                setStep(1);
              }}
            >
              {_t("chat.create-new-account")}
            </Button>
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
          onConfirm={handleCreateAccount}
        />
      )}
    </>
  );
}
