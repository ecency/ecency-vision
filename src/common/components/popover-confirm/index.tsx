import React, { Component } from 'react';

import { Popover, OverlayTrigger, Button } from 'react-bootstrap';

import { _t } from '../../i18n';

interface Props {
  titleText?: string;
  okText?: string;
  okVariant?: 'primary' | 'danger';
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
        <Popover.Title>{titleText || _t('confirm.title')}</Popover.Title>
        <Popover.Content>
          <div style={{ textAlign: 'center' }}>
            <Button
              size="sm"
              variant={okVariant || 'primary'}
              style={{ marginRight: '10px' }}
              onClick={this.confirm}
            >
              {okText || _t('confirm.ok')}
            </Button>
            <Button size="sm" variant="secondary" onClick={this.cancel}>
              {cancelText || _t('confirm.cancel')}
            </Button>
          </div>
        </Popover.Content>
      </Popover>
    );

    if (!show) {
      return clonedChildren;
    }

    return (
      <>
        <OverlayTrigger
          defaultShow={true}
          trigger={trigger || []}
          overlay={popover}
          placement={placement || 'auto'}
          rootClose={true}
          container={containerRef || null}
        >
          {children}
        </OverlayTrigger>
      </>
    );
  }
}
