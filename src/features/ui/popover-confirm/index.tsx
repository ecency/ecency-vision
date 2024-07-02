"use client";

import { cloneElement, ReactElement, useState } from "react";
import { Popover, PopoverContent, PopoverTitle } from "@ui/popover";
import { Button } from "@ui/button";
import i18next from "i18next";

interface Props {
  titleText?: string;
  okText?: string;
  okVariant?: "primary" | "danger";
  cancelText?: string;
  children: ReactElement;
  onConfirm?: () => void;
  onCancel?: () => void;
  trigger?: any;
  placement?: any;
  containerRef?: React.RefObject<HTMLInputElement>;
}
export function PopoverConfirm({
  titleText,
  okText,
  okVariant,
  cancelText,
  children,
  trigger,
  containerRef,
  placement,
  onConfirm,
  onCancel
}: Props) {
  const [show, setShow] = useState(false);

  const toggle = (e?: any) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setShow(!show);
  };

  const confirm = () => {
    toggle();

    if (onConfirm) {
      onConfirm();
    }
  };

  const cancel = () => {
    toggle();

    if (onCancel) {
      onCancel();
    }
  };

  const clonedChildren = cloneElement(children, {
    onClick: toggle
  });

  const popover = (
    <Popover
      show={show}
      setShow={(value) => setShow(value)}
      id="popover-confirm"
      onClick={(e) => {
        // Prevent to trigger hide event on modal dialog
        e.stopPropagation();
      }}
    >
      <PopoverTitle>{titleText || i18next.t("confirm.title")}</PopoverTitle>
      <PopoverContent>
        <div style={{ textAlign: "center" }}>
          <Button
            size="sm"
            appearance={okVariant || "primary"}
            style={{ marginRight: "10px" }}
            onClick={confirm}
          >
            {okText || i18next.t("confirm.ok")}
          </Button>
          <Button size="sm" appearance="secondary" onClick={cancel}>
            {cancelText || i18next.t("confirm.cancel")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );

  if (!show) {
    return clonedChildren;
  }

  return (
    <>
      {popover}
      {children}
    </>
  );
}
