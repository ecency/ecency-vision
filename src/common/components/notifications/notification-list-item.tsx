import React, { Component } from "react";
import { Global } from "../../store/global/types";
import { History } from "history";
import { ApiMentionNotification, ApiNotification } from "../../store/notifications/types";
import { DynamicProps } from "../../store/dynamic-props/types";
import { Account } from "../../store/accounts/types";
import { ToggleType } from "../../store/ui/types";
import _c from "../../util/fix-class-names";
import Tooltip from "../tooltip";
import { _t } from "../../i18n";
import { postBodySummary } from "@ecency/render-helper";
import formattedNumber, { rcFormatter } from "../../util/formatted-number";
import { vestsToHp } from "../../helper/vesting";
import ProfileLink from "../profile-link";
import UserAvatar from "../user-avatar";
import EntryLink from "../entry-link";

interface State {
  isChecked: boolean;
}

interface Props {
  global: Global;
  history: History;
  notification: ApiNotification;
  entry?: ApiNotification;
  dynamicProps: DynamicProps;
  isSelect?: boolean;
  currentStatus?: string;
  markNotifications: (id: string | null) => void;
  addAccount: (data: Account) => void;
  toggleUIProp: (what: ToggleType) => void;
  setSelectedNotifications?: (d: string) => void;
  onMounted?: () => void;
  className?: string;
  onLinkClick?: () => void;
  openLinksInNewTab?: boolean;
}
export default class NotificationListItem extends Component<Props, State> {
  state: State = {
    isChecked: false
  };

