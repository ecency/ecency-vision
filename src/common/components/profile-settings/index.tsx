import React, { Component } from "react";
import { History } from "history";
import { Link } from "react-router-dom";

import { ActiveUser } from "../../store/active-user/types";
import { Account } from "../../store/accounts/types";
import { Global } from "../../store/global/types";

import ProfileEdit from "../profile-edit";
import Preferences from "../preferences";

import { _t } from "../../i18n";

interface Props {
  history: History;
  global: Global;
  activeUser: ActiveUser | null;
  account: Account;
  addAccount: (data: Account) => void;
  updateActiveUser: (data?: Account) => void;
  muteNotifications: () => void;
  unMuteNotifications: () => void;
  setCurrency: (currency: string, rate: number, symbol: string) => void;
  setLang: (lang: string) => void;
  setNsfw: (value: boolean) => void;
  toggleTheme: (theme_key?: string) => void;
  setShowSelfVote: (value: boolean) => void;
  setShowRewardSplit: (value: boolean) => void;
  setLowRewardThreshold: (value: number) => void;
  setShowFrontEnd: (value: boolean) => void;
  setFooter: (value: string) => void;
}

export class ProfileSettings extends Component<Props> {
  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any) {
    const { activeUser, account, history } = this.props;
    if (!activeUser || activeUser.username !== account.name) {
      history.push(`/@${account.name}`);
    }
  }

  render() {
    const { activeUser } = this.props;

    if (activeUser) {
      return (
        <>
          {activeUser.data.__loaded && (
            <ProfileEdit {...this.props} global={this.props.global} activeUser={activeUser} />
          )}
          <Preferences {...this.props} activeUser={activeUser} />
          {activeUser && activeUser.username && (
            <Link to={`/@${activeUser.username}/permissions`}>
              <h5>{_t("g.permissions")}</h5>
            </Link>
          )}
        </>
      );
    }

    return null;
  }
}

export default (p: Props) => {
  const props: Props = {
    history: p.history,
    global: p.global,
    activeUser: p.activeUser,
    account: p.account,
    addAccount: p.addAccount,
    updateActiveUser: p.updateActiveUser,
    muteNotifications: p.muteNotifications,
    unMuteNotifications: p.unMuteNotifications,
    setCurrency: p.setCurrency,
    setLang: p.setLang,
    setNsfw: p.setNsfw,
    toggleTheme: p.toggleTheme,
    setShowSelfVote: p.setShowSelfVote,
    setShowRewardSplit: p.setShowRewardSplit,
    setLowRewardThreshold: p.setLowRewardThreshold,
    setShowFrontEnd: p.setShowFrontEnd,
    setFooter: p.setFooter
  };

  return <ProfileSettings {...props} />;
};
