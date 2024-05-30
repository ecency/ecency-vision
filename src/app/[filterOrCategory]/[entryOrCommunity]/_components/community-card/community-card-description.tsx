import React, { useMemo } from "react";
import { informationOutlineSvg } from "@ui/svg";
import i18next from "i18next";
import { Community } from "@/entities";
import { renderPostBody } from "@ecency/render-helper";
import { DialogInfo } from "@/app/[filterOrCategory]/[entryOrCommunity]/types";

interface Props {
  community: Community;
  toggleInfo: (payload: DialogInfo) => void;
}

export function CommunityCardDescription({ community, toggleInfo }: Props) {
  const description = useMemo(
    () =>
      community.description.trim() !== "" ? (
        <div
          className="preview-body markdown-view"
          dangerouslySetInnerHTML={{ __html: renderPostBody(community.description, true) }}
        />
      ) : (
        <></>
      ),
    [community.description]
  );

  return (
    description && (
      <div className="community-section">
        <div
          className="section-header"
          onClick={() => {
            toggleInfo({
              title: i18next.t("community-card.description"),
              content: description
            });
          }}
        >
          {informationOutlineSvg} {i18next.t("community-card.description")}
        </div>
        <div className="section-content">{description}</div>
      </div>
    )
  );
}
