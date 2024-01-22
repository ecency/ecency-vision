import { _t } from "../../../../i18n";
import React, { useMemo } from "react";
import { Table, Th, Tr } from "@ui/table";
import { Modal, ModalBody, ModalHeader } from "@ui/modal";
import { useChannelsQuery, useUpdateChannelBlockedUsers } from "@ecency/ns-query";
import { useCommunityCache } from "../../../../core";

interface Props {
  username: string;
  show: boolean;
  setShow: (v: boolean) => void;
}

export function BlockedUsersModal({ username, setShow, show }: Props) {
  const { data: community } = useCommunityCache(username);
  const { data: channels } = useChannelsQuery();

  const currentChannel = useMemo(
    () => channels?.find((c) => c.communityName === username),
    [channels]
  );

  const { mutateAsync: updateBlockedUsers, isLoading: isBlockedUsersLoading } =
    useUpdateChannelBlockedUsers(currentChannel!!);

  return (
    <Modal centered={true} show={show} onHide={() => setShow(false)}>
      <ModalHeader closeButton={true}>{_t("chat.blocked-users-management")}</ModalHeader>
      <ModalBody>
        <div className="flex flex-col mb-6 gap-6">
          <Table className="overflow-x-auto" full={true}>
            <thead>
              <Tr>
                <Th>{_t("g.username")}</Th>
                <Th>{_t("g.status")}</Th>
              </Tr>
            </thead>
            <tbody>
              {/*{currentChannel?.removedUserIds?.map((user, i) => {*/}
              {/*  return (*/}
              {/*    <Tr key={i}>*/}
              {/*      <Td>*/}
              {/*        <div className="flex">*/}
              {/*          <UserAvatar*/}
              {/*            username={*/}
              {/*              profiles?.find((profile) => profile.creator === user)?.name ?? ""*/}
              {/*            }*/}
              {/*            size="medium"*/}
              {/*          />{" "}*/}
              {/*          <span className="mt-2 ml-2 username">*/}
              {/*            @{profiles?.find((profile) => profile.creator === user)}*/}
              {/*          </span>*/}
              {/*        </div>*/}
              {/*      </Td>*/}
              {/*      <Td>*/}
              {/*        <Button*/}
              {/*          size="sm"*/}
              {/*          outline={!!currentChannel?.removedUserIds?.includes(user)}*/}
              {/*          disabled={isBlockedUsersLoading}*/}
              {/*          onClick={() => {*/}
              {/*            if (currentChannel?.removedUserIds?.includes(user)) {*/}
              {/*              updateBlockedUsers(*/}
              {/*                currentChannel?.removedUserIds?.filter((id) => id !== user)*/}
              {/*              );*/}
              {/*            } else {*/}
              {/*              updateBlockedUsers([...(currentChannel?.removedUserIds ?? []), user]);*/}
              {/*            }*/}
              {/*          }}*/}
              {/*        >*/}
              {/*          {currentChannel?.removedUserIds?.includes(user)*/}
              {/*            ? _t("chat.unblock")*/}
              {/*            : _t("chat.block")}*/}
              {/*        </Button>*/}
              {/*      </Td>*/}
              {/*    </Tr>*/}
              {/*  );*/}
              {/*})}*/}
            </tbody>
          </Table>
        </div>
      </ModalBody>
    </Modal>
  );
}
