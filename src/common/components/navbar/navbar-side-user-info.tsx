import React from "react";
import UserAvatar from "../user-avatar";
import { useMappedStore } from "../../store/use-mapped-store";
import { _t } from "../../i18n";
import { chevronUpSvg } from "../../img/svg";
import { downVotingPower, votingPower } from "../../api/hive";
import { FullAccount } from "../../store/accounts/types";

export function NavbarSideUserInfo() {
  const { activeUser } = useMappedStore();

  return (
    <div className="flex items-center gap-3">
      <UserAvatar username={activeUser!.username} size="medium" />
      {activeUser!.data && (
        <div>
          <div className="font-semibold">{activeUser?.username}</div>
          <div className="flex items-center text-xs opacity-50">
            <div>{_t("user-nav.vote-power")}</div>
            <div className="flex items-center">
              <div className="[&>svg]:w-6">
                {chevronUpSvg}
                {votingPower(activeUser!.data as FullAccount).toFixed(0)}
                {"%"}
              </div>
              <div className="[&>svg]:w-6 [&>svg]:rotate-180">
                {chevronUpSvg}
                {downVotingPower(activeUser!.data as FullAccount).toFixed(0)}
                {"%"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
