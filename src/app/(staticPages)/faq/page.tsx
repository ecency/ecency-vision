import { apiBase } from "@/api/helper";
import { Feedback, Navbar, ScrollToTop, Theme } from "@/features/shared";
import { Metadata, ResolvingMetadata } from "next";
import i18next from "i18next";
import { useGlobalStore } from "@/core/global-store";
import Image from "next/image";
import {
  FaqSearchBar,
  FaqSearchBarResultInfo,
  FaqSearchListener
} from "@/app/(staticPages)/faq/_components";
import { searchWithinFaq } from "@/app/(staticPages)/faq/utils";
import { Tsx } from "@/features/i18n/helper";
import { NavigationLocaleWatcher } from "@/features/i18n";
import { FaqSearchResult } from "@/app/(staticPages)/faq/_components/faq-search-result";
import { PagesMetadataGenerator } from "@/features/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  return PagesMetadataGenerator.getForPage("faq");
}

interface Props {
  searchParams: Record<string, string | undefined>;
}

export default function FAQ({ searchParams }: Props) {
  const canUseWebp = useGlobalStore((state) => state.canUseWebp);
  const faqImage = apiBase(`/assets/ecency-faq.${canUseWebp ? "webp" : "jpg"}`);

  const searchResult = searchWithinFaq(searchParams["q"] ?? "");

  return (
    <>
      <ScrollToTop />
      <Feedback />
      <Theme />
      <Navbar />
      <FaqSearchListener searchResult={searchResult} />
      <NavigationLocaleWatcher searchParams={searchParams} />

      <div
        className="app-content static-page faq-page"
        itemScope={true}
        itemType="https://schema.org/FAQPage"
      >
        <div className="static-content">
          <div className="relative rounded" style={{ marginBottom: "8%" }}>
            <Image alt="FAQ-image" width={1000} height={1000} src={faqImage} className="rounded" />
            <div className="absolute search-container flex justify-center items-center flex-col rounded p-3">
              <h1 className="text-white faq-title text-center mb-3">
                {i18next.t("static.faq.page-title")}
              </h1>
              <FaqSearchBar />
              <FaqSearchBarResultInfo />
            </div>
          </div>
          <FaqSearchResult />

          <div className="faq-list">
            {searchResult.map((x) => {
              return (
                <div
                  key={x}
                  className="faq-item"
                  itemScope={true}
                  itemProp="mainEntity"
                  itemType="https://schema.org/Question"
                >
                  <span className="anchor" id={x} />
                  <h4 className="faq-item-header text-[1.5rem] font-semibold" itemProp="name">
                    {i18next.t(`static.faq.${x}-header`)}
                  </h4>
                  <div
                    itemScope={true}
                    itemProp="acceptedAnswer"
                    itemType="https://schema.org/Answer"
                    id="content"
                  >
                    <Tsx k={`static.faq.${x}-body`}>
                      <div className="faq-item-body" itemProp="text" />
                    </Tsx>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
