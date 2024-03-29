import React, { Component, Fragment } from "react";
import BaseComponent from "../base";
import platform from "../../util/platform";
import { history } from "../../store";
import "./_index.scss";
import { Modal, ModalBody } from "@ui/modal";

interface ContentState {}

export class DialogContent extends BaseComponent<{}, ContentState> {
  render() {
    const os = platform(window);

    return (
      <div className="download-dialog-content">
        <h2 className="downloads-title">Download</h2>
        <div className="downloads-text">Enjoy Ecency for iPhone, iPad and Android devices</div>
        <div className="download-buttons">
          {(os === "AndroidOS" || os !== "iOS") && (
            <a
              className="download-button btn-android"
              target="_blank"
              href="https://android.ecency.com"
              rel="noopener noreferrer"
            >
              Android
            </a>
          )}
          {(os === "iOS" || os !== "AndroidOS") && (
            <a
              className="download-button btn-ios"
              target="_blank"
              href="https://ios.ecency.com"
              rel="noopener noreferrer"
            >
              iOS
            </a>
          )}
        </div>
      </div>
    );
  }
}

interface Props {
  children: JSX.Element;
}

interface State {
  modal: boolean;
}

export default class DownloadTrigger extends Component<Props, State> {
  state: State = {
    modal: false
  };

  toggle = () => {
    const { modal } = this.state;

    this.setState({ modal: !modal });
  };

  componentDidMount() {
    if (history?.location.hash === "#download") {
      this.toggle();
    }
  }

  componentDidUpdate(prevProps: Props, prevStates: State) {
    if (prevStates.modal !== this.state.modal) {
      if (!this.state.modal) {
        let scrollToTop: any = document.getElementsByClassName("overlay-for-introduction");

        scrollToTop = scrollToTop.length > 0;

        if (scrollToTop) {
          window.scrollTo({
            top: 0,
            behavior: "smooth"
          });
        }
      }
    }
  }

  render() {
    const { children } = this.props;
    const { modal } = this.state;

    const clonedChildren = React.cloneElement(children, {
      onClick: this.toggle
    });

    return (
      <Fragment>
        {clonedChildren}

        {modal && (
          <Modal
            show={true}
            centered={true}
            onHide={() => {
              this.toggle();
            }}
          >
            <ModalBody className="download-dialog-content">
              <DialogContent />
            </ModalBody>
          </Modal>
        )}
      </Fragment>
    );
  }
}
