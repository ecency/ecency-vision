"use client";

import React, { Fragment, useCallback } from "react";
import "./_index.scss";
import { UilMultiply } from "@iconscout/react-unicons";
import { TagLink } from "@/features/shared/tag";
import { makePath } from "@/utils";
import { useGlobalStore } from "@/core/global-store";
import i18next from "i18next";
import { useRouter } from "next/navigation";
import { useTrendingTagsQuery } from "@/api/queries";

export function TrendingTagsCard() {
  const router = useRouter();

  const filter = useGlobalStore((s) => s.filter);
  const tag = useGlobalStore((s) => s.tag);
  const activeUser = useGlobalStore((s) => s.activeUser);

  const { data: trendingTags } = useTrendingTagsQuery();

  const handleUnselection = useCallback(() => {
    router.push("/" + filter + ((activeUser && activeUser.username && "/my") || ""));
  }, [activeUser, filter, router]);

  return (
    <div className="trending-tags-card">
      <h2 className="list-header">{i18next.t("trending-tags.title")}</h2>

      {trendingTags?.slice(0, 30).map((t) => (
        <Fragment key={t}>
          <div className="flex">
            <TagLink tag={t} type="link">
              <a
                href={makePath(filter, t)}
                className={`tag-list-item ${tag === t ? "selected-item" : ""} flex items-center`}
              >
                {t}
                {tag === t && (
                  <div
                    className="text-gray-600 dark:text-gray-400 ml-2 pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleUnselection();
                    }}
                  >
                    <UilMultiply size="16" />
                  </div>
                )}
              </a>
            </TagLink>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
