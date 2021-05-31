import React, { FormEvent, useState } from "react";
import htmlParse from 'html-react-parser';
import { subscribeEmail } from "../../api/private-api";
import { _t } from "../../i18n";
import { scrollDown } from "../../img/svg";
import { error, success } from "../feedback";
import LinearProgress from "../linear-progress";
import { apiBaseImage, apiBase } from "../../api/helper";
import { proxifyImageSrc } from "@ecency/render-helper";


const LandingPage = (props: any) => {

  const {global} = props;

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const BgHeroDark = apiBase(`/illustration_hero.${global.canUseWebp?"webp":"png"}`);
  const BgHeroLight = apiBase(`/illustration_hero_day.${global.canUseWebp?"webp":"png"}`);
  const EarnMoney = apiBase(`/illustration_earn_money.${global.canUseWebp?"webp":"png"}`);
  const WhaleCatchsFish = apiBase(`/illustration_true_ownership.${global.canUseWebp?"webp":"png"}`);
  const Decentralization = apiBase(`/illustration_decentralization.${global.canUseWebp?"webp":"png"}`);
  const MechanicFish = apiBase(`/illustration_open_source.${global.canUseWebp?"webp":"png"}`);
  const FishOne = apiBase(`/fish_1.${global.canUseWebp?"webp":"png"}`);
  const FishTwo = apiBase(`/fish_2.${global.canUseWebp?"webp":"png"}`);
  const FishThree = apiBase(`/fish_3.${global.canUseWebp?"webp":"png"}`);
  const FishFour = apiBase(`/fish_4.${global.canUseWebp?"webp":"png"}`);
  const FishFive = apiBase(`/fish_5.${global.canUseWebp?"webp":"png"}`);
  const JuniorFish = apiBase(`/fish_junior.${global.canUseWebp?"webp":"png"}`);
  const SeniorFish = apiBase(`/fish_senior.${global.canUseWebp?"webp":"png"}`);
  const DownloadAndroid = apiBase(`/icon_android.${global.canUseWebp?"webp":"png"}`);
  const OurHistory = apiBase(`/our_history.${global.canUseWebp?"webp":"png"}`);
  const OurTeam = apiBase(`/our_team.${global.canUseWebp?"webp":"png"}`);
  const OurVision = apiBase(`/our_vision.${global.canUseWebp?"webp":"png"}`);
  const FooterMainFish = apiBase(`/footer_main_fish.${global.canUseWebp?"webp":"png"}`);
  const FounderImg = proxifyImageSrc(`${apiBaseImage('/u/good-karma/avatar/large')}`, 0, 0, global.canUseWebp ? 'webp' : 'match');
  const DevopsImg = proxifyImageSrc(`${apiBaseImage('/u/talhasch/avatar/large')}`, 0, 0, global.canUseWebp ? 'webp' : 'match');
  const DesignGuru = proxifyImageSrc(`${apiBaseImage('/u/dunsky/avatar/large')}`, 0, 0, global.canUseWebp ? 'webp' : 'match');
  const DownloadAndroidWhite = require("../../img/icon_android-white.svg");
  const DownloadIPhone = require("../../img/icon_apple.svg");
  const DownloadIPhoneWhite = require("../../img/icon_apple-white.svg");
  const DownloadWindows = require("../../img/icon_windows.svg");
  const DownloadWindowsWhite = require("../../img/icon_windows-white.svg");
  const FooterYoutube = require("../../img/footer-youtube.svg");
  const FooterTwitter = require("../../img/footer-twitter.svg");
  const FooterTelegram = require("../../img/footer-telegram.svg");
  const FooterDiscord = require("../../img/footer-discord.svg");
  const LogoCircle = require("../../img/logo-circle.svg");

  const handleSubsccribe = async (e: FormEvent<HTMLDivElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await subscribeEmail(email);
      if(200 == response?.status) {
        success(_t("landing-page.success-message-subscribe"))
      } 
    } catch (err) {
      error(_t('landing-page.error-occured'));
    }

    setEmail("");
    setLoading(false)
  };
  
  return (
    <div className="landing-wrapper">
      <div className="top-bg" />
      <img 
        className="tob-bg-illustration-light" 
        src={BgHeroLight}
        alt="algaes"
        loading="lazy"/>
      <img 
        className="tob-bg-illustration-dark" 
        src={BgHeroDark}
        alt="algaes"
        loading="lazy"/>
      <div className="tob-bg-algae" />
      <div className="tob-bg-fishes" />
      <div className="sections first-section">
        <h1>{_t("landing-page.welcome-text")}</h1>
        <div>
          <p>{_t("landing-page.what-is-ecency")}</p>
          <p>{_t("landing-page.powered-by-hive")}</p>
        </div>
        <button
          className="get-started"
          onClick={() => props.changeState({ step: 2 })}
        >
          {_t("landing-page.get-started")}
        </button>
        <a className="scroll-down" href="#earn-money">
          {scrollDown}
        </a>
      </div>
      <div className="sections second-section" id="earn-money">
        <div className="part-top">
          <div className="inner">
            <img src={EarnMoney} alt="earn-money" loading="lazy" />
            <div className="text-group visible">
              <h2>{_t("landing-page.earn-money")}</h2>
              <p>
                {_t("landing-page.earn-money-block-chain-based")}
                <span>
                  <a href="/signup?referral=ecency">
                    {_t("landing-page.join-us")}
                  </a>
                </span>
                {_t("landing-page.various-digital-tokens")}
              </p>
              <a className="link-read-more" href="/faq">
                {_t("landing-page.read-more")}
              </a>
            </div>
          </div>
        </div>
        <img
          className="landing-floating-image"
          src={WhaleCatchsFish}
          alt="whale"
          loading="lazy"
        />

        <div className="part-bottom">
          <div className="inner">
            <div className="text-group">
              <h2>{_t("landing-page.true-ownership")}</h2>
              <p>{_t("landing-page.true-ownership-desc")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="sections third-section">
        <div className="part-top">
          <div className="inner">
            <img
              className="decentralization-img"
              src={Decentralization}
              alt="decentralization"
              loading="lazy"
            />
            <div className="text-group visible">
              <h2>{_t("landing-page.decentralization")}</h2>
              <p>
                <span>
                  <a href="https://hive.io" target="_blank">
                    {_t("landing-page.hive-blockchain")}
                  </a>
                </span>{" "}
                {_t("landing-page.decentralization-desc")}
              </p>
            </div>
          </div>
        </div>
        <img
          className="landing-floating-image mechanic"
          src={MechanicFish}
          alt="mechanic"
          loading="lazy"
        />
        <div className="part-bottom">
          <div className="inner">
            <div className="text-group">
              <h2>{_t("landing-page.open-source")}</h2>
              <p>
                {_t("landing-page.open-source-desc")}
                <span>
                  <a className="no-break" href="/signup?referral=ecency">
                    {_t("landing-page.feel-free-join")}
                  </a>
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="sections fourth-section">
        <div className="part-top">
          <div className="inner">
            <div className="fish-container">
              <img className="fish three" src={FishThree} alt="earn-money" loading="lazy" />
              <img className="fish five" src={FishFive} alt="earn-money" loading="lazy" />
              <img className="fish four" src={FishFour} alt="earn-money" loading="lazy" />
            </div>
            <div className="fish-container">
              <img className="fish one" src={FishOne} alt="earn-money" loading="lazy" />
              <img className="fish two" src={FishTwo} alt="earn-money" loading="lazy" />
            </div>
            <ul>
              <li>
                <h3>92M</h3>
                <p>{_t("landing-page.posts")}</p>
              </li>
              <li>
                <h3>300K</h3>
                <p>{_t("landing-page.unique-visitors")}</p>
              </li>
            </ul>
            <ul>
              <li>
                <h3>15M</h3>
                <p>{_t("landing-page.points-distrubuted")}</p>
              </li>
              <li>
                <h3>25K</h3>
                <p>{_t("landing-page.new-users")}</p>
              </li>
            </ul>
          </div>
        </div>
        <div className="part-bottom">
          <div className="inner">
            <span />
            <span />
            <div className="text-group">
              <h2>{_t("landing-page.download-our-application")}</h2>
              <p>{_t("landing-page.download-our-application-desc")}</p>
              <a
                className="windows"
                href="https://desktop.ecency.com/"
                target="blank"
              >
                <img
                  src={
                    props?.global?.theme === "day"
                      ? DownloadWindows
                      : DownloadWindowsWhite
                  }
                  alt="Download for Windows"
                />
                {_t("landing-page.download-for-windows")}
              </a>
              <a href="https://ios.ecency.com/" target="blank">
                <img
                  src={
                    props?.global?.theme === "day"
                      ? DownloadIPhone
                      : DownloadIPhoneWhite
                  }
                  alt="Download for IOS"
                />
                {_t("landing-page.download-for-ios")}
              </a>
              <a href="https://android.ecency.com/" target="blank">
                <img
                  src={
                    props?.global?.theme === "day"
                      ? DownloadAndroid
                      : DownloadAndroidWhite
                  }
                  alt="Download for Android"
                />
                {_t("landing-page.download-for-android")}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="sections fifth-section">
        <div className="part-top">
          <div className="inner">
            <div className="text-group">
              <h2>{_t("landing-page.our-history")}</h2>
              <p>{htmlParse(_t('landing-page.our-history-p-one'))}</p>
              <p>{_t("landing-page.our-history-p-two")}</p>
            </div>
            <img className="our-history" src={OurHistory} alt="Our History" loading="lazy"/>
          </div>
        </div>
        <div className="part-bottom">
          <div className="inner">
            <img className="our-vision" src={OurVision} alt="Our Vision" loading="lazy" />

            <div className="text-group">
              <h2>{_t("landing-page.our-vision")}</h2>
              <p>{htmlParse(_t('landing-page.our-vision-p-one'))}</p>
              <p>{htmlParse(_t('landing-page.our-vision-p-two'))}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="sections sixth-section">
        <div className="part-top">
          <div className="inner">
            <div className="text-group">
              <h2>{_t("landing-page.our-team")}</h2>
              <ul>
                <li>
                  <img src={FounderImg} alt="Founder" loading="lazy" />
                  <div className="text-wrapper">
                    <a href="/@good-karma">@good-karma</a>
                    <p>{_t("landing-page.founder")}</p>
                  </div>
                </li>
                <li>
                  <img src={DevopsImg} alt="Devops" loading="lazy"/>
                  <div className="text-wrapper">
                    <a href="/@talhasch">@talhasch</a>
                    <p>{_t("landing-page.devops-guru")}</p>
                  </div>
                </li>
                <li>
                  <img src={DesignGuru} alt="Designer" loading="lazy"/>
                  <div className="text-wrapper">
                    <a href="/@dunsky">@dunsky</a>
                    <p>{_t("landing-page.design-guru")}</p>
                  </div>
                </li>
                <li className="last-element">
                  <a href="/contributors">{_t("landing-page.community-contributors")}</a>
                  <a href="/witnesses">{_t("landing-page.blockchain-witnesses")}</a>
                </li>
              </ul>
            </div>

            <div className="image-container">
              <img className="our-team together" src={OurTeam} alt="Our Team" loading="lazy" />
              <img
                className="our-team senior"
                src={SeniorFish}
                alt="Senior Fish"
              />
              <img
                className="our-team junior"
                src={JuniorFish}
                alt="Junior Fish"
                loading="lazy"
              />
            </div>
          </div>
        </div>
        <div className="part-bottom">
          <span className="left-fishes" />
          <img src={FooterMainFish} alt="Big fish" loading="lazy" className="main-fish" />
          <div className="inner">
            <div className="links-and-form">
              <div className="links">
                <ul className="first-column">
                  <li>
                    <a href="/about">{_t("landing-page.about")}</a>
                  </li>
                  <li>
                    <a href="/faq">{_t("landing-page.faq")}</a>
                  </li>
                  <li>
                    <a href="/terms-of-service">{_t("landing-page.terms-of-service")}</a>
                  </li>
                  <li>
                    <a href="/privacy-policy">{_t("landing-page.privacy-policy")}</a>
                  </li>
                </ul>
                <ul className="second-column">
                  <li>
                    <a href="/discover">{_t("landing-page.discover")}</a>
                  </li>
                  <li>
                    <p onClick={() => props.toggleUIProp("login")}>{_t("landing-page.sign-in")}</p>
                  </li>
                  <li>
                    <a href="/communities">{_t("landing-page.communities")}</a>
                  </li>
                  <li>
                    <a href="/faq">{_t("landing-page.help")}</a>
                  </li>
                </ul>
              </div>
              <div className="subscribe-form" onSubmit={handleSubsccribe}>
                <h2>{_t("landing-page.subscribe-us")}</h2>
                <form>
                  <input
                    type="email"
                    placeholder={_t("landing-page.enter-your-email-adress")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required={true}
                  />
                  <button disabled={loading}>{loading ? <span><LinearProgress /></span>  : _t("landing-page.send")}</button>
                </form>
                <div className="socials">
                  <p>{_t("landing-page.subscribe-paragraph")}</p>
                  <ul>
                    <li>
                      <a href="https://youtube.com/ecency">
                        <img src={FooterYoutube} alt="youtube" />
                      </a>
                    </li>
                    <li>
                      <a href="https://twitter.com/ecency_official">
                        <img src={FooterTwitter} alt="twitter" />
                      </a>
                    </li>
                    <li>
                      <a href="https://t.me/ecency">
                        <img src={FooterTelegram} alt="telegram" />
                      </a>
                    </li>
                    <li>
                      <a href="https://discord.me/ecency">
                        <img src={FooterDiscord} alt="discord" />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="site-icon">
              <a href="#">
                <img src={LogoCircle} alt="ecency logo" />
              </a>
              <p className="copy-right">{_t("landing-page.copy-rights")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
