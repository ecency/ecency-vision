import Tooltip from "../../tooltip";
import { _t } from "../../../i18n";
import { imageSvg } from "../../../img/svg";
import React, { useRef, useState } from "react";
import AddImage from "../../add-image";
import { useMappedStore } from "../../../store/use-mapped-store";
import { getAccessToken } from "../../../helper/user-token";
import { uploadImage } from "../../../api/misc";
import { error } from "../../feedback";
import axios from "axios";
import Gallery from "../../gallery";
import { PopperDropdown } from "../../popper-dropdown";
import { Button } from "@ui/button";

interface Props {
  onAddImage: (link: string, name: string) => void;
}

export const DeckThreadsFormToolbarImagePicker = ({ onAddImage }: Props) => {
  const { activeUser, global } = useMappedStore();

  const fileInputRef = useRef<any>();

  const [imagePickInitiated, setImagePickInitiated] = useState(false);
  const [galleryPickInitiated, setGalleryPickInitiated] = useState(false);

  const onImagePick = (text: string, url: string) => {
    onAddImage(url, text);
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

    if (files.length > 1) {
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
    let imageUrl: string;
    try {
      let token = getAccessToken(username);
      if (token) {
        const resp = await uploadImage(file, token);
        imageUrl = resp.url;
        onAddImage(imageUrl, file.name);
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
    <div className="deck-threads-form-toolbar-image-picker">
      {activeUser && (
        <Tooltip content={_t("editor-toolbar.image")}>
          <PopperDropdown toggle={<Button icon={imageSvg} appearance="link" noPadding={true} />}>
            <div className="dropdown-menu">
              <div
                className="dropdown-item"
                onClick={() => {
                  setImagePickInitiated(true);
                }}
              >
                {_t("editor-toolbar.link-image")}
              </div>
              <div
                className="dropdown-item"
                onClick={(e: React.MouseEvent<HTMLElement>) => {
                  e.stopPropagation();
                  const el = fileInputRef.current;
                  if (el) el.click();
                }}
              >
                {_t("editor-toolbar.upload")}
              </div>
              {global.usePrivate && (
                <div
                  className="dropdown-item"
                  onClick={(e: React.MouseEvent<HTMLElement>) => {
                    e.stopPropagation();
                    setGalleryPickInitiated(true);
                  }}
                >
                  {_t("editor-toolbar.gallery")}
                </div>
              )}
            </div>
          </PopperDropdown>
        </Tooltip>
      )}
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
    </div>
  );
};
