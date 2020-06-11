import React, { Component } from "react";
import { AnyAction, bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
import { History, Location } from "history";

import { AppState } from "../store";
import { State as GlobalState } from "../store/global/types";

import { toggleTheme } from "../store/global/index";

import Meta from "../components/meta";
import Theme from "../components/theme/index";
import NavBar from "../components/navbar/index";

import { _t } from "../i18n";

import { blogSvg, newsSvg, mailSvg, twitterSvg, githubSvg, telegramSvg, discordSvg } from "../img/svg";

import surferSs from "../img/surfer-ss.jpg";
import mobileSs from "../img/mobile-ss.jpg";

interface Props {
  history: History;
  location: Location;
  global: GlobalState;
  toggleTheme: () => void;
}

class AboutPage extends Component<Props> {
  render() {
    //  Meta config
    const metaProps = {};

    return (
      <>
        <Meta {...metaProps} />
        <Theme {...this.props} />
        <NavBar {...this.props} />

        <div className="app-content static-page about-page">
          <div className="about-cloud">
            <div className="up-cloud" />
            <div className="about-inner">
              <div className="about-content">
                <div className="arrow-1" />
                <div className="arrow-2" />
                <h1 className="about-title">
                  What is <span>Esteem</span>
                </h1>
                <p>
                  Esteem is beautiful and handy wrapper interface around the Hive blockchain network allowing you to
                  create your own posts, surf your feeds, vote what you like, write comments, read replies, do all major
                  Hive functions in your daily social surfing as well as wallet actions and other extras such as search,
                  discover different tags etc.
                </p>
              </div>
              <div className="sub-cloud">
                <div className="cloud-1" />
                <div className="cloud-2" />
                <div className="arrow-1" />
              </div>
            </div>
            <div className="down-cloud" />
          </div>

          <img src={surferSs} className="surfer-ss" alt="Esteem Surfer" />

          <div className="downloads" id="downloads">
            <h2 className="downloads-title">Downloads</h2>
            <div className="downloads-text">
              Enjoy Esteem for iPhone, iPad and Android, as well as PC, Mac or Linux devices:
            </div>
            <div className="download-buttons">
              <a
                className="download-button btn-desktop"
                target="_blank"
                href="https://github.com/EsteemApp/esteem-surfer/releases"
                rel="noopener noreferrer"
              >
                DESKTOP
              </a>
              <a
                className="download-button btn-ios"
                target="_blank"
                href="https://apps.apple.com/us/app/esteem-v2/id1451896376"
                rel="noopener noreferrer"
              >
                IOS
              </a>
              <a
                className="download-button btn-android"
                target="_blank"
                href="https://play.google.com/store/apps/details?id=app.esteem.mobile.android"
                rel="noopener noreferrer"
              >
                ANDROID
              </a>
            </div>
          </div>

          <img src={mobileSs} className="mobile-ss" alt="Esteem Mobile" />

          <div className="contacts">
            <h2 className="contacts-title">Contacts</h2>
            <div className="contacts-links">
              <a
                className="contacts-link"
                target="_blank"
                href="https://esteem.app/@good-karma"
                rel="noopener noreferrer"
              >
                {blogSvg} Founder's blog
              </a>
              <a
                className="contacts-link"
                target="_blank"
                href="https://esteem.app/@esteemapp"
                rel="noopener noreferrer"
              >
                {newsSvg} News on Hive
              </a>
              <a
                className="contacts-link"
                target="_blank"
                href="mailto:info@esteem.app?subject=Feedback"
                rel="noopener noreferrer"
              >
                {mailSvg} Email us
              </a>
              <a
                className="contacts-link"
                target="_blank"
                href="https://twitter.com/esteem_app"
                rel="noopener noreferrer"
              >
                {twitterSvg} Twitter
              </a>
              <a
                className="contacts-link"
                target="_blank"
                href="https://github.com/esteemapp"
                rel="noopener noreferrer"
              >
                {githubSvg} Github
              </a>
              <a className="contacts-link" target="_blank" href="https://t.me/esteemapp" rel="noopener noreferrer">
                {telegramSvg} Telegram
              </a>
              <a
                className="contacts-link"
                target="_blank"
                href="https://discordapp.com/invite/9cdhjc7"
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

class GuestPostPage extends Component<Props> {
  render() {
    //  Meta config
    const metaProps = {};

    return (
      <>
        <Meta {...metaProps} />
        <Theme {...this.props} />
        <NavBar {...this.props} />

        <div className="app-content static-page guest-post-page">
          <iframe
            title="Esteem contribution form"
            src="https://docs.google.com/forms/d/e/1FAIpQLSf3Pt8DQ79edkQK7XHrlIZkZYcueJvgJso6OXz2pgGCplLbaA/viewform?embedded=true"
            width="640"
            height="956"
            frameBorder={0}
            marginHeight={0}
            marginWidth={0}
          >
            Loading…
          </iframe>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state: AppState) => ({
  global: state.global,
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) =>
  bindActionCreators(
    {
      toggleTheme,
    },
    dispatch
  );

const AboutContainer = connect(mapStateToProps, mapDispatchToProps)(AboutPage);
export { AboutContainer };

const GuestPostContainer = connect(mapStateToProps, mapDispatchToProps)(GuestPostPage);
export { GuestPostContainer };
