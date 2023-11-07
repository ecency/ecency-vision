import { _t } from "../../../../i18n";
import LinearProgress from "../../../../components/linear-progress";
import { FormControl, InputGroup } from "@ui/input";
import React, { useMemo, useState } from "react";
import { Button } from "@ui/button";
import { NOSTRKEY } from "../chat-popup/chat-constants";
import { useChannelsQuery } from "../../queries";
import UserAvatar from "../../../../components/user-avatar";
import { ROLES } from "../../../../store/communities";
import { CommunityModerator } from "../../managers/message-manager-types";
import { error } from "../../../../components/feedback";
import useDebounce from "react-use/lib/useDebounce";
import { getAccountFull } from "../../../../api/hive";
import { useMappedStore } from "../../../../store/use-mapped-store";
import { useUpdateChannelModerator } from "../../mutations";
import { Table, Td, Th, Tr } from "@ui/table";
import { Spinner } from "@ui/spinner";

interface Props {
  username: string;
}

const roles = [ROLES.ADMIN, ROLES.MOD, ROLES.GUEST];

export function EditRolesModal({ username }: Props) {
  const { activeUser } = useMappedStore();
  const { data: channels } = useChannelsQuery();

  const [inProgress, setInProgress] = useState(false);
  const [user, setUser] = useState("");
  const [moderator, setModerator] = useState<CommunityModerator>();
  const [role, setRole] = useState("admin");
  const [addRoleError, setAddRoleError] = useState("");

  const currentChannel = useMemo(
    () => channels?.find((c) => c.communityName === username),
    [channels]
  );

  const { mutateAsync: updateModerator, isLoading: isUpdateModeratorLoading } =
    useUpdateChannelModerator(currentChannel);

  useDebounce(
    async () => {
      if (user.length === 0) {
        setAddRoleError("");
        setInProgress(false);
        return;
      }
      try {
        const response = await getAccountFull(user);
        if (!response) {
          setAddRoleError("Account does not exist");
          return;
        }

        if (!response.posting_json_metadata) {
          setAddRoleError("This user hasn't joined the chat yet.");
          return;
        }

        const { posting_json_metadata } = response;
        const profile = JSON.parse(posting_json_metadata).profile;

        if (!profile || !profile.hasOwnProperty(NOSTRKEY)) {
          setAddRoleError("You cannot set this user because this user hasn't joined the chat yet.");
          return;
        }

        const alreadyExists = currentChannel?.communityModerators?.some(
          (moderator) => moderator.name === response.name
        );

        if (alreadyExists) {
          setAddRoleError("You have already assigned some rule to this user.");
          setInProgress(false);
        } else {
          const moderator = {
            name: user,
            pubkey: profile.nsKey,
            role: role
          };
          setModerator(moderator);
          setAddRoleError("");
        }
      } catch (err) {
        error(err as string);
      } finally {
        setInProgress(false);
      }
    },
    200,
    [user, role]
  );

  return (
    <>
      <h4 className="pb-6">{_t("chat.edit-community-roles")}</h4>
      {inProgress && <LinearProgress />}
      <div>
        <div className={`flex flex-col mb-6 gap-6 ${inProgress ? "in-progress" : ""}`}>
          <div className="grid grid-cols-12">
            <div className="col-span-12 sm:col-span-2">{_t("community-role-edit.username")}</div>
            <div className="col-span-12 sm:col-span-10">
              <InputGroup prepend="@">
                <FormControl
                  type="text"
                  autoFocus={user === ""}
                  placeholder={_t("community-role-edit.username").toLowerCase()}
                  value={user}
                  onChange={(e) => {
                    setUser(e.target.value);
                    setInProgress(true);
                  }}
                  className={addRoleError ? "is-invalid" : ""}
                />
              </InputGroup>
              {addRoleError && <div className="text-danger">{addRoleError}</div>}
            </div>
          </div>
          <div className="grid grid-cols-12">
            <div className="col-span-12 sm:col-span-2">{_t("community-role-edit.role")}</div>
            <div className="col-span-12 sm:col-span-10">
              <FormControl
                type="select"
                value={role}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRole(e.target.value)}
              >
                {roles.map((r, i) => (
                  <option key={i} value={r}>
                    {r}
                  </option>
                ))}
              </FormControl>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => {
                if (moderator) {
                  updateModerator(moderator);
                }
              }}
              disabled={isUpdateModeratorLoading || addRoleError.length !== 0 || user.length === 0}
            >
              {_t("chat.add")}
            </Button>
          </div>
        </div>
        {currentChannel?.communityModerators?.length !== 0 ? (
          <>
            <Table full={true}>
              <thead>
                <Tr>
                  <Th style={{ width: "50%" }}>{_t("community.roles-account")}</Th>
                  <Th style={{ width: "50%" }}>{_t("community.roles-role")}</Th>
                </Tr>
              </thead>
              <tbody>
                {currentChannel?.communityModerators &&
                  currentChannel?.communityModerators!.map((moderator, i) => {
                    return (
                      <Tr key={i}>
                        <Td>
                          <div className="flex">
                            <UserAvatar username={moderator.name} size="medium" />{" "}
                            <span className="mt-2 ml-2 username">@{moderator.name}</span>
                          </div>
                        </Td>
                        <Td>
                          {moderator.name === activeUser?.username ? (
                            <div style={{ margin: "5px 0 0 12px" }}>{moderator.role}</div>
                          ) : (
                            <InputGroup
                              prepend={
                                isUpdateModeratorLoading && <Spinner className="w-3.5 h-3.5" />
                              }
                            >
                              <FormControl
                                type="select"
                                value={moderator.role}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                  updateModerator({ ...moderator, role: e.target.value })
                                }
                                disabled={isUpdateModeratorLoading}
                              >
                                {roles.map((r, i) => (
                                  <option key={i} value={r}>
                                    {r}
                                  </option>
                                ))}
                              </FormControl>
                            </InputGroup>
                          )}
                        </Td>
                      </Tr>
                    );
                  })}
              </tbody>
            </Table>
          </>
        ) : (
          <div className="text-center">
            <p>{_t("chat.no-admin")}</p>
          </div>
        )}
      </div>
    </>
  );
}
