import React from "react";
import { _t } from "../../i18n";
import DropDown from "../dropdown";
import { dotsHorizontal } from "../../img/svg";
import "./index.scss";

interface Props {
  toggleNsfwC?: () => void;
  embeddVideo: (video: any) => void;
  item: any;
  setShowGallery: (v: boolean) => void;
  setBeneficiary: (video: any) => void;
}

export const ConfirmNsfwContent = (props: Props) => {
  const { toggleNsfwC, embeddVideo, item, setShowGallery, setBeneficiary } = props;

  const menuItems = [
    {
      label: _t("video-gallery.insert-video"),
      onClick: () => {
        embeddVideo(item);
        setBeneficiary(item);
        setShowGallery(false);
      }
    },
    {
      label: _t("video-gallery.insert-nsfw"),
      onClick: () => {
        if (item.status === "publish_manual") {
          embeddVideo(item);
          setBeneficiary(item);
          setShowGallery(false);
          toggleNsfwC && toggleNsfwC();
        }
      }
    }
  ];

  return <DropDown items={menuItems} icon={dotsHorizontal} label="" float="right" history={null} />;
};
