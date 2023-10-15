import { useThreeSpeakManager } from "./hooks";
import React, { useMemo, useState } from "react";
import { proxifyImageSrc } from "@ecency/render-helper";
import { useMappedStore } from "../../store/use-mapped-store";
import { closeSvg } from "../../img/svg";
import { _t } from "../../i18n";
import { Alert } from "@ui/alert";

export function SubmitVideoAttachments() {
  const { global } = useMappedStore();
  const { videos, remove, hasMultipleUnpublishedVideo } = useThreeSpeakManager();

  const [collapsed, setCollapsed] = useState(true);
  const videoList = useMemo(() => [...Object.values(videos)], [videos]);

  return (
    <div
      className="submit-video-attachments m-3"
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => setCollapsed(true)}
    >
      {videoList.length > 0 ? <p className="text-muted">Attached 3Speak videos</p> : <></>}
      {hasMultipleUnpublishedVideo && (
        <Alert appearance="danger">{_t("submit.should-be-only-one-unpublished")}</Alert>
      )}
      <div className="submit-video-attachments-list">
        {videoList.map((item) => (
          <div
            className="attachment-item position-relative"
            key={item._id}
            style={{
              height: collapsed ? "4rem" : "9rem",
              minWidth: collapsed ? "5.5rem" : "12rem",
              maxWidth: collapsed ? "5.5rem" : "12rem",
              backgroundImage: `url("${proxifyImageSrc(
                item.thumbUrl,
                512,
                384,
                global.canUseWebp ? "webp" : "match"
              )}")`
            }}
          >
            {collapsed ? (
              <></>
            ) : (
              <>
                <div className="type">3speak</div>
                <div className="remove" onClick={() => remove(item._id)}>
                  {closeSvg}
                </div>
                <div className="title text-truncate">{item.title}</div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
