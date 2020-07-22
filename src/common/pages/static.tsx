import React, {Component} from "react";
import {AnyAction, bindActionCreators, Dispatch} from "redux";
import {connect} from "react-redux";
import {History, Location} from "history";
import {Link} from "react-router-dom";

import {AppState} from "../store";
import {Global} from "../store/global/types";
import {TrendingTags} from "../store/trending-tags/types";
import {Account} from "../store/accounts/types";
import {User} from "../store/users/types";
import {ActiveUser} from "../store/active-user/types";
import {UI, ToggleType} from "../store/ui/types";

import {toggleTheme} from "../store/global";
import {fetchTrendingTags} from "../store/trending-tags";
import {setActiveUser, updateActiveUser} from "../store/active-user";
import {deleteUser, addUser} from "../store/users";
import {toggleUIProp} from "../store/ui";

import Meta from "../components/meta";
import Theme from "../components/theme/index";
import NavBar from "../components/navbar/index";

import {_t} from "../i18n";

import {blogSvg, newsSvg, mailSvg, twitterSvg, githubSvg, telegramSvg, discordSvg} from "../img/svg";

const surferSs = require("../img/surfer-ss.jpg");
const mobileSs = require("../img/mobile-ss.jpg");

const faqKeys = [
    'what-is-ecency',
    'what-is-hive',
    'what-is-difference',
    'why-choose-ecency',
    'how-ecency-works',
    'how-to-join',
    'how-to-signin',
    'how-referrals-work',
    'what-is-points',
    'where-tokens-come',
    'how-promotion-work',
    'how-boosting-work',
    'can-guest-post',
    'can-link-post',
    'how-to-transfer',
    'how-see-rewards',
    'when-claim-rewards',
    'what-are-rc',
    'how-boost-account',
    'what-spam-abuse',
]


interface Props {
    history: History;
    location: Location;
    global: Global;
    trendingTags: TrendingTags;
    users: User[];
    activeUser: ActiveUser | null;
    ui: UI;
    toggleTheme: () => void;
    fetchTrendingTags: () => void;
    addUser: (user: User) => void;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data: Account) => void;
    deleteUser: (username: string) => void;
    toggleUIProp: (what: ToggleType) => void;
}

