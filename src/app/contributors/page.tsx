import { Navbar, ProfileLink, ScrollToTop, Theme, UserAvatar } from "@/features/shared";
import { Metadata } from "next";
import i18next from "i18next";
import "./page.scss";
import { Tsx } from "@/features/i18n/helper";
import { prefetchContributorsQuery } from "@/api/queries";
import { getPristineQueryClient } from "@/core/react-query";

export const metadata: Metadata = {
  title: i18next.t("contributors.title")
};

export default async function Contributors() {
  const client = getPristineQueryClient();
  const data = await prefetchContributorsQuery(client);

  return (
    <>
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
    </>
  );
}
