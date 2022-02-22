import _ from "lodash";
import React, { useEffect, useState } from "react";
import { Button, Form, InputGroup, Modal, ModalBody } from "react-bootstrap";
import { getCommunities } from "../../api/bridge";
import { lookupAccounts } from "../../api/hive";
import { formatError } from "../../api/operations";
import { searchAccount } from "../../api/search-api";
import { _t } from "../../i18n";
import {
  arrowLeftSvg,
  arrowRightSvg,
  communities,
  globalTrending,
  hot,
  magnify,
  newSvg,
  notificationSvg,
  peopleSvg,
  person,
  starOutlineSvg,
  tags,
  wallet,
} from "../../img/svg";
import { error } from "../feedback";
import { SearchComment } from "../search-comment";
import SuggestionList from "../suggestion-list";
import userAvatar from "../user-avatar";
const ModalHeader = Modal.Header;

const OptionWithIcon = ({ title, icon, onOptionClick, disabled }: any) => (
  <div
    className={`d-flex flex-column align-items-center justify-content-center option mr-2 pointer mt-2${
      disabled ? " bg-light text-muted" : ""
    }`}
    onClick={() => !disabled && onOptionClick(title)}
  >
    <div>{icon}</div>
    <div className="mt-2 text-center">{title}</div>
  </div>
);

const options = [
  {
    title: "Users",
    icon: person,
  },
  {
    title: "Trending topics",
    icon: hot,
  },
  {
    title: "Search",
    icon: magnify,
  },
  {
    title: "Community",
    icon: communities,
  },
  {
    title: "Topic",
    icon: tags,
  },
  {
    title: "Notifications",
    icon: notificationSvg,
  },
  {
    title: "Wallet",
    icon: wallet,
  },
  {
    title: "Favorite",
    icon: starOutlineSvg,
  },
  {
    title: "Trending",
    icon: globalTrending,
  },
  // {
  //   title: "New content",
  //   icon: newSvg,
  // },
];

const contentTypes = [
  { code: "", name: "Select content type" },
  { code: "blog", name: "Blogs" },
  { code: "posts", name: "Posts" },
  { code: "comments", name: "Comments" },
  { code: "replies", name: "Replies" },
];

const communityContentTypes = [
  { code: "", name: "Select content type" },
  { code: "trending", name: "Trending" },
  { code: "hot", name: "Hot" },
  { code: "created", name: "New" },
  { code: "payout", name: "Payouts" },
  { code: "muted", name: "Muted" },
];

