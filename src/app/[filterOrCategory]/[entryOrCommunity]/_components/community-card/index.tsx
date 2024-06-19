"use client";

import React, { useMemo, useState } from "react";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import { Button } from "@ui/button";
import { useGlobalStore } from "@/core/global-store";
import { Account, Community, FullAccount, roleMap, ROLES } from "@/entities";
import i18next from "i18next";
import JoinCommunityChatBtn from "@/app/chats/_components/join-community-chat-btn";
import { UserAvatar } from "@/features/shared";
import { DialogInfo } from "@/app/[filterOrCategory]/[entryOrCommunity]/types";
import { CommunityCardEditPic } from "./community-card-edit-pic";
import { CommunityCardDescription } from "./community-card-description";
import { CommunityCardRules } from "./community-card-rules";
import { CommunityCardTeam } from "./community-card-team";
import { CommunitySettingsDialog } from "@/app/[filterOrCategory]/[entryOrCommunity]/_components/community-settings";
import { CommunityRewardsRegistrationDialog } from "../community-rewards-registration";

interface Props {
  community: Community;
  account: Account;
}

export function CommunityCard({ community, account }: Props) {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const users = useGlobalStore((state) => state.users);
  const usePrivate = useGlobalStore((state) => state.usePrivate);

  const [info, setInfo] = useState<DialogInfo>();
  const [settings, setSettings] = useState(false);
  const [rewards, setRewards] = useState(false);
  const [useNewImage, setUseNewImage] = useState(false);

  const role = useMemo(
    () => community.team.find((x: (string | undefined)[]) => x[0] === activeUser?.username),
    [activeUser?.username, community.team]
  );
  const roleInTeam = useMemo(() => (role ? role[1] : null), [role]);
  const canUpdatePic = useMemo(
    () => activeUser && !!users.find((x) => x.username === community.name),
    [activeUser, community.name, users]
  );
  const canEditCommunity = useMemo(
    () => !!(roleInTeam && [ROLES.OWNER.toString(), ROLES.ADMIN.toString()].includes(roleInTeam)),
    [roleInTeam]
  );
  const canEditTeam = useMemo(() => !!(roleInTeam && roleMap[roleInTeam]), [roleInTeam]);

  return (
    <div className="community-card">
      <div className="community-avatar">
        {canUpdatePic && (
          <CommunityCardEditPic
            account={account as FullAccount}
            onUpdate={() => setUseNewImage(true)}
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
        <CommunityCardDescription community={community} toggleInfo={(e) => setInfo(e)} />
        <CommunityCardRules community={community} toggleInfo={(e) => setInfo(e)} />
        <CommunityCardTeam community={community} toggleInfo={(e) => setInfo(e)} />
      </div>

      {(canEditCommunity || canEditTeam) && (
        <div className="community-controls">
          {canEditCommunity && (
            <p className="community-control" onClick={() => setSettings(true)}>
              <Button size="sm">{i18next.t("community-card.edit")}</Button>
            </p>
          )}
          {canEditTeam && (
            <p className="community-control">
              <Button href={`/roles/${community.name}`} size="sm">
                {i18next.t("community-card.edit-team")}
              </Button>
            </p>
          )}
        </div>
      )}
      {usePrivate && roleInTeam === ROLES.OWNER.toString() && (
        <p className="community-rewards">
          <Button
            size="sm"
            outline={true}
            type="button"
            onClick={(e: { preventDefault: () => void }) => {
              e.preventDefault();
              setRewards(true);
            }}
          >
            {i18next.t("community-card.community-rewards")}
          </Button>
        </p>
      )}
      <JoinCommunityChatBtn community={community} />
      {info && (
        <Modal
          show={true}
          centered={true}
          onHide={() => setInfo(undefined)}
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
        <CommunitySettingsDialog community={community} onHide={() => setSettings(false)} />
      )}

      {rewards && (
        <CommunityRewardsRegistrationDialog
          community={community}
          onHide={() => setRewards(false)}
        />
      )}
    </div>
  );
}
