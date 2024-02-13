import React, { Component } from "react";

import { Button, ProgressBar } from "react-bootstrap";

import { Global } from "../../../../common/store/global/types";

import { _t } from "../../../../common/i18n";

import { getOperatingSystem } from "../../../../common/util/platform";

interface Props {
  global: Global;
  dismissNewVersion: () => void;
}

interface State {
  ver: string;
  downloading: boolean;
  progress: number;
  completed: boolean;
}

export default class Updater extends Component<Props, State> {
  state: State = {
    ver: "",
    downloading: false,
    progress: 0,
    completed: false,
  };

  componentDidMount() {
    // "?" is for to pass tests
    (window as any)?.ipcRenderer?.on(
      "download-started",
      this.onDownloadStarted
    );
    (window as any)?.ipcRenderer?.on(
      "download-progress",
      this.onDownloadProgress
    );
    (window as any)?.ipcRenderer?.on(
      "update-downloaded",
      this.onUpdateDownloaded
    );
  }

  onDownloadStarted = () => {
    this.setState({
      downloading: true,
      progress: 0,
    });
  };

  onDownloadProgress = (event: any, percent: number) => {
    this.setState({
      progress: percent,
    });

    if (percent >= 100) {
      setTimeout(() => {
        this.onUpdateDownloaded();
      }, 10000);
    }
  };

  onUpdateDownloaded = () => {
    this.setState({
      downloading: false,
      completed: true,
    });
  };

  begin = () => {
    const { global } = this.props;
    (window as any)?.ipcRenderer?.send("download-update", global.newVersion);
  };

  dismiss = () => {
    this.setState({
      downloading: false,
      progress: 0,
      completed: false,
    });

    const { dismissNewVersion } = this.props;
    dismissNewVersion();
  };

  updateRestart = () => {
    (window as any)?.ipcRenderer?.send("update-restart");
  };

  render() {
    const { global } = this.props;
    if (!global.newVersion) {
      return null;
    }

    // Windows
    if (getOperatingSystem(window.navigator.userAgent) === "WindowsOS") {
      return (
        <div className="updater">
          <p className="info-text">
            {_t("updater.new-version-available")}{" "}
            <span className="release-name">{global.newVersion}</span>
          </p>
          <Button className="btn-update" onClick={this.begin}>
            {_t("updater.download")}
          </Button>

          <Button className="btn-dismiss" onClick={this.dismiss}>
            {_t("updater.dismiss")}
          </Button>
        </div>
      );
    }

    const { downloading, completed, progress } = this.state;
    const percent = Math.ceil(progress);

    return (
      <div className="updater">
        {!downloading && !completed && (
          <>
            <p className="info-text">
              {_t("updater.new-version-available")}{" "}
              <span className="release-name">{global.newVersion}</span>
            </p>
            <Button className="btn-update" onClick={this.begin}>
              {_t("updater.update")}
            </Button>

            <Button className="btn-dismiss" onClick={this.dismiss}>
              {_t("updater.dismiss")}
            </Button>
          </>
        )}
        {downloading && (
          <>
            <p className="info-text">{_t("updater.downloading")}</p>
            <div className="progress">
              <ProgressBar
                max={100}
                min={0}
                now={percent}
                label={`${percent}%`}
              />
            </div>
          </>
        )}
        {completed && (
          <>
            <p className="info-text">{_t("updater.download-completed")}</p>
            <Button onClick={this.updateRestart}>
              {_t("updater.restart")}
            </Button>
          </>
        )}
      </div>
    );
  }
}
