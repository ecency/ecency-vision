import React, { useEffect } from "react";
import { Dropdown, DropdownItemWithIcon, DropdownMenu, DropdownToggle } from "@ui/dropdown";
import { Button } from "@ui/button";
import {
  Channel,
  DirectContact,
  useLeaveCommunityChannel,
  useLogoutFromChats,
  usePinContact
} from "@ecency/ns-query";
import { usePathname, useRouter } from "next/navigation";
import { error, success } from "@/features/shared";
import i18next from "i18next";
import { chatKeySvg, chatLeaveSvg, extendedView, kebabMenuSvg } from "@/assets/img/svg";
import { keySvg, pinSvg } from "@ui/svg";

interface Props {
  onManageChatKey?: () => void;
  currentUser?: string;
  channel?: Channel;
  contact?: DirectContact;
}

const ChatsDropdownMenu = (props: Props) => {
  const { mutateAsync: logout } = useLogoutFromChats();
  const pathname = usePathname();
  const router = useRouter();

  const { mutateAsync: leaveChannel, isPending: isLeavingLoading } = useLeaveCommunityChannel(
    props.channel
  );
  const {
    mutateAsync: pinContact,
    isPending: isContactPinning,
    isSuccess: isPinned,
    isError: isPinFailed
  } = usePinContact();

  useEffect(() => {
    if (isPinned) {
      success(i18next.t("g.success"));
    }
  }, [isPinned]);

  useEffect(() => {
    if (isPinFailed) {
      error(i18next.t("g.error"));
    }
  }, [isPinFailed]);

  const handleExtendedView = () => router.push("/chats");

  return (
    <Dropdown>
      <DropdownToggle>
        <Button size="sm" appearance="gray-link">
          {kebabMenuSvg}
        </Button>
        <DropdownMenu align="right">
          {props.contact && (
            <DropdownItemWithIcon
              icon={pinSvg}
              label={props.contact.pinned ? i18next.t("chat.unpin") : i18next.t("chat.pin")}
              disabled={isContactPinning}
              onClick={(e: { stopPropagation: () => void }) => {
                e.stopPropagation();
                if (!isContactPinning) {
                  pinContact({ contact: props.contact!, pinned: !props.contact!.pinned });
                }
              }}
            />
          )}
          {!pathname.startsWith("/chats") && (
            <DropdownItemWithIcon
              icon={extendedView}
              label={i18next.t("chat.extended-view")}
              onClick={(e: { stopPropagation: () => void }) => {
                e.stopPropagation();
                handleExtendedView();
              }}
            />
          )}
          {props.channel && (
            <DropdownItemWithIcon
              icon={chatLeaveSvg}
              label={isLeavingLoading ? i18next.t("chat.leaving") : i18next.t("chat.leave-channel")}
              onClick={() => leaveChannel()}
            />
          )}
          <DropdownItemWithIcon
            label={i18next.t("chat.manage-chat-key")}
            icon={chatKeySvg}
            onClick={() => props.onManageChatKey?.()}
          />
          <DropdownItemWithIcon
            icon={keySvg}
            label={i18next.t("chat.logout")}
            onClick={() => logout()}
          />
        </DropdownMenu>
      </DropdownToggle>
    </Dropdown>
  );
};

export default ChatsDropdownMenu;