class AboutPage extends Component<Props> {
    render() {
        //  Meta config
        const metaProps = {
            title: _t('static.about.page-title')
        };

        return (
            <>
                <Meta {...metaProps} />
                <Theme {...this.props} />
                <NavBar {...this.props} />

                <div className="app-content static-page about-page">
                    <div className="about-cloud">
                        <div className="up-cloud"/>
                        <div className="about-inner">
                            <div className="about-content">
                                <div className="arrow-1"/>
                                <div className="arrow-2"/>
                                <h1 className="about-title" dangerouslySetInnerHTML={{__html: _t('static.about.intro-title')}}/>
                                <p>{_t('static.about.intro-content')}</p>
                            </div>
                            <div className="sub-cloud">
                                <div className="cloud-1"/>
                                <div className="cloud-2"/>
                                <div className="arrow-1"/>
                            </div>
                        </div>
                        <div className="down-cloud"/>
                    </div>

                    <img src={surferSs} className="surfer-ss" alt="Esteem Surfer"/>

                    <div className="downloads" id="downloads">
                        <h2 className="downloads-title">Downloads</h2>
                        <div className="downloads-text">
                            Enjoy Ecency for iPhone, iPad and Android, as well as PC, Mac or Linux devices:
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

                    <img src={mobileSs} className="mobile-ss" alt="Ecency Mobile"/>

                    <div className="faq">
                        <h2 className="faq-title">{_t('static.about.faq-title')}</h2>
                        <div className="faq-links">
                            {faqKeys.slice(0, 4).map(x => {
                                return <p key={x}>
                                    <a className="faq-link" href={`/faq#${x}`}>{_t(`static.faq.${x}-header`)}</a>
                                </p>
                            })}
                            <p><Link to="/faq">{_t('static.about.faqs')}</Link></p>
                        </div>
                    </div>

                    <div className="contacts">
                        <h2 className="contacts-title">{_t('static.about.contact-title')}</h2>
                        <div className="contacts-links">
                            <a
                                className="contacts-link"
                                target="_blank"
                                href="https://ecency.com/@good-karma"
                                rel="noopener noreferrer"
                            >
                                {blogSvg} {_t('static.about.contact-blog')}
                            </a>
                            <a
                                className="contacts-link"
                                target="_blank"
                                href="https://ecency.com/@ecency"
                                rel="noopener noreferrer"
                            >
                                {newsSvg} {_t('static.about.contact-news')}
                            </a>
                            <a
                                className="contacts-link"
                                target="_blank"
                                href="mailto:info@esteem.app?subject=Feedback"
                                rel="noopener noreferrer"
                            >
                                {mailSvg} {_t('static.about.contact-email')}
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
                                href="https://github.com/ecency"
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

class GuestPostPage extends Component
    <Props> {
    render() {
        //  Meta config
        const metaProps = {
            title: "Guest Posts",
        };

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

class ContributePage extends Component<Props> {
    render() {
        //  Meta config
        const metaProps = {
            title: "Contribute",
        };

        return (
            <>
                <Meta {...metaProps} />
                <Theme {...this.props} />
                <NavBar {...this.props} />

                <div className="app-content static-page contribute-page">
                    <div className="static-content">
                        <h1 className="page-title">Contribute to Esteem</h1>
                        <p>
                            Esteem is a decentralized platform which rewards contributors. Content on platform is 100% user generated.
                            You can <a href="https://esteem.app/signup">signup to get your own account</a> and start earning
                            cryptocurrency. If you do not mind for rewards, you can get publicity for free, just fill out form below
                            and we will make sure to handle rest.
                        </p>
                        <ul>
                            <li>
                                To submit a contribution, <a href="https://esteem.app/guest-posts">click here</a>.
                            </li>
                            <li>Comments on your content will be emailed to your provided address.</li>
                        </ul>
                        <h3 id="topics">Topics</h3>
                        <p>
                            Our ambit is broad, you can post about anything that is original and has proper references. We stand
                            against Plagiarism!
                        </p>
                        <h2 id="submit">Submit</h2>
                        <p>
                            We accept contributions through <a href="https://esteem.app/guest-posts">this form</a>. For formating your
                            post use{" "}
                            <a href="https://hackmd.io" target="_blank" rel="noopener noreferrer">
                                Hackmd
                            </a>
                            , it is great tool to format your posts which will show perfectly. You can put content of your post inside
                            form. It is acceptable to publish existing content that you have the right to republish. Please review the
                            format instructions above before submitting.
                        </p>
                        <h2 id="faq">FAQ</h2>
                        <ol>
                            <li>
                                <em>Can I re-publish my contribution to Esteem on another site?</em> Yes. All that we request is that
                                you link back to the Esteem article.
                            </li>
                            <li>
                                <em>Can I re-use a previously published article?</em> Yes, if we believe your article is relevant to a
                                general audience.
                            </li>
                        </ol>
                    </div>
                </div>
            </>
        );
    }
}

class PrivacyPage extends Component<Props> {
    render() {
        //  Meta config
        const metaProps = {
            title: "Privacy Policy",
        };

        return (
            <>
                <Meta {...metaProps} />
                <Theme {...this.props} />
                <NavBar {...this.props} />

                <div className="app-content static-page privacy-page">
                    <div className="static-content">
                        <h1 className="page-title">Privacy Policy</h1>
                        <p>
                            1) We want you to understand how and why esteem.app (“Esteem,” “we” or “us”) collects, uses, and shares
                            information about you when you access and use Esteem mobile apps, widgets, and other online products and
                            services (collectively, the &quot;Services&quot;) or when you otherwise interact with us.
                        </p>
                        <h1>Information You Provide To Us</h1>
                        <p>
                            2) We collect information you provide directly to us when you use our Services. Depending on which Service
                            you use, we may collect different information about you. This includes:
                        </p>
                        <h3>Information Regarding Your Use of the Services</h3>
                        <p>
                            3) We collect the content and other information you provide when you use our Services. This includes
                            information used to create your account (e.g., a username, an email address, phone number), account
                            preferences, and the content of information you post to the Services (e.g., text, photos, videos, links).
                        </p>
                        <h3>Transactional Information</h3>
                        <p>
                            4) If you purchase products or services from us (e.g., Hive Power), we will collect certain information
                            from you, including your name, address, email address, and information about the product or service you
                            are purchasing. Payments are processed by third-party payment processors (e.g., Stripe and PayPal), so
                            please refer to the applicable processor’s terms and privacy policy for more information about how payment
                            information is processed and stored.
                        </p>
                        <h3>Other Information</h3>
                        <p>
                            5) You may choose to provide other information directly to us. For example, we may collect information
                            when you fill out a form, participate in contests, sweepstakes or promotions, apply for a job, communicate
                            with us via third-party sites and services, request customer support or otherwise communicate with us.
                        </p>
                        <h1>Information We Collect Automatically</h1>
                        <p>
                            6) When you access or use our Services, we may also automatically collect information about you. This
                            includes:
                        </p>
                        <h3>Log and Usage Data</h3>
                        <p>
                            7) We may log information when you access and use the Services. This may include your IP address,
                            user-agent string, browser type, operating system, referral URLs, device information (e.g., device IDs),
                            pages visited, links clicked, user interactions (e.g., voting data), the requested URL, hardware settings,
                            and search terms.
                        </p>
                        <h3>Information from Cookies</h3>
                        <p>
                            8) We may receive information from cookies, which are pieces of data your browser stores and sends back to
                            us when making requests. We use this information to improve your experience, understand user activity, and
                            improve the quality of our Services. For example, we store and retrieve information about your preferred
                            language and other settings. For more information on how you can disable cookies, please see “Your
                            Choices” below.
                        </p>
                        <h3>Location Information</h3>
                        <p>
                            9) With your consent, we may collect information about the specific location of your mobile device (for
                            example, by using GPS or Bluetooth). You can revoke this consent at any time by changing the preferences
                            on your device, but doing so may affect your ability to use all of the features and functionality of our
                            Services.
                        </p>
                        <h1>Social Sharing</h1>
                        <p>
                            10) We may offer social sharing features or other integrated tools that let you share content or actions
                            you take on our Services with other media. Your use of these features enables the sharing of certain
                            information with your friends or the public, depending on the settings you establish with the third party
                            that provides the social sharing feature. For more information about the purpose and scope of data
                            collection and processing in connection with social sharing features, please visit the privacy policies of
                            the third parties that provide these social sharing features (e.g., Tumblr, Facebook, Reddit, Pinterest,
                            and Twitter).
                        </p>
                        <h1>How We Use Information About You</h1>
                        <p>
                            11) Our primary purpose in collecting personal information is to provide you with a secure, smooth,
                            efficient, and customized experience. We may use your personal information to:
                        </p>
                        <ul>
                            <li>Provide Esteem Services and customer support you request;</li>
                            <li>Process transactions and send notices about your transactions;</li>
                            <li>Resolve disputes, collect fees, and troubleshoot problems;</li>
                            <li>
                                Prevent and investigate potentially prohibited or illegal activities, and/or violations of our posted
                                user terms;
                            </li>
                            <li>
                                Customize, measure, and improve Esteem Services and the content and layout of our website and
                                applications;
                            </li>
                            <li>
                                Deliver targeted marketing, service update notices, and promotional offers based on your communication
                                preferences; and
                            </li>
                            <li>Compare information for accuracy and verify it with third parties.</li>
                        </ul>
                        <p>
                            We will not use your personal information for purposes other than those purposes we have disclosed to you,
                            without your permission. From time to time we may request your permission to allow us to share your
                            personal information with third parties. You may opt out of having your personal information shared with
                            third parties, or from allowing us to use your personal information for any purpose that is incompatible
                            with the purposes for which we originally collected it or subsequently obtained your authorization. If you
                            choose to so limit the use of your personal information, certain features or Esteem Services may not be
                            available to you.
                        </p>
                        <h1>Marketing</h1>
                        <p>
                            12) We will not sell or rent your personal information to third parties. We may combine your information
                            with information we collect from other companies and use it to improve and personalize Esteem Services,
                            content, and advertising.
                        </p>
                        <h1>How We Share Information With Other Parties</h1>
                        <p>13) We may share your personal information with:</p>
                        <ul>
                            <li>
                                Service providers under contract who help with parts of our business operations such as fraud
                                prevention, bill collection, marketing, and technology services. Our contracts dictate that these
                                service providers only use your information in connection with the services they perform for us and not
                                for their own benefit;
                            </li>
                            <li>Financial institutions with which we partner;</li>
                            <li>
                                Companies or other entities that we plan to merge with or be acquired by. Should such a combination
                                occur, we will require that the new combined entity follow this Privacy Policy with respect to your
                                personal information. You will receive prior notice of any change in applicable policy;
                            </li>
                            <li>Law enforcement, government officials, or other third parties when:</li>
                            <li>We are compelled to do so by a subpoena, court order, or similar legal procedure; or</li>
                            <li>
                                We believe in good faith that the disclosure of personal information is necessary to prevent physical
                                harm or financial loss, to report suspected illegal activity or to investigate violations of our User
                                Agreement; and
                            </li>
                            <li>Other third parties with your consent or direction to do so.</li>
                        </ul>
                        <p>
                            Esteem will not sell or rent any of your personal information to third parties and only shares your
                            personal information with third parties as described in this policy. Before Esteem shares your information
                            with any third party that is not acting as an agent to perform tasks on behalf of and under the
                            instructions of Hive, Esteem will enter into a written agreement requiring that the third party to provide
                            at least the same level of privacy protection as required hereunder.
                        </p>
                        <p>
                            If you establish an Esteem account indirectly on a third party website or via a third party application,
                            any information that you enter on that website or application (and not directly on an Esteem website) will
                            be shared with the owner of the third party website or application and your information may be subject to
                            their privacy policies.
                        </p>
                        <h1>How You Can Access Or Change Your Personal Information</h1>
                        <p>
                            14) You are entitled to review, correct, or amend your personal information, or to delete that information
                            where it is inaccurate, and you may do so at any time by logging in to your account. This right shall only
                            be limited where the burden or expense of providing access would be disproportionate to the risks to your
                            privacy in the case in question, or where the rights of persons other than you would be violated. If you
                            close your S account, we will mark your account in our database as &quot;Closed,&quot; but will keep your
                            account information in our database for a period of time described above. This is necessary in order to
                            deter fraud, by ensuring that persons who try to commit fraud will not be able to avoid detection simply
                            by closing their account and opening a new account. However, if you close your account, your personally
                            identifiable information will not be used by us for any further purposes, nor sold or shared with third
                            parties, except as necessary to prevent fraud and assist law enforcement, as required by law, or in
                            accordance with this Privacy Policy.
                        </p>
                        <h1>Affiliations</h1>
                        <p>
                            15) The Services are not affiliated in any way with Hive.blog or Hive.blog, Inc. The Services utilize the
                            same, shared, public database (blockchain) as Hive.blog and other 3rd parties. Therefore, the content you
                            post through Esteem is availble to be read and displayed by Hive.blog or any 3rd party service that
                            utilizes the shared database.
                        </p>
                        <h1>Children under 13</h1>
                        <p>
                            16) Esteem is not intended or directed at individuals under the age of 13. Therefore, individuals under
                            the age of 13 may not create an account or otherwise access or use the Services.
                        </p>
                        <h1>Changes to Privacy Policy</h1>
                        <p>
                            17) We may change this Privacy Policy from time to time. If we do, we will let you know by revising the
                            date at the top of the policy. If we make a change to this policy that, in our sole discretion, is
                            material, we will provide you with additional notice. We encourage you to review the Privacy Policy
                            whenever you access or use our Services or otherwise interact with us to stay informed about our
                            information practices and the ways you can help protect your privacy. If you continue to use our Services
                            after Privacy Policy changes go into effect, you consent to the revised policy.
                        </p>
                        <p>
                            Questions or comments about Esteem may be directed to{" "}
                            <a href="mailto:info@esteem.app">
                                <strong>info@esteem.app</strong>
                            </a>
                        </p>
                    </div>
                </div>
            </>
        );
    }
}

