import React, { Component } from "react";

import moment from "moment";
import numeral from "numeral";

import { Account } from "../../store/accounts/types";
import UserAvatar from "../user-avatar";
import Tooltip from "../tooltip";

import accountReputation from "../../helper/account-reputation";

import defaults from "../../constants/defaults.json";

import { vpMana } from "../../api/hive";

import { _t } from "../../i18n";

import {
  formatListBulledttedSvg,
  accountMultipleSvg,
  accountPlusSvg,
  nearMeSvg,
  earthSvg,
  calendarRangeSvg,
  rssSvg,
} from "../../img/svg";

interface Props {
  account: Account;
}

export default class ProfileCard extends Component<Props> {
  render() {
    const { account } = this.props;

    const vPower = vpMana(account);
    const name = account?.profile?.name;
    const about = account?.profile?.about;
    const follow_stats = account?.follow_stats;
    const location = account?.profile?.location;
    const website = account?.profile?.website;
    const created = moment(new Date(account.created));
    const rss_link = `${defaults.base}/@${account.name}/rss`;

    return (
      <div className="profile-card">
        <div className="profile-avatar">
          <UserAvatar {...this.props} username={account.name} size="xLarge" />
          <div className="reputation">{accountReputation(account.reputation)}</div>
        </div>

        <div className="username">{account.name}</div>

        <div className="vpower-line">
          <div className="vpower-line-inner" style={{ width: `${vPower}%` }} />
        </div>

        <div className="vpower-percentage">
          <Tooltip content={_t("profile.voting-power")}>
            <span>{vPower.toFixed(2)}</span>
          </Tooltip>
        </div>

        {(name || about) && (
          <div className="basic-info">
            {name && <div className="full-name">{name}</div>}
            {about && <div className="about">{about}</div>}
          </div>
        )}

        <div className="stats">
          <div className="stat">
            <Tooltip content={_t("profile.post-count")}>
              <span>
                {formatListBulledttedSvg} {numeral(account.post_count).format()}
              </span>
            </Tooltip>
          </div>

          {follow_stats?.follower_count !== undefined && (
            <div className="stat">
              <Tooltip content={_t("profile.followers")}>
                <span>
                  {accountMultipleSvg} {numeral(follow_stats?.follower_count).format()}
                </span>
              </Tooltip>
            </div>
          )}

          {follow_stats?.following_count !== undefined && (
            <div className="stat">
              <Tooltip content={_t("profile.following")}>
                <span>
                  {accountPlusSvg} {numeral(follow_stats?.following_count).format()}
                </span>
              </Tooltip>
            </div>
          )}
        </div>

        <div className="extra-props">
          {location && (
            <div className="prop">
              {nearMeSvg} {location}
            </div>
          )}
          {website && (
            <div className="prop">
              {earthSvg}
              <a target="_external" className="website-link" href={website}>
                {website}
              </a>
            </div>
          )}
          <div className="prop">
            {calendarRangeSvg} {created.format("LL")}
          </div>
          <div className="prop">
            {rssSvg}
            <a target="_external" href={rss_link}>
              RSS feed
            </a>
          </div>
        </div>
      </div>
    );
  }
}
