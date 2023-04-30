import React, { useContext } from "react";
import "./_index.scss";
import { Button } from "react-bootstrap";
import { arrowLeftSvg } from "../../../img/svg";
import { DeckThreadsFormContext } from "./deck-threads-form-manager";
import { _t } from "../../../i18n";
import { UserAvatar } from "../../user-avatar";
import { useMappedStore } from "../../../store/use-mapped-store";
import { AvailableCredits } from "../../available-credits";
import { useLocation } from "react-router";
import { DeckThreadsFormControl } from "./deck-threads-form-control";

interface Props {
  className: string;
}

export const DeckThreadsForm = ({ className }: Props) => {
  const { global, activeUser } = useMappedStore();
  const { setShow } = useContext(DeckThreadsFormContext);
  const location = useLocation();

  return (
    <div className={"deck deck-toolbar-threads-form " + className}>
      <div className="deck-toolbar-threads-form-header">
        <Button variant="link" onClick={() => setShow(false)}>
          {arrowLeftSvg}
        </Button>
        <Button>{_t("decks.threads-form.bite-it")}</Button>
      </div>
      <div className="deck-toolbar-threads-form-content">
        <div className="deck-toolbar-threads-form-body p-3">
          <UserAvatar global={global} username={activeUser!.username} size="medium" />
          <DeckThreadsFormControl />
        </div>
        <div className="deck-toolbar-threads-form-footer">
          <AvailableCredits
            username={activeUser!.username}
            operation="comment_operation"
            activeUser={activeUser}
            location={location}
          />
          <Button href="/submit" target="_blank" variant="outline-primary" size="sm">
            {_t("decks.threads-form.create-regular-post")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export * from "./deck-threads-form-manager";
