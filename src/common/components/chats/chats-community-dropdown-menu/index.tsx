import React, { useContext, useEffect, useState } from "react";
import { History } from "history";
import DropDown, { MenuItem } from "../../dropdown";
import useDebounce from "react-use/lib/useDebounce";

import { KebabMenu, linkSvg, chatLeaveSvg, editSVG, removeUserSvg } from "../../../img/svg";
import { _t } from "../../../i18n";
import {
  ADDROLE,
  CHATPAGE,
  DropDownStyle,
  LEAVECOMMUNITY,
  NOSTRKEY,
  UNBLOCKUSER
} from "../chat-popup/chat-constants";
import { useMappedStore } from "../../../store/use-mapped-store";
import { Channel, communityModerator } from "../../../../managers/message-manager-types";
import { error, success } from "../../feedback";
import { Button, Form, Modal, Row, Col, InputGroup, FormControl } from "react-bootstrap";
import LinearProgress from "../../linear-progress";
import { ROLES } from "../../../store/communities";
import UserAvatar from "../../user-avatar";
import { copyToClipboard, getProfileMetaData } from "../utils";
import { ChatContext } from "../chat-context-provider";

import "./index.scss";

interface Props {
  history: History;
  from?: string;
  username: string;
}

const roles = [ROLES.ADMIN, ROLES.MOD, ROLES.GUEST];

