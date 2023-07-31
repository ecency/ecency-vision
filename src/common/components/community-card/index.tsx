import React, { Component } from "react";

import { Button } from "react-bootstrap";

import { History } from "history";

import { Link } from "react-router-dom";

import isEqual from "react-fast-compare";

import { Global } from "../../store/global/types";
import { Account, FullAccount } from "../../store/accounts/types";
import { Community, roleMap, ROLES } from "../../store/communities/types";
import { ActiveUser } from "../../store/active-user/types";
import { User } from "../../store/users/types";

import BaseComponent from "../base";
import UserAvatar from "../user-avatar";
import ProfileLink from "../profile-link";
import CommunitySettings from "../community-settings";
import CommunityRewardsRegistrationDialog from "../community-rewards-registration";
import ImageUploadDialog from "../image-upload";
import Tooltip from "../tooltip";
import { error, success } from "../feedback";

import { _t } from "../../i18n";

import { getAccount } from "../../api/hive";
import { updateProfile } from "../../api/operations";

import ln2list from "../../util/nl2list";

import {
  accountGroupSvg,
  informationOutlineSvg,
  pencilOutlineSvg,
  scriptTextOutlineSvg
} from "../../img/svg";
import { renderPostBody } from "@ecency/render-helper";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "../modal";

interface EditPicProps {
  activeUser: ActiveUser;
  community?: Community;
  account: FullAccount;
  addAccount: (data: Account) => void;
  onUpdate: () => void;
}

interface EditPicState {
  account: Account | null;
  dialog: boolean;
  inProgress: boolean;
}

export class EditPic extends BaseComponent<EditPicProps, EditPicState> {
  state: EditPicState = {
    account: null,
    dialog: false,
    inProgress: false
  };

  toggleDialog = () => {
    const { dialog } = this.state;
    this.stateSet({ dialog: !dialog });
  };

