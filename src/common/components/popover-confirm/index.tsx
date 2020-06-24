import React, { Component } from "react";

import { Popover, OverlayTrigger, Button } from "react-bootstrap";

interface Props {
  children: JSX.Element;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface State {
  show: boolean;
}

export default class PopoverConfirm extends Component<Props> {
  state: State = {
    show: false,
  };

  toggle = (e?: React.MouseEvent) => {
    if (e) {
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
    const { children } = this.props;
    const { show } = this.state;

    const clonedChildren = React.cloneElement(children, {
      onClick: this.toggle,
    });

    const popover = (
      <Popover
        id="popover-confirm"
        onClick={(e) => {
          // Prevent to trigger hide event on modal dialog
          e.stopPropagation();
        }}
      >
        <Popover.Title>Are you sure?</Popover.Title>
        <Popover.Content>
          <Button size="sm" variant="primary" style={{ marginRight: "10px" }} onClick={this.confirm}>
            Confirm
          </Button>
          <Button size="sm" variant="secondary" onClick={this.cancel}>
            Cancel
          </Button>
        </Popover.Content>
      </Popover>
    );

    if (!show) {
      return clonedChildren;
    }

    return (
      <>
        <OverlayTrigger defaultShow={true} trigger={[]} placement="right" overlay={popover}>
          {children}
        </OverlayTrigger>
      </>
    );
  }
}
