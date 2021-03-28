import React, {Fragment} from "react";

import {History} from "history";

import BaseComponent from "../base";

import DropDown from "../dropdown";

import isEqual from "react-fast-compare";

import {dotsHorizontal, deleteForeverSvg, pencilOutlineSvg} from "../../img/svg";
import {ActiveUser} from "../../store/active-user/types";
import {Entry} from "../../store/entries/types";
import {Communities, Community, ROLES} from "../../store/communities/types";
import EditHistory from "../edit-history";
import EntryShare from "../entry-share";
import {Global} from "../../store/global/types";
import clipboard from "../../util/clipboard";
import {error, success} from "../feedback";
import {_t} from "../../i18n";

import ModalConfirm from "../modal-confirm";

import MuteBtn from "../mute-btn";

import {deleteComment, formatError, pinPost} from "../../api/operations";
import {EntryPinTracker} from "../../store/entry-pin-tracker/types";

interface Props {
    history: History;
    global: Global;
    activeUser: ActiveUser | null;
    entry: Entry;
    community: Community | null;
    communities: Communities;
    entryPinTracker: EntryPinTracker;
    trackEntryPin: (entry: Entry) => void;
    setEntryPin: (pin: boolean) => void;
}

interface State {
    share: boolean;
    editHistory: boolean;
    delete_: boolean;
    pin: boolean;
    unpin: boolean
}

class EntryMenu extends BaseComponent<Props, State> {
    state: State = {
        share: false,
        editHistory: false,
        delete_: false,
        pin: false,
        unpin: false,
    }

    componentDidMount() {
        const {entry, trackEntryPin} = this.props;

        if (this.canPinOrMute()) {
            setTimeout(() => {
                trackEntryPin(entry);
            }, 500);
        }
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
        const {entry, trackEntryPin, activeUser} = this.props;

        if (!isEqual(this.props.communities, prevProps.communities) ||
            activeUser?.username !== prevProps.activeUser?.username) {
            trackEntryPin(entry);
        }
    }

    toggleShare = () => {
        const {share} = this.state;
        this.stateSet({share: !share});
    }

    toggleEditHistory = () => {
        const {editHistory} = this.state;
        this.stateSet({editHistory: !editHistory});
    }

    toggleDelete = () => {
        const {delete_} = this.state;
        this.stateSet({delete_: !delete_});
    }

    togglePin = () => {
        const {pin} = this.state;
        this.stateSet({pin: !pin});
    }

    toggleUnpin = () => {
        const {unpin} = this.state;
        this.stateSet({unpin: !unpin});
    }

    canPinOrMute = () => {
        const {activeUser, community} = this.props;

        return activeUser && community ? !!community.team.find(m => {
            return m[0] === activeUser.username &&
                [ROLES.OWNER.toString(), ROLES.ADMIN.toString(), ROLES.MOD.toString()].includes(m[1])
        }) : false;
    }

    copyAddress = () => {
        const {entry} = this.props;

        const u = `https://ecency.com/${entry.category}/@${entry.author}/${entry.permlink}`
        clipboard(u);
        success(_t("entry.address-copied"));
    };

    edit = () => {
        const {entry, history} = this.props;

        const u = `/@${entry.author}/${entry.permlink}/edit`;
        history.push(u);
    }

    delete = () => {
        const {history, activeUser, entry} = this.props;
        deleteComment(activeUser!.username, entry.author, entry.permlink)
            .then(() => {
                history.push('/');
            })
            .catch((e) => {
                error(formatError(e));
            })
    }

    pin = (pin: boolean) => {
        const {entry, community, activeUser, setEntryPin} = this.props;

        pinPost(activeUser!.username, community!.name, entry.author, entry.permlink, pin)
            .then(() => {
                setEntryPin(pin);

                if (pin) {
                    success(_t("entry-menu.pin-success"));
                } else {
                    success(_t("entry-menu.unpin-success"));
                }

            })
            .catch(err => error(formatError(err)))
    }

    render() {
        const {global, activeUser, entry, entryPinTracker} = this.props;

        const isComment = !!entry.parent_author;

        const ownEntry = activeUser && activeUser.username === entry.author;

        const editable = ownEntry && !isComment;

        let menuItems = [
            {
                label: _t("entry-menu.share"),
                onClick: this.toggleShare
            },
            {
                label: _t("entry-menu.edit-history"),
                onClick: this.toggleEditHistory
            }
        ];

        if (editable) {
            menuItems = [...menuItems,
                ...[
                    {
                        label: _t("g.edit"),
                        onClick: this.edit
                    },
                    {
                        label: _t("g.delete"),
                        onClick: this.toggleDelete
                    }
                ]
            ];
        }

        if (this.canPinOrMute()) {
            if (entryPinTracker.pinned) {
                menuItems = [...menuItems, {
                    label: _t("entry-menu.unpin"),
                    onClick: this.toggleUnpin
                }];
            } else {
                menuItems = [...menuItems, {
                    label: _t("entry-menu.pin"),
                    onClick: this.togglePin
                }];
            }

            /*
            const isMuted = !!entry.stats?.gray;
            menuItems = [...menuItems,
                ...[
                    {
                        label: (entryPinTracker.pinned ? "Unpin" : "Pin"),
                        onClick: this.edit
                    },
                    {
                        label: (isMuted ? "Unmute" : "Mute"),
                        onClick: this.edit
                    }
                ]
            ];
           */

        }

        if (global.isElectron) {
            menuItems = [...menuItems, {
                label: _t("entry.address-copy"),
                onClick: this.copyAddress
            }]
        }

        const menuConfig = {
            history: this.props.history,
            label: '',
            icon: dotsHorizontal,
            items: menuItems
        };

        const {share, editHistory, delete_, pin, unpin} = this.state;

        return <div className="entry-menu">
            <DropDown {...menuConfig} float="right"/>

            {share && <EntryShare entry={entry} onHide={this.toggleShare}/>}
            {editHistory && <EditHistory entry={entry} onHide={this.toggleEditHistory}/>}
            {delete_ && <ModalConfirm onConfirm={() => {
                this.delete();
                this.toggleDelete();
            }} onCancel={this.toggleDelete}/>}
            {pin && <ModalConfirm onConfirm={() => {
                this.pin(true);
                this.togglePin();
            }} onCancel={this.togglePin}/>}
            {unpin && <ModalConfirm onConfirm={() => {
                this.pin(false);
                this.toggleUnpin();
            }} onCancel={this.toggleUnpin}/>}
        </div>;
    }
}


export default (p: Props) => {
    const props: Props = {
        history: p.history,
        global: p.global,
        activeUser: p.activeUser,
        entry: p.entry,
        community: p.community,
        communities: p.communities,
        entryPinTracker: p.entryPinTracker,
        trackEntryPin: p.trackEntryPin,
        setEntryPin: p.setEntryPin
    }

    return <EntryMenu {...props} />
}
