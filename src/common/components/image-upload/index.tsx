import React, { Component } from "react";
import { ActiveUser } from "../../store/active-user/types";
import BaseComponent from "../base";
import UploadButton from "../image-upload-button";
import { _t } from "../../i18n";
import { Modal, ModalBody, ModalHeader } from "@ui/modal";
import { FormControl, InputGroup } from "@ui/input";
import { Spinner } from "@ui/spinner";
import { Button } from "@ui/button";

interface Props {
  activeUser: ActiveUser;
  title: string;
  defImage: string;
  inProgress: boolean;
  onDone: (url: string) => void;
  onHide: () => void;
}

interface State {
  image: string;
  uploading: boolean;
}

export class ImageUpload extends BaseComponent<Props, State> {
  state: State = {
    image: this.props.defImage,
    uploading: false
  };

  imageChanged = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value: image } = e.target;

    this.stateSet({ image });
  };

  done = () => {
    const { onDone } = this.props;
    const { image } = this.state;
    onDone(image);
  };

  render() {
    const { title, inProgress } = this.props;
    const { image, uploading } = this.state;

    const spinner = <Spinner className="mr-[6px] w-3.5 h-3.5" />;

    return (
      <div className="image-upload-dialog-content">
        <div className="mb-4">
          <label>{title}</label>
          <InputGroup
            className="mb-3"
            append={
              <UploadButton
                {...this.props}
                onBegin={() => {
                  this.stateSet({ uploading: true });
                }}
                onEnd={(url) => {
                  this.stateSet({ image: url, uploading: false });
                }}
              />
            }
          >
            <FormControl
              type="text"
              disabled={inProgress}
              placeholder="https://"
              value={image}
              maxLength={500}
              onChange={this.imageChanged}
            />
          </InputGroup>
        </div>
        <Button
          onClick={this.done}
          disabled={inProgress || uploading}
          icon={inProgress && spinner}
          iconPlacement="left"
        >
          {_t("g.save")}
        </Button>
      </div>
    );
  }
}

export default class ImageUploadDialog extends Component<Props> {
  render() {
    const { onHide } = this.props;
    return (
      <Modal
        animation={false}
        show={true}
        centered={true}
        onHide={onHide}
        className="image-upload-dialog"
      >
        <ModalHeader closeButton={true} />
        <ModalBody>
          <ImageUpload {...this.props} />
        </ModalBody>
      </Modal>
    );
  }
}
