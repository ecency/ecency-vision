import React from "react";
import i18next from "i18next";

export function VideoUploadRecorderNoPermission() {
  return (
    <div className="no-permission">
      <p>{i18next.t("video-upload.no-record-permission")}</p>
    </div>
  );
}
