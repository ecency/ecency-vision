import React, {Component, Fragment} from 'react';

import {Modal} from 'react-bootstrap';


interface Props {
    children: JSX.Element
}

interface State {
    modal: boolean
}

export default class DownloadTrigger extends Component <Props, State> {
    state: State = {
        modal: false
    };

    toggle = () => {
        const {modal} = this.state;

        this.setState({modal: !modal});
    };

    render() {
        const {children} = this.props;
        const {modal} = this.state;

        const clonedChildren = React.cloneElement(children, {
            onClick: this.toggle
        });

        return <Fragment>
            {clonedChildren}

            {modal &&
            <Modal
              show={true}
              centered={true}
              onHide={() => {
                  this.toggle();
              }}
            >
              <Modal.Body className="download-dialog-content">
                <div className="download-dialog-content">
                  <h2 className="downloads-title">Download</h2>
                  <div className="downloads-text">Enjoy eSteem for iPhone, iPad and Android, as well as PC, Mac or Linux
                    devices:
                  </div>
                  <div className="download-buttons">
                    <a className="download-button btn-desktop" target="_blank"
                       href="https://github.com/eSteemApp/esteem-surfer/releases" rel="noopener noreferrer">DESKTOP</a>
                    <a className="download-button btn-android" target="_blank"
                       href="https://play.google.com/store/apps/details?id=app.esteem.mobile.android"
                       rel="noopener noreferrer">ANDROID</a>
                    <a className="download-button btn-ios" target="_blank"
                       href="https://apps.apple.com/us/app/esteem-v2/id1451896376" rel="noopener noreferrer">IOS</a>
                  </div>
                </div>
              </Modal.Body>
            </Modal>
            }
        </Fragment>;
    }
}
