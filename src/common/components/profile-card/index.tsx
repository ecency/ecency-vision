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

    const vPower = account.__loaded ? vpMana(account) : 100;

    return (
      <div className="profile-card">
        <div className="profile-avatar">
          <UserAvatar {...this.props} username={account.name} size="xLarge" />
          {account.__loaded && <div className="reputation">{accountReputation(account.reputation!)}</div>}
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

        {(account.profile?.name || account.profile?.about) && (
          <div className="basic-info">
            {account.profile?.name && <div className="full-name">{account.profile.name}</div>}
            {account.profile?.about && <div className="about">{account.profile.about}</div>}
          </div>
        )}

        {account.__loaded && (
          <div className="stats">
            <div className="stat">
              <Tooltip content={_t("profile.post-count")}>
                <span>
                  {formatListBulledttedSvg} {numeral(account.post_count).format()}
                </span>
              </Tooltip>
            </div>

            {account.follow_stats?.follower_count !== undefined && (
              <div className="stat">
                <Tooltip content={_t("profile.followers")}>
                  <span>
                    {accountMultipleSvg} {numeral(account.follow_stats.follower_count).format()}
                  </span>
                </Tooltip>
              </div>
            )}

            {account.follow_stats?.following_count !== undefined && (
              <div className="stat">
                <Tooltip content={_t("profile.following")}>
                  <span>
                    {accountPlusSvg} {numeral(account.follow_stats.following_count).format()}
                  </span>
                </Tooltip>
              </div>
            )}
          </div>
        )}

        <div className="extra-props">
          {account.profile?.location && (
            <div className="prop">
              {nearMeSvg} {account.profile.location}
            </div>
          )}

          {account.profile?.website && (
            <div className="prop">
              {earthSvg}
              <a target="_external" className="website-link" href={account.profile.website}>
                {account.profile.website}
              </a>
            </div>
          )}

          {account.created && (
            <div className="prop">
              {calendarRangeSvg} {moment(new Date(account.created)).format("LL")}
            </div>
          )}

          <div className="prop">
            {rssSvg}
            <a target="_external" href={`${defaults.base}/@${account.name}/rss`}>
              RSS feed
            </a>
          </div>
        </div>
      </div>
    );
  }
}
