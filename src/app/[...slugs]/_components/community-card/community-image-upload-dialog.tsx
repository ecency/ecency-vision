import React, { useCallback, useState } from "react";
import { Modal, ModalBody, ModalHeader } from "@ui/modal";
import { FormControl, InputGroup } from "@ui/input";
import { Spinner } from "@ui/spinner";
import { Button } from "@ui/button";
import i18next from "i18next";
import { ImageUploadButton } from "@/features/shared";

interface Props {
  title: string;
  defImage: string;
  inProgress: boolean;
  onDone: (url: string) => void;
  onHide: () => void;
}

export function ImageUploadDialog({ defImage, title, inProgress, onDone, onHide }: Props) {
  const [image, setImage] = useState<string>(defImage);
  const [uploading, setUploading] = useState(false);

  const imageChanged = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value: image } = e.target;
    setImage(image);
  }, []);

  const done = useCallback(() => {
    onDone(image);
  }, [image, onDone]);

  return (
    <Modal show={true} centered={true} onHide={onHide} className="image-upload-dialog">
      <ModalHeader closeButton={true} />
      <ModalBody>
        <div className="image-upload-dialog-content">
          <div className="mb-4">
            <label>{title}</label>
            <InputGroup
              className="mb-3"
              append={
                <ImageUploadButton
                  onBegin={() => setUploading(true)}
                  onEnd={(url) => {
                    setImage(url);
                    setUploading(false);
                  }}
                />
              }
            >
              <FormControl
                type="text"
                disabled={inProgress}
                placeholder="https://"
                value={image}
                maxLength={500}
                onChange={imageChanged}
              />
            </InputGroup>
          </div>
          <Button
            onClick={done}
            disabled={inProgress || uploading}
            icon={inProgress && <Spinner className="mr-[6px] w-3.5 h-3.5" />}
            iconPlacement="left"
          >
            {i18next.t("g.save")}
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
}
