import React from "react";
import { Button } from "react-bootstrap";

import { ActiveUser } from "../../store/active-user/types";

import BaseComponent from "../base";
import { error, success } from "../feedback";

import { uploadImage } from "../../api/misc";
import { getAccessToken } from "../../helper/user-token";

import { _t } from "../../i18n";

import { uploadSvg } from "../../img/svg";
import { Spinner } from "@ui/spinner";

interface UploadButtonProps {
  activeUser: ActiveUser;
  onBegin: () => void;
  onEnd: (url: string) => void;
}

interface UploadButtonState {
  inProgress: boolean;
}

export default class UploadButton extends BaseComponent<UploadButtonProps, UploadButtonState> {
  input = React.createRef<HTMLInputElement>();

  state: UploadButtonState = {
    inProgress: false
  };

  upload = () => {
    if (this.input.current) this.input.current.click();
  };

  handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // @ts-ignore
    const files = [...e.target.files];

    if (files.length === 0) {
      return;
    }

    const [file] = files;

    const { onBegin, onEnd, activeUser } = this.props;

    onBegin();

    this.stateSet({ inProgress: true });
    let token = getAccessToken(activeUser.username);

    if (token) {
      uploadImage(file, token)
        .then((r) => {
          onEnd(r.url);
          success(_t("image-upload-button.uploaded"));
        })
        .catch(() => {
          error(_t("g.server-error"));
        })
        .finally(() => {
          this.stateSet({ inProgress: false });
        });
    } else {
      error(_t("editor-toolbar.image-error-cache"));
    }
  };

  render() {
    const { inProgress } = this.state;
    const spinner = <Spinner className="w-3.5 h-3.5" />;

    return (
      <>
        <Button
          size="sm"
          disabled={inProgress}
          onClick={() => {
            this.upload();
          }}
        >
          {inProgress && spinner}
          {!inProgress && uploadSvg}
          <input
            type="file"
            ref={this.input}
            accept="image/*"
            style={{ display: "none" }}
            onChange={this.handleFileInput}
          />
        </Button>
      </>
    );
  }
}
