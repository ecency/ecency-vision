import React, { Component } from "react";
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

interface State {
  show: boolean;
}

export default class PopoverConfirm extends Component<Props> {
  state: State = {
    show: false
  };

  toggle = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const { show } = this.state;
    this.setState({ show: !show });
  };

  confirm = () => {
    this.toggle();

    const { onConfirm } = this.props;
    if (onConfirm) {
      onConfirm();
    }
  };

  cancel = () => {
    this.toggle();

    const { onCancel } = this.props;
    if (onCancel) {
      onCancel();
    }
  };

  render() {
    const { titleText, okText, okVariant, cancelText, children, trigger, containerRef, placement } =
      this.props;
    const { show } = this.state;

    const clonedChildren = React.cloneElement(children, {
      onClick: this.toggle
    });

    const popover = (
      <Popover
        id="popover-confirm"
        onClick={(e) => {
          // Prevent to trigger hide event on modal dialog
          e.stopPropagation();
        }}
      >
        <PopoverTitle>{titleText || _t("confirm.title")}</PopoverTitle>
        <PopoverContent>
          <div style={{ textAlign: "center" }}>
            <Button
              size="sm"
              appearance={okVariant || "primary"}
              style={{ marginRight: "10px" }}
              onClick={this.confirm}
            >
              {okText || _t("confirm.ok")}
            </Button>
            <Button size="sm" appearance="secondary" onClick={this.cancel}>
              {cancelText || _t("confirm.cancel")}
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
}
