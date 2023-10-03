import React, { Component, Fragment } from "react";
import { History } from "history";
import { Link } from "react-router-dom";
import isEqual from "react-fast-compare";
import { Account } from "../../store/accounts/types";
import { Community } from "../../store/communities";
import { Subscription } from "../../store/subscriptions/types";
import { User } from "../../store/users/types";
import { ActiveUser } from "../../store/active-user/types";
import { ToggleType, UI } from "../../store/ui/types";
import ProfileLink from "../../components/profile-link";
import SubscriptionBtn from "../subscription-btn";
import UserAvatar from "../user-avatar";
import { Global } from "../../store/global/types";
import { makePath } from "../tag";
import defaults from "../../constants/defaults.json";
import { _t } from "../../i18n";
import formattedNumber from "../../util/formatted-number";
import "./_index.scss";

interface Props {
  history: History;
  global: Global;
  users: User[];
  activeUser: ActiveUser | null;
  community: Community;
  ui: UI;
  subscriptions: Subscription[];
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data?: Account) => void;
  deleteUser: (username: string) => void;
  toggleUIProp: (what: ToggleType) => void;
  addAccount: (data: Account) => void;
  updateSubscriptions: (list: Subscription[]) => void;
  small?: boolean;
}

export class CommunityListItem extends Component<Props> {
  shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
    return (
      !isEqual(this.props.community, nextProps.community) ||
      !isEqual(this.props.subscriptions, nextProps.subscriptions) ||
      !isEqual(this.props.activeUser?.username, nextProps.activeUser?.username)
    );
  }

  getItemsControls() {
    return (
      <div className="item-controls">
        <SubscriptionBtn
          {...this.props}
          buttonProps={{ full: true, size: this.props.small ? "sm" : undefined }}
        />
      </div>
    );
  }

  render() {
    const { community } = this.props;

    const nOpts = { fractionDigits: 0 };
    const subscribers = formattedNumber(community.subscribers, nOpts);
    const authors = formattedNumber(community.num_authors, nOpts);
    const posts = formattedNumber(community.num_pending, nOpts);

    return (
      <div className={"community-list-item " + (this.props.small ? "small" : "")}>
        <div className="item-content">
          <h2 className="item-title">
            <div className="item-details">
              <UserAvatar username={community.name} size={this.props.small ? "small" : "medium"} />
              <Link to={makePath(defaults.filter, community.name)}>{community.title}</Link>
            </div>
            {this.props.small && this.getItemsControls()}
          </h2>
          <div className={"item-about " + (this.props.small ? "truncate" : "")}>
            {community.about}
          </div>
          <div className="item-stats">
            <div className="stat">{_t("communities.n-subscribers", { n: subscribers })}</div>
            <div className="stat">{_t("communities.n-authors", { n: authors })}</div>
            <div className="stat">{_t("communities.n-posts", { n: posts })}</div>
          </div>
          {community.admins && (
            <div className="item-admins">
              {_t("communities.admins")}
              {community.admins.map((x, i) => (
                <Fragment key={i}>
                  {ProfileLink({
                    ...this.props,
                    username: x,
                    children: <span className="admin">{x}</span>
                  })}
                </Fragment>
              ))}
            </div>
          )}
        </div>
        {!this.props.small && this.getItemsControls()}
      </div>
    );
  }
}

export default (p: Props) => {
  const props: Props = {
    history: p.history,
    global: p.global,
    users: p.users,
    activeUser: p.activeUser,
    community: p.community,
    ui: p.ui,
    subscriptions: p.subscriptions,
    setActiveUser: p.setActiveUser,
    updateActiveUser: p.updateActiveUser,
    deleteUser: p.deleteUser,
    toggleUIProp: p.toggleUIProp,
    addAccount: p.addAccount,
    updateSubscriptions: p.updateSubscriptions,
    small: p.small
  };

  return <CommunityListItem {...props} />;
};
