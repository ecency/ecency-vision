import React, { useCallback, useMemo, useState } from "react";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import { FormControl } from "@ui/input";
import { Button } from "@ui/button";
import { useGetSubscriptionsQuery } from "@/api/queries";
import { SuggestionList } from "@/features/shared";
import i18next from "i18next";
import { useCrossPost } from "@/api/mutations";
import { Entry } from "@/entities";

interface Props {
  entry: Entry;
  onSuccess: (community: string) => void;
  onHide: () => void;
}

export function CrossPost({ entry, onSuccess, onHide }: Props) {
  const [community, setCommunity] = useState("");
  const [message, setMessage] = useState("");

  const { data: subscriptions, isLoading } = useGetSubscriptionsQuery();

  const communities = useMemo(
    () => subscriptions?.map((x) => ({ id: x[0], name: x[1] })) ?? [],
    [subscriptions]
  );
  const suggestions = useMemo(
    () => communities.filter((x) => x.name.toLowerCase().indexOf(community.toLowerCase()) !== -1),
    [communities, community]
  );
  const theCommunity = useMemo(
    () => communities.find((x) => x.name.toLowerCase() === community.toLowerCase()),
    [communities, community]
  );
  const canSubmit = useMemo(() => theCommunity && message.trim() !== "", [message, theCommunity]);

  const { mutateAsync: submit, isPending } = useCrossPost(entry, () =>
    onSuccess(theCommunity?.id ?? "")
  );

  const communityChanged = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setCommunity(e.target.value),
    []
  );
  const messageChanged = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value),
    []
  );

  if (!isLoading && communities.length === 0) {
    return <span className="text-info">{i18next.t("cross-post.no-subscription")}</span>;
  }

  return (
    <Modal
      animation={false}
      show={true}
      centered={true}
      onHide={onHide}
      className="cross-post-dialog"
    >
      <ModalHeader closeButton={true}>
        <ModalTitle>{i18next.t("cross-post.title")}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <div className="mb-4">
          <SuggestionList
            items={suggestions}
            onSelect={(e) => setCommunity(e.name)}
            renderer={(x) => x.name}
          >
            <FormControl
              value={community}
              onChange={communityChanged}
              type="text"
              placeholder={i18next.t("cross-post.community-placeholder")}
            />
          </SuggestionList>
        </div>
        <div className="mb-4">
          <FormControl
            type="text"
            value={message}
            onChange={messageChanged}
            maxLength={200}
            placeholder={i18next.t("cross-post.message-placeholder")}
          />
        </div>
        <small className="mb-4 block text-gray-600">{i18next.t("cross-post.info")}</small>
        <div className="flex justify-between">
          <Button appearance="secondary" outline={true} onClick={onHide} disabled={isPending}>
            {i18next.t("g.cancel")}
          </Button>
          <Button
            disabled={!canSubmit || isPending}
            onClick={() => submit({ community: theCommunity!, message })}
          >
            {i18next.t("cross-post.submit-label")} {isPending ? "..." : ""}
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
}
