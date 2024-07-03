import React, { useCallback, useRef, useState } from "react";
import { Spinner } from "@ui/spinner";
import { Button } from "@ui/button";
import { uploadSvg } from "@ui/svg";
import { error, success } from "@/features/shared";
import i18next from "i18next";
import { getAccessToken } from "@/utils";
import { uploadImage } from "@/api/misc";
import { useGlobalStore } from "@/core/global-store";

interface UploadButtonProps {
  onBegin: () => void;
  onEnd: (url: string) => void;
}

export function ImageUploadButton({ onBegin, onEnd }: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const activeUser = useGlobalStore((s) => s.activeUser);
  const [inProgress, setInProgress] = useState(false);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // @ts-ignore
      const files = [...e.target.files];

      if (files.length === 0) {
        return;
      }

      const [file] = files;
      onBegin();

      setInProgress(true);
      let token = getAccessToken(activeUser!.username);

      if (token) {
        uploadImage(file, token)
          .then((r) => {
            onEnd(r.url);
            success(i18next.t("image-upload-button.uploaded"));
          })
          .catch(() => {
            error(i18next.t("g.server-error"));
          })
          .finally(() => setInProgress(false));
      } else {
        error(i18next.t("editor-toolbar.image-error-cache"));
      }
    },
    [activeUser, onBegin, onEnd]
  );

  return (
    <>
      <Button
        size="sm"
        disabled={inProgress}
        onClick={() => inputRef.current?.click()}
        icon={inProgress ? <Spinner className="w-3.5 h-3.5" /> : uploadSvg}
      />
      <input
        type="file"
        ref={inputRef}
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileInput}
      />
    </>
  );
}
