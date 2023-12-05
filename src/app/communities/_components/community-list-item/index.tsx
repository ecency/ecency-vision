import React, { useMemo } from "react";
import { History } from "history";
import { makePath } from "../tag";
import defaults from "../../constants/defaults.json";
import { _t } from "../../i18n";
import formattedNumber from "../../util/formatted-number";
import "./index.scss";
import Link from "next/link";
import { Community } from "@/entities";
import { ProfileLink, UserAvatar } from "@/features/shared";
import SubscriptionBtn from "../subscription-btn";

interface Props {
  history: History;
  community: Community;
  small?: boolean;
}

export function CommunityListItem({ community, small }: Props) {
  const subscribers = useMemo(
    () => formattedNumber(community.subscribers, { fractionDigits: 0 }),
    [community]
  );
  const authors = useMemo(
    () => formattedNumber(community.num_authors, { fractionDigits: 0 }),
    [community]
  );
  const posts = useMemo(
    () => formattedNumber(community.num_pending, { fractionDigits: 0 }),
    [community]
  );

  return (
    <div className={"community-list-item " + (small ? "small" : "")}>
      <div className="item-content">
        <h2 className="item-title">
          <div className="item-details">
            <UserAvatar username={community.name} size={small ? "small" : "medium"} />
            <Link href={makePath(defaults.filter, community.name)}>{community.title}</Link>
          </div>
          {small && (
            <div className="item-controls">
              <SubscriptionBtn
                buttonProps={{ full: true, size: this.props.small ? "sm" : undefined }}
              />
            </div>
          )}
        </h2>
        <div className={"item-about " + (small ? "truncate" : "")}>{community.about}</div>
        <div className="item-stats">
          <div className="stat">{_t("communities.n-subscribers", { n: subscribers })}</div>
          <div className="stat">{_t("communities.n-authors", { n: authors })}</div>
          <div className="stat">{_t("communities.n-posts", { n: posts })}</div>
        </div>
        {community.admins && (
          <div className="item-admins">
            {_t("communities.admins")}
            {community.admins.map((x, i) => (
              <ProfileLink
                key={x}
                history={this.props.history}
                username={x}
                addAccount={this.props.addAccount}
              >
                <span className="admin">{x}</span>
              </ProfileLink>
            ))}
          </div>
        )}
      </div>
      {!small && (
        <div className="item-controls">
          <SubscriptionBtn
            buttonProps={{ full: true, size: this.props.small ? "sm" : undefined }}
          />
        </div>
      )}
    </div>
  );
}
