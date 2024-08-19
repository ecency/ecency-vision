"use client";

import React from "react";
import "./index.scss";
import { Entry } from "@/entities";
import { Popover } from "@ui/popover";
import { ProfilePreview } from "@/features/shared/profile-popover/profile-preview";

export const ProfilePopover = ({ entry }: { entry: Entry }) => {
  const author = entry.original_entry ? entry.original_entry.author : entry.author;

  return (
    <div>
      <div className="author btn notranslate items-center relative">
        <span className="author-name">{author}</span>
      </div>
      <Popover
        placement="auto"
        anchorParent={true}
        stopPropagationForChild={true}
        customClassName="rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-xl w-[320px]"
      >
        <ProfilePreview username={author} />
      </Popover>
    </div>
  );
};