const AddColumn = ({
  setSelectedValue,
  onSelect,
  selectedValue,
  decks,
}: any) => {
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
      let fetchData =
        selectedValue === "Community" ? getCommunities : lookupAccounts;
      let searchTerm = selectedValue === "Community" ? "" : toValue;
      return (fetchData as any)(searchTerm, 5, toValue)
        .then((resp: any) => {
          if (resp) {
            setToData(resp);
          }
        })
        .catch((err: any) => {
          error(formatError(err));
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
      }, 2000);
      return () => clearTimeout(delayDebounceFn);
    }
    return () => {};
  }, [to]);

  const toChanged = (e: any) => {
    setDeckExists(false)
    let toValue = e.target.value;
    setTo(toValue);
  };

  const suggestionProps = {
    renderer: (i: any) => {
      let valueToShow = selectedValue === "Community" ? i.title : i;
      return (
        <>
          {userAvatar({
            username: i.name || i,
            size: "medium",
            global: {} as any,
          })}{" "}
          <span style={{ marginLeft: "4px" }}>{valueToShow}</span>
        </>
      );
    },
    onSelect: (selectedText: any) => {
      let valueToSelect =
        selectedValue === "Community" ? selectedText.name : selectedText;
      setTo(selectedValue === "Community" ? selectedText.title :valueToSelect);
      setToSelected(valueToSelect);
    },
  };

  const handleAddColumn = () => {
    let couldBeExistingDeck = `${
      selectedValue === "Users" || selectedValue === "Community"
        ? contentType
        : selectedValue
    } @${selectedValue === "Community" ? toSelected : to}`;
    if (
      decks.some((deck: any) => {
        let deckExists =
          deck.header.title.toLowerCase() === couldBeExistingDeck.toLowerCase();
        return deckExists;
      })
    ) {
      setDeckExists(true);
    } else {
      onSelect(
        toSelected,
        selectedValue === "Users" || selectedValue === "Community"
          ? contentType
          : selectedValue
      );
      setDeckExists(false);
      setSelectedValue(null);
    }
  };

  let type =
    selectedValue === "Community" ? communityContentTypes : contentTypes;

  return (
    <div className="d-flex flex-column align-items-center mt-5">
      {/* {selectedValue === "Search" ? <><SearchComment /></> : <> */}
      {selectedValue === "Search" ? (
        <>Search Coming soon!</>
      ) : (
        <>
          <Form.Group>
            <Form.Label>
              {selectedValue === "Community" ? "Community" : "Username"}
            </Form.Label>

            <SuggestionList items={toData} {...suggestionProps}>
              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text>
                    {toDataLoading ? (
                      <div
                        className="spinner-border text-primary spinner-border-sm"
                        role="status"
                      >
                        <span className="sr-only">Loading...</span>
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
            {deckExists && <small className="text-danger">The column you're trying to add already exists!</small>}
          </Form.Group>

          {(selectedValue === "Users" || selectedValue === "Community") && (
            <Form.Group className="w-100">
              <Form.Label>Type of content</Form.Label>
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
              selectedValue === "Notifications" || selectedValue === "Wallet"
                ? toSelected.length === 0
                : contentType === "" || toSelected.length === 0
            }
            onClick={handleAddColumn}
          >
            Add
          </Button>
        </>
      )}

      <div
        className="my-5 d-flex align-items-center back-icon pointer w-100"
        onClick={() => setSelectedValue(null)}
      >
        <div className="mr-2">{arrowLeftSvg}</div>
        <div>Go back</div>
      </div>
    </div>
  );
};

export const DeckAddModal = ({
  open,
  onClose,
  onSelect,
  currentlyActivatedOptions,
}: any) => {
  const [selectedOption, setSelectedOption] = useState(null);
  useEffect(() => {
    if (
      selectedOption &&
      selectedOption !== "Users" &&
      selectedOption !== "Notifications" &&
      selectedOption !== "Wallet" &&
      selectedOption !== "Search" &&
      selectedOption !== "Community"
    ) {
      onClose();
      onSelect(selectedOption);
    }
  }, [selectedOption]);

  return (
    <Modal show={open} centered={true} onHide={onClose}>
      <ModalHeader
        className="header mt-5 justify-content-center mb-3"
        closeButton={true}
      >
        <div className="flex-grow-1 text-center">
          {selectedOption &&
          (selectedOption === "Users" ||
            selectedOption === "Notifications" ||
            selectedOption === "Wallet" ||
            selectedOption === "Search" ||
            selectedOption === "Search" ||
            selectedOption === "Community") ? (
            <div className="d-flex align-items-center justify-content-center">
              <div className="header-icon mr-2 d-flex">
                {options.find((item) => item.title === selectedOption)?.icon}
              </div>
              <div>
                Add{" "}
                {options.find((item) => item.title === selectedOption)?.title}{" "}
                Column
              </div>
            </div>
          ) : (
            "Which column type do you want to add?"
          )}
        </div>
      </ModalHeader>
      <ModalBody className="d-flex justify-content-center">
        {selectedOption &&
        (selectedOption === "Users" ||
          selectedOption === "Notifications" ||
          selectedOption === "Wallet" ||
          selectedOption === "Search" ||
          selectedOption === "Community") ? (
          <AddColumn
            selectedValue={selectedOption}
            setSelectedValue={setSelectedOption}
            onSelect={onSelect}
            decks={currentlyActivatedOptions}
          />
        ) : (
          <div className="d-flex w-100 flex-wrap">
            {options.map((option) => (
              <OptionWithIcon
                title={option.title}
                icon={option.icon}
                onOptionClick={setSelectedOption}
                key={option.title}
                disabled={currentlyActivatedOptions.some(
                  (item: any) => item.header.title === option.title
                )}
              />
            ))}
          </div>
        )}
      </ModalBody>
    </Modal>
  );
};