class WhitePaperPage extends Component<Props> {
    render() {
        //  Meta config
        const metaProps = {
            title: "Whitepaper",
        };

        return (
            <>
                <Meta {...metaProps} />
                <Theme {...this.props} />
                <NavBar {...this.props} />

                <div className="app-content static-page white-paper-page">
                    <div className="static-content">
                        <h1 className="page-title">Whitepaper</h1>

                        <p>&nbsp;</p>
                        <p>&nbsp;</p>
                        <p>&nbsp;</p>
                        <p>&nbsp;</p>
                        <p>&nbsp;</p>
                        <p>&nbsp;</p>
                        <p>&nbsp;</p>
                        <p>&nbsp;</p>
                        <p>&nbsp;</p>
                        <p>&nbsp;</p>
                        <p>&nbsp;</p>
                        <p>&nbsp;</p>
                        <p>&nbsp;</p>
                        <p>&nbsp;</p>
                    </div>
                </div>
            </>
        );
    }
}

class TosPage extends Component<Props> {
    render() {
        //  Meta config
        const metaProps = {
            title: "Terms Of Service",
        };

        return (
            <>
                <Meta {...metaProps} />
                <Theme {...this.props} />
                <NavBar {...this.props} />

                <div className="app-content static-page white-paper-page">
                    <div className="static-content">
                        <h1 className="page-title">Terms Of Service</h1>
                        <p>&nbsp;</p>
                        <p>&nbsp;</p>
                        <p>&nbsp;</p>
                        <p>&nbsp;</p>
                        <p>&nbsp;</p>
                        <p>&nbsp;</p>
                        <p>&nbsp;</p>
                        <p>&nbsp;</p>
                        <p>&nbsp;</p>
                        <p>&nbsp;</p>
                        <p>&nbsp;</p>
                        <p>&nbsp;</p>
                        <p>&nbsp;</p>
                        <p>&nbsp;</p>
                    </div>
                </div>
            </>
        );
    }
}


