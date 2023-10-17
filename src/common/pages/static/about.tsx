import React, { Component } from "react";
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "../common";
import { _t } from "../../i18n";
import Meta from "../../components/meta";
import ScrollToTop from "../../components/scroll-to-top";
import Theme from "../../components/theme";
import { Tsx } from "../../i18n/helper";
import { Link } from "react-router-dom";
import {
  blogSvg,
  discordSvg,
  githubSvg,
  mailSvg,
  newsSvg,
  telegramSvg,
  twitterSvg
} from "../../img/svg";
import NavBar from "../../components/navbar";
import { connect } from "react-redux";
import { faqKeysGeneral } from "../../constants";

class AboutPage extends Component<PageProps> {
  render() {
    //  Meta config
    const metaProps = {
      title: _t("static.about.page-title")
    };

    const { global } = this.props;

    return (
      <>
        <Meta {...metaProps} />
        <ScrollToTop />
        <Theme global={this.props.global} />
        <NavBar history={this.props.history} />

        <div className={"app-content static-page about-page"}>
          <div className="about-cloud">
            <div className="up-cloud" />
            <div className="about-inner">
              <div className="about-content">
                <div className="arrow-1" />
                <div className="arrow-2" />
                <Tsx k="static.about.intro-title">
                  <h1 className="about-title" />
                </Tsx>
                <p>{_t("static.about.intro-content")}</p>
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
            <h2 className="faq-title">{_t("static.about.faq-title")}</h2>
            <div className="faq-links">
              {[...faqKeysGeneral].slice(0, 4).map((x) => {
                return (
                  <p key={x}>
                    <a className="faq-link" href={`/faq#${x}`}>
                      {_t(`static.faq.${x}-header`)}
                    </a>
                  </p>
                );
              })}
              <p>
                <Link to="/faq">{_t("static.about.faqs")}</Link>
              </p>
            </div>
          </div>

          <div className="contacts">
            <h2 className="contacts-title">{_t("static.about.contact-title")}</h2>
            <div className="contacts-links">
              <a
                className="contacts-link"
                target="_blank"
                href="https://ecency.com/@good-karma"
                rel="noopener noreferrer"
              >
                {blogSvg} {_t("static.about.contact-blog")}
              </a>
              <a
                className="contacts-link"
                target="_blank"
                href="https://ecency.com/@ecency"
                rel="noopener noreferrer"
              >
                {newsSvg} {_t("static.about.contact-news")}
              </a>
              <a
                className="contacts-link"
                target="_blank"
                href="mailto:info@esteem.app?subject=Feedback"
                rel="noopener noreferrer"
              >
                {mailSvg} {_t("static.about.contact-email")}
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
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(AboutPage);
