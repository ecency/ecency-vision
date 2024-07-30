import { Navbar, ProfileLink, ScrollToTop, Theme, UserAvatar } from "@/features/shared";
import i18next from "i18next";
import "./page.scss";
import { Tsx } from "@/features/i18n/helper";
import { getContributorsQuery } from "@/api/queries";
import { getQueryClient } from "@/core/react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata, ResolvingMetadata } from "next";
import { PagesMetadataGenerator } from "@/features/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  return PagesMetadataGenerator.getForPage("contributors");
}
export default async function Contributors() {
  const data = await getContributorsQuery().prefetch();

  return (
    <HydrationBoundary state={dehydrate(getQueryClient())}>
      <ScrollToTop />
      <Theme />
      <Navbar />

      <div className="app-content static-page contributors-page">
        <div className="contributors">
          <div className="contributors-list">
            <div className="list-header">
              <h1 className="list-title">{i18next.t("contributors.title")}</h1>
              <Tsx k="contributors.description">
                <div className="list-description" />
              </Tsx>
            </div>
            <div className="list-body">
              {data?.map((c) => (
                <div className="list-item" key={c.name}>
                  <div className="item-main">
                    <ProfileLink username={c.name}>
                      <UserAvatar username={c.name} size="small" />
                    </ProfileLink>

                    <div className="item-info">
                      <ProfileLink username={c.name}>
                        <span className="item-name notranslate">{c.name}</span>
                      </ProfileLink>
                    </div>
                  </div>
                  <div className="item-extra">{c.contributes.join(", ")}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </HydrationBoundary>
  );
}
