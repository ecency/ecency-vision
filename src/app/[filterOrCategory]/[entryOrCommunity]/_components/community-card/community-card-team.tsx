import i18next from "i18next";
import { accountGroupSvg } from "@ui/svg";
import React, { useMemo } from "react";
import { Community } from "@/entities";
import { DialogInfo } from "@/app/[filterOrCategory]/[entryOrCommunity]/types";
import { ProfileLink } from "@/features/shared";

interface Props {
  community: Community;
  toggleInfo: (info: DialogInfo) => void;
}

export function CommunityCardTeam({ community, toggleInfo }: Props) {
  const team = useMemo(
    () =>
      community.team.map((m, i) => {
        if (m[0].startsWith("hive-")) {
          return <></>;
        }

        return (
          <div className="team-member" key={i}>
            <ProfileLink username={m[0]}>
              <span className="username">{`@${m[0]}`}</span>
            </ProfileLink>
            <span className="role">{m[1]}</span>
            {m[2] !== "" && <span className="extra">{m[2]}</span>}
          </div>
        );
      }),
    [community.team]
  );

  return (
    <div className="community-section section-team">
      <div
        className="section-header"
        onClick={() => toggleInfo({ title: i18next.t("community-card.team"), content: team })}
      >
        {accountGroupSvg} {i18next.t("community-card.team")}
      </div>
      <div className="section-content"></div>
    </div>
  );
}
