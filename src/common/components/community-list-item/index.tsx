import React, { Component } from "react";

import { History } from "history";
import { Link } from "react-router-dom";

import { Button } from "react-bootstrap";

import isEqual from "react-fast-compare";

import { Account } from "../../store/accounts/types";
import { Community } from "../../store/community/types";
import { Subscription } from "../../store/subscriptions/types";

import ProfileLink from "../../components/profile-link";
import DownloadTrigger from "../../components/download-trigger";
import { makePath } from "../tag";

import defaults from "../../constants/defaults.json";

import { _t } from "../../i18n";

import _c from "../../util/fix-class-names";

import formattedNumber from "../../util/formatted-number";

interface Props {
  history: History;
  community: Community;
  subscriptions: Subscription[];
  addAccount: (data: Account) => void;
}

export default class CommunityListItem extends Component<Props> {
  shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
    return !isEqual(this.props.community, nextProps.community);
  }

  render() {
    const { community } = this.props;

    const nOpts = { fractionDigits: 0 };
    const subscribers = formattedNumber(community.subscribers, nOpts);
    const authors = formattedNumber(community.num_authors, nOpts);
    const posts = formattedNumber(community.num_pending, nOpts);

    return (
      <div className="community-list-item">
        <div className="item-content">
          <h2 className="item-title">
            <Link to={makePath(defaults.filter, community.name)}>{community.title}</Link>
          </h2>
          <div className="item-about">{community.about}</div>
          <div className="item-stats">
            <div className="stat">{_t("community.n-subscribers", { n: subscribers })}</div>
            <div className="stat">{_t("community.n-authors", { n: authors })}</div>
            <div className="stat">{_t("community.n-posts", { n: posts })}</div>
          </div>
          {community.admins && (
            <div className="item-admins">
              {_t("community.admins")}
              {community.admins.map((x, i) => (
                <ProfileLink key={i} {...this.props} username={x}>
                  <a className="admin">{x}</a>
                </ProfileLink>
              ))}
            </div>
          )}
        </div>
        <div className="item-controls">
          <DownloadTrigger>
            <Button>{_t("community.subscribe")}</Button>
          </DownloadTrigger>
        </div>
      </div>
    );
  }
}
