import React, { useContext, useEffect, useRef, useState } from "react";
import "./_index.scss";
import { DeckThreadsFormContext } from "./deck-threads-form-manager";
import { DeckThreadsFormControl } from "./deck-threads-form-control";
import { DeckThreadsFormThreadSelection } from "./deck-threads-form-thread-selection";
import useLocalStorage from "react-use/lib/useLocalStorage";
import { DeckThreadsCreatedRecently } from "./deck-threads-created-recently";
import { IdentifiableEntry, ThreadItemEntry } from "../columns/deck-threads-manager";
import useClickAway from "react-use/lib/useClickAway";
import usePrevious from "react-use/lib/usePrevious";
import { Button } from "@ui/button";
import { Alert } from "@ui/alert";
import { Entry } from "@/entities";
import { useGlobalStore } from "@/core/global-store";
import { PollsContext } from "@/features/polls";
import { useLocation } from "react-use";
import { PREFIX } from "@/utils/local-storage";
import i18next from "i18next";
import { AvailableCredits, UserAvatar } from "@/features/shared";
import { arrowLeftSvg } from "@ui/svg";
import { classNameObject } from "@ui/util";

export * from "./deck-threads-form-manager";

interface Props {
  className?: string;
  inline?: boolean;
  placeholder?: string;
  replySource?: Entry;
  onSuccess?: (reply: Entry) => void;
  hideAvatar?: boolean;
  entry?: ThreadItemEntry;
  persistable?: boolean;
}

