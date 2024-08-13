import React, { useCallback, useMemo, useState } from "react";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader } from "@ui/modal";
import { Button } from "@ui/button";
import { Community } from "@/entities";
import { KeyOrHot } from "@/features/shared/key-or-hot";
import i18next from "i18next";
import { LinearProgress } from "@/features/shared";
import { useCommunityRewardsRegister, useCommunityRewardsRegisterKc } from "@/api/mutations";
import { communityRewardsRegisterHot } from "@/api/operations";
import { useGetRewardedCommunities } from "@/api/queries";

interface Props {
  community: Community;
  onHide: () => void;
}

export function CommunityRewardsRegistrationDialog({ onHide, community }: Props) {
  const [form, setForm] = useState(false);
  const [done, setDone] = useState(false);

  const { data: rewardedCommunities, isLoading: isRewardingFetching } = useGetRewardedCommunities();

  const { mutateAsync: signKs, isPending: isSignKcPending } = useCommunityRewardsRegisterKc(
    community,
    () => setDone(true)
  );
  const { mutateAsync: sign, isPending: isSigning } = useCommunityRewardsRegister(community, () =>
    setDone(true)
  );

  const registered = useMemo(
    () => rewardedCommunities?.find((x) => x.name === community.name),
    [community.name, rewardedCommunities]
  );
  const loading = useMemo(
    () => isSignKcPending || isSigning || isRewardingFetching,
    [isSignKcPending, isSigning, isRewardingFetching]
  );

  const hotSign = useCallback(() => {
    communityRewardsRegisterHot(community.name);
    onHide();
  }, [community.name, onHide]);

  return (
    <Modal
      show={true}
      centered={true}
      onHide={onHide}
      className="community-rewards-registration-dialog"
    >
      <ModalHeader closeButton={true} />
      <ModalBody>
        {loading ? (
          <LinearProgress />
        ) : done ? (
          <div className="dialog-content">
            <p className="text-info">
              {i18next.t("community-rewards-registration.done-body-text")}
            </p>
            <Button size="sm" onClick={onHide}>
              {i18next.t("g.close")}
            </Button>
          </div>
        ) : form ? (
          <div className="dialog-content">
            <KeyOrHot
              inProgress={loading}
              onKey={(key) => sign({ key })}
              onHot={hotSign}
              onKc={signKs}
            />
          </div>
        ) : registered ? (
          <div className="dialog-content">
            <p className="text-info">
              {i18next.t("community-rewards-registration.conflict-body-text")}
            </p>
            <Button size="sm" onClick={onHide}>
              {i18next.t("g.close")}
            </Button>
          </div>
        ) : community.subscribers < 100 ? (
          <div className="dialog-content">
            <p className="text-red">
              {i18next.t("community-rewards-registration.min-required-body-text")}
            </p>
            <Button size="sm" onClick={onHide}>
              {i18next.t("g.close")}
            </Button>
          </div>
        ) : (
          <div className="dialog-content">
            <p>{i18next.t("community-rewards-registration.body-text")}</p>
            <Button size="sm" onClick={() => setForm(true)}>
              {i18next.t("community-rewards-registration.btn-next-label")}
            </Button>
          </div>
        )}
      </ModalBody>
    </Modal>
  );
}