const ChatsCommunityDropdownMenu = (props: Props) => {
  const { activeUser, chat } = useMappedStore();
  const { currentChannel, setCurrentChannel } = useContext(ChatContext);
  const { history, from } = props;
  const [step, setStep] = useState(0);
  const [keyDialog, setKeyDialog] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [user, setUser] = useState("");
  const [addRoleError, setAddRoleError] = useState("");
  const [role, setRole] = useState("admin");
  const [moderator, setModerator] = useState<communityModerator>();
  const [communityAdmins, setCommunityAdmins] = useState<string[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<{ name: string; pubkey: string }[]>([]);
  const [removedUserId, setRemovedUserID] = useState("");

  const { messageServiceInstance } = useContext(ChatContext);

  useEffect(() => {
    getCommunityAdmins();

    if (currentChannel && currentChannel?.removedUserIds) {
      getBlockedUsers(currentChannel?.removedUserIds!);
    }
  }, [currentChannel, removedUserId]);

  const handleEditRoles = () => {
    setKeyDialog(true);
    setStep(2);
  };

  const toggleKeyDialog = () => {
    setKeyDialog(!keyDialog);
  };

  const userChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
    const { value: user } = e.target;
    setUser(user);
    setInProgress(true);
  };

  const getCommunityAdmins = () => {
    const communityAdminRoles = ["owner", "admin"];
    const communityAdmins = currentChannel?.communityModerators?.filter((user) =>
      communityAdminRoles.includes(user.role)
    );
    const communityAdminNames = communityAdmins?.map((user) => user.name);
    setCommunityAdmins(communityAdminNames!);
  };

  const getBlockedUsers = (blockedUser: string[]) => {
    const blockedUsers = chat.profiles
      .filter((item) => blockedUser.includes(item.creator))
      .map((item) => ({ name: item.name, pubkey: item.creator }));
    setBlockedUsers(blockedUsers);
  };

  const roleChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
    const { value: role } = e.target;
    setRole(role);
  };

  const handleBlockedUsers = () => {
    setKeyDialog(true);
    setStep(3);
  };

  const updateRole = (
    event: React.ChangeEvent<HTMLSelectElement>,
    moderator: communityModerator
  ) => {
    const selectedRole = event.target.value;
    const moderatorIndex = currentChannel?.communityModerators?.findIndex(
      (mod) => mod.name === moderator.name
    );
    if (moderatorIndex !== -1 && currentChannel) {
      const newUpdatedChannel: Channel = { ...currentChannel };
      const newUpdatedModerator = { ...newUpdatedChannel?.communityModerators![moderatorIndex!] };
      newUpdatedModerator.role = selectedRole;
      newUpdatedChannel!.communityModerators![moderatorIndex!] = newUpdatedModerator;
      setCurrentChannel(newUpdatedChannel);
      messageServiceInstance?.updateChannel(currentChannel, newUpdatedChannel);
      success("Roles updated succesfully");
    }
  };

  const finish = () => {
    setStep(0);
    setKeyDialog(false);
  };

  useDebounce(
    async () => {
      if (user.length === 0) {
        setAddRoleError("");
        setInProgress(false);
        return;
      }

      try {
        const profileData = await getProfileMetaData(user);
        if (profileData && profileData.hasOwnProperty(NOSTRKEY)) {
          const alreadyExists = currentChannel?.communityModerators?.some(
            (moderator) => moderator.name === profileData.name
          );
          if (alreadyExists) {
            setAddRoleError("You have already assigned some rule to this user.");
            setInProgress(false);
            return;
          }
          const moderator = {
            name: user,
            pubkey: profileData.nsKey,
            role: role
          };
          setModerator(moderator);
          setAddRoleError("");
        } else {
          setAddRoleError("You cannot set this user because this user hasn't joined the chat yet.");
        }
      } catch (err) {
        error(err as string);
      }

      setInProgress(false);
    },
    200,
    [user, role]
  );

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
    icon: KebabMenu,
    items: communityMenuItems
  };

  const confirmationModal = (actionType: string) => {
    return (
      <>
        <div className="join-community-dialog-header border-bottom">
          <div className="join-community-dialog-titles">
            <h2 className="join-community-main-title">Confirmation</h2>
          </div>
        </div>
        <div className="join-community-dialog-body" style={{ fontSize: "18px", marginTop: "12px" }}>
          Are you sure?
        </div>
        <p className="join-community-confirm-buttons" style={{ textAlign: "right" }}>
          <Button
            variant="outline-primary"
            className="close-btn"
            style={{ marginRight: "20px" }}
            onClick={() => {
              setStep(0);
              setKeyDialog(false);
            }}
          >
            {_t("chat.close")}
          </Button>
          <Button
            variant="outline-primary"
            className="confirm-btn"
            onClick={() => handleConfirmButton(actionType)}
          >
            {_t("chat.confirm")}
          </Button>
        </p>
      </>
    );
  };

  const EditRolesModal = () => {
    return (
      <>
        <div className="add-dialog-header border-bottom">
          <div className="add-dialog-titles">
            <h4 className="add-main-title">{_t("chat.edit-community-roles")}</h4>
          </div>
        </div>
        <div className="community-chat-role-edit-dialog-content">
          {inProgress && <LinearProgress />}
          <div className={`add-user-role-form ${inProgress ? "in-progress" : ""}`}>
            <Form.Group as={Row}>
              <Form.Label column={true} sm="2">
                {_t("community-role-edit.username")}
              </Form.Label>
              <Col sm="10">
                <InputGroup>
                  <InputGroup.Prepend>
                    <InputGroup.Text>@</InputGroup.Text>
                  </InputGroup.Prepend>
                  <Form.Control
                    type="text"
                    autoFocus={user === ""}
                    placeholder={_t("community-role-edit.username").toLowerCase()}
                    value={user}
                    onChange={userChanged}
                    className={addRoleError ? "is-invalid" : ""}
                  />
                </InputGroup>
                {addRoleError && <Form.Text className="text-danger">{addRoleError}</Form.Text>}
              </Col>
            </Form.Group>
            <Form.Group as={Row}>
              <Form.Label column={true} sm="2">
                {_t("community-role-edit.role")}
              </Form.Label>
              <Col sm="10">
                <Form.Control as="select" value={role} onChange={roleChanged}>
                  {roles.map((r, i) => (
                    <option key={i} value={r}>
                      {r}
                    </option>
                  ))}
                </Form.Control>
              </Col>
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button
                type="button"
                onClick={() => handleChannelUpdate(ADDROLE)}
                disabled={inProgress || addRoleError.length !== 0 || user.length === 0}
              >
                {_t("chat.add")}
              </Button>
            </div>
          </div>
          {currentChannel?.communityModerators?.length !== 0 ? (
            <>
              <table className="table table-striped table-bordered table-roles">
                <thead>
                  <tr>
                    <th style={{ width: "50%" }}>{_t("community.roles-account")}</th>
                    <th style={{ width: "50%" }}>{_t("community.roles-role")}</th>
                  </tr>
                </thead>
                <tbody>
                  {currentChannel?.communityModerators &&
                    currentChannel?.communityModerators!.map((moderator, i) => {
                      return (
                        <tr key={i}>
                          <td>
                            <span className="d-flex user">
                              <UserAvatar username={moderator.name} size="medium" />{" "}
                              <span className="mt-2 ml-2 username">@{moderator.name}</span>
                            </span>
                          </td>
                          <td>
                            {moderator.name === activeUser?.username ? (
                              <p style={{ margin: "5px 0 0 12px" }}>{moderator.role}</p>
                            ) : (
                              <Form.Control
                                as="select"
                                value={moderator.role}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                  updateRole(e, moderator)
                                }
                              >
                                {roles.map((r, i) => (
                                  <option key={i} value={r}>
                                    {r}
                                  </option>
                                ))}
                              </Form.Control>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </>
          ) : (
            <div className="text-center">
              <p>{_t("chat.no-admin")}</p>
            </div>
          )}
        </div>
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
                          <span className="d-flex user">
                            <UserAvatar username={user.name} size="medium" />{" "}
                            <span className="username" style={{ margin: "10px 0 0 10px" }}>
                              @{user.name}
                            </span>
                          </span>
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
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
        <div className="import-chat-dialog-header border-bottom">
          <div className="step-no">2</div>
          <div className="import-chat-dialog-titles">
            <div className="import-chat-main-title">{_t("manage-authorities.success-title")}</div>
            <div className="import-chat-sub-title">
              {_t("manage-authorities.success-sub-title")}
            </div>
          </div>
        </div>
        <div className="success-dialog-body">
          <div className="success-dialog-content">
            <span>{message === UNBLOCKUSER ? "User unblock successfully" : ""}</span>
          </div>
          <div className="d-flex justify-content-center">
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
        messageServiceInstance
          ?.updateLeftChannelList([...chat.leftChannelsList!, currentChannel?.id!])
          .then(() => {})
          .finally(() => {
            setKeyDialog(false);
            setStep(0);
            if (from && from === CHATPAGE) {
              history?.push("/chats");
            }
          });
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
      case ADDROLE:
        const updatedRoles = [...(currentChannel?.communityModerators || []), moderator!];
        updatedMetaData.communityModerators = updatedRoles;
        break;
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
      setCurrentChannel({ ...currentChannel!, ...updatedMetaData });

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
          keyboard={false}
          className="chats-dialog modal-thin-header"
          size="lg"
        >
          <Modal.Header closeButton={true} />
          <Modal.Body className="chat-modals-body">
            {step === 1 && confirmationModal(LEAVECOMMUNITY)}
            {step === 2 && EditRolesModal()}
            {step === 3 && blockedUsersModal()}
            {step === 4 && confirmationModal(UNBLOCKUSER)}
            {step === 5 && successModal(UNBLOCKUSER)}
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};

export default ChatsCommunityDropdownMenu;
