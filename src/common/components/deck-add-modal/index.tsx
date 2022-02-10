import React, { useState } from "react";
import { Button, Form, InputGroup, Modal, ModalBody } from "react-bootstrap";
import ModalHeader from "react-bootstrap/esm/ModalHeader";
import { lookupAccounts } from "../../api/hive";
import { formatError } from "../../api/operations";
import { _t } from "../../i18n";
import {
  arrowLeftSvg,
  arrowRightSvg,
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
import SuggestionList from "../suggestion-list";
import userAvatar from "../user-avatar";

const OptionWithIcon = ({ title, icon, onOptionClick }: any) => (
  <div
    className="d-flex flex-column align-items-center justify-content-center option mr-2 pointer mt-2"
    onClick={() => onOptionClick(title)}
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
    icon: peopleSvg,
  },
  {
    title: "Topic",
    icon: tags,
  },
  {
    title: "Notification",
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
    icon: arrowRightSvg,
  },
  {
    title: "New content",
    icon: newSvg,
  },
];

const contentTypes = [
  { code: "", name: "Select content type" },
  { code: "blogs", name: "Blogs" },
  { code: "posts", name: "Posts" },
  { code: "comments", name: "Comments" },
  { code: "replies", name: "Replies" },
];

const AddColumn = ({ setSelectedValue }: any) => {
  const [to, setTo] = useState("");
  const [contentType, setContentType] = useState("");
  const [toSelected, setToSelected] = useState("");
  const [toData, setToData] = useState<any>([]);
  const [toDataLoading, setToDataLoading] = useState(false);
  let _timer: any = null;

  const toChanged = (e: any) => {
    let toValue = e.target.value;
    setToDataLoading(true);
    setTo(toValue);
    if (_timer) {
      clearTimeout(_timer);
    }

    if (toValue === "") {
      setTo("");
      setToDataLoading(false);
      return;
    }

    _timer = setTimeout(() => {
      return lookupAccounts(toValue, 5)
        .then((resp) => {
          if (resp) {
            setToData(resp);
          }
        })
        .catch((err) => {
          error(formatError(err));
        })
        .finally(() => {
          setToDataLoading(false);
        });
    }, 500);
  };
  const suggestionProps = {
    renderer: (i: string) => {
      return (
        <>
          {userAvatar({ username: i, size: "medium", global: {} as any })}{" "}
          <span style={{ marginLeft: "4px" }}>{i}</span>
        </>
      );
    },
    onSelect: (selectedText: string) => {
      setTo(selectedText);
      setToSelected(selectedText);
    },
  };

  return (
    <div className="d-flex flex-column align-items-center mt-5">
      <Form.Group>
        <Form.Label>Username</Form.Label>

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
            //   className={toError ? "is-invalid" : ""}
            />
          </InputGroup>
        </SuggestionList>
      </Form.Group>

      <Form.Group className="w-100">
        <Form.Label>Type of content</Form.Label>
        <Form.Control
          type="text"
          as="select"
          onChange={(e) => {
            setContentType(e.target.value);
          }}
          value={contentType}
        >
          {contentTypes.map((x: any) => (
            <option key={x.code} value={x.code}>
              {x.name}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
      <Button className="align-self-start mb-5" disabled={contentType==="" || toSelected.length ===0}>Add</Button>

      <div
        className="mt-5 d-flex align-items-center back-icon pointer w-100"
        onClick={() => setSelectedValue(null)}
      >
        <div className="mr-2">{arrowLeftSvg}</div>
        <div>Go back</div>
      </div>
    </div>
  );
};

export const DeckAddModal = ({ open, onClose }: any) => {
  const [selectedOption, setSelectedOption] = useState(null);
  return (
    <Modal show={open} centered={true} onHide={onClose}>
      <ModalHeader
        className="header mt-3 justify-content-center"
        closeButton={true}
      >
        <div className="flex-grow-1">
          {selectedOption ? (
            <div className="d-flex align-items-center">
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
        {selectedOption ? (
          <AddColumn
            selectedValue={selectedOption}
            setSelectedValue={setSelectedOption}
          />
        ) : (
          <div className="d-flex w-100 flex-wrap">
            {options.map((option) => (
              <OptionWithIcon
                title={option.title}
                icon={option.icon}
                onOptionClick={setSelectedOption}
              />
            ))}
          </div>
        )}
      </ModalBody>
    </Modal>
  );
};
