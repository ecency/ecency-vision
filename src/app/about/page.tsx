import { faqKeysGeneral } from "@/consts";
import { Navbar, ScrollToTop, Theme } from "@/features/shared";
import { Tsx } from "@/features/i18n/helper";
import i18next from "i18next";
import Link from "next/link";
import { blogSvg, discordSvg, githubSvg, mailSvg, newsSvg, telegramSvg, twitterSvg } from "@ui/svg";
import { Metadata, ResolvingMetadata } from "next";
import { PagesMetadataGenerator } from "@/features/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  return PagesMetadataGenerator.getForPage("about");
}

export default function About() {
  return (
    <>
      <Theme />
      <ScrollToTop />
      <Navbar />

      <div className="app-content static-page about-page">
        <div className="about-cloud">
          <div className="up-cloud" />
          <div className="about-inner">
            <div className="about-content">
              <div className="arrow-1" />
              <div className="arrow-2" />
              <Tsx k="static.about.intro-title">
                <h1 className="about-title" />
              </Tsx>
              <p>{i18next.t("static.about.intro-content")}</p>
            </div>
            <div className="sub-cloud">
              <div className="cloud-1" />
              <div className="cloud-2" />
              <div className="arrow-1" />
            </div>
          </div>
          <div className="down-cloud" />
        </div>

        <div className="downloads" id="downloads">
          <h2 className="downloads-title">Downloads</h2>
          <div className="downloads-text">
            Enjoy Ecency for iPhone, iPad and Android, as well as PC, Mac or Linux devices:
          </div>
          <div className="download-buttons">
            <a
              className="download-button btn-desktop"
              target="_blank"
              href="https://github.com/ecency/ecency-vision/releases"
              rel="noopener noreferrer"
            >
              DESKTOP
            </a>
            <a
              className="download-button btn-ios"
              target="_blank"
              href="https://ios.ecency.com"
              rel="noopener noreferrer"
            >
              IOS
            </a>
            <a
              className="download-button btn-android"
              target="_blank"
              href="https://android.ecency.com"
              rel="noopener noreferrer"
            >
              ANDROID
            </a>
          </div>
        </div>

        <div className="faq">
          <h2 className="faq-title">{i18next.t("static.about.faq-title")}</h2>
          <div className="faq-links">
            {[...faqKeysGeneral].slice(0, 4).map((x) => {
              return (
                <p key={x}>
                  <a className="faq-link" href={`/faq#${x}`}>
                    {i18next.t(`static.faq.${x}-header`)}
                  </a>
                </p>
              );
            })}
            <p>
              <Link href="/faq">{i18next.t("static.about.faqs")}</Link>
            </p>
          </div>
        </div>

        <div className="contacts">
          <h2 className="contacts-title">{i18next.t("static.about.contact-title")}</h2>
          <div className="contacts-links">
            <a
              className="contacts-link"
              target="_blank"
              href="https://ecency.com/@good-karma"
              rel="noopener noreferrer"
            >
              {blogSvg} {i18next.t("static.about.contact-blog")}
            </a>
            <a
              className="contacts-link"
              target="_blank"
              href="https://ecency.com/@ecency"
              rel="noopener noreferrer"
            >
              {newsSvg} {i18next.t("static.about.contact-news")}
            </a>
            <a
              className="contacts-link"
              target="_blank"
              href="mailto:info@esteem.app?subject=Feedback"
              rel="noopener noreferrer"
            >
              {mailSvg} {i18next.t("static.about.contact-email")}
            </a>
            <a
              className="contacts-link"
              target="_blank"
              href="https://twitter.com/ecency_official"
              rel="noopener noreferrer"
            >
              {twitterSvg} Twitter
            </a>
            <a
              className="contacts-link"
              target="_blank"
              href="https://github.com/ecency"
              rel="noopener noreferrer"
            >
              {githubSvg} Github
            </a>
            <a
              className="contacts-link"
              target="_blank"
              href="https://t.me/ecency"
              rel="noopener noreferrer"
            >
              {telegramSvg} Telegram
            </a>
            <a
              className="contacts-link"
              target="_blank"
              href="https://discord.me/ecency"
              rel="noopener noreferrer"
            >
              {discordSvg} Discord
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
