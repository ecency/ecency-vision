"use client";

import { LinearProgress, LoginRequired } from "@/features/shared";
import { Modal, ModalBody, ModalHeader } from "@ui/modal";
import { Button } from "@ui/button";
import i18next from "i18next";
import { useMemo, useState } from "react";
import {
  getJoinedCommunities,
  useChannelsQuery,
  useLeftCommunityChannelsQuery
} from "@ecency/ns-query";
import { Community } from "@/entities";

interface Props {
  community: Community | null;
  communityId?: string;
}

export function JoinCommunityModal({ community, communityId }: Props) {
  const [show, setShow] = useState(!!communityId);
  const [inProgress, setInProgress] = useState(false);

  const { data: channels } = useChannelsQuery();
  const { data: leftChannelsIds } = useLeftCommunityChannelsQuery();

  const currentChannel = useMemo(
    () => channels?.find((channel) => channel.communityName === community?.name),
    [channels, community]
  );
  const isCommunityAlreadyJoined = useMemo(
    () =>
      getJoinedCommunities(channels ?? [], leftChannelsIds ?? []).some(
        (community) => community.name === currentChannel?.communityName
      ),
    [channels, currentChannel?.communityName, leftChannelsIds]
  );

  return (
    show && (
      <LoginRequired>
        <Modal
          show={true}
          centered={true}
          onHide={() => setShow(false)}
          className="authorities-dialog"
          size="lg"
        >
          <ModalHeader thin={true} closeButton={true} />
          <ModalBody>
            {isCommunityAlreadyJoined ? (
              <>
                <div>
                  <h4>{i18next.t("community.already-joined-community")}</h4>
                </div>
                <p className="mt-5 text-right">
                  <Button outline={true} onClick={() => setShow(false)}>
                    {i18next.t("g.ok")}
                  </Button>
                </p>
              </>
            ) : (
              <>
                <div className="border-bottom">
                  <div className="join-community-dialog-titles">
                    <h2 className="join-community-main-title">Confirmaton</h2>
                  </div>
                  {inProgress && <LinearProgress />}
                </div>
                <div
                  className="join-community-dialog-body"
                  style={{ fontSize: "18px", marginTop: "12px" }}
                >
                  {i18next.t("confirm.title")}
                </div>
                <p className="join-community-confirm-buttons" style={{ textAlign: "right" }}>
                  <Button outline={true} className="mr-4" onClick={() => setShow(false)}>
                    {i18next.t("g.close")}
                  </Button>
                  <Button outline={true} className="confirm-btn" href={`/chats/${community?.name}`}>
                    {i18next.t("g.join")}
                  </Button>
                </p>
              </>
            )}
          </ModalBody>
        </Modal>
      </LoginRequired>
    )
  );
}
