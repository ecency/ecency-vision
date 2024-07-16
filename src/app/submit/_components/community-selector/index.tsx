import React, { useEffect, useState } from "react";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader } from "@ui/modal";
import { useGlobalStore } from "@/core/global-store";
import { getCommunityCache } from "@/core/caches";
import { CommunitySelectorBrowser } from "@/app/submit/_components/community-selector/community-selector-browser";
import { isCommunity } from "@/utils";
import { UserAvatar } from "@/features/shared";
import { menuDownSvg } from "@ui/svg";
import i18next from "i18next";

interface Props {
  tags: string[];
  onSelect: (prev: string | undefined, next: string | null) => void;
}

function extractCommunityName(tags: string[]) {
  const [tag] = tags;

  if (!tag) {
    return undefined;
  }

  if (!isCommunity(tag)) {
    return undefined;
  }

  return tag;
}

export function CommunitySelector({ tags, onSelect }: Props) {
  const activeUser = useGlobalStore((s) => s.activeUser);

  const { data: community } = getCommunityCache(extractCommunityName(tags)).useClientQuery();

  const [visible, setVisible] = useState(false);
  const [picked, setPicked] = useState(false);

  useEffect(() => {
    setPicked(false);
  }, [tags]);

  return (
    <>
      <a
        href="#"
        id="community-picker"
        className="community-selector"
        onClick={(e) => {
          e.preventDefault();
          setVisible(!visible);
        }}
      >
        {community && (
          <>
            <UserAvatar username={community.name} size="small" />
            <span className="label">{community.title}</span> {menuDownSvg}
          </>
        )}
        {!community && (tags?.length > 0 || picked) && (
          <>
            <UserAvatar username={activeUser?.username ?? ""} size="small" />
            <span className="label">{i18next.t("community-selector.my-blog")}</span> {menuDownSvg}
          </>
        )}
        {!(tags?.length > 0 || picked) && !community && (
          <>
            <span className="label">{i18next.t("community-selector.choose")}</span> {menuDownSvg}
          </>
        )}
      </a>

      {visible && (
        <Modal
          onHide={() => setVisible(!visible)}
          show={true}
          centered={true}
          animation={false}
          className="community-selector-modal"
        >
          <ModalHeader closeButton={true} />

          <ModalBody>
            <CommunitySelectorBrowser
              onHide={() => setVisible(!visible)}
              onSelect={(name: string | null) => {
                const prev = extractCommunityName(tags);
                onSelect(prev, name);
                setPicked(true);
              }}
            />
          </ModalBody>
        </Modal>
      )}
    </>
  );
}
