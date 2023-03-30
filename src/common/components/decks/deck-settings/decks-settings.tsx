import { Alert, Button, Form, InputGroup, Modal } from "react-bootstrap";
import React, { useContext, useEffect, useState } from "react";
import "./_decks-settings.scss";
import { DeckGrid } from "../types";
import EmojiPicker from "../../emoji-picker";
import { deleteForeverSvg, emoticonHappyOutlineSvg } from "../../../img/svg";
import ClickAwayListener from "../../clickaway-listener";
import uuid from "uuid";
import { DeckGridContext } from "../deck-manager";
import { DEFAULT_COLUMNS } from "../consts";

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
      onHide={setShow}
      keyboard={false}
      className="decks-settings"
    >
      <Modal.Header closeButton={true}>
        <Modal.Title>{deck ? "Decks settings" : "Create a deck"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isRemovingDeck && deck && (
          <div>
            <div className="text-center mb-4">Are you sure deleting deck?</div>
            <div className="d-flex align-items-center justify-content-center">
              <Button
                disabled={isLoading}
                className="mr-2"
                variant="primary"
                onClick={() => setIsRemovingDeck(false)}
              >
                Cancel
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
                Confirm
              </Button>
            </div>
          </div>
        )}
        {!isRemovingDeck && (
          <Form>
            <Form.Group className="mb-4">
              <Form.Label className="font-weight-bold">Information</Form.Label>
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
            <Form.Label className="font-weight-bold">Deck storage</Form.Label>
            <Alert variant="primary">
              If its set local storage then this deck will be saved only on current device. Save on
              account if you want to get access to the deck from any device.
            </Alert>
            <div className="form-section d-flex">
              <Form.Group>
                <Form.Check
                  checked={isLocalStorage}
                  type="radio"
                  label="Use local storage"
                  onChange={({ target }) => setIsLocalStorage(target.value === "on")}
                />
              </Form.Group>
              <Form.Group>
                <Form.Check
                  checked={!isLocalStorage}
                  type="radio"
                  label="Use account storage"
                  onChange={({ target }) => setIsLocalStorage(target.value === "off")}
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
                  Cancel
                </Button>
                <Button disabled={!name} onClick={() => submit()}>
                  {deck ? "Save" : "Create"}
                </Button>
              </div>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};
