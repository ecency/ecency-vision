import React, { Component } from "react";

import { Global } from "../../store/global/types";
import { User } from "../../store/users/types";
import { ActiveUser } from "../../store/active-user/types";
import { Account } from "../../store/accounts/types";
import { UI, ToggleType } from "../../store/ui/types";
import { DynamicProps } from "../../store/dynamic-props/types";

import defaults from "../../constants/defaults.json";

import { proxifyImageSrc, setProxyBase } from "@ecency/render-helper";
import "./_index.scss";

setProxyBase(defaults.imageServer);

import FollowControls from "../follow-controls";
import FavoriteBtn from "../favorite-btn";
import ProfileInfo from "../profile-info";

interface Props {
  global: Global;
  dynamicProps: DynamicProps;
  account: Account;
  users: User[];
  activeUser: ActiveUser | null;
  ui: UI;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data?: Account) => void;
  deleteUser: (username: string) => void;
  toggleUIProp: (what: ToggleType) => void;
}

export class ProfileCover extends Component<Props> {
  render() {
    const { global, account, activeUser } = this.props;
    const coverFallbackDay = require("../../img/cover-fallback-day.png");
    const coverFallbackNight = require("../../img/cover-fallback-night.png");
    let bgImage = "";

    if (account?.__loaded) {
      bgImage = global.theme === "day" ? coverFallbackDay : coverFallbackNight;
      if (account.profile?.cover_image) {
        bgImage = proxifyImageSrc(
          account.profile.cover_image,
          0,
          0,
          global.canUseWebp ? "webp" : "match"
        );
      }
    }

    let style = {};
    if (bgImage) {
      style = { backgroundImage: `url('${bgImage}')` };
    }

    const hideControls = activeUser && activeUser.username === account?.name;

    return (
      <div className="profile-cover">
        <div className="cover-image" style={style} />
        <div className="follow-controls-holder">
          {ProfileInfo(this.props)}
          {!hideControls && (
            <>
              <FollowControls {...this.props} targetUsername={account?.name} />
              {global.usePrivate && <FavoriteBtn {...this.props} targetUsername={account?.name} />}
            </>
          )}
        </div>
      </div>
    );
  }
}

export default (p: Props) => {
  const props: Props = {
    global: p.global,
    dynamicProps: p.dynamicProps,
    account: p.account,
    users: p.users,
    activeUser: p.activeUser,
    ui: p.ui,
    setActiveUser: p.setActiveUser,
    updateActiveUser: p.updateActiveUser,
    deleteUser: p.deleteUser,
    toggleUIProp: p.toggleUIProp
  };

  return <ProfileCover {...props} />;
};
