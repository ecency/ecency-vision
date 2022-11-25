import React from "react";
import { ListGroup, ListGroupItem } from "react-bootstrap";
import { ActiveUser } from "../../store/active-user/types";
import { _t } from "../../i18n";
import { externalLink } from "../../img/svg";

interface Props {
  activeUser: ActiveUser | null;
}

export const InsufficientResourceCreditsDetails = ({ activeUser }: Props) => {
  return (
    <div className="insufficient-resource-credits-details">
      <p className="mb-4">{_t("feedback-modal.insufficient-resource-title")}</p>
      <ListGroup>
        <ListGroupItem
          action={true}
          onClick={() =>
            window.open(`/purchase?username=${activeUser?.username}&type=boost`, "_blank")
          }
        >
          {_t("feedback-modal.insufficient-resource-purchase")} {externalLink}
        </ListGroupItem>
        <ListGroupItem action={true} onClick={() => window.open("/faq#what-powering-up", "_blank")}>
          {_t("feedback-modal.insufficient-resource-buy-hive")} {externalLink}
        </ListGroupItem>
        <ListGroupItem action={true} onClick={() => window.open("/faq#what-are-rc", "_blank")}>
          {_t("feedback-modal.insufficient-resource-wait")} {externalLink}
        </ListGroupItem>
      </ListGroup>
    </div>
  );
};
