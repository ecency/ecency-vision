import { ThreeSpeakVideo } from "../../api/threespeak";
import { useMappedStore } from "../../store/use-mapped-store";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMountedState } from "react-use";
import { v4 } from "uuid";
import _c from "../../util/fix-class-names";
import Tooltip from "../tooltip";
import { _t } from "../../i18n";
import {
  codeTagsSvg,
  emoticonHappyOutlineSvg,
  formatBoldSvg,
  formatItalicSvg,
  formatListBulletedSvg,
  formatListNumberedSvg,
  formatQuoteCloseSvg,
  formatTitleSvg,
  gifIcon,
  gridSvg,
  imageSvg,
  linkSvg,
  textShortSvg,
  videoSvg
} from "../../img/svg";
import { VideoUpload } from "../video-upload-threespeak";
import VideoGallery from "../video-gallery";
import { EmojiPicker } from "../emoji-picker";
import GifPicker from "../gif-picker";
import AddImageMobile from "../add-image-mobile";
import { insertOrReplace, replace } from "../../util/input-util";
import Gallery from "../gallery";
import { getAccessToken } from "../../helper/user-token";
import { uploadImage } from "../../api/misc";
import { addImage } from "../../api/private-api";
import { error } from "../feedback";
import axios from "axios";
import Fragments from "../fragments";
import AddImage from "../add-image";
import AddLink from "../add-link";
import "./_index.scss";
import { PollsCreation, PollSnapshot } from "../../features/polls";
import { UilQuestion } from "@iconscout/react-unicons";
import { classNameObject } from "../../helper/class-name-object";

interface Props {
  sm?: boolean;
  setVideoEncoderBeneficiary?: (video: any) => void;
  toggleNsfwC?: () => void;
  comment: boolean;
  setVideoMetadata?: (v: ThreeSpeakVideo) => void;
  onAddPoll?: (poll: PollSnapshot) => void;
  existingPoll?: PollSnapshot;
  onDeletePoll?: () => void;
}

export const detectEvent = (eventType: string) => {
  const ev = new Event(eventType);
  window.dispatchEvent(ev);
};

export const toolbarEventListener = (event: Event, eventType: string) => {
  const ev = new CustomEvent("customToolbarEvent", { detail: { event, eventType } });
  window.dispatchEvent(ev);
};

