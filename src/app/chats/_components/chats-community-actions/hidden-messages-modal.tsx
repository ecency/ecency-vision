import React, { useMemo } from "react";
import { Table, Td, Th, Tr } from "@ui/table";
import { Modal, ModalBody, ModalHeader } from "@ui/modal";
import {
  Channel,
  useChannelHiddenMessagesQuery,
  useHideMessageInChannel,
  useNostrGetUserProfilesQuery
} from "@ecency/ns-query";
import { Button } from "@ui/button";
import { getCommunityCache } from "@/core/caches";
import i18next from "i18next";
import { UserAvatar } from "@/features/shared";

interface Props {
  channel?: Channel;
  show: boolean;
  setShow: (v: boolean) => void;
}

export function HiddenMessagesModal({ channel, setShow, show }: Props) {
  const { data: community } = getCommunityCache(channel?.communityName).useClientQuery();

  const { data: hiddenMessages } = useChannelHiddenMessagesQuery(channel, community ?? undefined);

  const uniqueAuthors = useMemo(
    () => Array.from(new Set(hiddenMessages?.map((m) => m.creator) ?? []).values()),
    [hiddenMessages]
  );

  const { data: profiles } = useNostrGetUserProfilesQuery(uniqueAuthors);
  const { mutateAsync: hideInChannel, isPending: isHidingLoading } =
    useHideMessageInChannel(channel);

  return (
    <Modal centered={true} show={show} onHide={() => setShow(false)}>
      <ModalHeader closeButton={true}>{i18next.t("chat.hidden-messages-management")}</ModalHeader>
      <ModalBody>
        <div className="flex flex-col mb-6 gap-6">
          {(hiddenMessages?.length ?? 0) > 0 && (
            <Table className="overflow-x-auto" full={true}>
              <thead>
                <Tr>
                  <Th>{i18next.t("g.message")}</Th>
                  <Th>{i18next.t("g.actions")}</Th>
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
                          {i18next.t("g.restore")}
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
              {i18next.t("chat.no-hidden-messages")}
            </div>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
}
