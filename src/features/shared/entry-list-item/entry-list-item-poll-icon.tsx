"use client";

import { Tooltip } from "@ui/tooltip";
import i18next from "i18next";
import { UilPanelAdd } from "@iconscout/react-unicons";
import React from "react";
import { Entry } from "@/entities";

interface Props {
  entry: Entry;
}

export function EntryListItemPollIcon({ entry }: Props) {
  return (entry.json_metadata as any).content_type === "poll" ? (
    <Tooltip content={i18next.t("polls.poll")}>
      <UilPanelAdd className="text-gray-600 dark:text-gray-400" size={16} />
    </Tooltip>
  ) : (
    <></>
  );
}
