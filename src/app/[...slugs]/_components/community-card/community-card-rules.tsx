import React, { useMemo } from "react";
import { Community } from "@/entities";
import { nl2list } from "@/utils";
import { scriptTextOutlineSvg } from "@ui/svg";
import i18next from "i18next";
import { DialogInfo } from "@/app/[...slugs]/types";

interface Props {
  community: Community;
  toggleInfo: (payload: DialogInfo) => void;
}

export function CommunityCardRules({ community, toggleInfo }: Props) {
  const hasRules = useMemo(() => community.flag_text.trim() !== "", [community]);
  const rules = useMemo(
    () =>
      nl2list(community.flag_text).map((x, i) => (
        <p key={i}>
          {"- "}
          {x}
        </p>
      )),
    [community.flag_text]
  );

  return (
    hasRules && (
      <div className="community-section">
        <div
          className="section-header"
          onClick={() => toggleInfo({ title: i18next.t("community-card.rules"), content: rules })}
        >
          {scriptTextOutlineSvg} {i18next.t("community-card.rules")}
        </div>
        <div className="section-content">{rules}</div>
      </div>
    )
  );
}
