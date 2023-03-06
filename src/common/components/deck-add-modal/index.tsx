import React, { useEffect, useState } from "react";
import { Button, Form, InputGroup, Modal, ModalBody } from "react-bootstrap";
import { getCommunities } from "../../api/bridge";
import { lookupAccounts } from "../../api/hive";
import { formatError } from "../../api/operations";
import { _t } from "../../i18n";
import {
  arrowLeftSvg,
  communities,
  globalTrending,
  hot,
  magnify,
  notificationSvg,
  person,
  tags,
  wallet
} from "../../img/svg";
import isElectron from "../../util/is-electron";
import { error } from "../feedback";
import SuggestionList from "../suggestion-list";
import UserAvatar from "../user-avatar";
import "./_index.scss";

const ModalHeader = Modal.Header;

const comingSoon = isElectron() ? "./img/coming-soon.png" : require("../../img/coming-soon.png");

const OptionWithIcon = ({ title, icon, onOptionClick, disabled, na }: any) => (
  <div
    className={`d-flex flex-column align-items-center justify-content-center option mr-2 pointer mt-2 position-relative${
      disabled || na ? " bg-light text-muted" : ""
    }`}
    onClick={() => !disabled && onOptionClick(title)}
    style={{ cursor: disabled || na ? "auto" : "" }}
  >
    <div>{icon}</div>
    <div className="mt-2 text-center">{title}</div>
    {na && <img src={comingSoon} width="23px" height="23px" className="coming-soon" />}
  </div>
);

const options = (activeUser: any) => {
  let isLoggedIn = activeUser && activeUser.username;
  return [
    {
      title: _t("decks.users"),
      icon: person
    },
    {
      title: _t("decks.community"),
      icon: communities
    },
    {
      title: _t("decks.wallet"),
      icon: wallet
    },
    {
      title: _t("decks.notifications"),
      icon: notificationSvg,
      disabled: !isLoggedIn
    },
    {
      title: _t("decks.trending"),
      icon: globalTrending
    },
    {
      title: _t("decks.trending-topics"),
      icon: hot
    },
    {
      title: _t("decks.search"),
      icon: magnify,
      na: true
    },
    {
      title: _t("decks.topic"),
      icon: tags,
      na: true
    }
    /*{
    title: _t("decks.favorite"),
    icon: starOutlineSvg,
    na:true
  },*/
  ];
};

const contentTypes = [
  { code: "", name: _t("decks.select") },
  { code: "blogs", name: _t("decks.blogs") },
  { code: "posts", name: _t("decks.posts") },
  { code: "comments", name: _t("decks.comments") },
  { code: "replies", name: _t("decks.replies") }
];

const communityContentTypes = [
  { code: "", name: _t("decks.select") },
  { code: "trending", name: _t("decks.trending") },
  { code: "hot", name: _t("decks.hot") },
  { code: "created", name: _t("decks.created") },
  { code: "payout", name: _t("decks.payout") },
  { code: "muted", name: _t("decks.muted") }
];

