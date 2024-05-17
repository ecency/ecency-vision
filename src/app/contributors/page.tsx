import { Navbar, ProfileLink, ScrollToTop, Theme, UserAvatar } from "@/features/shared";
import { Metadata } from "next";
import i18next from "i18next";
import "./_index.scss";
import { Tsx } from "@/features/i18n/helper";
import contributors from "@/consts/contributors.json";
import { shuffle } from "remeda";

export const metadata: Metadata = {
  title: i18next.t("contributors.title")
};

export default function Contributors() {
  const shuffledContributors = shuffle(contributors);
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
              {shuffledContributors.map((c) => {
                const username = c.name;
                return (
                  <div className="list-item" key={username}>
                    <div className="item-main">
                      <ProfileLink username={username}>
                        <UserAvatar username={username} size="small" />
                      </ProfileLink>

                      <div className="item-info">
                        <ProfileLink username={username}>
                          <span className="item-name notranslate">{username}</span>
                        </ProfileLink>
                      </div>
                    </div>
                    <div className="item-extra">{c.contributes.join(", ")}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
