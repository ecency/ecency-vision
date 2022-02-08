import React from "react";
import { Modal, ModalBody } from "react-bootstrap";
import ModalHeader from "react-bootstrap/esm/ModalHeader";
import {
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

const OptionWithIcon = ({ title, icon }: any) => (
  <div className="d-flex flex-column align-items-center justify-content-center option mr-2 pointer mt-2">
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

export const DeckAddModal = ({ open, onClose }: any) => {
  return (
    <Modal show={open} centered={true} onHide={onClose}>
      <ModalHeader className="header mt-3 justify-content-center">
        Which column type do you want to add?
      </ModalHeader>
      <ModalBody className="d-flex justify-content-center">
        <div className="d-flex w-100 flex-wrap">
          {options.map((option) => (
            <OptionWithIcon title={option.title} icon={option.icon} />
          ))}
        </div>
      </ModalBody>
    </Modal>
  );
};