const AddColumn = ({ setSelectedValue, onSelect, selectedValue, decks }: any) => {
  const [to, setTo] = useState("");
  const [contentType, setContentType] = useState("");
  const [toSelected, setToSelected] = useState("");
  const [toData, setToData] = useState<any>([]);
  const [toDataLoading, setToDataLoading] = useState(false);
  const [deckExists, setDeckExists] = useState(false);
  let _timer: any = null;

  const afterToChange = (toValue: string) => {
    setDeckExists(false);
    if (_timer) {
      clearTimeout(_timer);
    }

    if (toValue === "") {
      setTo("");
      setToDataLoading(false);
      return;
    }

    _timer = setTimeout(() => {
      let fetchData = selectedValue === _t("decks.community") ? getCommunities : lookupAccounts;
      let searchTerm = selectedValue === _t("decks.community") ? "" : toValue;
      return (fetchData as any)(searchTerm, 5, toValue)
        .then((resp: any) => {
          if (resp) {
            setToData(resp);
            let existing = resp.find((item: any) =>
              selectedValue === _t("decks.community")
                ? item.title.toLowerCase() === to.toLowerCase()
                : item.toLowerCase() === to.toLowerCase()
            );
            if (existing) {
              let valueToSelect =
                selectedValue === _t("decks.community") ? existing.name : existing;
              setTo(selectedValue === _t("decks.community") ? existing.title : existing);
              setToSelected(valueToSelect);
            }
          }
        })
        .catch((err: any) => {
          error(...formatError(err));
        })
        .finally(() => {
          setToDataLoading(false);
        });
    }, 500);
  };

  useEffect(() => {
    if (to && to.length > 0) {
      const delayDebounceFn = setTimeout(() => {
        afterToChange(to);
        setToDataLoading(true);
      }, 1000);
      return () => clearTimeout(delayDebounceFn);
    }
    return () => {};
  }, [to]);

  const toChanged = (e: any) => {
    setDeckExists(false);
    let toValue = e.target.value;
    setTo(toValue);
  };

  const suggestionProps = {
    renderer: (i: any) => {
      let valueToShow = selectedValue === _t("decks.community") ? i.title : i;
      return (
        <>
          <UserAvatar username={i.name || i} size="small" />{" "}
          <span style={{ marginLeft: "4px" }}>{valueToShow}</span>
        </>
      );
    },
    onSelect: (selectedText: any) => {
      let valueToSelect =
        selectedValue === _t("decks.community") ? selectedText.name : selectedText;
      setTo(selectedValue === _t("decks.community") ? selectedText.title : valueToSelect);
      setToSelected(valueToSelect);
    }
  };

  const handleAddColumn = () => {
    let couldBeExistingDeck = `${
      selectedValue === _t("decks.users") || selectedValue === _t("decks.community")
        ? contentType
        : selectedValue
    } @${selectedValue === _t("decks.community") ? toSelected : to}`;
    if (
      decks.some((deck: any) => {
        return deck.header.title.toLowerCase() === couldBeExistingDeck.toLowerCase();
      })
    ) {
      setDeckExists(true);
    } else {
      onSelect(
        toSelected,
        selectedValue === _t("decks.users") || selectedValue === _t("decks.community")
          ? contentType
          : selectedValue
      );
      setDeckExists(false);
      setSelectedValue(null);
    }
  };

  let type = selectedValue === _t("decks.community") ? communityContentTypes : contentTypes;

  return (
    <div className="d-flex flex-column align-items-center mt-5">
      {/* {selectedValue === "Search" ? <><SearchComment /></> : <> */}
      {selectedValue === _t("decks.search") || selectedValue === _t("decks.topic") ? (
        <>Coming soon!</>
      ) : (
        <>
          <Form.Group>
            <Form.Label>
              {selectedValue === _t("decks.community")
                ? _t("decks.community")
                : _t("decks.username")}
            </Form.Label>

            <SuggestionList items={toData} {...suggestionProps}>
              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text>
                    {toDataLoading ? (
                      <div className="spinner-border text-primary spinner-border-sm" role="status">
                        <span className="sr-only">{_t("g.loading")}</span>
                      </div>
                    ) : (
                      "@"
                    )}
                  </InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                  type="text"
                  autoFocus={true}
                  placeholder={_t("transfer.to-placeholder")}
                  value={to}
                  onChange={toChanged}
                  isInvalid={deckExists}
                />
              </InputGroup>
            </SuggestionList>
            {deckExists && <small className="text-danger">{_t("decks.deck-exists")}</small>}
          </Form.Group>

          {(selectedValue === _t("decks.users") || selectedValue === _t("decks.community")) && (
            <Form.Group className="w-100">
              <Form.Label>{_t("decks.content-type")}</Form.Label>
              <Form.Control
                type="text"
                as="select"
                onChange={(e) => {
                  setContentType(e.target.value);
                  setDeckExists(false);
                }}
                value={contentType}
              >
                {type.map((x: any) => (
                  <option key={x.code} value={x.code}>
                    {x.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          )}
          <Button
            className="align-self-start mb-5"
            disabled={
              selectedValue === _t("decks.notifications") || selectedValue === _t("decks.wallet")
                ? toSelected.length === 0
                : contentType === "" || toSelected.length === 0
            }
            onClick={handleAddColumn}
          >
            {_t("decks.add")}
          </Button>
        </>
      )}

      <div
        className="my-5 d-flex align-items-center back-icon pointer w-100"
        onClick={() => setSelectedValue(null)}
      >
        <div className="mr-2">{arrowLeftSvg}</div>
        <div>{_t("decks.go-back")}</div>
      </div>
    </div>
  );
};

export const DeckAddModal = ({
  open,
  onClose,
  onSelect,
  currentlyActivatedOptions,
  activeUser
}: any) => {
  const [selectedOption, setSelectedOption] = useState(null);
  useEffect(() => {
    if (
      selectedOption &&
      selectedOption !== _t("decks.users") &&
      selectedOption !== _t("decks.notifications") &&
      selectedOption !== _t("decks.wallet") &&
      selectedOption !== _t("decks.search") &&
      selectedOption !== _t("decks.topic") &&
      selectedOption !== _t("decks.community")
    ) {
      onClose();
      onSelect(selectedOption);
    }
  }, [selectedOption]);

  return (
    <Modal show={open} centered={true} onHide={onClose}>
      <ModalHeader className="header mt-5 justify-content-center mb-3" closeButton={true}>
        <div className="flex-grow-1 text-center title">
          {selectedOption &&
          (selectedOption === _t("decks.users") ||
            selectedOption === _t("decks.notifications") ||
            selectedOption === _t("decks.wallet") ||
            selectedOption === _t("decks.search") ||
            selectedOption === _t("decks.topic") ||
            selectedOption === _t("decks.community")) ? (
            <div className="d-flex align-items-center justify-content-center">
              <div className="header-icon mr-2 d-flex">
                {options(activeUser).find((item) => item.title === selectedOption)?.icon}
              </div>
              <div>
                {_t("decks.add")}{" "}
                {options(activeUser).find((item) => item.title === selectedOption)?.title}{" "}
                {_t("decks.column")}
              </div>
            </div>
          ) : (
            _t("decks.select-column-type")
          )}
        </div>
      </ModalHeader>
      <ModalBody className="d-flex justify-content-center">
        {selectedOption &&
        (selectedOption === _t("decks.users") ||
          selectedOption === _t("decks.notifications") ||
          selectedOption === _t("decks.wallet") ||
          selectedOption === _t("decks.search") ||
          selectedOption === _t("decks.topic") ||
          selectedOption === _t("decks.community")) ? (
          <AddColumn
            selectedValue={selectedOption}
            setSelectedValue={setSelectedOption}
            onSelect={onSelect}
            decks={currentlyActivatedOptions}
          />
        ) : (
          <div className="d-flex w-100 flex-wrap">
            {options(activeUser).map((option) => (
              <OptionWithIcon
                title={option.title}
                icon={option.icon}
                onOptionClick={setSelectedOption}
                key={option.title}
                na={option.na}
                disabled={currentlyActivatedOptions.some(
                  (item: any) => item.header.title === option.title || option.disabled
                )}
              />
            ))}
          </div>
        )}
      </ModalBody>
    </Modal>
  );
};
