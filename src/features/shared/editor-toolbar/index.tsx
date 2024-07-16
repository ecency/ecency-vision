"use client";

import React, { useMemo, useRef, useState } from "react";
import { useMountedState } from "react-use";
import { v4 } from "uuid";
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
} from "@/assets/img/svg";
import "./_index.scss";
import { UilPanelAdd } from "@iconscout/react-unicons";
import { ThreeSpeakVideo } from "@/api/threespeak";
import { PollsCreation, PollSnapshot } from "@/features/polls";
import { useGlobalStore } from "@/core/global-store";
import { useUploadPostImage } from "@/api/mutations";
import { insertOrReplace, replace } from "@/utils";
import { Tooltip } from "@ui/tooltip";
import i18next from "i18next";
import { EmojiPicker } from "@/features/ui";
import { GifPicker } from "@ui/gif-picker";
import { classNameObject } from "@ui/util";
import { GalleryDialog } from "@/features/shared/gallery";
import { Fragments } from "@/features/shared/fragments/fragments-list";
import { VideoUpload } from "@/features/shared/video-upload-threespeak";
import { VideoGallery } from "@/features/shared/video-gallery";
import { AddImage } from "@/features/shared/editor-toolbar/add-image";
import { AddLink } from "@/features/shared/editor-toolbar/add-link";
import { AddImageMobile } from "@/features/shared/editor-toolbar/add-image-mobile";
import useMount from "react-use/lib/useMount";

