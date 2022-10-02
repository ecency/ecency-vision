import { Form, Modal } from "react-bootstrap";
import React, { useState } from "react";
import { _t } from "../../i18n";
import Tooltip from "../tooltip";
import formattedNumber from "../../util/formatted-number";
import ProfileLink from "../profile-link";
import UserAvatar from "../user-avatar";
import { History } from "history";
import { Global } from "../../store/global/types";

interface Props {
  show: boolean;
  setShow: (value: boolean) => void;
  items: [string, number][];
  history: History;
  global: Global;
  addAccount: any;
}

export const WalletSpkDelegatedPowerDialog = ({
  show,
  setShow,
  items,
  history,
  global,
  addAccount
}: Props) => {
  const [query, setQuery] = useState("");
  const clear = () => {
    setQuery("");
  };

  return (
    <Modal
      animation={false}
      show={show}
      centered={true}
      onHide={() => {
        setShow(false);
        clear();
      }}
      keyboard={false}
      className="spk-delegation-power-dialog"
    >
      <Modal.Header closeButton={true}>
        <Modal.Title>{_t("wallet.spk.delegate.delegated-larynx-power.title")}</Modal.Title>
      </Modal.Header>
      <Form.Group className="w-100 px-3">
        <Form.Control
          type="text"
          placeholder={_t("friends.search-placeholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </Form.Group>
      <Modal.Body>
        <div className="delegated-vesting-content">
          <div className="user-list">
            <div className="list-body">
              {items
                .filter(([username]) => username.toLowerCase().includes(query.toLowerCase()))
                .map(([username, value]) => (
                  <div className="list-item" key={username}>
                    <div className="item-main">
                      <ProfileLink username={username} history={history} addAccount={addAccount}>
                        {UserAvatar({ global, username, size: "small" })}
                      </ProfileLink>
                      {ProfileLink({
                        history,
                        addAccount,
                        username,
                        children: <>{UserAvatar({ global, username, size: "small" })}</>
                      })}
                      <div className="item-info">
                        <ProfileLink history={history} username={username} addAccount={addAccount}>
                          <a className="item-name notransalte">{username}</a>
                        </ProfileLink>
                      </div>
                    </div>
                    <div className="item-extra">
                      <Tooltip content="">
                        <span>{formattedNumber(value / 1000)} LP</span>
                      </Tooltip>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};
