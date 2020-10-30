import React, {Component} from "react";
import {Button, Spinner} from "react-bootstrap";

import {ActiveUser} from "../../store/active-user/types";

import {error, success} from "../feedback";

import {uploadImage} from "../../api/misc";
import {getAccessToken} from "../../helper/user-token";

import {_t} from "../../i18n";

import {uploadSvg} from "../../img/svg";

interface UploadButtonProps {
    activeUser: ActiveUser;
    onBegin: () => void;
    onEnd: (url: string) => void;
}

interface UploadButtonState {
    inProgress: boolean;
}

export default class UploadButton extends Component<UploadButtonProps, UploadButtonState> {

    _mounted: boolean = true;
    input = React.createRef<HTMLInputElement>();

    state: UploadButtonState = {
        inProgress: false
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    stateSet = (state: {}, cb?: () => void) => {
        if (this._mounted) {
            this.setState(state, cb);
        }
    };

    upload = () => {
        if (this.input.current) this.input.current.click();
    };

    handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = [...e.target.files];

        if (files.length === 0) {
            return;
        }

        const [file] = files;

        const {onBegin, onEnd, activeUser} = this.props;

        onBegin();

        this.stateSet({inProgress: true});

        uploadImage(file, getAccessToken(activeUser.username)).then(r => {
            onEnd(r.url);
            success(_t('image-upload-button.uploaded'));
        }).catch(() => {
            error(_t('g.server-error'));
        }).finally(() => {
            this.stateSet({inProgress: false});
        });
    };

    render() {
        const {inProgress} = this.state;
        const spinner = <Spinner animation="grow" variant="light" size="sm"/>;

        return (
            <>
                <Button size="sm"
                        disabled={inProgress}
                        onClick={() => {
                            this.upload();
                        }}>
                    {inProgress && spinner}
                    {!inProgress && uploadSvg}
                    <input
                        type="file"
                        ref={this.input}
                        accept="image/*"
                        style={{display: 'none'}}
                        onChange={this.handleFileInput}
                    />
                </Button>
            </>
        );
    }
}
