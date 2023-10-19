import React, { Component } from "react";
import { _t } from "../../i18n";
import { readClipboard } from "../../util/clipboard";
import { handleInvalid, handleOnInput } from "../../util/input-util";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import { FormControl } from "@ui/input";
import { Button } from "@ui/button";
import { Form } from "@ui/form";

interface Props {
  onHide: () => void;
  onSubmit: (text: string, link: string) => void;
}

interface State {
  text: string;
  link: string;
}

export class AddLink extends Component<Props, State> {
  state: State = {
    text: "",
    link: "https://"
  };

  componentDidMount() {
    this.handleClipboard();
  }

  handleClipboard = async () => {
    const clipboard = await readClipboard();

    if (clipboard && (clipboard.startsWith("https://") || clipboard.startsWith("http://"))) {
      this.setState({ link: clipboard });
    }
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
          <div className="mb-4">
            <FormControl
              type="text"
              autoComplete="off"
              value={text}
              placeholder={_t("add-link.text-label")}
              onChange={this.textChanged}
              autoFocus={true}
              required={true}
              onInvalid={(e: any) => handleInvalid(e, "add-link.", "validation-text")}
              onInput={handleOnInput}
            />
          </div>
          <div className="mb-4">
            <FormControl
              type="text"
              autoComplete="off"
              value={link}
              placeholder={_t("add-link.link-label")}
              onChange={this.linkChanged}
              required={true}
              onInvalid={(e: any) => handleInvalid(e, "add-link.", "validation-link")}
              onInput={handleOnInput}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit">{_t("g.add")}</Button>
          </div>
        </Form>
      </div>
    );
  }
}

export default class AddLinkDialog extends Component<Props> {
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
        className="add-link-modal"
        animation={false}
      >
        <ModalHeader closeButton={true}>
          <ModalTitle>{_t("add-link.title")}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <AddLink {...this.props} />
        </ModalBody>
      </Modal>
    );
  }
}
