"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import i18next from "i18next";
import Link from "next/link";
import { searchWithinFaqStrict } from "@/app/faq/utils";

export function FaqSearchBarResultInfo() {
  const params = useSearchParams();

  const search = useMemo(() => params.get("q") ?? "", [params]);
  const searchResult = useMemo(() => searchWithinFaqStrict(search), [search]);

  return search.length > 0 ? (
    <small className="text-white mt-2 sm:mt-3 w-[75%] text-center helper-text">
      {searchResult.length > 0 ? (
        i18next.t("static.faq.search", { search: `"${search}"` })
      ) : (
        <div className="text-not-found">
          {i18next.t("static.faq.search-not-found")}
          <Link href="https://discord.me/ecency" target="_blank">
            Discord
          </Link>
          .
        </div>
      )}
    </small>
  ) : (
    <></>
  );
}
