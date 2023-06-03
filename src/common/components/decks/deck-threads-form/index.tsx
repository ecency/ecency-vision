import React, { useContext, useEffect, useRef, useState } from "react";
import "./_index.scss";
import { Alert, Button } from "react-bootstrap";
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
import { IdentifiableEntry } from "../columns/deck-threads-manager";
import useClickAway from "react-use/lib/useClickAway";

interface Props {
  className?: string;
  inline?: boolean;
  placeholder?: string;
  replySource?: Entry;
  onSuccess?: (reply: Entry) => void;
}

export const DeckThreadsForm = ({
  className,
  inline,
  placeholder,
  replySource,
  onSuccess
}: Props) => {
  const rootRef = useRef(null);
  useClickAway(rootRef, () => setFocused(false));

  const { global, activeUser, toggleUIProp } = useMappedStore();
  const { setShow, create, createReply } = useContext(DeckThreadsFormContext);
  const location = useLocation();

  const [localDraft, setLocalDraft] = useLocalStorage<Record<string, any>>(
    PREFIX + "_local_draft",
    {}
  );
  const [threadHost, setThreadHost] = useLocalStorage(PREFIX + "_dtf_th", "ecency.waves");
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [disabled, setDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

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
      let content = text;

      if (image) {
        content = `${content}<br>![${imageName ?? ""}](${image})`;
      }

      // Push to draft built content with attachments
      if (text.length > 255) {
        setLocalDraft({
          ...localDraft,
          body: content
        });
        window.open("/submit", "_blank");
        return;
      }

      let threadItem: IdentifiableEntry;

      if (replySource) {
        threadItem = (await createReply(replySource, content)) as IdentifiableEntry;
      } else {
        threadItem = (await create(threadHost!!, content)) as IdentifiableEntry;
      }

      if (threadHost) {
        threadItem.host = threadHost;
      }
      threadItem.id = threadItem.post_id;

      setLastCreatedThreadItem(threadItem);

      if (onSuccess) {
        onSuccess(threadItem);
      }
      setText("");
      setImage(null);
      setImageName(null);
      _t("decks.threads-form.successfully-created");
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setDisabled(!text || !threadHost);
  }, [text, threadHost]);

  const getSubmitButton = (size?: "sm") => (
    <Button
      onClick={submit}
      disabled={disabled || loading}
      className={"deck-toolbar-threads-form-submit "}
      size={size}
    >
      {!activeUser && text.length <= 255 && _t("decks.threads-form.login-and-publish")}
      {activeUser &&
        text.length <= 255 &&
        (loading ? _t("decks.threads-form.publishing") : _t("decks.threads-form.publish"))}
      {text.length > 255 && _t("decks.threads-form.create-regular-post")}
    </Button>
  );

  return (
    <div
      ref={rootRef}
      className={
        "deck-toolbar-threads-form " +
        (inline ? " inline " : " deck ") +
        (focused ? " focus " : "") +
        className
      }
      onClick={() => setFocused(true)}
    >
      {!inline && (
        <div className="deck-toolbar-threads-form-header">
          <Button variant="link" onClick={() => setShow(false)}>
            {arrowLeftSvg}
          </Button>
          {getSubmitButton()}
        </div>
      )}
      <div className="deck-toolbar-threads-form-content">
        <div className="deck-toolbar-threads-form-body p-3">
          <UserAvatar global={global} username={activeUser?.username ?? ""} size="medium" />
          <div>
            {!inline && (
              <DeckThreadsFormThreadSelection host={threadHost} setHost={setThreadHost} />
            )}
            <DeckThreadsFormControl
              text={text}
              setText={setText}
              selectedImage={image}
              onAddImage={(url, name) => {
                setImage(url);
                setImageName(name);
              }}
              setSelectedImage={setImage}
              placeholder={placeholder}
            />
            {inline && (
              <div className="d-flex align-items-center">
                {activeUser && (
                  <AvailableCredits
                    username={activeUser.username}
                    operation="comment_operation"
                    activeUser={activeUser}
                    location={location}
                  />
                )}
                {getSubmitButton("sm")}
              </div>
            )}
          </div>
        </div>
        {inline && text.length > 255 && (
          <Alert variant="warning">{_t("decks.threads-form.max-length")}</Alert>
        )}
        {!inline && (
          <div className="deck-toolbar-threads-form-bottom">
            {text.length > 255 && (
              <Alert variant="warning">{_t("decks.threads-form.max-length")}</Alert>
            )}
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
        )}
      </div>
    </div>
  );
};

export * from "./deck-threads-form-manager";
