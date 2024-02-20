import React from "react";
import UserAvatar from "../../user-avatar";
import { useMappedStore } from "../../../store/use-mapped-store";
import { _t } from "../../../i18n";
import { chevronUpSvg } from "../../../img/svg";
import { downVotingPower, votingPower } from "../../../api/hive";
import { FullAccount } from "../../../store/accounts/types";
import ProfileLink from "../../profile-link";
import { History } from "history";

export function NavbarSideUserInfo({ history }: { history: History }) {
  const { activeUser, addAccount } = useMappedStore();

  return (
    <div className="flex items-center gap-3">
      <ProfileLink history={history} username={activeUser!.username} addAccount={addAccount}>
        <UserAvatar username={activeUser!.username} size="medium" />
      </ProfileLink>
      {activeUser!.data && (
        <div>
          <div className="font-semibold">{activeUser?.username}</div>
          <div className="flex flex-col text-xs">
            <div className="flex items-center">
              <div className="[&>svg]:w-4 text-blue-dark-sky">
                {chevronUpSvg}
                {votingPower(activeUser!.data as FullAccount).toFixed(0)}
                {"%"}
              </div>
              <div className="[&>svg]:w-4 [&>svg]:rotate-180 text-red">
                {chevronUpSvg}
                {downVotingPower(activeUser!.data as FullAccount).toFixed(0)}
                {"%"}
              </div>
            </div>
            <div className="opacity-50">{_t("user-nav.vote-power")}</div>
          </div>
        </div>
      )}
    </div>
  );
}