  save = (url: string) => {
    const { account } = this.props;
    if (account.profile?.profile_image === url) {
      this.toggleDialog();
      return;
    }

    this.stateSet({ inProgress: true });

    const { addAccount, onUpdate } = this.props;
    const { profile } = account;

    const newProfile = {
      profile_image: url
    };

    updateProfile(account, { ...profile, ...newProfile })
      .then((r) => {
        success(_t("community-card.profile-image-updated"));
        return getAccount(account.name);
      })
      .then((account) => {
        // update reducer
        addAccount(account);

        // close dialog
        this.toggleDialog();
        onUpdate();
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
        <Tooltip content={_t("community-card.profile-image-edit")}>
          <div className="edit-button" onClick={this.toggleDialog}>
            {pencilOutlineSvg}
          </div>
        </Tooltip>
        {dialog && (
          <ImageUploadDialog
            activeUser={activeUser!}
            title={_t("community-card.profile-image")}
            defImage={account.profile?.profile_image || ""}
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
  signingKey: string;
  setSigningKey: (key: string) => void;
  addAccount: (data: Account) => void;
}

interface DialogInfo {
  title: string;
  content: JSX.Element | null;
}

interface State {
  info: DialogInfo | null;
  settings: boolean;
  rewards: boolean;
  useNewImage: boolean;
}

export class CommunityCard extends Component<Props, State> {
  state: State = {
    info: null,
    settings: false,
    rewards: false,
    useNewImage: false
  };

  shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>): boolean {
    return (
      !isEqual(this.props.community, nextProps.community) ||
      !isEqual(this.props.users, nextProps.users) ||
      !isEqual(this.props.account, nextProps.account) ||
      !isEqual(this.props.activeUser?.username, nextProps.activeUser?.username) ||
      !isEqual(this.state, nextState)
    );
  }

  toggleInfo = (info: DialogInfo | null) => {
    this.setState({ info });
  };

  toggleSettings = () => {
    const { settings } = this.state;
    this.setState({ settings: !settings });
  };

  toggleRewards = () => {
    const { rewards } = this.state;
    this.setState({ rewards: !rewards });
  };

  render() {
    const { info, settings, rewards, useNewImage } = this.state;
    const { global, community, activeUser, users, account } = this.props;

    const role = community.team.find((x) => x[0] === activeUser?.username);
    const roleInTeam = role ? role[1] : null;
    const canEditTeam = !!(roleInTeam && roleMap[roleInTeam]);
    const canEditCommunity = !!(
      roleInTeam && [ROLES.OWNER.toString(), ROLES.ADMIN.toString()].includes(roleInTeam)
    );

    const description: JSX.Element | null =
      community.description.trim() !== "" ? (
        <div
          className="preview-body markdown-view"
          dangerouslySetInnerHTML={{ __html: renderPostBody(community.description, true) }}
        />
      ) : null;

    const rules: JSX.Element | null =
      community.flag_text.trim() !== "" ? (
        <>
          {ln2list(community.flag_text).map((x, i) => (
            <p key={i}>
              {"- "}
              {x}
            </p>
          ))}
        </>
      ) : null;

    const team: JSX.Element = (
      <>
        {community.team.map((m, i) => {
          if (m[0].startsWith("hive-")) {
            return null;
          }

          return (
            <div className="team-member" key={i}>
              {ProfileLink({
                ...this.props,
                username: m[0],
                children: <span className="username">{`@${m[0]}`}</span>
              })}
              <span className="role">{m[1]}</span>
              {m[2] !== "" && <span className="extra">{m[2]}</span>}
            </div>
          );
        })}
      </>
    );

    const canUpdatePic = activeUser && !!users.find((x) => x.username === community.name);

    return (
      <div className="community-card">
        <div className="community-avatar">
          {canUpdatePic && (
            <EditPic
              {...this.props}
              account={account as FullAccount}
              activeUser={activeUser!}
              onUpdate={() => {
                this.setState({ useNewImage: true });
              }}
            />
          )}
          <UserAvatar
            username={community.name}
            size="xLarge"
            src={account.__loaded && useNewImage ? account.profile?.profile_image : undefined}
          />
        </div>
        <div className="community-info">
          <h1>
            <div className="title">{community.title}</div>
          </h1>
          <div className="about">{community.about}</div>
          {community.is_nsfw && <span className="nsfw">nsfw</span>}
        </div>
        <div className="community-sections">
          {description && (
            <div className="community-section">
              <div
                className="section-header"
                onClick={() => {
                  this.toggleInfo({
                    title: _t("community-card.description"),
                    content: description
                  });
                }}
              >
                {informationOutlineSvg} {_t("community-card.description")}
              </div>
              <div className="section-content">{description}</div>
            </div>
          )}
          {rules && (
            <div className="community-section">
              <div
                className="section-header"
                onClick={() => {
                  this.toggleInfo({ title: _t("community-card.rules"), content: rules });
                }}
              >
                {scriptTextOutlineSvg} {_t("community-card.rules")}
              </div>
              <div className="section-content">{rules}</div>
            </div>
          )}
          <div className="community-section section-team">
            <div
              className="section-header"
              onClick={() => {
                this.toggleInfo({ title: _t("community-card.team"), content: team });
              }}
            >
              {accountGroupSvg} {_t("community-card.team")}
            </div>
            <div className="section-content">{team}</div>
          </div>
        </div>

        {(canEditCommunity || canEditTeam) && (
          <div className="community-controls">
            {canEditCommunity && (
              <p className="community-control" onClick={this.toggleSettings}>
                <Button size="sm">{_t("community-card.edit")}</Button>
              </p>
            )}
            {canEditTeam && (
              <p className="community-control">
                <Link className="btn btn-sm btn-primary" to={`/roles/${community.name}`}>
                  {_t("community-card.edit-team")}
                </Link>
              </p>
            )}
          </div>
        )}
        {global.usePrivate && roleInTeam === ROLES.OWNER.toString() && (
          <p className="community-rewards">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                this.toggleRewards();
              }}
            >
              {_t("community-card.community-rewards")}
            </a>
          </p>
        )}
        {info && (
          <Modal
            show={true}
            centered={true}
            onHide={() => {
              this.toggleInfo(null);
            }}
            animation={false}
            className="community-info-dialog"
          >
            <ModalHeader closeButton={true}>
              <ModalTitle>{info.title}</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <div className="description-wrapper">{info.content}</div>
            </ModalBody>
          </Modal>
        )}

        {settings && (
          <CommunitySettings
            {...this.props}
            activeUser={activeUser!}
            community={community}
            onHide={this.toggleSettings}
          />
        )}

        {rewards && (
          <CommunityRewardsRegistrationDialog
            {...this.props}
            activeUser={activeUser!}
            community={community}
            onHide={this.toggleRewards}
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
    signingKey: p.signingKey,
    setSigningKey: p.setSigningKey,
    activeUser: p.activeUser,
    addAccount: p.addAccount
  };

  return <CommunityCard {...props} />;
};
