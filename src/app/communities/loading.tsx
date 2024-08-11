import i18next from "i18next";
import Link from "next/link";
import { InputSkeletonLoader } from "@ui/input";
import { useMemo } from "react";

export default function Loading() {
  const items = useMemo(() => new Array(24).fill(0), []);

  return (
    <div className="app-content communities-page">
      <div className="community-list">
        <div className="list-header">
          <h1 className="list-title">{i18next.t("communities.title")}</h1>
          <Link href="/communities/create" className="create-link">
            {i18next.t("communities.create")}
          </Link>
        </div>

        <div className="list-form">
          <div className="search">
            <InputSkeletonLoader />
          </div>

          <div className="sort">
            <InputSkeletonLoader />
          </div>
        </div>

        <div className="list-items">
          {items.map((_, i) => (
            <div className="flex items-center justify-between gap-2 mt-[25px]" key={i}>
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center gap-2">
                  <div className="w-[34px] rounded-full animate-pulse h-[34px] bg-blue-dark-sky-040 dark:bg-blue-dark-grey" />
                  <div className="w-full rounded animate-pulse h-[22px] bg-blue-dark-sky-040 dark:bg-blue-dark-grey" />
                </div>
                <div className="w-full rounded animate-pulse h-[55px] bg-blue-dark-sky-040 dark:bg-blue-dark-grey" />
                <div className="flex gap-2">
                  <div className="w-[100px] rounded animate-pulse h-[20px] bg-blue-dark-sky-040 dark:bg-blue-dark-grey" />
                  <div className="w-[100px] rounded animate-pulse h-[20px] bg-blue-dark-sky-040 dark:bg-blue-dark-grey" />
                  <div className="w-[100px] rounded animate-pulse h-[20px] bg-blue-dark-sky-040 dark:bg-blue-dark-grey" />
                </div>
                <div className="w-full rounded animate-pulse h-[20px] bg-blue-dark-sky-040 dark:bg-blue-dark-grey" />
              </div>
              <div className="w-[120px] rounded animate-pulse h-[34px] bg-blue-dark-sky-040 dark:bg-blue-dark-grey" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
