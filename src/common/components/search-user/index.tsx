import React, { useEffect, useState } from "react";
import { Modal, Form, FormControl } from "react-bootstrap";

import { _t } from "../../i18n";
import "./index.scss";

interface Props {
  setSearchUser: (d: boolean) => void;
}

export default function SeachUser(props: Props) {
  const [searchtext, setSearchText] = useState("");

  const setStep = () => {
    const { setSearchUser } = props;
    setSearchUser(false);
  };
  return (
    <Modal
      animation={false}
      show={true}
      centered={true}
      onHide={setStep}
      keyboard={false}
      className="search-user-dialog"
      size="lg"
    >
      <Modal.Header closeButton={true} className="search-header">
        <Modal.Title>New message</Modal.Title>
      </Modal.Header>
      <Form.Group className="w-100 mb-3">
        <Form.Control
          type="text"
          placeholder={_t("chat.search")}
          value={searchtext}
          onChange={(e) => {
            setSearchText(e.target.value);
          }}
        />
      </Form.Group>
      <Modal.Body>
        {/* <ProposalVotesDetail
          {...this.props}
          searchText={searchText}
          getVotesCount={this.getVotesCount}
          checkIsMoreData={this.checkIsMoreData}
        /> */}
      </Modal.Body>
    </Modal>
  );
}