export const DeckThreadsForm = ({
  className,
  inline,
  placeholder,
  replySource,
  onSuccess,
  hideAvatar = false,
  entry,
  persistable = false
}: Props) => {
  const rootRef = useRef(null);
  useClickAway(rootRef, () => setFocused(false));

  const activeUser = useGlobalStore((s) => s.activeUser);
  const toggleUIProp = useGlobalStore((s) => s.toggleUiProp);
  const { setShow, create, createReply } = useContext(DeckThreadsFormContext);
  const { clearActivePoll } = useContext(PollsContext);

  const location = useLocation();

  const [localDraft, setLocalDraft] = useLocalStorage<Record<string, any>>(
    PREFIX + "_local_draft",
    {}
  );
  const [persistedForm, setPersistedForm] = useLocalStorage<Record<string, any>>(PREFIX + "_dtf_f");
  const previousPersistedForm = usePrevious(persistedForm);

  const [threadHost, setThreadHost] = useState("ecency.waves");
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);

  const [disabled, setDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const [lastCreatedThreadItem, setLastCreatedThreadItem] = useState<Entry | undefined>(undefined);

  useEffect(() => {
    setDisabled(!text || !threadHost);
  }, [text, threadHost]);

  useEffect(() => {
    if (entry) {
      let nextText = entry.body.replace("<br>", "\n").replace("<p>", "").replace("</p>", "");
      const nextImage = entry.body.match(/\!\[.*\]\(.+\)/g)?.[0];
      if (nextImage) {
        setImage(
          nextImage
            .replace(/\!\[.*\]/g, "")
            .replace("(", "")
            .replace(")", "")
        );
        nextText = nextText.replace(nextImage, "");
      }
      setText(nextText);
    }
  }, [entry]);

  useEffect(() => {
    if (persistable) {
      if (!threadHost && persistedForm?.threadHost) {
        setThreadHost(persistedForm.threadHost);
      }

      if (!text && persistedForm?.text) {
        setText(persistedForm.text);
      }

      if (!image && persistedForm?.image) {
        setImage(persistedForm.image);
      }

      if (!imageName && persistedForm?.imageName) {
        setImageName(persistedForm.imageName);
      }

      if (!video && persistedForm?.video) {
        setVideo(persistedForm.video);
      }
    }
  }, [image, imageName, persistable, persistedForm, text, threadHost, video]);

  useEffect(() => {
    if (
      persistable &&
      (persistedForm?.threadHost !== threadHost ||
        persistedForm?.text !== text ||
        persistedForm?.image !== image ||
        persistedForm?.imageName !== imageName ||
        persistedForm?.video !== video)
    ) {
      setPersistedForm({
        threadHost,
        text,
        image,
        imageName,
        video
      });
    }
  }, [
    threadHost,
    text,
    image,
    imageName,
    persistable,
    persistedForm?.threadHost,
    persistedForm?.text,
    persistedForm?.image,
    persistedForm?.imageName,
    persistedForm?.video,
    video,
    setPersistedForm
  ]);

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
      let content = text!!;

      if (image) {
        content = `${content}<br>![${imageName ?? ""}](${image})`;
      }

      if (video) {
        content = `${content}<br>${video}`;
      }

      // Push to draft built content with attachments
      if (text!!.length > 255) {
        setLocalDraft({
          ...localDraft,
          body: content
        });
        window.open("/submit", "_blank");
        return;
      }

      let threadItem: IdentifiableEntry;

      if (content === entry?.body) {
        return;
      }

      if (replySource) {
        threadItem = (await createReply(replySource, content, entry)) as IdentifiableEntry;
      } else {
        threadItem = (await create(threadHost!!, content, entry)) as IdentifiableEntry;
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
      clearActivePoll();
      i18next.t("decks.threads-form.successfully-created");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getSubmitButton = (size?: "sm") => (
    <Button
      onClick={submit}
      disabled={disabled || loading}
      className={"deck-toolbar-threads-form-submit "}
      size={size}
    >
      {!activeUser &&
        !entry &&
        text?.length <= 255 &&
        i18next.t("decks.threads-form.login-and-publish")}
      {activeUser &&
        !entry &&
        text?.length <= 255 &&
        (loading
          ? i18next.t("decks.threads-form.publishing")
          : i18next.t("decks.threads-form.publish"))}
      {text?.length > 255 && !entry && i18next.t("decks.threads-form.create-regular-post")}
      {entry && i18next.t("decks.threads-form.save")}
    </Button>
  );

  return (
    <div
      ref={rootRef}
      className={classNameObject({
        "deck-toolbar-threads-form": true,
        inline,
        deck: !inline,
        focus: focused,
        ...(className && { [className]: !!className }),
        hideAvatar
      })}
      onClick={() => setFocused(true)}
    >
      {!inline && (
        <div className="deck-toolbar-threads-form-header">
          <Button appearance="link" onClick={() => setShow(false)} icon={arrowLeftSvg} />
          {getSubmitButton()}
        </div>
      )}
      <div className="deck-toolbar-threads-form-content">
        <div className="deck-toolbar-threads-form-body p-3">
          {!hideAvatar && <UserAvatar username={activeUser?.username ?? ""} size="medium" />}
          <div>
            {!inline && (
              <DeckThreadsFormThreadSelection host={threadHost} setHost={setThreadHost} />
            )}
            <DeckThreadsFormControl
              video={video}
              text={text!!}
              setText={setText}
              selectedImage={image!!}
              onAddImage={(url, name) => {
                setImage(url);
                setImageName(name);
              }}
              onAddVideo={setVideo}
              setSelectedImage={setImage}
              placeholder={placeholder}
              onTextareaFocus={() => setFocused(true)}
            />
            {inline && (
              <div className="flex items-center">
                {activeUser && (
                  <AvailableCredits username={activeUser.username} operation="comment_operation" />
                )}
                {getSubmitButton("sm")}
              </div>
            )}
          </div>
        </div>
        {inline && text?.length > 255 && (
          <Alert appearance="warning">{i18next.t("decks.threads-form.max-length")}</Alert>
        )}
        {!inline && (
          <div className="deck-toolbar-threads-form-bottom">
            {text?.length > 255 && (
              <Alert appearance="warning">{i18next.t("decks.threads-form.max-length")}</Alert>
            )}
            <DeckThreadsCreatedRecently
              lastEntry={lastCreatedThreadItem}
              setLastEntry={setLastCreatedThreadItem}
            />
            <div className="deck-toolbar-threads-form-footer">
              {activeUser && (
                <AvailableCredits username={activeUser.username} operation="comment_operation" />
              )}
              <Button
                className="whitespace-nowrap flex items-center"
                href="/submit"
                target="_blank"
                appearance="primary"
                outline={true}
                size="sm"
              >
                {i18next.t("decks.threads-form.create-regular-post")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
