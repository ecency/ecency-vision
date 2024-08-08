"use client";

import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "@ui/dropdown";
import i18next from "i18next";
import React from "react";
import { useRouter } from "next/navigation";
import { chevronDownSvgForSlider } from "@ui/svg";

export function DiscoverPeriodDropdown() {
  const router = useRouter();
  return (
    <Dropdown>
      <DropdownToggle>
        <div className="flex items-center gap-1">
          {i18next.t("leaderboard.title-stars")}
          {chevronDownSvgForSlider}
        </div>
      </DropdownToggle>
      <DropdownMenu align="left">
        {["day", "week", "month"].map((f) => (
          <DropdownItem key={f} onClick={() => router.push(`/discover?period=${f}`)}>
            {i18next.t(`leaderboard.period-${f}`)}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
