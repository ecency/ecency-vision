import React from "react";
import { Entry } from "../../store/entries/types";
import { ActiveUser } from "../../store/active-user/types";
import { addBookmark, deleteBookmark, getBookmarks } from "../../api/private-api";
import BaseComponent from "../base";
import LoginRequired from "../login-required";
import { User } from "../../store/users/types";
import { ToggleType, UI } from "../../store/ui/types";
import { Account } from "../../store/accounts/types";
import Tooltip from "../tooltip";
import { error, success } from "../feedback";
import { _t } from "../../i18n";
import _c from "../../util/fix-class-names";
import { bookmarkOutlineSvg, bookmarkSvg } from "../../img/svg";
import "./_index.scss";

export interface Props {
  entry: Entry;
  activeUser: ActiveUser | null;
  users: User[];
  ui: UI;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data?: Account) => void;
  deleteUser: (username: string) => void;
  toggleUIProp: (what: ToggleType) => void;
}

export interface State {
  bookmarkId: string | null;
  inProgress: boolean;
}

export class BookmarkBtn extends BaseComponent<Props> {
  state: State = {
    bookmarkId: null,
    inProgress: false
  };

  componentDidMount() {
    this.detect();
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    const { activeUser, entry } = this.props;
    if (
      // active user changed
      activeUser?.username !== prevProps.activeUser?.username ||
      // or entry changed
      !(entry.author === prevProps.entry.author && entry.permlink === prevProps.entry.permlink)
    ) {
      this.detect();
    }
  }

  detect = () => {
    const { entry, activeUser } = this.props;
    if (!activeUser) {
      this.stateSet({ bookmarked: false });
      return;
    }

    this.stateSet({ inProgress: true });
    getBookmarks(activeUser.username)
      .then((r) => {
        const bookmark = r.find((x) => x.author === entry.author && x.permlink == entry.permlink);
        if (bookmark) {
          this.stateSet({ bookmarkId: bookmark._id });
        } else {
          this.stateSet({ bookmarkId: null });
        }
      })
      .finally(() => this.stateSet({ inProgress: false }));
  };

  add = () => {
    const { activeUser, entry } = this.props;
    this.stateSet({ inProgress: true });
    addBookmark(activeUser?.username!, entry.author, entry.permlink)
      .then(() => {
        this.detect();
        success(_t("bookmark-btn.added"));
      })
      .catch(() => error(_t("g.server-error")))
      .finally(() => this.stateSet({ inProgress: false }));
  };

  delete = () => {
    const { activeUser } = this.props;
    const { bookmarkId } = this.state;

    if (!bookmarkId) {
      return;
    }

    this.stateSet({ inProgress: true });
    deleteBookmark(activeUser?.username!, bookmarkId)
      .then(() => {
        this.detect();
        success(_t("bookmark-btn.deleted"));
      })
      .catch(() => error(_t("g.server-error")))
      .finally(() => this.stateSet({ inProgress: false }));
  };

  render() {
    const { activeUser } = this.props;

    if (!activeUser) {
      return LoginRequired({
        ...this.props,
        children: (
          <div className="bookmark-btn">
            <Tooltip content={_t("bookmark-btn.add")}>
              <span>{bookmarkOutlineSvg}</span>
            </Tooltip>
          </div>
        )
      });
    }

    const { bookmarkId, inProgress } = this.state;

    if (bookmarkId) {
      return (
        <div
          className={_c(`bookmark-btn bookmarked ${inProgress ? "in-progress" : ""}`)}
          onClick={this.delete}
        >
          <Tooltip content={_t("bookmark-btn.delete")}>
            <span>{bookmarkSvg}</span>
          </Tooltip>
        </div>
      );
    }

    return (
      <div className={_c(`bookmark-btn ${inProgress ? "in-progress" : ""}`)} onClick={this.add}>
        <Tooltip content={_t("bookmark-btn.add")}>
          <span>{bookmarkOutlineSvg}</span>
        </Tooltip>
      </div>
    );
  }
}

export default (p: Props) => {
  const props: Props = {
    entry: p.entry,
    activeUser: p.activeUser,
    users: p.users,
    ui: p.ui,
    setActiveUser: p.setActiveUser,
    updateActiveUser: p.updateActiveUser,
    deleteUser: p.deleteUser,
    toggleUIProp: p.toggleUIProp
  };

  return <BookmarkBtn {...props} />;
};
