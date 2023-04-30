import Tooltip from "../../tooltip";
import { _t } from "../../../i18n";
import { imageSvg } from "../../../img/svg";
import React, { useRef, useState } from "react";
import AddImage from "../../add-image";
import { useMappedStore } from "../../../store/use-mapped-store";
import { getAccessToken } from "../../../helper/user-token";
import { uploadImage } from "../../../api/misc";
import { addImage } from "../../../api/private-api";
import { error } from "../../feedback";
import axios from "axios";
import Gallery from "../../gallery";
import { Button, Dropdown } from "react-bootstrap";

export const DeckThreadsFormToolbarImagePicker = () => {
  const { activeUser, global } = useMappedStore();

  const fileInputRef = useRef<any>();

  const [imagePickInitiated, setImagePickInitiated] = useState(false);
  const [galleryPickInitiated, setGalleryPickInitiated] = useState(false);

  const onImagePick = (text: string, url: string) => {
    // this.insertText(`![${text}`, `](${url})`);
  };

  const checkFile = (filename: string) => {
    const filenameLow = filename.toLowerCase();
    return ["jpg", "jpeg", "gif", "png"].some((el) => filenameLow.endsWith(el));
  };

  const fileInputChanged = (e: React.ChangeEvent<HTMLInputElement>): void => {
    let files = [...(e.target.files as FileList)].filter((i) => checkFile(i.name)).filter((i) => i);

    if (files.length > 0) {
      e.stopPropagation();
      e.preventDefault();
    }

    if (files.length > 1 && global.isElectron) {
      let isWindows = process.platform === "win32";
      if (isWindows) {
        files = files.reverse();
      }
    }

    files.forEach((file) => upload(file));

    // reset input
    e.target.value = "";
  };

  const upload = async (file: File) => {
    const username = activeUser?.username!;

    const tempImgTag = `![Uploading ${file.name} #${Math.floor(Math.random() * 99)}]()\n\n`;
    // this.insertText(tempImgTag);

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

        // imgTag && this.replaceText(tempImgTag, imgTag);
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

  return (
    <>
      <Tooltip content={_t("editor-toolbar.image")}>
        <Dropdown>
          <Dropdown.Toggle as="div">
            <Button variant="link">{imageSvg}</Button>
          </Dropdown.Toggle>

          {activeUser && (
            <Dropdown.Menu>
              <Dropdown.Item
                onClick={() => {
                  setImagePickInitiated(true);
                }}
              >
                {_t("editor-toolbar.link-image")}
              </Dropdown.Item>
              <Dropdown.Item
                onClick={(e: React.MouseEvent<HTMLElement>) => {
                  e.stopPropagation();
                  const el = fileInputRef.current;
                  if (el) el.click();
                }}
              >
                {_t("editor-toolbar.upload")}
              </Dropdown.Item>
              {global.usePrivate && (
                <Dropdown.Item
                  onClick={(e: React.MouseEvent<HTMLElement>) => {
                    e.stopPropagation();
                    setGalleryPickInitiated(true);
                  }}
                >
                  {_t("editor-toolbar.gallery")}
                </Dropdown.Item>
              )}
            </Dropdown.Menu>
          )}
        </Dropdown>
      </Tooltip>
      {imagePickInitiated && (
        <AddImage
          onHide={() => setImagePickInitiated(false)}
          onSubmit={(text: string, link: string) => {
            onImagePick(text, link);
            setImagePickInitiated(false);
          }}
        />
      )}
      {galleryPickInitiated && activeUser && (
        <Gallery
          onHide={() => setGalleryPickInitiated(false)}
          onPick={(url: string) => {
            const fileName = "";
            onImagePick(fileName, url);
            setGalleryPickInitiated(false);
          }}
        />
      )}
      <input
        onChange={fileInputChanged}
        className="file-input"
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={true}
        style={{ display: "none" }}
      />
    </>
  );
};
