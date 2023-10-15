import React, { useState } from "react";
import { _t } from "../../i18n";
import Tooltip from "../tooltip";
import formattedNumber from "../../util/formatted-number";
import ProfileLink from "../profile-link";
import UserAvatar from "../user-avatar";
import { History } from "history";
import { Global } from "../../store/global/types";
import "./wallet-spk-delegated-power-dialog.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import { FormControl } from "@ui/input";

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
      className="spk-delegation-power-dialog"
    >
      <ModalHeader closeButton={true}>
        <ModalTitle>{_t("wallet.spk.delegate.delegated-larynx-power.title")}</ModalTitle>
      </ModalHeader>
      <div className="w-full pb-4 px-3">
        <FormControl
          type="text"
          placeholder={_t("friends.search-placeholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <ModalBody>
        <div className="delegated-vesting-content">
          <div className="user-list">
            <div className="list-body">
              {items
                .filter(([username]) => username.toLowerCase().includes(query.toLowerCase()))
                .map(([username, value]) => (
                  <div className="list-item" key={username}>
                    <div className="item-main">
                      <ProfileLink username={username} history={history} addAccount={addAccount}>
                        <UserAvatar username={username} size="small" />
                      </ProfileLink>
                      <div className="item-info">
                        <ProfileLink history={history} username={username} addAccount={addAccount}>
                          <span className="item-name notranslate">{username}</span>
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
      </ModalBody>
    </Modal>
  );
};
