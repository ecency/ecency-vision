import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "@ui/dropdown";
import i18next from "i18next";
import React from "react";
import { useRouter } from "next/navigation";

export function DiscoverPeriodDropdown() {
  const router = useRouter();
  return (
    <Dropdown>
      <DropdownToggle>{i18next.t("leaderboard.title-stars")}</DropdownToggle>
      <DropdownMenu align="left">
        {["day", "week", "month"].map((f) => (
          <DropdownItem key={f} onClick={() => router.push("", { params: { period: f } })}>
            {i18next.t(`leaderboard.period-${f}`)}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
