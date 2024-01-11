import React, { Dispatch, SetStateAction, useMemo } from "react";
import { useChatFileUpload } from "../mutations";
import { CHAT_FILE_CONTENT_TYPES } from "./chat-popup/chat-constants";
import { Spinner } from "@ui/spinner";
import { classNameObject } from "../../../helper/class-name-object";
import { Button } from "@ui/button";
import { deleteForeverSvg } from "../../../img/svg";
import useMount from "react-use/lib/useMount";
import { _t } from "../../../i18n";

interface FileItemProps {
  file?: File;
  link?: string;
  isUploading?: boolean;
  onDelete: () => void;
  onUpload?: (url: string) => void;
}

function FileItem({ link, file, onDelete, isUploading = false, onUpload }: FileItemProps) {
  const {
    mutateAsync: upload,
    isLoading,
    isError
  } = useChatFileUpload((_, url) => onUpload?.(url));

  useMount(() => {
    if (file) {
      upload(file);
    }
  });

  return (
    <div
      className={classNameObject({
        "w-[6rem] h-[6rem] bg-cover rounded-2xl flex relative items-center justify-center overflow-hidden":
          true,
        grayscale: isUploading
      })}
      style={{ backgroundImage: `url(${link})` }}
    >
      {!isLoading && (
        <Button
          appearance="gray-link"
          icon={deleteForeverSvg}
          size="xs"
          className="absolute top-1 right-1 cursor-pointer"
          onClick={() => onDelete()}
        />
      )}
      {isError && file && (
        <Button size="xs" onClick={() => upload(file)}>
          {_t("g.retry")}
        </Button>
      )}
      {!isError && (isLoading || isUploading) && <Spinner className="w-4 h-4" />}
    </div>
  );
}

interface Props {
  files: File[];
  setFiles: Dispatch<SetStateAction<File[]>>;
  uploadedFileLinks: string[];
  setUploadedFileLinks: Dispatch<SetStateAction<string[]>>;
}

export function ChatInputFiles({
  files,
  setFiles,
  uploadedFileLinks,
  setUploadedFileLinks
}: Props) {
  const fileList = useMemo(
    () =>
      [...files]
        .filter((file) => {
          const filenameLow = file.name.toLowerCase();
          return CHAT_FILE_CONTENT_TYPES.some((el) => filenameLow.endsWith(el));
        })
        .map((file) => [file, URL.createObjectURL(file)] as const),
    [files]
  );

  return (
    <div className="bg-white bg-opacity-50 backdrop-blur border-t border-[--border-color] p-3 z-10 left-[-0.5rem] overflow-x-auto w-[calc(100%+0.5rem)] absolute bottom-[100%] flex gap-4">
      {uploadedFileLinks.map((item) => (
        <FileItem
          key={item}
          link={item}
          onDelete={() => setUploadedFileLinks(uploadedFileLinks.filter((f) => f !== item))}
        />
      ))}
      {fileList.map(([file, item]) => (
        <FileItem
          file={file}
          key={item}
          link={item}
          isUploading={true}
          onDelete={() => setFiles(files.filter((f) => f !== file))}
          onUpload={(link) => {
            setUploadedFileLinks((links) => [...links, link]);
            setFiles((files) => files.filter((f) => f !== file));
          }}
        />
      ))}
    </div>
  );
}
