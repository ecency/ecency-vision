import React, { Component } from "react";

import { Form } from "react-bootstrap";

import { _t } from "../../i18n";
import { handleInvalid, handleOnInput } from "../../util/input-util";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import { FormControl } from "@ui/input";
import { Button } from "@ui/button";

interface Props {
  onHide: () => void;
  onSubmit: (text: string, link: string) => void;
}

interface State {
  text: string;
  link: string;
}

export class AddImage extends Component<Props, State> {
  state: State = {
    text: "",
    link: ""
  };

  form = React.createRef<HTMLFormElement>();

  textChanged = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ text: e.target.value });
  };

  linkChanged = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ link: e.target.value });
  };

  render() {
    const { text, link } = this.state;

    return (
      <div className="dialog-content">
        <Form
          ref={this.form}
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (!this.form.current?.checkValidity()) {
              return;
            }

            const { text, link } = this.state;
            const { onSubmit } = this.props;
            onSubmit(text, link);
          }}
        >
          <Form.Group>
            <FormControl
              type="text"
              autoComplete="off"
              value={text}
              placeholder={_t("add-image.text-label")}
              onChange={this.textChanged}
              autoFocus={true}
              required={true}
              onInvalid={(e: any) => handleInvalid(e, "add-image.", "validation-text")}
              onInput={handleOnInput}
            />
          </Form.Group>
          <Form.Group>
            <FormControl
              type="text"
              autoComplete="off"
              value={link}
              placeholder={_t("add-image.link-label")}
              onChange={this.linkChanged}
              required={true}
              onInvalid={(e: any) => handleInvalid(e, "add-image.", "validation-image")}
              onInput={handleOnInput}
            />
          </Form.Group>
          <div className="d-flex justify-content-end">
            <Button type="submit">{_t("g.add")}</Button>
          </div>
        </Form>
      </div>
    );
  }
}

export default class AddImageDialog extends Component<Props> {
  hide = () => {
    const { onHide } = this.props;
    onHide();
  };

  render() {
    return (
      <Modal
        show={true}
        centered={true}
        onHide={this.hide}
        className="add-image-modal"
        animation={false}
      >
        <ModalHeader closeButton={true}>
          <ModalTitle>{_t("add-image.title")}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <AddImage {...this.props} />
        </ModalBody>
      </Modal>
    );
  }
}