interface Props {
  sm?: boolean;
  setVideoEncoderBeneficiary?: (video: any) => void;
  toggleNsfwC?: () => void;
  comment: boolean;
  setVideoMetadata?: (v: ThreeSpeakVideo) => void;
  onAddPoll?: (poll: PollSnapshot) => void;
  existingPoll?: PollSnapshot;
  onDeletePoll?: () => void;
  readonlyPoll?: boolean;
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
  onDeletePoll,
  readonlyPoll
}: Props) {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const usePrivate = useGlobalStore((s) => s.usePrivate);
  const isMobile = useGlobalStore((s) => s.isMobile);

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
  const headers = useMemo(() => Array.from(new Array(3).keys()), []);

  const uploadImage = useUploadPostImage();
  const isMounted = useMountedState();

  useMount(() => {
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
  });

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
    let files = Array.from(e.target.files as FileList)
      .filter((i) => checkFile(i.name))
      .filter((i) => i);

    if (files.length > 0) {
      e.stopPropagation();
      e.preventDefault();
    }

    files.forEach((file) => upload(file));

    // reset input
    e.target.value = "";
  };

  const upload = async (file: File) => {
    const tempImgTag = `![Uploading ${file.name} #${Math.floor(Math.random() * 99)}]()\n\n`;
    insertText(tempImgTag);

    const { url } = await uploadImage.mutateAsync({ file });
    const imgTag = url.length > 0 && `![](${url})\n\n`;
    imgTag && replaceText(tempImgTag, imgTag);
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

    const files = Array.from(e.dataTransfer.files)
      .filter((i) => checkFile(i.name))
      .filter((i) => i);

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

    const files = Array.from(e.clipboardData.items)
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
      <div id="editor-toolbar" className={`editor-toolbar ${sm ? "toolbar-sm" : ""}`} ref={rootRef}>
        <Tooltip content={i18next.t("editor-toolbar.bold")}>
          <div className="editor-tool" onClick={bold}>
            {formatBoldSvg}
          </div>
        </Tooltip>
        <Tooltip content={i18next.t("editor-toolbar.italic")}>
          <div className="editor-tool" onClick={italic}>
            {formatItalicSvg}
          </div>
        </Tooltip>
        <Tooltip content={i18next.t("editor-toolbar.header")}>
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
        <Tooltip content={i18next.t("editor-toolbar.code")}>
          <div className="editor-tool" onClick={code}>
            {codeTagsSvg}
          </div>
        </Tooltip>
        <Tooltip content={i18next.t("editor-toolbar.quote")}>
          <div className="editor-tool" onClick={quote}>
            {formatQuoteCloseSvg}
          </div>
        </Tooltip>
        {usePrivate && (
          <Tooltip content={i18next.t("editor-toolbar.fragments")}>
            <div className="editor-tool" onClick={() => setFragments(!fragments)}>
              {textShortSvg}
            </div>
          </Tooltip>
        )}
        <div className="tool-separator" />
        <Tooltip content={i18next.t("editor-toolbar.ol")}>
          <div className="editor-tool" onClick={ol}>
            {formatListNumberedSvg}
          </div>
        </Tooltip>
        <Tooltip content={i18next.t("editor-toolbar.ul")}>
          <div className="editor-tool" onClick={ul}>
            {formatListBulletedSvg}
          </div>
        </Tooltip>
        <Tooltip content={i18next.t("editor-toolbar.table")}>
          <div className="editor-tool" onClick={table}>
            {gridSvg}
            <div className="sub-tool-menu">
              <div className="sub-tool-menu-item" onClick={table}>
                {i18next.t("editor-toolbar.table-3-col")}
              </div>
              <div className="sub-tool-menu-item" onClick={table2}>
                {i18next.t("editor-toolbar.table-2-col")}
              </div>
              <div className="sub-tool-menu-item" onClick={table1}>
                {i18next.t("editor-toolbar.table-1-col")}
              </div>
            </div>
          </div>
        </Tooltip>
        <div className="tool-separator" />
        {activeUser && isMobile ? (
          <Tooltip content={i18next.t("editor-toolbar.image")}>
            <div className="editor-tool" onClick={() => setMobileImage(!mobileImage)}>
              {imageSvg}
            </div>
          </Tooltip>
        ) : (
          <Tooltip content={i18next.t("editor-toolbar.image")}>
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
                    {i18next.t("editor-toolbar.upload")}
                  </div>
                  {usePrivate && (
                    <div
                      className="sub-tool-menu-item"
                      onClick={(e: React.MouseEvent<HTMLElement>) => {
                        e.stopPropagation();
                        setGallery(!gallery);
                      }}
                    >
                      {i18next.t("editor-toolbar.gallery")}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Tooltip>
        )}
        {!comment && (
          <Tooltip content={i18next.t("video-upload.upload-video")}>
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
                      {i18next.t("video-upload.upload-video")}
                    </div>
                    {usePrivate && (
                      <div
                        className="sub-tool-menu-item"
                        onClick={(e: React.MouseEvent<HTMLElement>) => {
                          e.stopPropagation();
                          setShowVideoGallery(true);
                        }}
                      >
                        {i18next.t("video-upload.video-gallery")}
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
          <Tooltip content={i18next.t("editor-toolbar.emoji")}>
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
        <Tooltip content={i18next.t("Gif")}>
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
        <Tooltip content={i18next.t("editor-toolbar.link")}>
          <div className="editor-tool" onClick={() => setLink(!link)}>
            {linkSvg}
          </div>
        </Tooltip>
        {!comment && (
          <Tooltip content={i18next.t("editor-toolbar.polls")}>
            <div
              className={classNameObject({
                "editor-tool": true,
                "bg-green bg-opacity-25": !!existingPoll
              })}
              onClick={() => setShowPollsCreation(!showPollsCreation)}
            >
              <UilPanelAdd />
            </div>
          </Tooltip>
        )}
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
        <GalleryDialog
          show={gallery}
          setShow={setGallery}
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
            fileInputRef.current?.click();
          }}
        />
      )}
      <PollsCreation
        readonly={readonlyPoll}
        existingPoll={existingPoll}
        show={showPollsCreation}
        setShow={(v) => setShowPollsCreation(v)}
        onAdd={(snap) => onAddPoll?.(snap)}
        onDeletePoll={() => onDeletePoll?.()}
      />
    </>
  );
}
