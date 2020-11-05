import React, {Component} from "react";

import {Button, Form, FormControl, InputGroup, Modal} from "react-bootstrap";

import isEqual from "react-fast-compare";

import {Entry, EntryStat} from "../../store/entries/types";
import {Community} from "../../store/communities/types";
import {ActiveUser} from "../../store/active-user/types";
import {clone} from "../../store/util";

import {formatError, mutePost} from "../../api/operations";
import {error} from "../feedback";

import {_t} from "../../i18n";

import _c from "../../util/fix-class-names";

export type DialogMode = "mute" | "unmute";

interface DialogProps {
    entry: Entry;
    mode: DialogMode;
    onSubmit: (notes: string) => void
}

interface DialogState {
    value: string;
}

export class DialogBody extends React.Component<DialogProps, DialogState> {
    state: DialogState = {
        value: ''
    }

    valueChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>): void => {
        const {value} = e.target;
        this.setState({value});
    }

    render() {
        const {mode, entry} = this.props;
        const {value} = this.state;
        return <div className="mute-form">
            <Form.Group>
                <div className="entry-title">@{entry.author}/{entry.permlink}</div>
                <InputGroup>
                    <Form.Control
                        type="text"
                        autoComplete="off"
                        autoFocus={true}
                        value={value}
                        placeholder={_t('mute-btn.notes')}
                        onChange={this.valueChanged}
                        maxLength={120}
                    />
                </InputGroup>
                <Form.Text>
                    {mode === "mute" && _t('mute-btn.note-placeholder-mute')}
                    {mode === "unmute" && _t('mute-btn.note-placeholder-unmute')}
                </Form.Text>
            </Form.Group>
            <div>
                <Button
                    disabled={value.trim().length === 0}
                    onClick={() => {
                        const {onSubmit} = this.props;
                        onSubmit(value);
                    }}>
                    {mode === "mute" && _t("mute-btn.mute")}
                    {mode === "unmute" && _t("mute-btn.unmute")}
                </Button>
            </div>
        </div>
    }
}

interface Props {
    entry: Entry;
    community: Community;
    activeUser: ActiveUser;
    onSuccess: (entry: Entry) => void;
}

interface State {
    dialog: boolean;
    dialogMode: DialogMode | null;
    inProgress: boolean;
}

export class MuteBtn extends Component<Props, State> {
    state: State = {
        dialog: false,
        dialogMode: null,
        inProgress: false
    }

    _mounted: boolean = true;

    shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>): boolean {
        return !isEqual(this.state, nextState) ||
            !isEqual(this.props.entry, nextProps.entry) ||
            !isEqual(this.props.community, nextProps.community) ||
            !isEqual(this.props.activeUser?.username, nextProps.activeUser?.username)
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    stateSet = (state: {}, cb?: () => void) => {
        if (this._mounted) {
            this.setState(state, cb);
        }
    };

    toggleDialog = (mode?: DialogMode) => {
        const {dialog} = this.state;

        if (dialog) {
            this.stateSet({dialog: false, dialogMode: null});
        } else {
            this.stateSet({dialog: true, dialogMode: mode});
        }
    }

    mute = (mute: boolean, notes: string) => {
        const {entry, community, activeUser, onSuccess} = this.props;

        this.stateSet({inProgress: true});
        mutePost(activeUser.username, community.name, entry.author, entry.permlink, notes, mute)
            .then(() => {
                const nStats: EntryStat = {...clone(entry.stats), gray: mute}
                const nEntry: Entry = {...clone(entry), stats: nStats};
                onSuccess(nEntry);
            })
            .catch(err => error(formatError(err)))
            .finally(() => this.stateSet({inProgress: false}));
    }

    render() {
        const {entry} = this.props;
        const {inProgress, dialog, dialogMode} = this.state;
        const isMuted = !!entry?.stats?.gray;

        const cls = _c(`mute-btn ${inProgress ? "in-progress" : ""}`);

        const modal = (dialog && dialogMode) ?
            <Modal animation={false} show={true} centered={true} onHide={this.toggleDialog} keyboard={false} className="mute-dialog modal-thin-header" size="lg">
                <Modal.Header closeButton={true}/>
                <Modal.Body>
                    <DialogBody entry={entry} mode={dialogMode} onSubmit={(value) => {
                        this.toggleDialog();
                        this.mute(dialogMode === "mute", value);
                    }}/>
                </Modal.Body>
            </Modal> : null;

        if (isMuted) {
            return <>
                <a href="#" className={cls} onClick={(e) => {
                    e.preventDefault();
                    this.toggleDialog("unmute");
                }}>{_t("mute-btn.unmute")}</a>
                {modal}
            </>
        }

        return <>
            <a href="#" className={cls} onClick={(e) => {
                e.preventDefault();
                this.toggleDialog("mute");
            }}>{_t("mute-btn.mute")}</a>
            {modal}
        </>
    }
}

export default (p: Props) => {
    const props = {
        entry: p.entry,
        community: p.community,
        activeUser: p.activeUser,
        onSuccess: p.onSuccess
    }

    return <MuteBtn {...props} />;
}
