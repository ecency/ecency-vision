import React, { useState } from "react";
import "./wallet-spk-delegated-power-dialog.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import { FormControl } from "@ui/input";
import i18next from "i18next";
import { ProfileLink, UserAvatar } from "@/features/shared";
import { Tooltip } from "@ui/tooltip";
import { formattedNumber } from "@/utils";

interface Props {
  show: boolean;
  setShow: (value: boolean) => void;
  items: [string, number][];
}

export const WalletSpkDelegatedPowerDialog = ({ show, setShow, items }: Props) => {
  const [query, setQuery] = useState("");
  const clear = () => {
    setQuery("");
  };

  return (
    <Modal
      show={show}
      centered={true}
      onHide={() => {
        setShow(false);
        clear();
      }}
      className="spk-delegation-power-dialog"
    >
      <ModalHeader closeButton={true}>
        <ModalTitle>{i18next.t("wallet.spk.delegate.delegated-larynx-power.title")}</ModalTitle>
      </ModalHeader>
      <div className="w-full pb-4 px-3">
        <FormControl
          type="text"
          placeholder={i18next.t("friends.search-placeholder")}
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
                      <ProfileLink username={username}>
                        <UserAvatar username={username} size="small" />
                      </ProfileLink>
                      <div className="item-info">
                        <ProfileLink username={username}>
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
