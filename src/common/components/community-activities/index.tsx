import React, { Component, Fragment } from "react";
import { History } from "history";
import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import { Community } from "../../store/communities";
import BaseComponent from "../base";
import ProfileLink from "../profile-link";
import EntryLink from "../entry-link";
import UserAvatar from "../user-avatar";
import LinearProgress from "../linear-progress";
import { error } from "../feedback";
import { AccountNotification, getAccountNotifications } from "../../api/bridge";
import { _t } from "../../i18n";
import { dateToFullRelative } from "../../helper/parse-date";
import "./_index.scss";
import { Button } from "@ui/button";

interface ListItemProps {
  history: History;
  global: Global;
  notification: AccountNotification;
  addAccount: (data: Account) => void;
}

class NListItem extends Component<ListItemProps> {
  shouldComponentUpdate(): boolean {
    return false;
  }

  formatMessage = (patterns: string[]): JSX.Element => {
    const { notification } = this.props;
    const { msg } = notification;

    const parts = msg.split(new RegExp(`(${patterns.join("|")})`, "gi"));

    return (
      <>
        {parts.map((part, i) => {
          if (part.trim() === "") {
            return null;
          }

          if (patterns.includes(part.toLowerCase())) {
            // post link
            if (part.includes("/")) {
              const s = part.split("/");
              return (
                <Fragment key={i}>
                  {EntryLink({
                    ...this.props,
                    entry: {
                      category: "post",
                      author: s[0].replace("@", ""),
                      permlink: s[1]
                    },
                    children: <>{part}</>
                  })}
                </Fragment>
              );
            }

            // user link
            return (
              <Fragment key={i}>
                {ProfileLink({
                  ...this.props,
                  username: part.replace("@", ""),
                  children: <>{part}</>
                })}
              </Fragment>
            );
          }

          return <span key={i}>{part}</span>;
        })}
      </>
    );
  };

  render() {
    const { notification } = this.props;
    let mentions = notification.msg.match(/@[\w.\d-]+/gi);
    if (!mentions) {
      return null;
    }

    let formatPatterns = [];

    // @username/permlink
    if (notification.url.startsWith("@")) {
      formatPatterns.push(notification.url);
    }

    // @usernames
    formatPatterns = [...formatPatterns, ...mentions];

    const username = mentions[0].replace("@", "");
    const msg = this.formatMessage(formatPatterns);
    const date = dateToFullRelative(notification.date);

    return (
      <div className="activity-list-item">
        <div className="activity-user">
          {ProfileLink({
            ...this.props,
            username,
            children: <UserAvatar username={username} size="medium" />
          })}
        </div>
        <div className="activity-content">
          <div className="activity-msg">{msg}</div>
          <div className="activity-date">{date}</div>
        </div>
      </div>
    );
  }
}

interface Props {
  history: History;
  global: Global;
  community: Community;
  addAccount: (data: Account) => void;
}

interface State {
  loading: boolean;
  items: AccountNotification[];
  hasMore: boolean;
}

export class Activities extends BaseComponent<Props, State> {
  state: State = {
    loading: true,
    items: [],
    hasMore: false
  };

  componentDidMount() {
    this.fetch();
  }

  fetch = () => {
    const limit = 50;
    const { items } = this.state;
    const { community } = this.props;

    const lastId = items.length > 0 ? items[items.length - 1].id : null;

    this.setState({ loading: true });
    getAccountNotifications(community.name, lastId, limit)
      .then((r) => {
        if (r) {
          const newItems = [...items, ...r];
          this.stateSet({ items: newItems, hasMore: r.length === limit });
        }
      })
      .catch(() => {
        error(_t("g.server-error"));
      })
      .finally(() => {
        this.stateSet({ loading: false });
      });
  };

  render() {
    const { items, loading, hasMore } = this.state;

    return (
      <div className="community-activities">
        {loading && <LinearProgress />}
        <div className="activity-list">
          <div className="activity-list-body">
            {items.length > 0 &&
              items.map((item, i) => <NListItem key={i} {...this.props} notification={item} />)}
          </div>
        </div>
        {hasMore && (
          <div className="load-more">
            <Button disabled={loading || !hasMore} onClick={this.fetch}>
              {_t("g.load-more")}
            </Button>
          </div>
        )}
      </div>
    );
  }
}

export default (p: Props) => {
  const props: Props = {
    history: p.history,
    global: p.global,
    community: p.community,
    addAccount: p.addAccount
  };

  return <Activities {...props} />;
};
