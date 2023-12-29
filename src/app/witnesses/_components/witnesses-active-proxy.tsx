import React, { useState } from "react";
import "./witness-active-proxy.scss";
import { Spinner } from "@ui/spinner";
import { Button } from "@ui/button";
import { error, KeyOrHotDialog, LoginRequired, ProfileLink } from "@/features/shared";
import { formatError, witnessProxy, witnessProxyHot, witnessProxyKc } from "@/api/operations";
import i18next from "i18next";
import { useGlobalStore } from "@/core/global-store";

interface Props {
  username: string;
  onDone: () => void;
  isProxy: boolean;
}

export function WitnessesActiveProxy({ username, isProxy, onDone }: Props) {
  const activeUser = useGlobalStore((state) => state.activeUser);

  const [inProgress, setInProgress] = useState(false);

  const proxy = (fn: any, args: any[]) => {
    const fnArgs = [...args];
    const call = fn(...fnArgs);
    if (typeof call?.then === "function") {
      setInProgress(true);
      call
        .then(() => {
          onDone();
        })
        .catch((e: any) => {
          error(...formatError(e));
        })
        .finally(() => {
          setInProgress(false);
        });
    }
  };

  return (
    <div className="witnesses-active-proxy" style={{ marginBottom: "50px" }}>
      {isProxy ? (
        <>
          <p className="description">{i18next.t("witnesses.proxy-active-description")}</p>
          <div className="proxy-form">
            <div className="current-proxy">
              {i18next.t("witnesses.proxy-active-current")}{" "}
              <ProfileLink username={username}>
                <span>{`@${username}`}</span>
              </ProfileLink>
            </div>

            {activeUser ? (
              <KeyOrHotDialog
                onKey={(key) => proxy(witnessProxy, [activeUser!.username, key, ""])}
                onHot={() => proxy(witnessProxyHot, [activeUser!.username, ""])}
                onKc={() => proxy(witnessProxyKc, [activeUser!.username, ""])}
              />
            ) : (
              <LoginRequired>
                <Button
                  disabled={inProgress}
                  icon={inProgress && <Spinner className="mr-[6px] w-3.5 h-3.5" />}
                  iconPlacement="left"
                >
                  {i18next.t("witnesses.proxy-active-btn-label")}
                </Button>
              </LoginRequired>
            )}

            <p className="description">{i18next.t("witnesses.proxy-active-highlighted")}</p>
          </div>
        </>
      ) : (
        <div className="current-proxy">
          <ProfileLink username={username}>
            <span>{`@${username}'s`}</span>
          </ProfileLink>
          {i18next.t("witnesses.check-witness-highlighted")}
        </div>
      )}
    </div>
  );
}

export default WitnessesActiveProxy;
