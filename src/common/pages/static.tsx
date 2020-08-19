import React, {Component} from "react";

import {connect} from "react-redux";

import {Link} from "react-router-dom";

import Meta from "../components/meta";
import Theme from "../components/theme/index";
import NavBar from "../components/navbar/index";

import {PageProps, pageMapDispatchToProps, pageMapStateToProps} from "./common";

import {_t} from "../i18n";

import {blogSvg, newsSvg, mailSvg, twitterSvg, githubSvg, telegramSvg, discordSvg} from "../img/svg";

const surferSs = require("../img/surfer-ss.jpg");
const mobileSs = require("../img/mobile-ss.jpg");

const faq = require("../img/FAQ4.jpg");
const faqWebp = require("../img/FAQ4-webp.webp");

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


class AboutPage extends Component<PageProps> {
    render() {
        //  Meta config
        const metaProps = {
            title: _t('static.about.page-title')
        };

        return (
            <>
                <Meta {...metaProps} />
                <Theme global={this.props.global}/>
                {NavBar({...this.props})}

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

class GuestPostPage extends Component <PageProps> {
    render() {
        //  Meta config
        const metaProps = {
            title: "Guest Posts",
        };

        return (
            <>
                <Meta {...metaProps} />
                <Theme global={this.props.global}/>
                {NavBar({...this.props})}

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

class ContributePage extends Component<PageProps> {
    render() {
        //  Meta config
        const metaProps = {
            title: "Contribute",
        };

        return (
            <>
                <Meta {...metaProps} />
                <Theme global={this.props.global}/>
                {NavBar({...this.props})}

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

class PrivacyPage extends Component<PageProps> {
    render() {
        //  Meta config
        const metaProps = {
            title: "Privacy Policy",
        };

        return (
            <>
                <Meta {...metaProps} />
                <Theme global={this.props.global}/>
                {NavBar({...this.props})}

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

class WhitePaperPage extends Component<PageProps> {
    render() {
        //  Meta config
        const metaProps = {
            title: "Whitepaper",
        };

        return (
            <>
                <Meta {...metaProps} />
                <Theme global={this.props.global}/>
                {NavBar({...this.props})}

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

class TosPage extends Component<PageProps> {
    render() {
        //  Meta config
        const metaProps = {
            title: "Terms Of Service",
        };

        return (
            <>
                <Meta {...metaProps} />
                <Theme global={this.props.global}/>
                {NavBar({...this.props})}

                <div className="app-content static-page white-paper-page">
                    <div className="static-content">
                        <h1 className="page-title">Terms Of Service</h1>
                        <p>Last Updated August 20, 2020</p>
                        <p>This agreement (the "Agreement") between you and this site’s operators ("we", "us", "our") sets out your rights to access and use of this site and any other products or services provided by this web site (the "Service"). If you are accepting this Agreement and using the Services on behalf of a company, organization, government, or other legal entity, you represent and warrant that you are authorized to do so and have the authority to bind such entity to this Agreement. By accessing our Service, you agree that you have read, understood and accepted this Agreement.</p>
                        <p>
                        If we decide to make changes to this Agreement, we will provide notice of those changes by updating the "Last Updated" date above or posting notice on this site. Your continued use of the Service will confirm your acceptance of the changes.
                        </p>
                        <h2>1. Privacy Policy</h2>
                        <p>Please refer to our Privacy Policy for information about how we collect, use, and disclose information about you.</p>
                        <h2>2. Eligibility</h2>
                        <p>The Service is not targeted toward, nor intended for use by, anyone under the age of 13. You must be at least 13 years of age to access or use of the Service. If you are between 13 and 18 years of age (or the age of legal majority where you reside), you may only access or use the Service under the supervision of a parent or legal guardian who agrees to be bound by this Agreement.</p>
                        <h2>3. Copyright and Limited License</h2>
                        <p>We may retain data, text, photographs, images, video, audio, graphics, articles, comments, software, code, scripts, and other content supplied by us, the Hive blockchain or our licensors, which we call "Hive Content."</p>
                        <p>You are granted a limited, non-exclusive, non-transferable, and non-sublicensable license to access and use the Service and Hive Content for your personal use. You retain ownership of and responsibility for Content you create or own ("Your Content"). If you're posting anything you did not create yourself or do not own the rights to, you agree that you are responsible for any Content you post; that you will only submit Content that you have the right to post; and that you will fully comply with any third-party licenses relating to Content you post.</p>
                        <h2>4. Trademark Policy</h2>
                        <p>"Ecency", the Ecency logo and any other product or service names, logos or slogans that may appear on Ecency are trademarks of Ecency and may not be copied, imitated or used, in whole or in part, without our prior written permission. You may not use any metatags or other "hidden text" utilizing "Ecency" or any other name, trademark or product or service name of Ecency without our prior written permission. In addition, the look and feel of Ecency, including, without limitation, all page headers, custom graphics, button icons and scripts, constitute the service mark, trademark or trade dress of Ecency and may not be copied, imitated or used, in whole or in part, without our prior written permission. All other trademarks, registered trademarks, product names and company names or logos mentioned or used on Ecency are the property of their respective owners and may not be copied, imitated or used, in whole or in part, without the permission of the applicable trademark holder. Reference to any products, services, processes or other information by name, trademark, manufacturer, supplier or otherwise does not constitute or imply endorsement, sponsorship or recommendation by Ecency.</p>
                        <h2>5. Assumption of Risk, Limitations on Liability.</h2>
                        <h5>5.1. You accept and acknowledge that there are risks associated with utilizing an Internet-based Hive blockchain account service including, but not limited to, the risk of failure of hardware, software and Internet connections, the risk of malicious software introduction, and the risk that third-parties may obtain unauthorized access to information stored within or associated with your Account, including, but not limited to your private key(s) ("Private Key"). You accept and acknowledge that we will not be responsible for any communication failures, disruptions, errors, distortions, or delays you may experience when using the Services, however caused.</h5>
                        <h5>5.2. We make no representation or warranty of any kind, express or implied, statutory, or otherwise, regarding the contents of the Service, information and functions made accessible through the Service, any hyperlinks to third-party websites, nor for any breach of security associated with the transmission of information through the Service or any website linked to by the Service.</h5>
                        <h5>5.3. We will not be responsible or liable to you for any loss and take no responsibility for and will not be liable to you for any use of our Services, including but not limited to any losses, damages or claims arising from: (a) User error such as forgotten passwords, incorrectly constructed transactions, or mistyped Hive blockchain addresses; (b) Server failure or data loss; (c) Corrupted Account files; (d) Unauthorized access to applications; (e) Any unauthorized third-party activities, including without limitation the use of viruses, phishing, brute forcing or other means of attack against the Service or Services.</h5>
                        <h5>5.4. We make no warranty that the Service or the server that makes it available, are free of viruses or errors, that its content is accurate, that it will be uninterrupted, or that defects will be corrected. We will not be responsible or liable to you for any loss of any kind, from action taken, or taken in reliance on material, or information, contained on the Service.</h5>
                        <h5>5.5. Subject to 6.1 below, any and all indemnities, warranties, terms, and conditions (whether express or implied) are hereby excluded to the fullest extent permitted.</h5>
                        <h5>5.6. We will not be liable, in contract, or tort (including, without limitation, negligence), other than where we have been fraudulent or made negligent misrepresentations.</h5>
                        <h5>5.7. Nothing in this Agreement excludes or limits liability for death or personal injury caused by negligence, fraudulent misrepresentation, or any other liability which may not otherwise be limited or excluded under United States law.</h5>
                        <h2>6. Agreement to Hold this Site's Operators Harmless</h2>
                        <h5>6.1. You agree to hold harmless this site (and its operators) from any claim, demand, action, damage, loss, cost, or expense, including without limitation reasonable legal fees, arising out, or relating to:</h5>
                        <p>6.1.1. Your use of, or conduct in connection with, our Services;</p>
                        <p>6.1.2. Your violation of any term in this Agreement; or</p>
                        <p>6.1.3. Violation of any rights of any other person or entity.</p>
                        <h5>6.2. If you are obligated to indemnify us, we will have the right, in our sole discretion, to control any action or proceeding (at our expense) and determine whether we will pursue a settlement of any action or proceeding.</h5>
                        <h2>7. No Liability for Third-Party Services and Content</h2>
                        <h5>7.1. In using our Services, you may view content or utilize services provided by third parties, including links to web pages and services of such parties (“Third-Party Content”). We do not control, endorse, or adopt any Third-Party Content and will have no responsibility for Third-Party Content including, without limitation, material that may be misleading, incomplete, erroneous, offensive, indecent, or otherwise objectionable in your jurisdiction. In addition, your dealings or correspondence with such third parties are solely between you and the third parties. We are not responsible or liable for any loss or damage of any sort incurred because of any such dealings and you understand that your use of Third-Party Content, and your interactions with third parties, is at your own risk.</h5>
                        <h2>8. Account Registration</h2>
                        <h5>8.1. You need not use a Hive blockchain account provided by us, and you can create an account independently of the Service. If you would like to use part of the Service, you must create a Hive blockchain account ("Account"). When you create an Account, you are strongly advised to take the following precautions, as failure to do so may result in loss of access to, and/or control over, your Account: (b) Provide accurate and truthful information; (c) maintain the security of your Account by protecting your Account password and access to your computer and your Account; (e) Promptly notify us if you discover or otherwise suspect any security breaches related to your Account.</h5>
                        <h5>8.2. You hereby accept and acknowledge that you take responsibility for all activities that occur under your Account and accept all risks of any authorized or unauthorized access to your Account, to the maximum extent permitted by law.</h5>
                        <h5>8.3. You acknowledge and understand that cryptography is a progressing field. Advances in code cracking or technical advances such as the development of quantum computers may present risks to the Services that you use and your Account, which could result in the theft or loss of your property. By using the Service or accessing Hive Content, you acknowledge these inherent risks.</h5>
                        <h2>9. The Services</h2>
                        <h5>9.1. As described in more detail below, the Services, among other things, provide software that facilitates the submission of Hive blockchain transaction data to the Hive blockchain without requiring you to access the Hive blockchain command line interface.</h5>
                        <h5>9.2. Account and Private Keys. Should you agree to create an Account through our Service, we generate a cryptographic private and public key pair that are provided solely to you and completely owned by you; provided however that we not store passwords or Private Keys for our you. We never have access to your Private Key and do not custody any Private Keys on your behalf, and therefore, assume no responsibility for the management of the Private Key tied to your Account. The Private Key uniquely match the Account name and must be used in connection with the Account to authorize the transfer of HIVE and Hive Dollars from that Account. You are solely responsible for maintaining the security of your Private Keys. You must keep your Private Key access information secure. Failure to do so may result in the loss of control of HIVE, Hive Power and Hive Dollars associated with your Account.</h5>
                        <h5>9.3. No Password Retrieval. We do not receive or store your Account password or Private Keys. Your Private Key is your own and you are solely responsible for their safekeeping. We cannot assist you with Account password retrieval, reset, or recovery. You are solely responsible for remembering your Account password. If you have not safely stored a backup of any Account and password pairs maintained in your Account, you accept and acknowledge that any HIVE, Hive Dollars and Hive Power you have associated with such Account will become permanently inaccessible if you do not have your Account password.</h5>
                        <h5>9.4. Transactions. All proposed Hive blockchain transactions must be confirmed and recorded in the Hive blockchain via the Hive distributed consensus network (a peer-to-peer network), which is not owned, controlled, or operated by us. The Hive blockchain is operated by a decentralized network of independent third parties. We have no control over the Hive blockchain and therefore cannot and will not ensure that any transaction details you submit via the Services will be confirmed on the Hive blockchain. You acknowledge and agree that the transaction details you submit via the Services may not be completed, or may be substantially delayed, by the Hive blockchain. You may use the Services to submit these details to the Hive blockchain.</h5>
                        <h5>9.5. No Storage or Transmission of HIVE, Hive Dollars or Hive Power. HIVE, in any of its forms (HIVE, Hive Dollars and Hive Power) is an intangible, digital asset controlled by you. These assets exist only by virtue of the ownership record maintained on the Hive blockchain. The Service does not store, send, or receive HIVE, Hive Dollars, or Hive Power. Any transfer of title that might occur in any HIVE, Hive Dollars or Hive Power occurs on the Hive blockchain and not within the Services. We do not guarantee that the Service can affect the transfer of title or right in any HIVE, Hive Dollars or Hive Power.</h5>
                        <h5>9.6. Relationship. Nothing in this Agreement is intended to nor shall create any partnership, joint venture, agency, consultancy, or trusteeship, between you and us.</h5>
                        <h5>9.7. Accuracy of Information. You represent and warrant that any information you provide via the Services is accurate and complete. You accept and acknowledge that we are not responsible for any errors or omissions that you make in connection with any Hive blockchain transaction initiated via the Services, for instance, if you mistype an Account name or otherwise provide incorrect information. We strongly encourage you to review your transaction details carefully before completing them via the Services.</h5>
                        <h5>9.8. No Cancellations or Modifications. Once transaction details have been submitted to the Hive blockchain via the Services, The Services cannot assist you to cancel or otherwise modify your transaction details. We have no control over the Hive blockchain and do not have the ability to facilitate any cancellation or modification requests.</h5>
                        <h5>9.9. Taxes. It is your responsibility to determine what, if any, taxes apply to the transactions you for which you have submitted transaction details via the Services, and it is your responsibility to report and remit the correct tax to the appropriate tax authority. You agree that the we are not responsible for determining whether taxes apply to your Hive blockchain transactions or for collecting, reporting, withholding, or remitting any taxes arising from any Hive blockchain transactions.</h5>
                        <h2>10. Fees for Using the Services</h2>
                        <h5>10.1. Fees Creating an Account. We do not currently charge fees for the creation of Accounts, however we reserve the right to do so in future, and in such case any applicable fees will be displayed prior to you using any Service to which a fee applies.</h5>
                        <h2>11. No Right to Cancel And/or Reverse Hive Transactions</h2>
                        <h5>11.1. If you use a Service to which HIVE, Hive Dollars or Hive Power is transacted, you will not be able to change your mind once you have confirmed that you wish to proceed with the Service or transaction.</h5>
                        <h2>12. Discontinuation of Services.</h2>
                        <h5>12.1. We may, in our sole discretion and without cost to you, with or without prior notice and at any time, modify or discontinue, temporarily or permanently, any portion of our Services. You are solely responsible for storing, outside of the Services, a backup of any Account and Private Key that you maintain in your Account.</h5>
                        <h5>12.2. If you do not maintain a backup of your Account data outside of the Services, you will be may not be able to access HIVE, Hive Dollars and Hive Power associated with any Account maintained in your Account if we discontinue or deprecate the Services.</h5>
                        <h2>13. Suspension or Termination of Service.</h2>
                        <h5>13.1. We may suspend or terminate your access to the Services in our sole discretion, immediately and without prior notice, and delete or deactivate your account and all related information and files in such without cost to you, including, for instance, if you breach any term of this Agreement. In the event of termination, your access to the funds in your account will require you access to the Hive blockchain via the command line API or third party tool, and will require you to have access to your backup of your Account data including your Account and Private Keys.</h5>
                        <h2>14. User Conduct</h2>
                        <h5>14.1. When accessing or using the Services, you agree that you will not commit any unlawful act, and that you are solely responsible for your conduct while using our Services. Without limiting the generality of the foregoing, you agree that you will not:</h5>
                        <p>14.1.1. Use of our Services in any manner that could interfere with, disrupt, negatively affect, or inhibit other users from fully enjoying our Services, or that could damage, disable, overburden, or impair the functioning of our Services in any manner;</p>
                        <p>14.1.2. Use our Services to pay for, support or otherwise engage in any activity prohibited by law, including, but not limited to illegal gambling, fraud, money-laundering, or terrorist financing activities.</p>
                        <p>14.1.3. Use or attempt to use another user’s Account without authorization;</p>
                        <p>14.1.4. Attempt to circumvent any content filtering techniques we employ, or attempt to access any service or area of our Services that you are not authorized to access;</p>
                        <p>14.1.5. Introduce to the Services any virus, Trojan, worms, logic bombs or other harmful material;</p>
                        <p>14.1.6. Encourage or induce any third-party to engage in any of the activities prohibited under this Section.</p>
                        <h2>15. Copyright Complaints, the DMCA, and Takedowns</h2>
                        <h5>15.1 We will respond to legitimate requests under the Digital Millennium Copyright Act ("DMCA"), and we retain the right to remove access to user content provided via the Service that we deem to be infringing the copyright of others. If you become aware of user content on the Service that infringes your copyright rights, you may submit a properly formatted DMCA request (see 17 U.S.C. § 512) to this site’s operator(s).</h5>
                        <p>Misrepresentations of infringement can result in liability for monetary damages. You may want to consult an attorney before taking any action pursuant to the DMCA. A DMCA request can be sent to us via the contact information below:</p>
                        <p>Copyright Agent</p>
                        <p><code>info@ecency.com</code></p>
                        <p>Please send our Copyright Agent the following information:</p>
                        <p>The electronic or physical signature of the owner of the copyright or the person authorized to act on the owner's behalf;</p>
                        <p>Identification of the copyrighted work claimed to have been infringed, or a representative list of such works;</p>
                        <p>The URL or Internet location of the materials claimed to be infringing or to be the subject of infringing activity, or information reasonably sufficient to permit us to locate the material;</p>
                        <p>Your name, address, telephone number, and email address;</p>
                        <p>A statement by you that you have a good faith belief that the disputed use of the material is not authorized by the copyright owner, its agent, or the law;</p>
                        <p>A statement by you, made under penalty of perjury, that the above information in your notice is accurate and that you are the copyright owner or are authorized to act on the copyright owner's behalf.</p>
                        <h5>15.2 Your right to file a counter-notice. If you believe your user content was wrongly removed due to a mistake or misidentification of the material, you can s end a counter-notice to our Copyright Agent (contact information provided above) that includes the following:</h5>
                        <p>Your physical or electronic signature;</p>
                        <p>Identification of the material that has been removed or to which access has been disabled and where the material was located online before it was removed or access to it was disabled;</p>
                        <p>A statement by you, under penalty of perjury, that you have a good faith belief that the material was removed or disabled because of mistake or misidentification of the material to be removed or disabled;</p>
                        <p>Your name, address, and telephone number, and a statement that you consent to the jurisdiction of federal district court for the judicial district in which the address is located, or if your address is outside of the United States, for any judicial district in which the service provider may be found, and that you will accept service of process from the person who provided notification under DMCA 512 subsection (c)(1)(c) or an agent of such person.</p>
                        <p>Upon receiving a counter-notice we will forward it to the complaining party and tell them we will restore your content within 10 business days. If that party does not notify us that they have filed an action to enjoin your use of that content on the Service before that period passes, we will consider restoring your user content to the site.</p>
                        <p>It is our policy to deny use of the Service to users we identify as repeat infringers. We apply this policy at our discretion and in appropriate circumstances, such as when a user has repeatedly been charged with infringing the copyrights or other intellectual property rights of others.</p>
                        <h2>16. Indemnity</h2>
                        <p>All the things you do and all the information you submit or post to the Service remain your responsibility. Indemnity is basically a way of saying that you will not hold us legally liable for any of your content or actions that infringe the law or the rights of a third party or person in any way.</p>
                        <p>Specifically, you agree to hold us, our affiliates, officers, directors, employees, agents, and third-party service providers harmless from and defend them against any claims, costs, damages, losses, expenses, and any other liabilities, including attorneys’ fees and costs, arising out of or related to your access to or use of the Service, your violation of this user agreement, and/or your violation of the rights of any third-party or person.</p>
                        <h2>17. Disclaimers</h2>
                        <p>To the fullest extent permitted by applicable law, the Service and the Hive Content are provided on an "as is" and "as available" basis, without warranties of any kind, either express or implied, including, without limitation, implied warranties of merchantability, fitness for a particular purpose, title and non-infringement and any warranties implied by any course of performance or usage of trade. The company does not represent or warrant that the Service and the Hive Content: (a) will be secure or available at any time or location; (b) are accurate, complete, reliable, current, or error-free or that any defects or errors will be corrected; and (c) are free of viruses or other harmful components. Your use of the Service and Hive Content is solely at your own risk. Some jurisdictions do not allow the disclaimer of implied terms in contracts with consumers, so some or all the disclaimers in this Section may not apply to you.</p>
                        <h2>18. Limitation of liability</h2>
                        <p>To the fullest extent permitted by applicable law, in no event shall this site’s operators or any related party, that includes but is not limited to, subsidiaries, vendors, or contractors, be liable for any special, indirect, incidental, consequential, exemplary or punitive damages, or any other damages of any kind, including, but not limited to, loss of use, loss of profits or loss of data, whether in an action in contract, tort (including, but not limited to, negligence) or otherwise, arising out of, or in any way connected with, the use of, or inability to use, the Service or the Hive Content. To the fullest extent permitted by applicable law, in no event shall the aggregate liability of this site’s operators or any related party, whether in contract, warranty, tort (including negligence, whether active, passive or imputed), product liability, strict liability or other theory, arising out of or relating to the use of or inability to use of the Service.</p>
                        <p>Some jurisdictions do not allow the exclusion or limitation of certain damages, so some or all of the exclusions and limitations in this Section may not apply to you.</p>
                        <h2>19. Modifications to the Service</h2>
                        <p>We reserve the right to modify or discontinue, temporarily or permanently, the Service, or any features or portions of the Service, without prior notice. You agree that we will not be liable for any modification, suspension, or discontinuance of the Service.</p>
                        <h2>20. Termination</h2>
                        <p>We reserve the right, without notice and in our sole discretion, to terminate your license to access and use of the Service, which includes this site, and to block or prevent your future access to, and use of, the Service that we provide.</p>
                        <h2>21. Severability</h2>
                        <p>If any term, clause, or provision of this Agreement is deemed to be unlawful, void or for any reason unenforceable, then that term, clause or provision shall be deemed severable from this Agreement and shall not affect the validity and enforceability of any remaining provisions.</p>
                        <h2>22. Changes</h2>
                        <p>This Agreement is the entire agreement between you and us concerning the Service. It supersedes all prior or contemporaneous agreements between you and us. We may modify this user agreement at any time. If we make changes to this agreement that materially affect your rights, we will provide notice and keep this edition available as an archive. By continuing to use the Services after a change to this agreement, you agree to those changes.</p>
                        <h2>23. Contact Information</h2>
                        <p>Notices to this site’s operators should be directed to <code>info@ecency.com</code>.</p>
                    </div>
                </div>
            </>
        );
    }
}

class FaqPage extends Component<PageProps> {
    render() {
        //  Meta config
        const metaProps = {
            title: _t('static.faq.page-title')
        };

        return (
            <>
                <Meta {...metaProps} />
                <Theme global={this.props.global}/>
                {NavBar({...this.props})}

                <div className="app-content static-page faq-page">
                    <div className="static-content">
                        <h1 className="page-title">{_t('static.faq.page-title')}</h1>
                        <img src={this.props.global.canUseWebp?faqWebp:faq}/>
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


const AboutPageContainer = connect(pageMapStateToProps, pageMapDispatchToProps)(AboutPage);
export {AboutPageContainer};

const GuestPostPageContainer = connect(pageMapStateToProps, pageMapDispatchToProps)(GuestPostPage);
export {GuestPostPageContainer};

const ContributePageContainer = connect(pageMapStateToProps, pageMapDispatchToProps)(ContributePage);
export {ContributePageContainer};

const PrivacyPageContainer = connect(pageMapStateToProps, pageMapDispatchToProps)(PrivacyPage);
export {PrivacyPageContainer};

const WhitePaperPageContainer = connect(pageMapStateToProps, pageMapDispatchToProps)(WhitePaperPage);
export {WhitePaperPageContainer};

const TosPageContainer = connect(pageMapStateToProps, pageMapDispatchToProps)(TosPage);
export {TosPageContainer};

const FaqPageContainer = connect(pageMapStateToProps, pageMapDispatchToProps)(FaqPage);
export {FaqPageContainer};
