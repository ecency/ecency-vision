import { Alert, Button, Form, InputGroup } from "react-bootstrap";
import React, { useContext, useEffect, useState } from "react";
import "./_decks-settings.scss";
import { DeckGrid } from "../types";
import EmojiPicker from "../../emoji-picker";
import { deleteForeverSvg, emoticonHappyOutlineSvg } from "../../../img/svg";
import ClickAwayListener from "../../clickaway-listener";
import * as uuid from "uuid";
import { DeckGridContext } from "../deck-manager";
import { DEFAULT_COLUMNS } from "../consts";
import { _t } from "../../../i18n";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";

interface Props {
  deck?: DeckGrid;
  show: boolean;
  setShow: (val: boolean) => void;
}

export const DecksSettings = ({ show, setShow, deck }: Props) => {
  const { pushOrUpdateDeck, removeDeck, decks } = useContext(DeckGridContext);

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [isLocalStorage, setIsLocalStorage] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isRemovingDeck, setIsRemovingDeck] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setName(deck?.title ?? name);
    setIcon(deck?.icon ?? icon);
    setIsLocalStorage(deck?.storageType === "local" ?? false);
  }, [deck]);

  const submit = () => {
    if (!name) {
      return;
    }

    if (deck) {
      const value: DeckGrid = {
        key: deck.key,
        icon,
        title: name,
        storageType: isLocalStorage ? "local" : "account",
        columns: deck.columns
      };
      pushOrUpdateDeck(value);
    } else {
      const newDeck: DeckGrid = {
        key: uuid.v4(),
        icon,
        title: name,
        storageType: isLocalStorage ? "local" : "account",
        columns: DEFAULT_COLUMNS
      };
      pushOrUpdateDeck(newDeck);
    }
    setShow(false);
  };

  return (
    <Modal
      animation={true}
      show={show}
      centered={true}
      onHide={() => setShow(false)}
      className="decks-settings"
    >
      <ModalHeader closeButton={true}>
        <ModalTitle>{deck ? _t("decks.settings") : _t("decks.create-deck")}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        {isRemovingDeck && deck && (
          <div>
            <div className="text-center mb-4">{_t("decks.delete-prompt")}</div>
            <div className="d-flex align-items-center justify-content-center">
              <Button
                disabled={isLoading}
                className="mr-2"
                variant="primary"
                onClick={() => setIsRemovingDeck(false)}
              >
                {_t("g.cancel")}
              </Button>
              <Button
                disabled={isLoading}
                variant="outline-danger"
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    await removeDeck(deck);
                    setShow(false);
                    setIsRemovingDeck(false);
                  } catch (e) {
                  } finally {
                    setIsLoading(false);
                  }
                }}
              >
                {_t("g.confirm")}
              </Button>
            </div>
          </div>
        )}
        {!isRemovingDeck && (
          <Form>
            <Form.Group className="mb-4">
              <InputGroup>
                <InputGroup.Prepend>
                  <Button
                    variant="link"
                    onClick={() => {
                      setShowEmoji(!showEmoji);
                    }}
                  >
                    {icon ? icon : emoticonHappyOutlineSvg}
                  </Button>
                  {showEmoji ? (
                    <ClickAwayListener onClickAway={() => setShowEmoji(false)}>
                      <EmojiPicker
                        fallback={(value) => {
                          setIcon(value);
                          setShowEmoji(false);
                        }}
                      />
                    </ClickAwayListener>
                  ) : (
                    <></>
                  )}
                </InputGroup.Prepend>
                <Form.Control
                  placeholder="Name"
                  value={name}
                  onChange={({ target }) => setName(target.value)}
                />
              </InputGroup>
            </Form.Group>
            <Form.Label className="font-weight-bold">{_t("g.settings")}</Form.Label>
            {isLocalStorage && <Alert variant="primary">{_t("decks.use-local-text")}</Alert>}
            <div className="form-section d-flex">
              <Form.Group>
                <Form.Check
                  checked={isLocalStorage}
                  type="checkbox"
                  label={_t("decks.save-locally")}
                  onChange={({ target }) => setIsLocalStorage(target.checked)}
                />
              </Form.Group>
            </div>
            <div className="d-flex justify-content-between">
              <div>
                {deck && decks.decks.length > 1 ? (
                  <Button variant="outline-danger" onClick={() => setIsRemovingDeck(true)}>
                    {deleteForeverSvg}
                  </Button>
                ) : (
                  <></>
                )}
              </div>
              <div>
                <Button variant="link" onClick={() => setShow(false)}>
                  {_t("g.cancel")}
                </Button>
                <Button disabled={!name} onClick={() => submit()}>
                  {deck ? _t("g.save") : _t("decks.create")}
                </Button>
              </div>
            </div>
          </Form>
        )}
      </ModalBody>
    </Modal>
  );
};
