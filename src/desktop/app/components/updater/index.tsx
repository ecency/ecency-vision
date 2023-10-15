import React, { Component } from "react";
import { Global } from "../../../../common/store/global/types";
import { _t } from "../../../../common/i18n";
import { getOperatingSystem } from "../../../../common/util/platform";
import "./_index.scss";
import { Button } from "@ui/button";

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
    completed: false
  };

  componentDidMount() {
    // "?" is for to pass tests
    window["ipcRenderer"]?.on("download-started", this.onDownloadStarted);
    window["ipcRenderer"]?.on("download-progress", this.onDownloadProgress);
    window["ipcRenderer"]?.on("update-downloaded", this.onUpdateDownloaded);
  }

  onDownloadStarted = () => {
    this.setState({
      downloading: true,
      progress: 0
    });
  };

  onDownloadProgress = (event: any, percent: number) => {
    this.setState({
      progress: percent
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
      completed: true
    });
  };

  begin = () => {
    const { global } = this.props;
    window["ipcRenderer"]?.send("download-update", global.newVersion);
  };

  dismiss = () => {
    this.setState({
      downloading: false,
      progress: 0,
      completed: false
    });

    const { dismissNewVersion } = this.props;
    dismissNewVersion();
  };

  updateRestart = () => {
    window["ipcRenderer"]?.send("update-restart");
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
          <Button className="mr-[10px]" onClick={this.begin}>
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
            <Button className="mr-[10px]" onClick={this.begin}>
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
            <div className="bg-gray-200 h-[1rem] text-white rounded-lg flex overflow-hidden">
              <div
                className="flex duration-300 justify-center overflow-hidden text-xs bg-blue-dark-sky"
                role="progressbar"
                style={{ width: `${percent}%` }}
              >
                {percent}%
              </div>
            </div>
          </>
        )}
        {completed && (
          <>
            <p className="info-text">{_t("updater.download-completed")}</p>
            <Button onClick={this.updateRestart}>{_t("updater.restart")}</Button>
          </>
        )}
      </div>
    );
  }
}
