import React from "react";

import {Entry} from "../../store/entries/types";
import {Account} from "../../store/accounts/types";
import {User} from "../../store/users/types";
import {ActiveUser} from "../../store/active-user/types";
import {Reblogs} from "../../store/reblogs/types";
import {UI, ToggleType} from "../../store/ui/types";

import BaseComponent from "../base";
import Tooltip from "../tooltip";
import LoginRequired from "../login-required";
import PopoverConfirm from "../popover-confirm";
import {error, success, info} from "../feedback";

import {reblog, formatError} from "../../api/operations";

import {_t} from "../../i18n";

import _c from "../../util/fix-class-names";

import {repeatSvg} from "../../img/svg";
import { updateUserPoints } from "../../api/breakaway";
import { Global } from "../../store/global/types";
import { getCommunity } from "../../api/bridge";

interface Props {
    entry: Entry;
    users: User[];
    activeUser: ActiveUser | null;
    reblogs: Reblogs;
    ui: UI;
    global: Global;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data?: Account) => void;
    deleteUser: (username: string) => void;
    fetchReblogs: () => void;
    addReblog: (author: string, permlink: string) => void;
    deleteReblog: (author: string, permlink: string) => void;
    toggleUIProp: (what: ToggleType) => void;
}

interface State {
    inProgress: boolean;
    communityData: any
}

export class EntryReblogBtn extends BaseComponent<Props> {
    state: State = {
        inProgress: false,
        communityData: {}
    };

    componentDidMount() {
        const {activeUser, reblogs, fetchReblogs, global} = this.props;
        if (activeUser && reblogs.canFetch) {
            // since @active-user/LOGIN resets reblogs reducer, wait 500 ms on first load
            // to clientStoreTasks (store/helper.ts) finish its job with logging active user in.
            // Otherwise condenser_api.get_blog_entries will be called 2 times on page load.
            setTimeout(fetchReblogs, 500);
        }
        this.getCurrentCommunity()
    }

    componentDidUpdate(prevProps: Readonly<Props>) {
        const {activeUser, reblogs, fetchReblogs} = this.props;
        if (activeUser && activeUser.username !== prevProps.activeUser?.username && reblogs.canFetch) {
            fetchReblogs();
        }
    }

    reblog = () => {
        const {entry, activeUser, addReblog} = this.props;
        const { communityData } = this.state;

        this.stateSet({inProgress: true});
        reblog(activeUser?.username!, entry.author, entry.permlink)
            .then(async () => {
                addReblog(entry.author, entry.permlink);
                const baResponse = await updateUserPoints(activeUser!.username, communityData.title, "reblog")
                success(_t("entry-reblog.success"));
            })
            .catch((e) => {
                error(formatError(e));
            })
            .finally(() => {
                this.stateSet({inProgress: false});
            });
    };

    deleteReblog = () => {
        const {entry, activeUser, deleteReblog} = this.props;

        this.stateSet({inProgress: true});
        reblog(activeUser?.username!, entry.author, entry.permlink, true)
            .then(() => {
                deleteReblog(entry.author, entry.permlink);
                info(_t("entry-reblog.delete-success"));
            })
            .catch((e) => {
                error(formatError(e));
            })
            .finally(() => {
                this.stateSet({inProgress: false});
            });
    }

    getCurrentCommunity = async () => {
        const communityId = this.props.global.hive_id
        const community = await getCommunity(communityId);
        if (community) {
          this.setState({communityData: community})
        }
      }

    render() {
        const {activeUser, entry, reblogs} = this.props;
        const {inProgress} = this.state;

        const reblogged =
            activeUser &&
            reblogs.list.find((x) => x.author === entry.author && x.permlink === entry.permlink) !== undefined;

        const content = (
            <div className={_c(`entry-reblog-btn ${reblogged ? "reblogged" : ""} ${inProgress ? "in-progress" : ""} `)}>
                <Tooltip content={reblogged ? _t("entry-reblog.delete-reblog") : _t("entry-reblog.reblog")}>
                    <a className="inner-btn">
                        {repeatSvg}
                    </a>
                </Tooltip>
            </div>
        );

        if (!activeUser) {
            return LoginRequired({
                ...this.props,
                children: content
            })
        }

        // Delete reblog
        if (reblogged) {
            return <PopoverConfirm
                onConfirm={this.deleteReblog}
                okVariant="danger"
                titleText={_t("entry-reblog.delete-confirm-title")}
                okText={_t("entry-reblog.delete-confirm-ok")}
            >
                {content}
            </PopoverConfirm>
        }

        // Reblog
        return (
            <PopoverConfirm
                onConfirm={this.reblog}
                titleText={_t("entry-reblog.confirm-title", {n: activeUser.username})}
                okText={_t("entry-reblog.confirm-ok")}
            >
                {content}
            </PopoverConfirm>
        );
    }
}

export default (p: Props) => {
    const props: Props = {
        entry: p.entry,
        users: p.users,
        activeUser: p.activeUser,
        reblogs: p.reblogs,
        ui: p.ui,
        setActiveUser: p.setActiveUser,
        updateActiveUser: p.updateActiveUser,
        deleteUser: p.deleteUser,
        fetchReblogs: p.fetchReblogs,
        addReblog: p.addReblog,
        deleteReblog: p.deleteReblog,
        toggleUIProp: p.toggleUIProp,
        global: p.global,
    }

    return <EntryReblogBtn {...props} />
}
