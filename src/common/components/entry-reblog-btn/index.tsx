import React from "react";

import { Entry } from "../../store/entries/types";
import { Account } from "../../store/accounts/types";
import { User } from "../../store/users/types";
import { ActiveUser } from "../../store/active-user/types";
import { Reblogs } from "../../store/reblogs/types";
import { UI, ToggleType } from "../../store/ui/types";
import BaseComponent from "../base";
import Tooltip from "../tooltip";
import LoginRequired from "../login-required";
import PopoverConfirm from "../popover-confirm";
import { error, success, info } from "../feedback";
import { reblog, formatError } from "../../api/operations";
import { _t } from "../../i18n";
import _c from "../../util/fix-class-names";
import { repeatSvg, viewListSvg } from "../../img/svg";
import "./_index.scss";
import { useMappedStore } from "../../store/use-mapped-store";
import { getRebloggedUsers } from "../../api/hive";
import EntryRebloStats from "../entry-reblog-stats";

interface Props {
  entry: Entry;
  users: User[];
  activeUser: ActiveUser | null;
  reblogs: Reblogs;
  ui: UI;
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
  rebloggedBy: string[];
  showReblogStats: boolean;
}

export class EntryReblogBtn extends BaseComponent<Props> {
  state: State = {
    inProgress: false,
    rebloggedBy: [],
    showReblogStats: false
  };

  componentDidMount() {
    const { activeUser, reblogs, fetchReblogs } = this.props;
    if (activeUser && reblogs.canFetch) {
      // since @active-user/LOGIN resets reblogs reducer, wait 500 ms on first load
      // to clientStoreTasks (store/helper.ts) finish its job with logging active user in.
      // Otherwise condenser_api.get_blog_entries will be called 2 times on page load.
      setTimeout(fetchReblogs, 500);
    }
    this.getReblogs()
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    const { activeUser, reblogs, fetchReblogs } = this.props;
    if (activeUser && activeUser.username !== prevProps.activeUser?.username && reblogs.canFetch) {
      fetchReblogs();
    }
  }

  reblog = () => {
    const { entry, activeUser, addReblog } = this.props;

    this.stateSet({ inProgress: true });
    reblog(activeUser?.username!, entry.author, entry.permlink)
      .then(() => {
        addReblog(entry.author, entry.permlink);
        success(_t("entry-reblog.success"));
      })
      .catch((e) => {
        error(...formatError(e));
      })
      .finally(() => {
        this.stateSet({ inProgress: false });
      });
  };

  deleteReblog = () => {
    const { entry, activeUser, deleteReblog } = this.props;

    this.stateSet({ inProgress: true });
    reblog(activeUser?.username!, entry.author, entry.permlink, true)
      .then(() => {
        deleteReblog(entry.author, entry.permlink);
        info(_t("entry-reblog.delete-success"));
      })
      .catch((e) => {
        error(...formatError(e));
      })
      .finally(() => {
        this.stateSet({ inProgress: false });
      });
  };

  getReblogs = async () => {
    const { entry } = this.props
    this.stateSet({inProgress: true})
    const rebloggedBy = await getRebloggedUsers(entry.author, entry.permlink)
    this.stateSet({rebloggedBy, inProgress: false})
  }

  showReblogs = () => {
    this.stateSet({showReblogStats: true})
  }
  hideReblogs = () => {
    this.stateSet({showReblogStats: false})
  }

  render() {
    const { activeUser, entry, reblogs } = this.props;
    const { inProgress, rebloggedBy, showReblogStats } = this.state;

    const reblogged =
      entry &&
      activeUser &&
      reblogs.list.find((x) => x.author === entry.author && x.permlink === entry.permlink) !==
        undefined;

    const content = (
      <>
        <div
          className={_c(
            `entry-reblog-btn d-flex align-items-center ${reblogged ? "reblogged" : ""} ${inProgress ? "in-progress" : ""} `
          )}
        >
          <Tooltip content={reblogged ? _t("entry-reblog.delete-reblog") : _t("entry-reblog.reblog")}>
            <a className="inner-btn">{repeatSvg}</a>
          </Tooltip>
        </div>
        <>
        <div onClick={this.showReblogs} className="entry-reblog-btn">
          <Tooltip content={`${rebloggedBy.length} reblogs`}>
            <a className="inner-btn">
              {viewListSvg} 
            </a>           
          </Tooltip> 
        <span className="ml-1 inner-btn">{rebloggedBy.length}</span>
        </div>
          <EntryRebloStats 
          hideReblogs={this.hideReblogs}
          showReblogStats={showReblogStats}
          rebloggedBy={rebloggedBy}
          inProgress={inProgress}
          />
        </>
      </>
    );

    if (!activeUser) {
      return LoginRequired({
        ...this.props,
        children: content
      });
    }

    // Delete reblog
    if (reblogged) {
      return (
        <PopoverConfirm
          onConfirm={this.deleteReblog}
          okVariant="danger"
          titleText={_t("entry-reblog.delete-confirm-title")}
          okText={_t("entry-reblog.delete-confirm-ok")}
        >
          {content}
        </PopoverConfirm>
      );
    }

    // Reblog
    return (
      <PopoverConfirm
        onConfirm={this.reblog}
        titleText={_t("entry-reblog.confirm-title", { n: activeUser.username })}
        okText={_t("entry-reblog.confirm-ok")}
      >
        {content}
      </PopoverConfirm>
    );
  }
}

export default (p: Pick<Props, "entry">) => {
  const {
    users,
    activeUser,
    reblogs,
    ui,
    setActiveUser,
    updateActiveUser,
    deleteUser,
    fetchReblogs,
    addReblog,
    deleteReblog,
    toggleUIProp
  } = useMappedStore();

  const props: Props = {
    entry: p.entry,
    users,
    activeUser,
    reblogs,
    ui,
    setActiveUser,
    updateActiveUser,
    deleteUser,
    fetchReblogs,
    addReblog,
    deleteReblog,
    toggleUIProp
  };

  return <EntryReblogBtn {...props} />;
};
