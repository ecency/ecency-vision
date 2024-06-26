import React from "react";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import i18next from "i18next";
import { formattedNumber } from "@/utils";
import { Account } from "@/entities";
import { FriendsList } from "@/app/[filterOrCategory]/[entryOrCommunity]/_profile-components/friends/friends-list";

interface Props {
  account: Account;
  onHide: () => void;
}
export function Followers({ onHide, account }: Props) {
  return (
    <Modal onHide={onHide} show={true} centered={true} animation={false} size="lg">
      <ModalHeader closeButton={true}>
        <ModalTitle>
          {account.__loaded && account.follow_stats
            ? i18next.t("friends.followers", {
                n: formattedNumber(account.follow_stats.follower_count, { fractionDigits: 0 })
              })
            : ""}
        </ModalTitle>
      </ModalHeader>
      <ModalBody>
        <FriendsList mode="follower" account={account} />
      </ModalBody>
    </Modal>
  );
}

export function Following({ onHide, account }: Props) {
  return (
    <Modal onHide={onHide} show={true} centered={true} animation={false} size="lg">
      <ModalHeader closeButton={true}>
        <ModalTitle>
          {account.__loaded && account.follow_stats
            ? i18next.t("friends.following", {
                n: formattedNumber(account.follow_stats.following_count, { fractionDigits: 0 })
              })
            : ""}
        </ModalTitle>
      </ModalHeader>
      <ModalBody>
        <FriendsList mode="following" account={account} />
      </ModalBody>
    </Modal>
  );
}
