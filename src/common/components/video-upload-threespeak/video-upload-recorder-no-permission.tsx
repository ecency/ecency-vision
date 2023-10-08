import { _t } from "../../i18n";
import React from "react";

export function VideoUploadRecorderNoPermission() {
  return (
    <div className="no-permission">
      <p>{_t("video-upload.no-record-permission")}</p>
    </div>
  );
}