export function EditorToolbar({
  sm,
  comment,
  setVideoMetadata,
  setVideoEncoderBeneficiary,
  toggleNsfwC,
  onAddPoll,
  existingPoll,
  onDeletePoll
}: Props) {
  const { global, activeUser, users } = useMappedStore();

  const rootRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [gallery, setGallery] = useState(false);
  const [fragments, setFragments] = useState(false);
  const [image, setImage] = useState(false);
  const [link, setLink] = useState(false);
  const [mobileImage, setMobileImage] = useState(false);
  const [gif, setGif] = useState(false);
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [showVideoGallery, setShowVideoGallery] = useState(false);
  const [showPollsCreation, setShowPollsCreation] = useState(false);

  const toolbarId = useMemo(() => v4(), []);
  const headers = useMemo(() => [...Array(3).keys()], []);

  const isMounted = useMountedState();

  useEffect(() => {
    window.addEventListener("bold", bold);
    window.addEventListener("italic", italic);
    window.addEventListener("table", table);
    window.addEventListener("link", () => setLink(true));
    window.addEventListener("codeBlock", code);
    window.addEventListener("blockquote", quote);
    window.addEventListener("image", () => setImage(true));
    window.addEventListener("customToolbarEvent", handleCustomToolbarEvent);

    return () => {
      window.removeEventListener("bold", bold);
      window.removeEventListener("italic", italic);
      window.removeEventListener("table", table);
      window.removeEventListener("link", () => setLink(true));
      window.removeEventListener("codeBlock", code);
      window.removeEventListener("blockquote", quote);
      window.removeEventListener("image", () => setImage(true));
      window.removeEventListener("customToolbarEvent", handleCustomToolbarEvent);
    };
  }, []);

  const getTargetEl = () => {
    const root = rootRef.current;
    if (!root || !root.parentElement) {
      return null;
    }

    return root.parentElement.querySelector(".the-editor") as HTMLInputElement;
  };

  const insertText = (before: string, after: string = "") => {
    const el = getTargetEl();
    if (el) {
      insertOrReplace(el, before, after);
    }
    return getTargetEl();
  };

  const replaceText = (find: string, rep: string) => {
    const el = getTargetEl();
    if (el) {
      replace(el, find, rep);
    }
  };

  const bold = () => insertText("**", "**");
  const italic = () => insertText("*", "*");
  const header = (w: number) => insertText(`${"#".repeat(w)} `);
  const code = () => insertText("<code>", "</code>");
  const quote = () => insertText(">");
  const ol = () => insertText("1. item1\n2. item2\n3. item3");
  const ul = () => insertText("* item1\n* item2\n* item3");
  const insertLink = (text: string, url: string) => insertText(`[${text}`, `](${url})`);
  const insertImage = (text: string, url: string) => insertText(`![${text}`, `](${url})`);

  const table = (e: React.MouseEvent<HTMLElement> | Event) => {
    e.stopPropagation();
    const t =
      "\n|\tColumn 1\t|\tColumn 2\t|\tColumn 3\t|\n" +
      "|\t------------\t|\t------------\t|\t------------\t|\n" +
      "|\t     Text     \t|\t     Text     \t|\t     Text     \t|\n";
    insertText(t);
  };

  const table1 = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();

    const t = "\n|\tColumn 1\t|\n" + "|\t------------\t|\n" + "|\t     Text     \t|\n";
    insertText(t);
  };

  const table2 = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    const t =
      "\n|\tColumn 1\t|\tColumn 2\t|\n" +
      "|\t------------\t|\t------------\t|\n" +
      "|\t     Text     \t|\t     Text     \t|\n";
    insertText(t);
  };

  const fileInputChanged = (e: React.ChangeEvent<HTMLInputElement>): void => {
    let files = [...(e.target.files as FileList)].filter((i) => checkFile(i.name)).filter((i) => i);

    if (files.length > 0) {
      e.stopPropagation();
      e.preventDefault();
    }

    files.forEach((file) => upload(file));

    // reset input
    e.target.value = "";
  };

  const upload = async (file: File) => {
    const username = activeUser?.username!;

    const tempImgTag = `![Uploading ${file.name} #${Math.floor(Math.random() * 99)}]()\n\n`;
    insertText(tempImgTag);

    let imageUrl: string;
    try {
      let token = getAccessToken(username);
      if (token) {
        const resp = await uploadImage(file, token);
        imageUrl = resp.url;

        if (global.usePrivate && imageUrl.length > 0) {
          addImage(username, imageUrl).then();
        }

        const imgTag = imageUrl.length > 0 && `![](${imageUrl})\n\n`;

        imgTag && replaceText(tempImgTag, imgTag);
      } else {
        error(_t("editor-toolbar.image-error-cache"));
      }
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 413) {
        error(_t("editor-toolbar.image-error-size"));
      } else {
        error(_t("editor-toolbar.image-error"));
      }
      return;
    }
  };

  const checkFile = (filename: string) =>
    ["jpg", "jpeg", "gif", "png", "webp"].some((el) => filename.toLowerCase().endsWith(el));

  const handleCustomToolbarEvent = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    switch (detail.eventType) {
      case "paste":
        onPaste(detail.event);
        break;
      case "dragover":
        onDragOver(detail.event);
        break;
      case "drop":
        drop(detail.event);
        break;
    }
  };

  const onDragOver = (e: DragEvent) => {
    if (!activeUser) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "copy";
      e.dataTransfer.dropEffect = "copy";
    }
  };

  const drop = (e: DragEvent) => {
    if (!activeUser) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    if (!e.dataTransfer) {
      return;
    }

    const files = [...e.dataTransfer.files].filter((i) => checkFile(i.name)).filter((i) => i);

    if (files.length > 0) {
      files.forEach((file) => upload(file));
    }
  };

  const onPaste = (e: ClipboardEvent) => {
    if (!e.clipboardData) {
      return;
    }

    // when text copied from ms word, it adds screenshot of selected text to clipboard.
    // check if data in clipboard is long string and skip upload.
    // (i think no one uses more than 50 chars for a image file)
    const txtData = e.clipboardData.getData("text/plain");
    if (txtData.length >= 50) {
      return;
    }

    const files = [...e.clipboardData.items]
      .map((item) => (item.type.indexOf("image") !== -1 ? item.getAsFile() : null))
      .filter((i) => i);

    if (files.length > 0) {
      e.stopPropagation();
      e.preventDefault();

      files.forEach((file) => {
        if (file) upload(file).then();
      });
    }
  };

  return (
    <>
      <div
        id="editor-toolbar"
        className={_c(`editor-toolbar ${sm ? "toolbar-sm" : ""}`)}
        ref={rootRef}
      >
        <Tooltip content={_t("editor-toolbar.bold")}>
          <div className="editor-tool" onClick={bold}>
            {formatBoldSvg}
          </div>
        </Tooltip>
        <Tooltip content={_t("editor-toolbar.italic")}>
          <div className="editor-tool" onClick={italic}>
            {formatItalicSvg}
          </div>
        </Tooltip>
        <Tooltip content={_t("editor-toolbar.header")}>
          <div className="editor-tool" onClick={() => header(1)}>
            {formatTitleSvg}
            <div className="sub-tool-menu">
              {headers.map((i) => (
                <div
                  key={i}
                  className="sub-tool-menu-item"
                  onClick={(e: React.MouseEvent<HTMLElement>) => {
                    e.stopPropagation();
                    header(i + 2);
                  }}
                >
                  {`H${i + 2}`}
                </div>
              ))}
            </div>
          </div>
        </Tooltip>
        <div className="tool-separator" />
        <Tooltip content={_t("editor-toolbar.code")}>
          <div className="editor-tool" onClick={code}>
            {codeTagsSvg}
          </div>
        </Tooltip>
        <Tooltip content={_t("editor-toolbar.quote")}>
          <div className="editor-tool" onClick={quote}>
            {formatQuoteCloseSvg}
          </div>
        </Tooltip>
        {global.usePrivate && (
          <Tooltip content={_t("editor-toolbar.fragments")}>
            <div className="editor-tool" onClick={() => setFragments(!fragments)}>
              {textShortSvg}
            </div>
          </Tooltip>
        )}
        <div className="tool-separator" />
        <Tooltip content={_t("editor-toolbar.ol")}>
          <div className="editor-tool" onClick={ol}>
            {formatListNumberedSvg}
          </div>
        </Tooltip>
        <Tooltip content={_t("editor-toolbar.ul")}>
          <div className="editor-tool" onClick={ul}>
            {formatListBulletedSvg}
          </div>
        </Tooltip>
        <Tooltip content={_t("editor-toolbar.table")}>
          <div className="editor-tool" onClick={table}>
            {gridSvg}
            <div className="sub-tool-menu">
              <div className="sub-tool-menu-item" onClick={table}>
                {_t("editor-toolbar.table-3-col")}
              </div>
              <div className="sub-tool-menu-item" onClick={table2}>
                {_t("editor-toolbar.table-2-col")}
              </div>
              <div className="sub-tool-menu-item" onClick={table1}>
                {_t("editor-toolbar.table-1-col")}
              </div>
            </div>
          </div>
        </Tooltip>
        <div className="tool-separator" />
        {activeUser && global.isMobile ? (
          <Tooltip content={_t("editor-toolbar.image")}>
            <div className="editor-tool" onClick={() => setMobileImage(!mobileImage)}>
              {imageSvg}
            </div>
          </Tooltip>
        ) : (
          <Tooltip content={_t("editor-toolbar.image")}>
            <div className="editor-tool" onClick={() => setImage(!image)}>
              {imageSvg}

              {activeUser && (
                <div className="sub-tool-menu">
                  <div
                    className="sub-tool-menu-item"
                    onClick={(e: React.MouseEvent<HTMLElement>) => {
                      e.stopPropagation();
                      const el = fileInputRef.current?.click();
                    }}
                  >
                    {_t("editor-toolbar.upload")}
                  </div>
                  {global.usePrivate && (
                    <div
                      className="sub-tool-menu-item"
                      onClick={(e: React.MouseEvent<HTMLElement>) => {
                        e.stopPropagation();
                        setGallery(!gallery);
                      }}
                    >
                      {_t("editor-toolbar.gallery")}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Tooltip>
        )}
        {!comment && (
          <Tooltip content={_t("video-upload.upload-video")}>
            <div className="editor-tool" role="none">
              <VideoUpload
                className="new-feature"
                show={showVideoUpload}
                setShow={(v) => setShowVideoUpload(v)}
                setShowGallery={(v) => setShowVideoGallery(v)}
              >
                {videoSvg}
                {activeUser && (
                  <div className="sub-tool-menu">
                    <div className="sub-tool-menu-item" onClick={() => setShowVideoUpload(true)}>
                      {_t("video-upload.upload-video")}
                    </div>
                    {global.usePrivate && (
                      <div
                        className="sub-tool-menu-item"
                        onClick={(e: React.MouseEvent<HTMLElement>) => {
                          e.stopPropagation();
                          setShowVideoGallery(true);
                        }}
                      >
                        {_t("video-upload.video-gallery")}
                      </div>
                    )}
                  </div>
                )}
              </VideoUpload>
              <VideoGallery
                showGallery={showVideoGallery}
                setShowGallery={(v) => setShowVideoGallery(v)}
                insertText={insertText}
                setVideoEncoderBeneficiary={setVideoEncoderBeneficiary}
                toggleNsfwC={toggleNsfwC}
                setVideoMetadata={setVideoMetadata}
              />
            </div>
          </Tooltip>
        )}
        {isMounted() && (
          <Tooltip content={_t("editor-toolbar.emoji")}>
            <div className="editor-tool" id={"editor-tool-emoji-picker-" + toolbarId} role="none">
              {emoticonHappyOutlineSvg}
              <EmojiPicker
                anchor={
                  document.querySelector("#editor-tool-emoji-picker-" + toolbarId)!! as HTMLElement
                }
                onSelect={(e) => insertText(e, "")}
              />
            </div>
          </Tooltip>
        )}
        <Tooltip content={_t("Gif")}>
          <div className="editor-tool" role="none">
            <div className="editor-tool-gif-icon" onClick={() => setGif(!gif)}>
              {gifIcon}
            </div>
            {gif && (
              <GifPicker
                shGif={true}
                changeState={(gifState) => setGif(gifState ?? false)}
                fallback={(e) => insertText(e, "")}
              />
            )}
          </div>
        </Tooltip>
        <Tooltip content={_t("editor-toolbar.link")}>
          <div className="editor-tool" onClick={() => setLink(!link)}>
            {linkSvg}
          </div>
        </Tooltip>
        <Tooltip content={_t("editor-toolbar.polls")}>
          <div
            className={classNameObject({
              "editor-tool": true,
              "bg-green bg-opacity-25": !!existingPoll
            })}
            onClick={() => setShowPollsCreation(!showPollsCreation)}
          >
            <UilQuestion />
          </div>
        </Tooltip>
      </div>
      <input
        onChange={fileInputChanged}
        className="file-input"
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={true}
        style={{ display: "none" }}
      />
      {gallery && activeUser && (
        <Gallery
          onHide={() => setGallery(false)}
          onPick={(url: string) => {
            const fileName = "";
            insertImage(fileName, url);
            setGallery(false);
          }}
        />
      )}
      {fragments && activeUser && (
        <Fragments
          onHide={() => setFragments(false)}
          onPick={(body: string) => {
            insertText(body);
            setFragments(false);
          }}
        />
      )}
      {image && (
        <AddImage
          onHide={() => setImage(false)}
          onSubmit={(text: string, link: string) => {
            insertImage(text, link);
            setImage(false);
          }}
        />
      )}
      {link && (
        <AddLink
          onHide={() => setLink(false)}
          onSubmit={(text: string, link: string) => {
            insertLink(text, link);
            setLink(false);
          }}
        />
      )}
      {mobileImage && (
        <AddImageMobile
          global={global}
          activeUser={activeUser}
          onHide={() => setMobileImage(false)}
          onPick={(url) => {
            const fileName = "";
            insertImage(fileName, url);
            setMobileImage(false);
          }}
          onGallery={() => {
            setMobileImage(false);
            setGallery(!gallery);
          }}
          onUpload={() => {
            setMobileImage(false);
            const el = fileInputRef.current?.click();
          }}
        />
      )}
      <PollsCreation
        existingPoll={existingPoll}
        show={showPollsCreation}
        setShow={(v) => setShowPollsCreation(v)}
        onAdd={(snap) => onAddPoll?.(snap)}
        onDeletePoll={() => onDeletePoll?.()}
      />
    </>
  );
}
