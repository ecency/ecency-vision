import React, { Component } from "react";

import { History } from "history";

import isEqual from "react-fast-compare";

import { Button } from "react-bootstrap";

import { Community } from "../../store/community/types";

import DownloadTrigger from "../download-trigger";

import { _t } from "../../i18n";

import formattedNumber from "../../util/formatted-number";

import { accountGroupSvg } from "../../img/svg";

interface Props {
  history: History;
  community: Community;
}

export default class CommunityCardSm extends Component<Props> {
  shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
    return !isEqual(this.props.community, nextProps.community);
  }

  render() {
    const { community } = this.props;

    const subscribers = formattedNumber(community.subscribers, { fractionDigits: 0 });
    const rewards = formattedNumber(community.sum_pending, { fractionDigits: 0 });
    const authors = formattedNumber(community.num_authors, { fractionDigits: 0 });

    return (
      <div className="community-card-sm">
        <h2 className="community-title">
          {accountGroupSvg} {community.title}
        </h2>
        <div className="community-panel">
          <div className="infromation">
            <div className="section-about">{community.about}</div>
            <div className="section-stats">
              <div className="stat">{_t("community.n-subscribers", { n: subscribers })}</div>
              <div className="stat">
                {"$"} {_t("community.n-rewards", { n: rewards })}
              </div>
              <div className="stat">{_t("community.n-authors", { n: authors })}</div>
            </div>
          </div>
          <div className="controls">
            <DownloadTrigger>
              <Button variant="primary">{_t("community.subscribe")}</Button>
            </DownloadTrigger>
            <DownloadTrigger>
              <Button variant="primary">{_t("community.post")}</Button>
            </DownloadTrigger>
          </div>
        </div>
      </div>
    );
  }
}
