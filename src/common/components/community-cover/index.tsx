import React, { Component } from "react";
import { History } from "history";
import isEqual from "react-fast-compare";
import { Global } from "../../store/global/types";
import { User } from "../../store/users/types";
import { ActiveUser } from "../../store/active-user/types";
import { Account, FullAccount } from "../../store/accounts/types";
import { ToggleType, UI } from "../../store/ui/types";
import { Community } from "../../store/communities";
import { Subscription } from "../../store/subscriptions/types";
import defaults from "../../constants/defaults.json";
import { setProxyBase } from "@ecency/render-helper";
import BaseComponent from "../base";
import SubscriptionBtn from "../subscription-btn";
import CommunityPostBtn from "../community-post-btn";
import JoinCommunityChatBtn from "../../features/chats/join-community-chat-btn";
import Tooltip from "../tooltip";
import ImageUploadDialog from "../image-upload";

import formattedNumber from "../../util/formatted-number";

import { updateProfile } from "../../api/operations";
import { error, success } from "../feedback";
import { getAccount } from "../../api/hive";

import { _t } from "../../i18n";

import { pencilOutlineSvg } from "../../img/svg";
import "./_index.scss";

setProxyBase(defaults.imageServer);

const coverFallbackDay = require("../../img/cover-fallback-day.png");
const coverFallbackNight = require("../../img/cover-fallback-night.png");

interface EditCoverImageProps {
  activeUser: ActiveUser;
  community: Community;
  account: FullAccount;
  addAccount: (data: Account) => void;
}

interface EditCoverImageState {
  dialog: boolean;
  inProgress: boolean;
}

class EditCoverImage extends BaseComponent<EditCoverImageProps, EditCoverImageState> {
  state: EditCoverImageState = {
    dialog: false,
    inProgress: false
  };

  toggleDialog = () => {
    const { dialog } = this.state;
    this.stateSet({ dialog: !dialog });
  };

  save = (url: string) => {
    const { account } = this.props;
    if (account.profile?.cover_image === url) {
      this.toggleDialog();
      return;
    }

    this.stateSet({ inProgress: true });

    const { addAccount } = this.props;
    const { profile } = account;

    const newProfile = {
      cover_image: url
    };

    updateProfile(account, { ...profile, ...newProfile })
      .then((r) => {
        success(_t("community-cover.cover-image-updated"));
        return getAccount(account.name);
      })
      .then((account) => {
        // update reducer
        addAccount(account);

        // close dialog
        this.toggleDialog();
      })
      .catch(() => {
        error(_t("g.server-error"));
      })
      .finally(() => {
        this.stateSet({ inProgress: false });
      });
  };

  render() {
    const { activeUser, account } = this.props;
    const { dialog, inProgress } = this.state;

    return (
      <>
        <Tooltip content={_t("community-cover.cover-image-edit")}>
          <div className="btn-edit-cover-image" onClick={this.toggleDialog}>
            {pencilOutlineSvg}
          </div>
        </Tooltip>
        {dialog && (
          <ImageUploadDialog
            activeUser={activeUser!}
            title={_t("community-cover.cover-image")}
            defImage={account.profile?.cover_image || ""}
            inProgress={inProgress}
            onDone={this.save}
            onHide={this.toggleDialog}
          />
        )}
      </>
    );
  }
}

interface Props {
  history: History;
  global: Global;
  community: Community;
  account: Account;
  users: User[];
  activeUser: ActiveUser | null;
  subscriptions: Subscription[];
  ui: UI;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data?: Account) => void;
  deleteUser: (username: string) => void;
  toggleUIProp: (what: ToggleType) => void;
  updateSubscriptions: (list: Subscription[]) => void;
  addAccount: (data: Account) => void;
}

export class CommunityCover extends Component<Props> {
  shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
    return (
      !isEqual(this.props.global, nextProps.global) ||
      !isEqual(this.props.community, nextProps.community) ||
      !isEqual(this.props.subscriptions, nextProps.subscriptions) ||
      !isEqual(this.props.account, nextProps.account) ||
      !isEqual(this.props.users, nextProps.users) ||
      !isEqual(this.props.activeUser, nextProps.activeUser) ||
      !isEqual(this.props.ui, nextProps.ui)
    );
  }

  render() {
    const { global, account, community, activeUser, users } = this.props;

    let bgImage = global.theme === "day" ? coverFallbackDay : coverFallbackNight;
    if (community) {
      bgImage = `https://images.ecency.com/${global.canUseWebp ? "webp/" : ""}u/${
        community.name
      }/cover`;
    }

    let style = {};
    if (bgImage) {
      style = { backgroundImage: `url('${bgImage}')` };
    }

    const subscribers = formattedNumber(community.subscribers, { fractionDigits: 0 });
    const rewards = formattedNumber(community.sum_pending, { fractionDigits: 0 });
    const authors = formattedNumber(community.num_authors, { fractionDigits: 0 });

    const canUpdateCoverImage = activeUser && !!users.find((x) => x.username === community.name);

    return (
      <div className="community-cover">
        <div className="cover-image" style={style} />
        <div className="community-stats">
          <div className="community-stat">
            <div className="stat-value">{subscribers}</div>
            <div className="stat-label">{_t("community.subscribers")}</div>
          </div>
          <div className="community-stat">
            <div className="stat-value">
              {"$"} {rewards}
            </div>
            <div className="stat-label">{_t("community-cover.rewards")}</div>
          </div>
          <div className="community-stat">
            <div className="stat-value">{authors}</div>
            <div className="stat-label">{_t("community-cover.authors")}</div>
          </div>
          {community.lang.trim() !== "" && (
            <div className="community-stat">
              <div className="stat-value">{community.lang.toUpperCase()}</div>
              <div className="stat-label">{_t("community-cover.lang")}</div>
            </div>
          )}
        </div>

        <div className="controls-holder">
          <SubscriptionBtn {...this.props} />
          {CommunityPostBtn({ ...this.props })}

          <JoinCommunityChatBtn community={this.props.community} history={this.props.history} />
        </div>
        {canUpdateCoverImage && (
          <EditCoverImage
            {...this.props}
            account={account as FullAccount}
            activeUser={activeUser!}
          />
        )}
      </div>
    );
  }
}

export default (p: Props) => {
  const props: Props = {
    history: p.history,
    global: p.global,
    community: p.community,
    account: p.account,
    users: p.users,
    activeUser: p.activeUser,
    subscriptions: p.subscriptions,
    ui: p.ui,
    setActiveUser: p.setActiveUser,
    updateActiveUser: p.updateActiveUser,
    deleteUser: p.deleteUser,
    toggleUIProp: p.toggleUIProp,
    updateSubscriptions: p.updateSubscriptions,
    addAccount: p.addAccount
  };

  return <CommunityCover {...props} />;
};
