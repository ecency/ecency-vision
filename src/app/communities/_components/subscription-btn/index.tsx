import React, { useMemo, useState } from "react";
import { Spinner } from "@ui/spinner";
import { Button, ButtonProps } from "@ui/button";
import { Community, Subscription } from "@/entities";
import { useGlobalStore } from "@/core/global-store";
import i18next from "i18next";
import { formatError, subscribe, unSubscribe } from "@/api/operations";
import { LoginRequired } from "@/features/shared";

interface Props {
  community: Community;
  buttonProps?: ButtonProps;
}
export function SubscriptionBtn({ buttonProps, community }: Props) {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const subscriptions = useGlobalStore((state) => state.subscriptions);
  const updateSubscriptions = useGlobalStore((state) => state.updateSubscriptions);

  const [hover, setHover] = useState(false);
  const [inProgress, setInProgress] = useState(false);

  const subscribed = useMemo(
    () => subscriptions.find((x) => x[0] === community.name) !== undefined,
    [subscriptions, community]
  );

  const subscribeAction = async () => {
    setInProgress(true);
    try {
      await subscribe(activeUser!!.username, community.name);
      const s: Subscription = [community.name, community.title, "guest", ""];
      updateSubscriptions([...subscriptions, s]);
    } catch (e) {
      error(...formatError(e));
    } finally {
      setInProgress(false);
    }
  };

  const unsubscribeAction = async () => {
    setInProgress(true);
    try {
      await unSubscribe(activeUser?.username!, community.name);
      const s: Subscription[] = subscriptions.filter((x) => x[0] !== community.name);
      updateSubscriptions([...s]);
    } catch (e) {
      error(...formatError(e));
    } finally {
      setInProgress(false);
    }
  };

  return (
    <>
      {inProgress && (
        <Button disabled={true} {...buttonProps}>
          <Spinner className="w-3.5 h-3.5" />
        </Button>
      )}
      {subscribed && (
        <Button
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={unsubscribeAction}
          outline={true}
          appearance={hover ? "danger" : "primary"}
          {...buttonProps}
        >
          {hover ? i18next.t("community.unsubscribe") : i18next.t("community.subscribed")}
        </Button>
      )}
      {!activeUser && (
        <LoginRequired>
          <Button onClick={subscribeAction} {...buttonProps}>
            {i18next.t("community.subscribe")}
          </Button>
        </LoginRequired>
      )}
    </>
  );
}
