import React, {Component, Fragment} from 'react';

import {Modal} from 'react-bootstrap';

import platform from '../../util/platform';

export class DialogContent extends Component {
    render() {
        const os = platform(window);

        return <div className="download-dialog-content">
            <h2 className="downloads-title">Download</h2>
            <div className="downloads-text">Enjoy Ecency for iPhone, iPad and Android, as well as Windows, Mac or Linux devices</div>
            <div className="download-buttons">
                {(os !== 'iOS' && os !== 'AndroidOS' && os === 'WindowsOS') &&
                <a className="download-button btn-desktop" target="_blank"
                   href="https://github.com/ecency/ecency-vision/releases/download/3.0.15/Ecency-Setup-3.0.15.exe" rel="noopener noreferrer">Windows</a>
                }
                {(os !== 'iOS' && os !== 'AndroidOS' && os === 'MacOS') &&
                <a className="download-button btn-desktop" target="_blank"
                   href="https://github.com/ecency/ecency-vision/releases/download/3.0.15/Ecency-3.0.15.dmg" rel="noopener noreferrer">Mac</a>
                }
                {(os !== 'iOS' && os !== 'AndroidOS' && (os === 'UnixOS' || os === 'LinuxOS')) &&
                <a className="download-button btn-desktop" target="_blank"
                   href="https://github.com/ecency/ecency-vision/releases/download/3.0.15/ecency-surfer-3.0.15.tar.gz" rel="noopener noreferrer">Linux</a>
                }
                {(os === 'AndroidOS' || os !== 'iOS') &&
                <a className="download-button btn-android" target="_blank"
                   href="https://android.ecency.com"
                   rel="noopener noreferrer">Android</a>
                }
                {(os === 'iOS' || os !== 'AndroidOS') &&
                <a className="download-button btn-ios" target="_blank"
                   href="https://ios.ecency.com" rel="noopener noreferrer">iOS</a>
                }
            </div>
        </div>;
    }
}

interface Props {
    children: JSX.Element
}

interface State {
    modal: boolean
}

export default class DownloadTrigger extends Component <Props, State> {
    state: State = {
        modal: false,
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
              }}>
              <Modal.Body className="download-dialog-content">
                <DialogContent/>
              </Modal.Body>
            </Modal>
            }
        </Fragment>;
    }
}
