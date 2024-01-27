import { _t } from "../../../../i18n";
import React from "react";
import { Table, Td, Th, Tr } from "@ui/table";
import { Modal, ModalBody, ModalHeader } from "@ui/modal";
import {
  Channel,
  useChannelMutedUsersQuery,
  useMuteUserInChannel,
  useNostrGetUserProfilesQuery
} from "@ecency/ns-query";
import { useCommunityCache } from "../../../../core";
import UserAvatar from "../../../../components/user-avatar";
import { Button } from "@ui/button";

interface Props {
  channel?: Channel;
  show: boolean;
  setShow: (v: boolean) => void;
}

export function BlockedUsersModal({ channel, setShow, show }: Props) {
  const { data: community } = useCommunityCache(channel?.communityName);

  const { data: mutedUsersIds } = useChannelMutedUsersQuery(channel, community ?? undefined);
  const { data: mutedUsersProfiles } = useNostrGetUserProfilesQuery(mutedUsersIds ?? []);

  const { mutateAsync: muteUserInChannel, isLoading: isUserMutingLoading } =
    useMuteUserInChannel(channel);

  return (
    <Modal centered={true} show={show} onHide={() => setShow(false)}>
      <ModalHeader closeButton={true}>{_t("chat.blocked-users-management")}</ModalHeader>
      <ModalBody>
        <div className="flex flex-col mb-6 gap-6">
          {(mutedUsersProfiles?.length ?? 0) > 0 && (
            <Table className="overflow-x-auto" full={true}>
              <thead>
                <Tr>
                  <Th>{_t("g.username")}</Th>
                  <Th>{_t("g.status")}</Th>
                </Tr>
              </thead>
              <tbody>
                {mutedUsersProfiles?.map((user, i) => {
                  return (
                    <Tr key={i}>
                      <Td>
                        <div className="flex">
                          <UserAvatar username={user.name} size="medium" />{" "}
                          <span className="mt-2 ml-2 username">@{user.name}</span>
                        </div>
                      </Td>
                      <Td>
                        <Button
                          disabled={isUserMutingLoading}
                          size="sm"
                          outline={true}
                          onClick={() => muteUserInChannel({ pubkey: user.creator, status: 1 })}
                        >
                          {_t("chat.unblock")}
                        </Button>
                      </Td>
                    </Tr>
                  );
                })}
              </tbody>
            </Table>
          )}
          {(!mutedUsersProfiles || mutedUsersProfiles?.length === 0) && (
            <div className="text-center text-gray-400 dark:text-gray-600">
              {_t("chat.no-locked-user")}
            </div>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
}
