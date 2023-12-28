"use client";

import { Tsx } from "@/features/i18n/helper";
import React from "react";
import i18next from "i18next";
import { useGlobalStore } from "@/core/global-store";
import { useWitnessVotesQuery } from "@/app/witnesses/_queries";

export function WitnessesHeader() {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const { data: witnessVotes } = useWitnessVotesQuery();

  return (
    <div className="page-header mt-5">
      <div className="header-title">{i18next.t("witnesses.page-title")}</div>
      <Tsx k="witnesses.page-description-long">
        <div className="header-description" />
      </Tsx>
      {activeUser && (
        <Tsx k="witnesses.remaining" args={{ n: 30 - witnessVotes.length, max: 30 }}>
          <div className="remaining" />
        </Tsx>
      )}
    </div>
  );
}
