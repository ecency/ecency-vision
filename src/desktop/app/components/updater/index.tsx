import React, {Component} from "react";

import {ipcRenderer} from "electron";

import {Button, ProgressBar} from "react-bootstrap";

import {Global} from "../../../../common/store/global/types";

import {_t} from "../../../../common/i18n";

interface Props {
    global: Global;
    dismissNewVersion: () => void;
}

interface State {
    ver: string,
    downloading: boolean,
    progress: number,
    completed: boolean
}

export default class Updater extends Component<Props, State> {

    state: State = {
        ver: '',
        downloading: false,
        progress: 0,
        completed: false
    }

    componentDidMount() {
        ipcRenderer.on('download-started', this.onDownloadStarted);
        ipcRenderer.on('download-progress', this.onDownloadProgress);
        ipcRenderer.on('update-downloaded', this.onUpdateDownloaded);
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
        ipcRenderer.send('download-update');
    };

    dismiss = () => {
        this.setState({
            downloading: false,
            progress: 0,
            completed: false
        });

        const {dismissNewVersion} = this.props;
        dismissNewVersion();
    };

    updateRestart = () => {
        ipcRenderer.send('update-restart');
    };

    render() {
        const {downloading, completed, progress} = this.state;
        const {global} = this.props;
        const percent = Math.ceil(progress);

        return <div className="updater">
            {(!downloading && !completed) && (
                <>
                    <p className="info-text">
                        {_t("updater.new-version-available")}
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
                    <p className="info-text">
                        {_t("updater.downloading")}
                    </p>
                    <div className="progress">
                        <ProgressBar max={100} min={0} now={percent} label={`${percent}%`}/>
                    </div>
                </>
            )}
            {completed && (
                <>
                    <p className="info-text">
                        {_t("updater.download-completed")}
                    </p>
                    <Button onClick={this.updateRestart}>
                        {_t("updater.restart")}
                    </Button>
                </>
            )}
        </div>
    }
}
