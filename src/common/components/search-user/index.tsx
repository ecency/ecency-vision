import React, { useEffect, useState } from "react";
import { Modal, Form } from "react-bootstrap";
import useDebounce from "react-use/lib/useDebounce";
import { lookupAccounts } from "../../api/hive";

import UserAvatar from "../user-avatar";
import { _t } from "../../i18n";
import "./index.scss";

interface Props {
  setSearchUser: (d: boolean) => void;
  setCurrentUserFromSearch: (username: string) => void;
}

export default function SeachUser(props: Props) {
  const [searchtext, setSearchText] = useState("");
  const [userList, setUserList] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(true);

  useDebounce(
    async () => {
      const resp = await lookupAccounts(searchtext, 7);
      setUserList(resp);
    },
    500,
    [searchtext]
  );

  const searchUserClicked = (username: string) => {
    const { setCurrentUserFromSearch, setSearchUser } = props;
    setCurrentUserFromSearch(username);
    setSearchUser(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    const { setSearchUser } = props;
    setSearchUser(false);
  };

  return (
    <Modal
      animation={false}
      show={showModal}
      centered={true}
      onHide={handleCloseModal}
      keyboard={false}
      className="search-user-dialog"
      size="lg"
    >
      <Modal.Header closeButton={true} className="search-header">
        <Modal.Title>{_t("chat.new-message")}</Modal.Title>
      </Modal.Header>
      <Form.Group className="w-100 mb-3">
        <Form.Control
          type="text"
          placeholder={_t("chat.search")}
          value={searchtext}
          autoFocus={true}
          onChange={(e) => {
            setSearchText(e.target.value);
          }}
        />
      </Form.Group>
      <Modal.Body>
        <div className="user-search-suggestion-list">
          {userList.map((user, index) => {
            return (
              <div key={index} className="search-content" onClick={() => searchUserClicked(user)}>
                <div className="search-user-img">
                  <span>
                    <UserAvatar username={user} size="medium" />
                  </span>
                </div>

                <div className="search-user-title">
                  <p className="search-username">{user}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Modal.Body>
    </Modal>
  );
}
