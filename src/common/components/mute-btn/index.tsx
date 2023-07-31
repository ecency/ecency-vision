import React from "react";

import { Button, Form, FormControl, InputGroup } from "react-bootstrap";

import isEqual from "react-fast-compare";

import { Entry, EntryStat } from "../../store/entries/types";
import { Community } from "../../store/communities/types";
import { ActiveUser } from "../../store/active-user/types";
import { clone } from "../../store/util";

import BaseComponent from "../base";

import { formatError, mutePost } from "../../api/operations";
import { error } from "../feedback";

import { _t } from "../../i18n";

import _c from "../../util/fix-class-names";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader } from "../modal";

interface DialogProps {
  entry: Entry;
  inProgress: boolean;
  onSubmit: (notes: string) => void;
}

interface DialogState {
  value: string;
}

export class DialogBody extends React.Component<DialogProps, DialogState> {
  state: DialogState = {
    value: ""
  };

  valueChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>): void => {
    const { value } = e.target;
    this.setState({ value });
  };

  render() {
    const { entry, inProgress } = this.props;
    const { value } = this.state;

    const isMuted = !!entry.stats?.gray;

    return (
      <div className="mute-form">
        <Form.Group>
          <div className="entry-title">
            @{entry.author}/{entry.permlink}
          </div>
          <InputGroup>
            <Form.Control
              type="text"
              autoComplete="off"
              autoFocus={true}
              value={value}
              placeholder={_t("mute-btn.notes")}
              onChange={this.valueChanged}
              maxLength={120}
            />
          </InputGroup>
          <Form.Text>
            {!isMuted && _t("mute-btn.note-placeholder-mute")}
            {isMuted && "unmute" && _t("mute-btn.note-placeholder-unmute")}
          </Form.Text>
        </Form.Group>
        <div>
          <Button
            disabled={value.trim().length === 0 || inProgress}
            onClick={() => {
              const { onSubmit } = this.props;
              onSubmit(value);
            }}
          >
            {!isMuted && _t("mute-btn.mute")}
            {isMuted && "unmute" && _t("mute-btn.unmute")}
            {inProgress && " ..."}
          </Button>
        </div>
      </div>
    );
  }
}

interface Props {
  entry: Entry;
  community: Community;
  activeUser: ActiveUser;
  onlyDialog?: boolean;
  onSuccess: (entry: Entry, mute: boolean) => void;
  onCancel?: () => void;
}

interface State {
  dialog: boolean;
  inProgress: boolean;
}

export class MuteBtn extends BaseComponent<Props, State> {
  state: State = {
    dialog: false,
    inProgress: false
  };

  shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>): boolean {
    return (
      !isEqual(this.state, nextState) ||
      !isEqual(this.props.entry, nextProps.entry) ||
      !isEqual(this.props.community, nextProps.community) ||
      !isEqual(this.props.activeUser?.username, nextProps.activeUser?.username)
    );
  }

  toggleDialog = () => {
    const { dialog } = this.state;
    this.stateSet({ dialog: !dialog });
  };

  mute = (mute: boolean, notes: string) => {
    const { entry, community, activeUser, onSuccess } = this.props;

    this.stateSet({ inProgress: true });
    mutePost(activeUser.username, community.name, entry.author, entry.permlink, notes, mute)
      .then(() => {
        const nStats: EntryStat = { ...clone(entry.stats), gray: mute };
        const nEntry: Entry = { ...clone(entry), stats: nStats };
        onSuccess(nEntry, mute);
      })
      .catch((err) => error(...formatError(err)))
      .finally(() => this.stateSet({ inProgress: false }));
  };

  render() {
    const { entry, onlyDialog } = this.props;
    const { inProgress, dialog } = this.state;
    const isMuted = !!entry.stats?.gray;

    const cls = _c(`mute-btn ${inProgress ? "in-progress" : ""}`);

    const modal =
      dialog || onlyDialog ? (
        <Modal
          animation={false}
          show={true}
          centered={true}
          onHide={() => {
            const { onCancel } = this.props;
            if (onCancel) {
              onCancel();
            }
            this.toggleDialog();
          }}
          className="mute-dialog modal-thin-header"
          size="lg"
        >
          <ModalHeader closeButton={true} />
          <ModalBody>
            <DialogBody
              entry={entry}
              inProgress={inProgress}
              onSubmit={(value) => {
                this.toggleDialog();
                this.mute(!isMuted, value);
              }}
            />
          </ModalBody>
        </Modal>
      ) : null;

    if (onlyDialog) {
      return modal;
    }

    if (isMuted) {
      return (
        <>
          <a
            href="#"
            className={cls}
            onClick={(e) => {
              e.preventDefault();
              this.toggleDialog();
            }}
          >
            {_t("mute-btn.unmute")}
          </a>
          {modal}
        </>
      );
    }

    return (
      <>
        <a
          href="#"
          className={cls}
          onClick={(e) => {
            e.preventDefault();
            this.toggleDialog();
          }}
        >
          {_t("mute-btn.mute")}
        </a>
        {modal}
      </>
    );
  }
}

export default (p: Props) => {
  const props = {
    entry: p.entry,
    community: p.community,
    activeUser: p.activeUser,
    onlyDialog: p.onlyDialog,
    onSuccess: p.onSuccess,
    onCancel: p.onCancel
  };

  return <MuteBtn {...props} />;
};
