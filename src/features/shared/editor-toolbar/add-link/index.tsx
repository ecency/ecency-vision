import React, { useRef, useState } from "react";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import { FormControl } from "@ui/input";
import { Button } from "@ui/button";
import { Form } from "@ui/form";
import { readClipboard } from "@/utils/clipboard";
import { handleInvalid, handleOnInput } from "@/utils";
import i18next from "i18next";
import { useMount } from "react-use";

interface Props {
  onHide: () => void;
  onSubmit: (text: string, link: string) => void;
}

interface State {
  text: string;
  link: string;
}

export function AddLink({ onHide, onSubmit }: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  const [text, setText] = useState("");
  const [link, setLink] = useState("https://");

  const textChanged = (e: React.ChangeEvent<HTMLInputElement>): void => setText(e.target.value);
  const linkChanged = (e: React.ChangeEvent<HTMLInputElement>): void => setLink(e.target.value);
  const handleClipboard = async () => {
    const clipboard = await readClipboard();

    if (clipboard && (clipboard.startsWith("https://") || clipboard.startsWith("http://"))) {
      setLink(clipboard);
    }
  };

  useMount(() => {
    handleClipboard();
  });

  return (
    <Modal show={true} centered={true} onHide={onHide} className="add-link-modal">
      <ModalHeader closeButton={true}>
        <ModalTitle>{i18next.t("add-link.title")}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <div className="dialog-content">
          <Form
            ref={formRef}
            onSubmit={(e: React.FormEvent) => {
              e.preventDefault();
              e.stopPropagation();

              if (!formRef.current?.checkValidity()) {
                return;
              }

              onSubmit(text, link);
            }}
          >
            <div className="mb-4">
              <FormControl
                type="text"
                autoComplete="off"
                value={text}
                placeholder={i18next.t("add-link.text-label")}
                onChange={textChanged}
                autoFocus={true}
                required={true}
                onInvalid={(e: any) => handleInvalid(e, "add-link.", "validation-text")}
                onInput={handleOnInput}
              />
            </div>
            <div className="mb-4">
              <FormControl
                type="text"
                autoComplete="off"
                value={link}
                placeholder={i18next.t("add-link.link-label")}
                onChange={linkChanged}
                required={true}
                onInvalid={(e: any) => handleInvalid(e, "add-link.", "validation-link")}
                onInput={handleOnInput}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit">{i18next.t("g.add")}</Button>
            </div>
          </Form>
        </div>
      </ModalBody>
    </Modal>
  );
}
