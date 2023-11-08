import React, { useContext, useEffect, useMemo, useState } from "react";
import { History } from "history";
import DropDown, { MenuItem } from "../../../../components/dropdown";

import { chatLeaveSvg, editSVG, kebabMenuSvg, linkSvg, removeUserSvg } from "../../../../img/svg";
import { _t } from "../../../../i18n";
import { DropDownStyle, LEAVECOMMUNITY, UNBLOCKUSER } from "../chat-popup/chat-constants";
import { useMappedStore } from "../../../../store/use-mapped-store";
import { error, success } from "../../../../components/feedback";
import UserAvatar from "../../../../components/user-avatar";
import { copyToClipboard } from "../../utils";
import { ChatContext } from "../../chat-context-provider";

import "./index.scss";
import { Button } from "@ui/button";
import { Modal, ModalBody, ModalHeader } from "@ui/modal";
import { CommunityModerator } from "../../managers/message-manager-types";
import { useLeaveCommunityChannel } from "../../mutations";
import { EditRolesModal } from "./edit-roles-modal";
import { useChannelsQuery } from "../../queries";

interface Props {
  history: History;
  from?: string;
  username: string;
}

const ChatsCommunityDropdownMenu = (props: Props) => {
  const { activeUser, chat } = useMappedStore();
  const { history, from } = props;
  const [step, setStep] = useState(0);
  const [keyDialog, setKeyDialog] = useState(false);
  const [moderator, setModerator] = useState<CommunityModerator>();
  const [communityAdmins, setCommunityAdmins] = useState<string[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<{ name: string; pubkey: string }[]>([]);
  const [removedUserId, setRemovedUserID] = useState("");

  const { data: channels } = useChannelsQuery();
  const currentChannel = useMemo(
    () => channels?.find((channel) => channel.communityName === props.username),
    [channels, props.username]
  );

  const { mutateAsync: leaveChannel } = useLeaveCommunityChannel(() => {
    setKeyDialog(false);
    setStep(0);
    history?.push("/chats");
  });

  const { messageServiceInstance } = useContext(ChatContext);

  useEffect(() => {
    getCommunityAdmins();

    if (currentChannel && currentChannel?.removedUserIds) {
      // getBlockedUsers(currentChannel?.removedUserIds!);
    }
  }, [currentChannel, removedUserId]);

  const handleEditRoles = () => {
    setKeyDialog(true);
    setStep(2);
  };

  const toggleKeyDialog = () => {
    setKeyDialog(!keyDialog);
  };

  const getCommunityAdmins = () => {
    const communityAdminRoles = ["owner", "admin"];
    const communityAdmins = currentChannel?.communityModerators?.filter((user) =>
      communityAdminRoles.includes(user.role)
    );
    const communityAdminNames = communityAdmins?.map((user) => user.name);
    setCommunityAdmins(communityAdminNames!);
  };

  // const getBlockedUsers = (blockedUser: string[]) => {
  //   const blockedUsers = profiles
  //     .filter((item) => blockedUser.includes(item.creator))
  //     .map((item) => ({ name: item.name, pubkey: item.creator }));
  //   setBlockedUsers(blockedUsers);
  // };

  const handleBlockedUsers = () => {
    setKeyDialog(true);
    setStep(3);
  };

  const finish = () => {
    setStep(0);
    setKeyDialog(false);
  };

  const communityMenuItems: MenuItem[] = [
    {
      label: _t("chat.invite"),
      onClick: () => {
        copyToClipboard(
          `https://ecency.com/created/${currentChannel?.communityName}?communityid=${currentChannel?.id}`
        );
        success("Link copied into clipboard.");
      },

      icon: linkSvg
    },
    {
      label: _t("chat.leave"),
      onClick: () => {
        setStep(1);
        setKeyDialog(true);
      },
      icon: chatLeaveSvg
    },
    ...(activeUser?.username === currentChannel?.communityName
      ? [
          {
            label: _t("chat.edit-roles"),
            onClick: handleEditRoles,
            icon: editSVG
          }
        ]
      : []),
    ...(communityAdmins && communityAdmins.includes(activeUser?.username!)
      ? [
          {
            label: _t("chat.blocked-users"),
            onClick: handleBlockedUsers,
            icon: removeUserSvg
          }
        ]
      : [])
  ];

  const communityMenuConfig = {
    history: props.history,
    label: "",
    icon: kebabMenuSvg,
    items: communityMenuItems
  };

  const confirmationModal = (actionType: string) => {
    return (
      <>
        <div className="join-community-dialog-header border-bottom">
          <div className="join-community-dialog-titles">
            <h2 className="join-community-main-title">{_t("communities-create.confirmation")}</h2>
          </div>
        </div>
        <div className="text-lg mt-4">{_t("confirm.title")}</div>
        <p className="text-right mt-8">
          <Button
            outline={true}
            className="mr-6"
            onClick={() => {
              setStep(0);
              setKeyDialog(false);
            }}
          >
            {_t("chat.close")}
          </Button>
          <Button
            outline={true}
            className="confirm-btn"
            onClick={() => handleConfirmButton(actionType)}
          >
            {_t("chat.confirm")}
          </Button>
        </p>
      </>
    );
  };

  const blockedUsersModal = () => {
    return (
      <>
        <div className="blocked-user-header" style={{ marginBottom: "1rem" }}>
          <h4 className="blocked-user-title">{_t("chat.blocked-users")}</h4>
        </div>

        {blockedUsers.length !== 0 ? (
          <>
            <table className="table table-striped table-bordered table-roles">
              <thead>
                <tr>
                  <th style={{ width: "50%" }}>{_t("community.roles-account")}</th>
                  <th style={{ width: "50%" }}>{_t("chat.action")}</th>
                </tr>
              </thead>
              <tbody>
                {blockedUsers &&
                  blockedUsers.map((user, i) => {
                    return (
                      <tr key={i}>
                        <td>
                          <span className="flex user">
                            <UserAvatar username={user.name} size="medium" />{" "}
                            <span className="username" style={{ margin: "10px 0 0 10px" }}>
                              @{user.name}
                            </span>
                          </span>
                        </td>
                        <td>
                          <Button
                            outline={true}
                            onClick={() => {
                              setKeyDialog(true);
                              setStep(4);
                              setRemovedUserID(user.pubkey);
                            }}
                          >
                            {_t("chat.unblock")}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </>
        ) : (
          <div className="text-center">
            <p> {_t("chat.no-locked-user")}</p>
          </div>
        )}
      </>
    );
  };

  const successModal = (message: string) => {
    return (
      <>
        <div className="success-dialog-header flex border-bottom">
          <div className="step-no">2</div>
          <div className="success-dialog-titles">
            <div className="success-main-title">{_t("manage-authorities.success-title")}</div>
            <div className="success-sub-title">{_t("manage-authorities.success-sub-title")}</div>
          </div>
        </div>
        <div className="success-dialog-body">
          <div className="success-dialog-content text-center">
            <span>{message === UNBLOCKUSER ? "User unblock successfully" : ""}</span>
          </div>
          <div className="flex justify-center mt-3">
            <span className="hr-6px-btn-spacer" />
            <Button onClick={finish}>{_t("g.finish")}</Button>
          </div>
        </div>
      </>
    );
  };

  const handleConfirmButton = (actionType: string) => {
    switch (actionType) {
      case LEAVECOMMUNITY:
        leaveChannel(currentChannel?.id!!);
        break;
      case UNBLOCKUSER:
        handleChannelUpdate(UNBLOCKUSER);
        break;
    }
  };

  const handleChannelUpdate = (operationType: string) => {
    let updatedMetaData = {
      name: currentChannel?.name!,
      about: currentChannel?.about!,
      picture: "",
      communityName: currentChannel?.communityName!,
      communityModerators: currentChannel?.communityModerators,
      hiddenMessageIds: currentChannel?.hiddenMessageIds,
      removedUserIds: currentChannel?.removedUserIds
    };
    switch (operationType) {
      case UNBLOCKUSER:
        const NewUpdatedRemovedUsers = currentChannel?.removedUserIds?.filter(
          (item) => item !== removedUserId
        );
        updatedMetaData.removedUserIds = NewUpdatedRemovedUsers;
        break;
      default:
        break;
    }
    try {
      messageServiceInstance?.updateChannel(currentChannel!, updatedMetaData);

      if (operationType === UNBLOCKUSER) {
        setStep(5);
        setKeyDialog(true);
        setRemovedUserID("");
      }
    } catch (err) {
      error(_t("chat.error-updating-community"));
    }
  };

  return (
    <>
      <DropDown
        {...communityMenuConfig}
        style={DropDownStyle}
        float="right"
        alignBottom={false}
        noMarginTop={true}
      />

      {keyDialog && (
        <Modal
          animation={false}
          show={true}
          centered={true}
          onHide={toggleKeyDialog}
          className="chats-dialog modal-thin-header"
          size="lg"
        >
          <ModalHeader thin={true} closeButton={true} />
          <ModalBody className="chat-modals-body">
            {step === 1 && confirmationModal(LEAVECOMMUNITY)}
            {step === 2 && <EditRolesModal username={props.username} />}
            {step === 3 && blockedUsersModal()}
            {step === 4 && confirmationModal(UNBLOCKUSER)}
            {step === 5 && successModal(UNBLOCKUSER)}
          </ModalBody>
        </Modal>
      )}
    </>
  );
};

export default ChatsCommunityDropdownMenu;
