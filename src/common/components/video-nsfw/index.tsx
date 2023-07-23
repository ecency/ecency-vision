import React, { useState } from 'react'
import { _t } from '../../i18n';
import DropDown from "../dropdown";
import { dotsHorizontal } from "../../img/svg";
import "./index.scss"

interface Props {
  togleNsfwC: () => void;
  embeddVideo: (video: any) => void;
  item: any;
  setShowGallery:  React.Dispatch<React.SetStateAction<boolean>>;
  setBeneficiary: (video: any) => void;
}

export const ConfirmNsfwContent = (props: Props) => {

  const { togleNsfwC, embeddVideo, item, setShowGallery, setBeneficiary } = props;

  const menuItems = [
    {
      label: _t("video-gallery.insert-video"),
      onClick: () =>  {
        embeddVideo(item)
        setBeneficiary(item)
        setShowGallery(false)
      },
    },
    {
      label: _t("video-gallery.insert-nsfw"),
      onClick: () =>{
        if(item.status === "publish_manual") {
          embeddVideo(item)
          setBeneficiary(item)
          setShowGallery(false)
          togleNsfwC()
        }
        },
    },
  ]

  return (
    <DropDown
      items={menuItems}
      icon={dotsHorizontal}
      label=""
      float="left"
      history={null}    
      />
  )
}
