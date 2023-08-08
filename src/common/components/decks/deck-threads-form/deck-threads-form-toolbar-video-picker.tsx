import Tooltip from "../../tooltip";
import { _t } from "../../../i18n";
import { PopperDropdown } from "../../popper-dropdown";
import { videoSvg } from "../../../img/svg";
import React, { useState } from "react";
import { useMappedStore } from "../../../store/use-mapped-store";
import { VideoUpload } from "../../video-upload-threespeak";
import VideoGallery from "../../video-gallery";

interface Props {
  onSelect: (video: string) => void;
}

export function DeckThreadsFormToolbarVideoPicker({ onSelect }: Props) {
  const { activeUser, global } = useMappedStore();

  const [showUpload, setShowUpload] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  return (
    <div className="deck-threads-form-toolbar-video-picker">
      {activeUser && (
        <Tooltip content={_t("editor-toolbar.image")}>
          <PopperDropdown toggle={videoSvg} hideOnClick={true}>
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={() => setShowUpload(true)}>
                {_t("video-upload.upload-video")}
              </div>
              {global.usePrivate && (
                <div className="dropdown-item" onClick={() => setShowGallery(true)}>
                  {_t("video-upload.video-gallery")}
                </div>
              )}
            </div>
          </PopperDropdown>
        </Tooltip>
      )}
      <VideoUpload show={showUpload} setShow={setShowUpload} setShowGallery={setShowGallery} />
      <VideoGallery
        showGallery={showGallery}
        setShowGallery={setShowGallery}
        insertText={(v) => {
          onSelect(v);
        }}
      />
    </div>
  );
}