  componentDidMount() {
    if (this.props.onMounted) {
      this.props.onMounted();
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    if (prevProps.isSelect !== this.props.isSelect && !this.props.isSelect) {
      this.setState({ isChecked: false });
    }
  }

  markAsRead = () => {
    const { notification: primaryNotification, entry, markNotifications } = this.props;
    const notification = primaryNotification || entry;

    if (notification!.read === 0 && !(notification as ApiMentionNotification).deck) {
      markNotifications(notification!.id);
    }
  };

  afterClick = () => {
    const { toggleUIProp, entry } = this.props;
    !(entry && (entry as any).toggleNotNeeded) && toggleUIProp("notifications");
    this.markAsRead();
  };

  handleChecked = (id: string) => {
    if (this.props.isSelect) {
      this.setState({ isChecked: !this.state.isChecked });
      if (this.props.setSelectedNotifications) {
        this.props.setSelectedNotifications(id);
      }
    }
  };

  render() {
    const { notification: primaryNotification, entry, dynamicProps } = this.props;
    const notification = primaryNotification || entry;
    const { hivePerMVests } = dynamicProps;

    const sourceLinkMain = ProfileLink({
      ...this.props,
      username: notification.source,
      afterClick: this.afterClick,
      children: (
        <span className="source-avatar">
          <UserAvatar username={notification?.source} size="medium" />
        </span>
      )
    });

    const sourceLink = ProfileLink({
      ...this.props,
      username: notification.source,
      afterClick: this.afterClick,
      children: <span className="source-name"> {notification.source}</span>
    });

    return (
      <>
        <div
          title={notification.timestamp}
          className={
            _c(
              `list-item ${
                notification.read === 0 && !(notification as ApiMentionNotification).deck
                  ? "not-read"
                  : " "
              }`
            ) +
            " " +
            this.props.className
          }
          onClick={() => this.handleChecked(notification!.id)}
          key={notification.id}
        >
          <div
            className={`item-inner ${
              (notification as ApiMentionNotification).deck ? "p-2 m-0" : ""
            }`}
          >
            {this.props.isSelect ? (
              <div className="checkbox">
                <input type="checkbox" checked={this.state.isChecked} />
              </div>
            ) : (
              <div
                className={`item-control ${
                  (notification as ApiMentionNotification).deck ? "item-control-deck" : ""
                }`}
              >
                {!(notification as ApiMentionNotification).deck && notification.read === 0 && (
                  <Tooltip content={_t("notifications.mark-read")}>
                    <span onClick={this.markAsRead} className="mark-read" />
                  </Tooltip>
                )}
              </div>
            )}

            <div className="source">{sourceLinkMain}</div>

            {/* Votes */}
            {(notification.type === "vote" || notification.type === "unvote") && (
              <div className="item-content">
                <div className="first-line">
                  {sourceLink}
                  <span className="item-action">
                    {_t("notifications.vote-str", { p: notification.weight / 100 })}
                  </span>
                </div>
                <div className="second-line">
                  {"onLinkClick" in this.props ? (
                    <a className="post-link" onClick={this.props.onLinkClick}>
                      {notification.permlink}
                    </a>
                  ) : (
                    EntryLink({
                      ...this.props,
                      entry: {
                        category: "category",
                        author: notification.author,
                        permlink: notification.permlink
                      },
                      afterClick: this.afterClick,
                      target: "_blank",
                      children: <a className="post-link">{notification.permlink}</a>
                    })
                  )}
                </div>
              </div>
            )}

            {/* Replies */}
            {notification.type === "reply" && (
              <div className="item-content">
                <div className="first-line">
                  {sourceLink}
                  <span className="item-action">{_t("notifications.reply-str")}</span>
                  <div className="vert-separator" />
                  {"onLinkClick" in this.props ? (
                    <a className="post-link" onClick={this.props.onLinkClick}>
                      {notification.parent_permlink}
                    </a>
                  ) : (
                    EntryLink({
                      ...this.props,
                      entry: {
                        category: "category",
                        author: notification.parent_author,
                        permlink: notification.parent_permlink
                      },
                      afterClick: this.afterClick,
                      target: "_blank",
                      children: <a className="post-link">{notification.parent_permlink}</a>
                    })
                  )}
                </div>
                <div className="second-line">
                  {"onLinkClick" in this.props ? (
                    <div
                      className="markdown-view mini-markdown reply-body"
                      onClick={this.props.onLinkClick}
                    >
                      {postBodySummary(notification.body, 100)}
                    </div>
                  ) : (
                    EntryLink({
                      ...this.props,
                      entry: {
                        category: "category",
                        author: notification.author,
                        permlink: notification.permlink
                      },
                      afterClick: this.afterClick,
                      target: "_blank",
                      children: (
                        <div className="markdown-view mini-markdown reply-body">
                          {postBodySummary(notification.body, 100)}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}

            {/* Mentions */}
            {notification.type === "mention" && (
              <div className="item-content">
                <div className="first-line">
                  {sourceLink}
                  <span className="item-action">{_t("notifications.mention-str")}</span>
                </div>
                <div className="second-line">
                  {"onLinkClick" in this.props ? (
                    <a className="post-link" onClick={this.props.onLinkClick}>
                      {notification.permlink}
                    </a>
                  ) : (
                    EntryLink({
                      ...this.props,
                      entry: {
                        category: "category",
                        author: notification.author,
                        permlink: notification.permlink
                      },
                      afterClick: this.afterClick,
                      target: "_blank",
                      children: <a className="post-link">{notification.permlink}</a>
                    })
                  )}
                </div>
              </div>
            )}

            {/* Favorites */}
            {notification.type === "favorites" && (
              <div className="item-content">
                <div className="first-line">
                  {sourceLink}
                  <span className="item-action">{_t("notifications.favorite-str")}</span>
                </div>
                <div className="second-line">
                  {"onLinkClick" in this.props ? (
                    <a className="post-link" onClick={this.props.onLinkClick}>
                      {notification.permlink}
                    </a>
                  ) : (
                    EntryLink({
                      ...this.props,
                      entry: {
                        category: "category",
                        author: notification.author,
                        permlink: notification.permlink
                      },
                      target: "_blank",
                      afterClick: this.afterClick,
                      children: <a className="post-link">{notification.permlink}</a>
                    })
                  )}
                </div>
              </div>
            )}

            {/* Bookmarks */}
            {notification.type === "bookmarks" && (
              <div className="item-content">
                <div className="first-line">
                  {sourceLink}
                  <span className="item-action">{_t("notifications.bookmark-str")}</span>
                </div>
                <div className="second-line">
                  {"onLinkClick" in this.props ? (
                    <a className="post-link" onClick={this.props.onLinkClick}>
                      {notification.permlink}
                    </a>
                  ) : (
                    EntryLink({
                      ...this.props,
                      entry: {
                        category: "category",
                        author: notification.author,
                        permlink: notification.permlink
                      },
                      afterClick: this.afterClick,
                      target: "_blank",
                      children: <a className="post-link">{notification.permlink}</a>
                    })
                  )}
                </div>
              </div>
            )}

            {/* Follows */}
            {(notification.type === "follow" ||
              notification.type === "unfollow" ||
              notification.type === "ignore") && (
              <div className="item-content">
                <div className="first-line">{sourceLink}</div>
                <div className="second-line">
                  {notification.type === "follow" && (
                    <span className="follow-label">{_t("notifications.followed-str")}</span>
                  )}
                  {notification.type === "unfollow" && (
                    <span className="unfollow-label">{_t("notifications.unfollowed-str")}</span>
                  )}
                  {notification.type === "ignore" && (
                    <span className="ignore-label">{_t("notifications.ignored-str")}</span>
                  )}
                </div>
              </div>
            )}

            {/* Reblogs */}
            {notification.type === "reblog" && (
              <div className="item-content">
                <div className="first-line">
                  {sourceLink}
                  <span className="item-action">{_t("notifications.reblog-str")}</span>
                </div>
                <div className="second-line">
                  {"onLinkClick" in this.props ? (
                    <a className="post-link">{notification.permlink}</a>
                  ) : (
                    EntryLink({
                      ...this.props,
                      entry: {
                        category: "category",
                        author: notification.author,
                        permlink: notification.permlink
                      },
                      afterClick: this.afterClick,
                      target: "_blank",
                      children: <a className="post-link">{notification.permlink}</a>
                    })
                  )}
                </div>
              </div>
            )}

            {/* Transfer */}
            {notification.type === "transfer" && (
              <div className="item-content">
                <div className="first-line">
                  {sourceLink}
                  <span className="item-action">
                    {_t("notifications.transfer-str")}{" "}
                    <span className="transfer-amount">{notification.amount}</span>
                  </span>
                </div>
                {notification.memo && (
                  <div className="second-line">
                    <div className="transfer-memo">
                      {notification.memo
                        .substring(0, 120)
                        .replace("https://peakd.com/", "https://ecency.com/")}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Delegations */}
            {notification.type === "delegations" && (
              <div className="item-content">
                <div className="first-line">
                  {sourceLink}
                  <span className="item-action">
                    {_t("notifications.delegations-str")}{" "}
                    <span className="transfer-amount">
                      {notification.amount.includes("VESTS")
                        ? formattedNumber(
                            vestsToHp(parseFloat(notification.amount), hivePerMVests),
                            {
                              suffix: "HP"
                            }
                          )
                        : formattedNumber(rcFormatter(parseFloat(notification.amount)), {
                            suffix: "RC"
                          })}
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* Spin */}
            {notification.type === "spin" && (
              <div className="item-content">
                <div className="first-line">
                  {sourceLink}
                  <span className="item-action">{_t("notifications.spin-str")}</span>
                </div>
              </div>
            )}

            {/* Inactive */}
            {notification.type === "inactive" && (
              <div className="item-content">
                <div className="first-line">
                  {sourceLink}
                  <span className="item-action">{_t("notifications.inactive-str")}</span>
                </div>
              </div>
            )}

            {/* Referral */}
            {notification.type === "referral" && (
              <div className="item-content">
                <div className="first-line">
                  {sourceLink}
                  <span className="item-action">{_t("notifications.referral-str")}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }
}
