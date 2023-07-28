import React, { Component } from "react";

import { Button, Form, FormControl, InputGroup, Modal } from "react-bootstrap";

import { ActiveUser } from "../../store/active-user/types";

import BaseComponent from "../base";
import UploadButton from "../image-upload-button";

import { _t } from "../../i18n";
import { Spinner } from "../spinner";

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

  imageChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>): void => {
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
        <Form.Group>
          <Form.Label>{title}</Form.Label>
          <InputGroup className="mb-3">
            <Form.Control
              type="text"
              disabled={inProgress}
              placeholder="https://"
              value={image}
              maxLength={500}
              onChange={this.imageChanged}
            />
            <InputGroup.Append>
              <UploadButton
                {...this.props}
                onBegin={() => {
                  this.stateSet({ uploading: true });
                }}
                onEnd={(url) => {
                  this.stateSet({ image: url, uploading: false });
                }}
              />
            </InputGroup.Append>
          </InputGroup>
        </Form.Group>
        <Button onClick={this.done} disabled={inProgress || uploading}>
          {inProgress && spinner} {_t("g.save")}
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
        keyboard={false}
        className="image-upload-dialog modal-thin-header"
      >
        <Modal.Header closeButton={true} />
        <Modal.Body>
          <ImageUpload {...this.props} />
        </Modal.Body>
      </Modal>
    );
  }
}
