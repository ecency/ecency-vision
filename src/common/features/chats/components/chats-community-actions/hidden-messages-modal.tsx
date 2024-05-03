import { _t } from "../../../../i18n";
import React, { useMemo } from "react";
import { Table, Td, Th, Tr } from "@ui/table";
import { Modal, ModalBody, ModalHeader } from "@ui/modal";
import {
  Channel,
  useChannelHiddenMessagesQuery,
  useHideMessageInChannel,
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

export function HiddenMessagesModal({ channel, setShow, show }: Props) {
  const { data: community } = useCommunityCache(channel?.communityName);

  const { data: hiddenMessages } = useChannelHiddenMessagesQuery(channel, community ?? undefined);

  const uniqueAuthors = useMemo(
    () => Array.from(new Set(hiddenMessages?.map((m) => m.creator) ?? []).values()),
    [hiddenMessages]
  );

  const { data: profiles } = useNostrGetUserProfilesQuery(uniqueAuthors);
  const { mutateAsync: hideInChannel, isLoading: isHidingLoading } =
    useHideMessageInChannel(channel);

  return (
    <Modal centered={true} show={show} onHide={() => setShow(false)}>
      <ModalHeader closeButton={true}>{_t("chat.hidden-messages-management")}</ModalHeader>
      <ModalBody>
        <div className="flex flex-col mb-6 gap-6">
          {(hiddenMessages?.length ?? 0) > 0 && (
            <Table className="overflow-x-auto" full={true}>
              <thead>
                <Tr>
                  <Th>{_t("g.message")}</Th>
                  <Th>{_t("g.actions")}</Th>
                </Tr>
              </thead>
              <tbody>
                {hiddenMessages?.map((message, i) => {
                  return (
                    <Tr key={i}>
                      <Td>
                        <div className="flex">
                          <UserAvatar
                            username={
                              profiles?.find((p) => p.creator === message.creator)?.name ?? ""
                            }
                            size="medium"
                          />{" "}
                          <span className="mt-2 ml-2 username">
                            @{profiles?.find((p) => p.creator === message.creator)?.name ?? ""}
                          </span>
                        </div>
                        <div className="mt-2 bg-gray-200 dark:bg-gray-800 p-2 rounded-xl text-sm">
                          {message.content}
                        </div>
                      </Td>
                      <Td>
                        <Button
                          disabled={isHidingLoading}
                          size="sm"
                          outline={true}
                          onClick={() => hideInChannel({ messageId: message.id, status: 1 })}
                        >
                          {_t("g.restore")}
                        </Button>
                      </Td>
                    </Tr>
                  );
                })}
              </tbody>
            </Table>
          )}
          {(!hiddenMessages || hiddenMessages?.length === 0) && (
            <div className="text-center text-gray-400 dark:text-gray-600">
              {_t("chat.no-hidden-messages")}
            </div>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
}
