import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTitle } from "@ui/popover";
import { _t } from "../../../i18n";
import { Button } from "@ui/button";

interface Props {
  titleText?: string;
  okText?: string;
  okVariant?: "primary" | "danger";
  cancelText?: string;
  children: JSX.Element;
  onConfirm?: () => void;
  onCancel?: () => void;
  trigger?: any;
  placement?: any;
  containerRef?: React.RefObject<HTMLInputElement>;
}

function PopoverConfirm(props: Props) {
  const [show, setShow] = useState(false);

  const toggle = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setShow(!show);
  };

  const confirm = () => {
    toggle();

    if (props.onConfirm) {
      props.onConfirm();
    }
  };

  const cancel = () => {
    toggle();

    if (props.onCancel) {
      props.onCancel();
    }
  };

  if (!show) {
    return React.cloneElement(props.children, {
      onClick: toggle
    });
  }

  return (
    <>
      <Popover
        show={show}
        setShow={setShow}
        id="popover-confirm"
        onClick={(e) => {
          // Prevent to trigger hide event on modal dialog
          e.stopPropagation();
        }}
      >
        <PopoverTitle>{props.titleText || _t("confirm.title")}</PopoverTitle>
        <PopoverContent>
          <div style={{ textAlign: "center" }}>
            <Button
              id="popover-confirm-ok"
              size="sm"
              appearance={props.okVariant || "primary"}
              style={{ marginRight: "10px" }}
              onClick={confirm}
            >
              {props.okText || _t("confirm.ok")}
            </Button>
            <Button id="popover-confirm-cancel" size="sm" appearance="secondary" onClick={cancel}>
              {props.cancelText || _t("confirm.cancel")}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      {props.children}
    </>
  );
}

export default PopoverConfirm;
