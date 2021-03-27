import React, {Fragment} from "react";

import {History} from "history";

import BaseComponent from "../base";

import DropDown from "../dropdown";

import {dotsHorizontal, deleteForeverSvg, pencilOutlineSvg} from "../../img/svg";
import {ActiveUser} from "../../store/active-user/types";
import {Entry} from "../../store/entries/types";
import {Community, ROLES} from "../../store/communities/types";
import EditHistory from "../edit-history";
import EntryShare from "../entry-share";
import {Global} from "../../store/global/types";
import clipboard from "../../util/clipboard";
import {error, success} from "../feedback";
import {_t} from "../../i18n";

import ModalConfirm from "../modal-confirm";

import PinBtn from "../pin-btn";
import MuteBtn from "../mute-btn";

import {deleteComment, formatError} from "../../api/operations";

interface Props {
    history: History;
    global: Global;
    activeUser: ActiveUser | null;
    entry: Entry;
    community: Community | null;
}

interface State {
    share: boolean;
    editHistory: boolean;
    delete_: boolean;
}

class EntryMenu extends BaseComponent<Props, State> {
    state: State = {
        share: false,
        editHistory: false,
        delete_: false,
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
        deleteComment(activeUser?.username!, entry.author, entry.permlink)
            .then(() => {
                history.push('/');
            })
            .catch((e) => {
                error(formatError(e));
            })
    }

    render() {
        const {global, activeUser, entry, community} = this.props;

        const canPinOrMute = this.canPinOrMute();

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
                        label: "Edit",
                        onClick: this.edit
                    },
                    {
                        label: "Delete",
                        onClick: this.toggleDelete
                    }
                ]
            ];
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

        const {share, editHistory, delete_} = this.state;

        return <div className="entry-menu">
            <DropDown {...menuConfig} float="right"/>

            {share && <EntryShare entry={entry} onHide={this.toggleShare}/>}
            {editHistory && <EditHistory entry={entry} onHide={this.toggleEditHistory}/>}
            {delete_ && <ModalConfirm onConfirm={() => {
                this.delete();
                this.toggleDelete();
            }} onCancel={this.toggleDelete}/>}
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
    }

    return <EntryMenu {...props} />
}
