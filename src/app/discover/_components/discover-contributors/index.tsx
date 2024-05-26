"use client";

import React from "react";
import "./_index.scss";
import { syncSvg } from "@ui/svg";
import i18next from "i18next";
import { useContributorsQuery } from "@/api/queries";
import { ProfileLink, UserAvatar } from "@/features/shared";

export function DiscoverContributors() {
  let { data, refetch } = useContributorsQuery();

  return (
    <div className="discover-contributors-list">
      <div className="list-header">
        <h1>
          <div className="list-title">{i18next.t("contributors.title")}</div>
        </h1>
        <div className="list-refresh" onClick={() => refetch()}>
          {syncSvg}
        </div>
      </div>

      {data && data.length > 0 && (
        <div className="list-body">
          {data.map((c, i) => (
            <div className="list-item" key={i}>
              <ProfileLink username={c.name}>
                <span>
                  <UserAvatar username={c.name} size="medium" />
                </span>
              </ProfileLink>
              <div className="user-info">
                <ProfileLink username={c.name}>
                  <span className="display-name">{c.name}</span>
                </ProfileLink>
                <ProfileLink username={c.name}>
                  <span className="name notranslate">
                    {" "}
                    {"@"}
                    {c.name}
                  </span>
                </ProfileLink>
                <div className="about">{c.contributes.join(", ")}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