class FaqPage extends Component<Props> {
    render() {
        //  Meta config
        const metaProps = {
            title: _t('static.faq.page-title')
        };

        return (
            <>
                <Meta {...metaProps} />
                <Theme {...this.props} />
                <NavBar {...this.props} />
                <div className="app-content static-page faq-page">
                    <div className="static-content">
                        <h1 className="page-title">{_t('static.faq.page-title')}</h1>
                        <img src='https://images.ecency.com/DQmNx7o8eD4CkbCn1rw8fRo96jNwPwDP6aV3siaKz6YRRWA/FAQ4.jpg'/>
                        <h3>{_t('static.faq.page-sub-title')}</h3>
                        <ul className="table-contents">
                            {faqKeys.map(x => {
                                return <li key={x}><a href={`#${x}`}>{_t(`static.faq.${x}-header`)}</a></li>
                            })}
                        </ul>
                        <div className="faq-list">
                            {faqKeys.map(x => {
                                return <div key={x} className="faq-item" id={x}>
                                    <h4 className="faq-item-header">{_t(`static.faq.${x}-header`)}</h4>
                                    <div className="faq-item-body" dangerouslySetInnerHTML={{__html: _t(`static.faq.${x}-body`)}}/>
                                </div>
                            })}
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

const mapStateToProps = (state: AppState) => ({
    global: state.global,
    trendingTags: state.trendingTags,
    users: state.users,
    activeUser: state.activeUser,
    ui: state.ui
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) =>
    bindActionCreators(
        {
            toggleTheme,
            fetchTrendingTags,
            addUser,
            setActiveUser,
            updateActiveUser,
            deleteUser,
            toggleUIProp
        },
        dispatch
    );

const AboutPageContainer = connect(mapStateToProps, mapDispatchToProps)(AboutPage);
export {AboutPageContainer};

const GuestPostPageContainer = connect(mapStateToProps, mapDispatchToProps)(GuestPostPage);
export {GuestPostPageContainer};

const ContributePageContainer = connect(mapStateToProps, mapDispatchToProps)(ContributePage);
export {ContributePageContainer};

const PrivacyPageContainer = connect(mapStateToProps, mapDispatchToProps)(PrivacyPage);
export {PrivacyPageContainer};

const WhitePaperPageContainer = connect(mapStateToProps, mapDispatchToProps)(WhitePaperPage);
export {WhitePaperPageContainer};

const TosPageContainer = connect(mapStateToProps, mapDispatchToProps)(TosPage);
export {TosPageContainer};

const FaqPageContainer = connect(mapStateToProps, mapDispatchToProps)(FaqPage);
export {FaqPageContainer};
