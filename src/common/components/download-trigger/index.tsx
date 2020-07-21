import React, {Component, Fragment} from 'react';

import {Modal} from 'react-bootstrap';

import platform from '../../util/platform';

interface Props {
    children: JSX.Element
}

interface State {
    modal: boolean,
    os: string
}

export default class DownloadTrigger extends Component <Props, State> {
    state: State = {
        modal: false,
        os: typeof window !== 'undefined' ? platform(window) : 'WindowsOS'
    };

    toggle = () => {
        const {modal} = this.state;

        this.setState({modal: !modal});
    };

    render() {
        const {children} = this.props;
        const {modal, os} = this.state;

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
                  <div className="downloads-text">Enjoy Ecency for iPhone, iPad and Android, as well as Windows, Mac or Linux devices
                  </div>
                  <div className="download-buttons">
                    {(os !== 'iOS' && os !== 'AndroidOS' && os === 'WinOS') &&
                      <a className="download-button btn-desktop" target="_blank"
                        href="https://github.com/ecency/esteem-surfer/releases/download/2.2.7/Esteem-Setup-2.2.7.exe" rel="noopener noreferrer">Windows</a>
                    }
                    {(os !== 'iOS' && os !== 'AndroidOS' && os === 'MacOS') &&
                      <a className="download-button btn-desktop" target="_blank"
                        href="https://github.com/ecency/esteem-surfer/releases/download/2.2.7/Esteem-2.2.7.dmg" rel="noopener noreferrer">Mac</a>
                    }
                    {(os !== 'iOS' && os !== 'AndroidOS' && (os === 'UnixOS' || os === 'LinuxOS')) &&
                      <a className="download-button btn-desktop" target="_blank"
                        href="https://github.com/ecency/esteem-surfer/releases/download/2.2.7/esteem-surfer-2.2.7.tar.gz" rel="noopener noreferrer">Linux</a>
                    }
                    {(os === 'AndroidOS' || os !== 'iOS') && 
                      <a className="download-button btn-android" target="_blank"
                        href="https://play.google.com/store/apps/details?id=app.esteem.mobile.android"
                        rel="noopener noreferrer">Android</a>
                    }
                    {(os === 'iOS' || os !== 'AndroidOS') &&
                      <a className="download-button btn-ios" target="_blank"
                        href="https://apps.apple.com/us/app/esteem-v2/id1451896376" rel="noopener noreferrer">iOS</a>
                    }
                  </div>
                </div>
              </Modal.Body>
            </Modal>
            }
        </Fragment>;
    }
}
