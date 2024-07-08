import React, { Fragment, useState } from "react";
import "./_index.scss";
import { Modal, ModalBody } from "@ui/modal";
import useMount from "react-use/lib/useMount";
import platform from "@/utils/platform";

interface Props {
  children: JSX.Element;
}

export function DownloadTrigger({ children }: Props) {
  const [modal, setModal] = useState(false);
  const os = platform(window);

  const toggle = () => setModal(!modal);

  const clonedChildren = React.cloneElement(children, {
    onClick: toggle
  });

  useMount(() => {
    let scrollToTop: any = document.getElementsByClassName("overlay-for-introduction");

    scrollToTop = scrollToTop.length > 0;

    if (scrollToTop) {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }

    if (location.hash === "#download") {
      toggle();
    }
  });

  return (
    <Fragment>
      {clonedChildren}

      {modal && (
        <Modal show={true} centered={true} onHide={() => toggle()}>
          <ModalBody className="download-dialog-content">
            <div className="download-dialog-content">
              <h2 className="downloads-title">Download</h2>
              <div className="downloads-text">
                Enjoy Ecency for iPhone, iPad and Android devices
              </div>
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
          </ModalBody>
        </Modal>
      )}
    </Fragment>
  );
}
