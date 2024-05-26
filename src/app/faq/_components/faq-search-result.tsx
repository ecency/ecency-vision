"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { searchWithinFaq } from "@/app/faq/utils";
import i18next from "i18next";
import Link from "next/link";
import { FaqCategory } from "@/app/faq/_components/faq-category";

export function FaqSearchResult() {
  const params = useSearchParams();

  const search = useMemo(() => params.get("q") ?? "", [params]);
  const searchResult = useMemo(() => searchWithinFaq(search), [search]);

  return search ? (
    <>
      <h3>{i18next.t("static.faq.page-sub-title")}</h3>
      <ul className="table-contents">
        {searchResult.map((x) => {
          return (
            <li key={x}>
              <Link href={"#" + x}>{i18next.t(`static.faq.${x}-header`)}</Link>
            </li>
          );
        })}
      </ul>
    </>
  ) : (
    <div className="category-cards">
      <FaqCategory
        categoryTitle={i18next.t(`static.faq.about-ecency`)}
        contentList={searchResult.slice(0, 5)}
      />
      <FaqCategory
        categoryTitle={i18next.t(`static.faq.working`)}
        contentList={searchResult.slice(5, 10)}
      />
      <FaqCategory
        categoryTitle={i18next.t(`static.faq.about-blockchain`)}
        contentList={searchResult.slice(10, 15)}
      />
      <FaqCategory
        categoryTitle={i18next.t(`static.faq.features`)}
        contentList={searchResult.slice(15, 34)}
      />
    </div>
  );
}
