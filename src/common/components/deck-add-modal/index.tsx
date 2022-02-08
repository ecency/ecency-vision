import React, { useState } from "react";
import { Button, Form, Modal, ModalBody } from "react-bootstrap";
import ModalHeader from "react-bootstrap/esm/ModalHeader";
import {
  arrowLeftSvg,
  arrowRightSvg,
  closeSvg,
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

const OptionWithIcon = ({ title, icon, onOptionClick }: any) => (
  <div
    className="d-flex flex-column align-items-center justify-content-center option mr-2 pointer mt-2"
    onClick={() => onOptionClick(title)}
  >
    <div>{icon}</div>
    <div className="mt-2">{title}</div>
  </div>
);

const options = [
  {
    title: "Users",
    icon: person,
  },
  {
    title: "Trending",
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
  { code: "blogs", name: "Blogs" },
  { code: "posts", name: "Posts" },
  { code: "comments", name: "Comments" },
  { code: "replies", name: "Replies" },
];

const AddColumn = ({ setSelectedValue }: any) => {
  return (
    <div className="d-flex flex-column align-items-center mt-5">
      <Form.Group>
        <Form.Label>Username</Form.Label>
        <Form.Control />
      </Form.Group>

      <Form.Group className="w-100">
        <Form.Label>Type of content</Form.Label>
        <Form.Control type="text" as="select">
          {contentTypes.map((x: any) => (
            <option key={x.code} value={x.code}>
              {x.name}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
      <Button className="align-self-start mb-5 w-25">Add</Button>

      <div className="mt-5 d-flex align-items-center back-icon pointer w-100" onClick={()=>setSelectedValue(null)}>
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
              <div className="header-icon mr-2">
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
          <AddColumn selectedValue={selectedOption} setSelectedValue={setSelectedOption}/>
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
