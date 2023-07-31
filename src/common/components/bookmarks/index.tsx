import React, { Component } from "react";
import { History } from "history";

import { Global } from "../../store/global/types";
import { ActiveUser } from "../../store/active-user/types";
import { Account } from "../../store/accounts/types";

import BaseComponent from "../base";
import EntryLink from "../entry-link";
import ProfileLink from "../profile-link";
import UserAvatar from "../user-avatar";
import LinearProgress from "../linear-progress";
import { error } from "../feedback";

import { Bookmark, Favorite, getBookmarks, getFavorites } from "../../api/private-api";

import { _t } from "../../i18n";
import { useMappedStore } from "../../store/use-mapped-store";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader } from "../modal";

interface BookmarksProps {
  history: History;
  global: Global;
  activeUser: ActiveUser | null;
  onHide: () => void;
}

interface BookmarksState {
  loading: boolean;
  items: Bookmark[];
}

export class Bookmarks extends BaseComponent<BookmarksProps, BookmarksState> {
  state: BookmarksState = {
    loading: true,
    items: []
  };

  componentDidMount() {
    this.fetch();
  }

  fetch = () => {
    const { activeUser } = this.props;

    this.stateSet({ loading: true });
    getBookmarks(activeUser?.username!)
      .then((items) => {
        const sorted = items.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));
        this.stateSet({ items: sorted, loading: false });
      })
      .catch(() => {
        this.stateSet({ loading: false });
        error(_t("g.server-error"));
      });
  };

  render() {
    const { items, loading } = this.state;

    return (
      <div className="dialog-content">
        {loading && <LinearProgress />}
        {items.length > 0 && (
          <div className="dialog-list">
            <div className="dialog-list-body">
              {items.map((item) => {
                return (
                  <div key={item._id}>
                    {EntryLink({
                      ...this.props,
                      entry: {
                        category: "foo",
                        author: item.author,
                        permlink: item.permlink
                      },
                      afterClick: () => {
                        const { onHide } = this.props;
                        onHide();
                      },
                      children: (
                        <div className="dialog-list-item">
                          <UserAvatar username={item.author} size="medium" />
                          <div className="item-body">
                            <span className="author with-slash">{item.author}</span>
                            <span className="permlink">{item.permlink}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {!loading && items.length === 0 && <div className="dialog-list">{_t("g.empty-list")}</div>}
      </div>
    );
  }
}

interface FavoritesProps {
  history: History;
  global: Global;
  activeUser: ActiveUser | null;
  addAccount: (data: Account) => void;
  onHide: () => void;
}

interface FavoritesState {
  loading: boolean;
  items: Favorite[];
}

export class Favorites extends BaseComponent<FavoritesProps, FavoritesState> {
  state: FavoritesState = {
    loading: true,
    items: []
  };

  componentDidMount() {
    this.fetch();
  }

  fetch = () => {
    const { activeUser } = this.props;

    this.stateSet({ loading: true });
    getFavorites(activeUser?.username!)
      .then((items) => {
        const sorted = items.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));
        this.stateSet({ items: sorted, loading: false });
      })
      .catch(() => {
        this.stateSet({ loading: false });
        error(_t("g.server-error"));
      });
  };

  render() {
    const { items, loading } = this.state;

    return (
      <div className="dialog-content">
        {loading && <LinearProgress />}
        {items.length > 0 && (
          <div className="dialog-list">
            <div className="dialog-list-body">
              {items.map((item) => {
                return (
                  <div key={item._id}>
                    {ProfileLink({
                      ...this.props,
                      username: item.account,
                      afterClick: () => {
                        const { onHide } = this.props;
                        onHide();
                      },
                      children: (
                        <div className="dialog-list-item">
                          <UserAvatar username={item.account} size="medium" />
                          <div className="item-body">
                            <span className="author notranslate">{item.account}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {!loading && items.length === 0 && <div className="dialog-list">{_t("g.empty-list")}</div>}
      </div>
    );
  }
}

interface DialogProps {
  history: History;
  global: Global;
  activeUser: ActiveUser | null;
  addAccount: (data: Account) => void;
  onHide: () => void;
}

type DialogSection = "bookmarks" | "favorites";

interface DialogState {
  section: DialogSection;
}

class BookmarksDialog extends Component<DialogProps, DialogState> {
  state: DialogState = {
    section: "bookmarks"
  };

  changeSection = (section: DialogSection) => {
    this.setState({ section });
  };

  hide = () => {
    const { onHide } = this.props;
    onHide();
  };

  render() {
    const { section } = this.state;

    return (
      <Modal
        show={true}
        centered={true}
        onHide={this.hide}
        size="lg"
        className="bookmarks-modal modal-thin-header"
      >
        <ModalHeader closeButton={true} />
        <ModalBody>
          <div className="dialog-menu">
            <div
              className={`menu-item ${section === "bookmarks" ? "active" : ""}`}
              onClick={() => {
                this.changeSection("bookmarks");
              }}
            >
              {_t("bookmarks.title")}
            </div>
            <div
              className={`menu-item ${section === "favorites" ? "active" : ""}`}
              onClick={() => {
                this.changeSection("favorites");
              }}
            >
              {_t("favorites.title")}
            </div>
          </div>
          {section === "bookmarks" && <Bookmarks {...this.props} />}
          {section === "favorites" && <Favorites {...this.props} />}
        </ModalBody>
      </Modal>
    );
  }
}

export default ({ history, onHide }: Pick<BookmarksProps, "history" | "onHide">) => {
  const { global, activeUser, addAccount } = useMappedStore();

  return (
    <BookmarksDialog
      history={history}
      global={global}
      activeUser={activeUser}
      addAccount={addAccount}
      onHide={onHide}
    />
  );
};
