"use client";

import React from "react";
import "./_index.scss";
import { KeyOrHotDialog, LoginRequired } from "@/features/shared";
import { useGlobalStore } from "@/core/global-store";
import { chevronUpSvg } from "@ui/svg";
import { classNameObject } from "@ui/util";
import { useVoteWitness } from "@/api/mutations";

interface Props {
  voted: boolean;
  witness: string;
  onStart?: () => void;
  onEnd?: () => void;
  onSuccess?: (approve: boolean) => void;
}

export function WitnessVoteBtn({ witness, onStart, onEnd, onSuccess, voted }: Props) {
  const activeUser = useGlobalStore((state) => state.activeUser);

  const { mutateAsync: vote, isPending } = useVoteWitness(
    witness,
    onStart,
    () => onSuccess?.(!voted),
    onEnd
  );

  const btn = (
    <div className="witness-vote-btn">
      <div
        className={classNameObject({
          "btn-witness-vote btn-up-vote": true,
          "in-progress": isPending,
          voted,
          disabled: witness === ""
        })}
      >
        <span className="btn-inner">{chevronUpSvg}</span>
      </div>
    </div>
  );

  return activeUser ? (
    <KeyOrHotDialog
      onKey={(key) => vote({ kind: "app", key, voted })}
      onHot={() => vote({ kind: "hot", voted })}
      onKc={() => vote({ kind: "kc", voted })}
    >
      {btn}
    </KeyOrHotDialog>
  ) : (
    <LoginRequired>{btn}</LoginRequired>
  );
}
