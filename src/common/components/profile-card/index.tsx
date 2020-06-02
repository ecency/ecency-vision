import React, { Component } from "react";

import moment from "moment";
import numeral from "numeral";

import { Account } from "../../store/accounts/types";
import UserAvatar from "../user-avatar";
import Tooltip from "../tooltip";

import accountReputation from "../../helper/account-reputation";

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
    const rss_link = "https://esteem.app/@" + account.name + "/rss";

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
          <Tooltip content={_t("account.voting-power")}>
            <span>{vPower.toFixed(2)}</span>
          </Tooltip>
        </div>

        {name && <div className="full-name">{name}</div>}
       
        {about && <div className="about">{about}</div>}
       
        {(name || about) && <div className="divider" />}
       
        <div className="stats">
          <div className="stat">
            <Tooltip content={_t("account.post-count")}>
              <span>
                {formatListBulledttedSvg} {numeral(account.post_count).format()}
              </span>
            </Tooltip>
          </div>
          <div />

          {follow_stats?.follower_count !== undefined && (
            <div className="stat">
              <Tooltip content={_t("account.followers")}>
                <span>
                  {accountMultipleSvg} {numeral(follow_stats?.follower_count).format()}
                </span>
              </Tooltip>
            </div>
          )}

          {follow_stats?.following_count !== undefined && (
            <div className="stat">
              <Tooltip content={_t("account.following")}>
                <span>
                  {accountPlusSvg} {numeral(follow_stats?.following_count).format()}
                </span>
              </Tooltip>
            </div>
          )}
        </div>
       
        <div className="divider" />
       
        <div className="account-props">
          {location && (
            <div className="account-prop">
              {nearMeSvg} {location}
            </div>
          )}
          {website && (
            <div className="account-prop">
              {earthSvg}
              <a target="_external" className="website-link" href={website}>
                {website}
              </a>
            </div>
          )}
          <div className="account-prop">
            {calendarRangeSvg} {created.format("LL")}
          </div>
          <div className="account-prop">
            {rssSvg}
            <a target="_external" className="website-link" href={rss_link}>
              RSS feed
            </a>
          </div>
        </div>
      </div>
    );
  }
}
