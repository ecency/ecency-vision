import React, { useContext, useEffect, useState } from "react";
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
import { DeckThreadsFormThreadSelection } from "./deck-threads-form-thread-selection";
import useLocalStorage from "react-use/lib/useLocalStorage";
import { PREFIX } from "../../../util/local-storage";
import { Entry } from "../../../store/entries/types";
import { DeckThreadsCreatedRecently } from "./deck-threads-created-recently";

interface Props {
  className: string;
}

export const DeckThreadsForm = ({ className }: Props) => {
  const { global, activeUser, toggleUIProp } = useMappedStore();
  const { setShow, create } = useContext(DeckThreadsFormContext);
  const location = useLocation();

  const [threadHost, setThreadHost] = useLocalStorage(PREFIX + "_dtf_th", "");
  const [text, setText] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const [lastCreatedThreadItem, setLastCreatedThreadItem] = useState<Entry | undefined>(undefined);

  const submit = async () => {
    if (!activeUser) {
      toggleUIProp("login");
      return;
    }

    if (disabled) {
      return;
    }

    setLoading(true);
    try {
      const threadItem = await create(threadHost!!, text);
      setLastCreatedThreadItem(threadItem);
      setText("");
      _t("decks.threads-form.successfully-created");
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setDisabled(!text || !threadHost);
  }, [text, threadHost]);

  return (
    <div className={"deck deck-toolbar-threads-form " + className}>
      <div className="deck-toolbar-threads-form-header">
        <Button variant="link" onClick={() => setShow(false)}>
          {arrowLeftSvg}
        </Button>
        <Button onClick={submit} disabled={disabled || loading}>
          {!activeUser
            ? _t("decks.threads-form.login-and-bite")
            : loading
            ? _t("decks.threads-form.biting")
            : _t("decks.threads-form.bite-it")}
        </Button>
      </div>
      <div className="deck-toolbar-threads-form-content">
        <div className="deck-toolbar-threads-form-body p-3">
          <UserAvatar global={global} username={activeUser?.username ?? ""} size="medium" />
          <div>
            <DeckThreadsFormThreadSelection host={threadHost} setHost={setThreadHost} />
            <DeckThreadsFormControl text={text} setText={setText} />
          </div>
        </div>
        <div>
          <DeckThreadsCreatedRecently
            lastEntry={lastCreatedThreadItem}
            setLastEntry={setLastCreatedThreadItem}
          />
          <div className="deck-toolbar-threads-form-footer">
            {activeUser && (
              <AvailableCredits
                username={activeUser.username}
                operation="comment_operation"
                activeUser={activeUser}
                location={location}
              />
            )}
            <Button href="/submit" target="_blank" variant="outline-primary" size="sm">
              {_t("decks.threads-form.create-regular-post")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export * from "./deck-threads-form-manager";
