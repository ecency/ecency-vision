import React, { Component } from "react";
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "../common";
import Meta from "../../components/meta";
import ScrollToTop from "../../components/scroll-to-top";
import Theme from "../../components/theme";
import NavBar from "../../components/navbar";
import { connect } from "react-redux";

class PrivacyPage extends Component<PageProps> {
  render() {
    //  Meta config
    const metaProps = {
      title: "Privacy Policy"
    };

    return (
      <>
        <Meta {...metaProps} />
        <ScrollToTop />
        <Theme global={this.props.global} />
        <NavBar history={this.props.history} />

        <div className={"app-content static-page privacy-page"}>
          <div className="static-content">
            <h1 className="page-title">Privacy Policy</h1>
            <p className="static-last-updated">Effective: August 20, 2020</p>
            <p>
              This Privacy Policy describes how this site collects, uses and discloses information,
              and what choices you have with respect to the information.
            </p>
            <p>
              Updates in this version of the Privacy Policy reflect changes in data protection law.
            </p>
            <p>
              When we refer to this site’s operator, we mean the entity that acts as the controller
              of your information.
            </p>
            <p>
              By using the Services, you accept the terms of this Policy and our Terms of Service,
              and consent to our initial collection, use, disclosure, and retention of your
              information as described in this Policy and Terms of Service.
            </p>
            <p>
              Please note that this Policy does not apply to information collected through
              third-party websites or services that you may access through the Services or that you
              submit to us through email, text message or other electronic message or offline.
            </p>
            <p>
              If you are visiting this site from the European Union (EU), see our Notice to EU Data
              Subjects below for our legal bases for processing and transfer of your data.
            </p>
            <h2>WHAT WE COLLECT</h2>
            <p>We get information about you in a range of ways.</p>
            <p>Information You Give Us. Information we collect from you includes:</p>
            <p>IP address;</p>
            <p>Language information;</p>
            <p>Contact information, such as your email address;</p>
            <p>
              Information Automatically Collected. We may automatically record certain information
              about how you use our Site (we refer to this information as "Log Data"). Log Data may
              include information such as a user’s Internet Protocol (IP) address, device and
              browser type, and operating system. We use this information to administer and provide
              access to the Services
            </p>
            <p>
              Information we will never collect. We will never ask you to share your private keys or
              wallet seed. Never trust anyone or any site that asks you to enter your private keys
              or wallet seed.
            </p>
            <h2>USE OF PERSONAL INFORMATION</h2>
            <p>
              To provide our service we will use your personal information in the following ways:
            </p>
            <p>To enable you to access and use the Services</p>
            <p>To comply with law</p>
            <p>
              We use your personal information as we believe necessary or appropriate to comply with
              applicable laws, lawful requests and legal process, such as to respond to subpoenas or
              requests from government authorities.
            </p>
            <p>For compliance, fraud prevention, and safety</p>
            <p>Communications</p>
            <p>
              We may use your personal information to protect, investigate, and deter against
              fraudulent, unauthorized, or illegal activity.
            </p>
            <p>
              We may use your personal information to contact you with newsletters, marketing or
              promotional materials and other information that may be of interest to you. You may
              opt out of receiving any, or all, of these communications from us by following the
              unsubscribe or instructions provided in any email send.
            </p>
            <h2>SHARING OF PERSONAL INFORMATION</h2>
            <p>
              We do not share or sell the personal information that you provide us with other
              organizations without your express consent, except as described in this Privacy
              Policy. We disclose personal information to third parties under the following
              circumstances:
            </p>
            <p>
              Affiliates. We may disclose your personal information to our subsidiaries and
              corporate affiliates for purposes consistent with this Privacy Policy.
            </p>
            <p>
              Business Transfers. We may share personal information when we do a business deal, or
              negotiate a business deal, involving the sale or transfer of all or a part of our
              business or assets. These deals can include any merger, financing, acquisition, or
              bankruptcy transaction or proceeding.
            </p>
            <p>
              Compliance with Laws and Law Enforcement; Protection and Safety. We may share personal
              information for legal, protection, and safety purposes.
            </p>
            <p>We may share information to comply with laws.</p>
            <p>We may share information to respond to lawful requests and legal processes.</p>
            <p>
              Professional Advisors and Service Providers. We may share information with those who
              need it to do work for us. These recipients may include third party companies and
              individuals to administer and provide the Service on our behalf (such as customer
              support, hosting, email delivery and database management services), as well as
              lawyers, bankers, auditors, and insurers.
            </p>
            <p>
              Other. You may permit us to share your personal information with other companies or
              entities of your choosing. Those uses will be subject to the privacy policies of the
              recipient entity or entities.
            </p>
            <p>
              We may also share aggregated and/or anonymized data with others for their own uses.
            </p>
            <h2>INTERNATIONAL TRANSFER</h2>
            <p>
              The Company may have offices outside of the EU and may have affiliates and service
              providers in the United States and in other countries. Your personal information may
              be transferred to or from the United States or other locations outside of your state,
              province, country or other governmental jurisdiction where privacy laws may not be as
              protective as those in your jurisdiction.
            </p>
            <p>
              EU users should read the important information provided below about transfer of
              personal information outside of the European Economic Area (EEA).
            </p>
            <h2>HOW INFORMATION IS SECURED</h2>
            <p>
              We retain information we collect as long as it is necessary and relevant to fulfill
              the purposes outlined in this privacy policy. In addition, we retain personal
              information to comply with applicable law where required, prevent fraud, resolve
              disputes, troubleshoot problems, assist with any investigation, enforce our Terms of
              Service, and other actions permitted by law. To determine the appropriate retention
              period for personal information, we consider the amount, nature, and sensitivity of
              the personal information, the potential risk of harm from unauthorized use or
              disclosure of your personal information, the purposes for which we process your
              personal information and whether we can achieve those purposes through other means,
              and the applicable legal requirements.
            </p>
            <p>
              In some circumstances we may anonymize your personal information (so that it can no
              longer be associated with you) in which case we may use this information indefinitely
              without further notice to you.
            </p>
            <p>
              We employ industry standard security measures designed to protect the security of all
              information submitted through the Services. However, the security of information
              transmitted through the internet can never be guaranteed. We are not responsible for
              any interception or interruption of any communications through the internet or for
              changes to or losses of data. Users of the Services are responsible for maintaining
              the security of any password, user ID or other form of authentication involved in
              obtaining access to password protected or secure areas of any of our digital services.
            </p>
            <h2>INFORMATION CHOICES AND CHANGES</h2>
            <p>Accessing, Updating, Correcting, and Deleting your Information</p>
            <p>
              You may access information that you have voluntarily provided through your account on
              the Services, and review, correct, or delete it.
            </p>
            <h2>CONTACT INFORMATION.</h2>
            <p>
              We welcome your comments or questions about this Policy, and you may contact us at:{" "}
              <code>info@ecency.com</code>.
            </p>
            <h2>CHANGES TO THIS PRIVACY POLICY.</h2>
            <p>
              We may change this privacy policy at any time. We encourage you to periodically review
              this page for the latest information on our privacy practices. If we make any changes,
              we will change the Last Updated date above.
            </p>
            <p>
              Any modifications to this Privacy Policy will be effective upon our posting of the new
              terms and/or upon implementation of the changes to the Site (or as otherwise indicated
              at the time of posting). In all cases, your continued use of the the Site or Services
              after the posting of any modified Privacy Policy indicates your acceptance of the
              terms of the modified Privacy Policy.
            </p>
            <h2>ELIGIBILITY</h2>
            <p>
              If you are under the age of majority in your jurisdiction of residence, you may use
              the Services only with the consent of or under the supervision of your parent or legal
              guardian. Consistent with the requirements of the Children's Online Privacy Protection
              Act (COPPA), if we learn that we have received any information directly from a child
              under age 13 without first receiving his or her parent's verified consent, we will use
              that information only to respond directly to that child (or his or her parent or legal
              guardian) to inform the child that he or she cannot use the Site and subsequently we
              will delete that information.
            </p>
            <h2>NOTICE TO CALIFORNIA RESIDENTS</h2>
            <p>
              Under California Civil Code Section 1789.3, California users are entitled to the
              following consumer rights notice: California residents may reach the Complaint
              Assistance Unit of the Division of Consumer Services of the California Department of
              Consumer Affairs by mail at 1625 North Market Blvd., Sacramento, CA 95834, or by
              telephone at (916) 445-1254 or (800) 952-5210.
            </p>
            <h2>NOTICE TO EU DATA SUBJECTS</h2>
            <h4>Personal Information</h4>
            <p>
              With respect to EU data subjects, "personal information" as used in this Privacy
              Policy, is equivalent to "personal data" as defined in the European Union General Data
              Protection Regulation (GDPR).
            </p>
            <h4>Legal Bases for Processing</h4>
            <p>
              We only use your personal information as permitted by law. We are required to inform
              you of the legal bases of our processing of your personal information, which are
              described in the table below. If you have questions about the legal bases under which
              we process your personal information, contact us at info@ecency.com.
            </p>
            <h4>Processing Purpose</h4>
            <h4>Legal Basis</h4>
            <h4>For compliance, fraud prevention, and safety</h4>
            <h4>To provide our service</h4>
            <p>
              These processing activities constitute our legitimate interests. We make sure we
              consider and balance any potential impacts on you (both positive and negative) and
              your rights before we process your personal information for our legitimate interests.
              We do not use your personal information for activities where our interests are
              overridden by any adverse impact on you (unless we have your consent or are otherwise
              required or permitted to by law).
            </p>
            <h4>With your consent</h4>
            <p>
              Where our use of your personal information is based upon your consent, you have the
              right to withdraw it anytime in the manner indicated in the Service or by contacting
              us at info@ecency.com
            </p>
            <h4>Use for New Purposes</h4>
            <p>
              We may use your personal information for reasons not described in this Privacy Policy,
              where we are permitted by law to do so and where the reason is compatible with the
              purpose for which we collected it. If we need to use your personal information for an
              unrelated purpose, we will notify you and explain the applicable legal basis for that
              use. If we have relied upon your consent for a particular use of your personal
              information, we will seek your consent for any unrelated purpose.
            </p>
            <h4>Your Rights</h4>
            <p>
              Under the GDPR, you have certain rights regarding your personal information. You may
              ask us to take the following actions in relation to your personal information that we
              hold:
            </p>
            <p>
              Opt-out. Stop sending you direct marketing communications which you have previously
              consented to receive. We may continue to send you Service-related and other
              non-marketing communications.
            </p>
            <p>
              Access. Provide you with information about our processing of your personal information
              and give you access to your personal information.
            </p>
            <p>Correct. Update or correct inaccuracies in your personal information.</p>
            <p>Delete. Delete your personal information.</p>
            <p>
              Transfer. Transfer a machine-readable copy of your personal information to you or a
              third party of your choice.
            </p>
            <p>Restrict. Restrict the processing of your personal information.</p>
            <p>
              Object. Object to our reliance on our legitimate interests as the basis of our
              processing of your personal information that impacts your rights.
            </p>
            <p>
              You can submit these requests by email to info@ecency.com. We may request specific
              information from you to help us confirm your identity and process your request.
              Applicable law may require or permit us to decline your request. If we decline your
              request, we will tell you why, subject to legal restrictions. If you would like to
              submit a complaint about our use of your personal information or response to your
              requests regarding your personal information, you may contact us at privacy@hive.io or
              submit a complaint to the data protection regulator in your jurisdiction..
            </p>
            <p>Cross-Border Data Transfer</p>
            <p>
              Please be aware that your personal data will be transferred to, processed, and stored
              in the EU. Data protection laws in the EU may be different from those in your country
              of residence. You consent to the transfer of your information, including personal
              information, to the EU as set forth in this Privacy Policy by visiting our site or
              using our service.
            </p>
            <p>
              Whenever we transfer your personal information out of the EEA to the U.S. or countries
              not deemed by the European Commission to provide an adequate level of personal
              information protection, the transfer will be based on a data transfer mechanism
              recognized by the European Commission as providing adequate protection for personal
              information.
            </p>
            <p>
              Please contact us if you want further information on the specific mechanism used by us
              when transferring your personal information out of the EEA.
            </p>
            <h2>Why do we use Cookies?</h2>
            <p>We generally use Cookies for the following purposes:</p>
            <p>
              To allow registered users to stay logged in to the site after they close their browser
              window;
            </p>
            <p>To store users' preferences for site functionality; and</p>
            <p>
              To track site usage so we can improve our site & better understand how people are
              using it
            </p>
            <p>To better understand the interests of our customers and our website visitors.</p>
            <p>
              Some Cookies are necessary for certain uses of the Site, and without such Cookies, we
              would not be able to provide many services that you need to properly use the Site.
              These Cookies, for example, allow us to operate our Site so you may access it as you
              have requested and let us recognize that you have created an account and have logged
              into that account to access Site content. They also include Cookies that enable us to
              remember your previous actions within the same browsing session and secure our Sites.
            </p>
            <p>
              We also use functional Cookies and Cookies from third parties for analysis and
              marketing purposes. Functional Cookies enable certain parts of the site to work
              properly and your user preferences to remain known. Analysis Cookies, among other
              things, collect information on how visitors use our Site, the content and products
              that users view most frequently, and the effectiveness of our third party advertising.
              Advertising Cookies assist in delivering ads to relevant audiences and having our ads
              appear at the top of search results. Cookies are either "session" Cookies which are
              deleted when you end your browser session, or "persistent" which remain until their
              deletion by you (discussed below) or the party who served the cookie. Full details on
              all of the Cookies used on the Site are available at our Cookie Disclosure table
              below.
            </p>
            <h2>How to disable Cookies.</h2>
            <p>
              You can generally activate or later deactivate the use of cookies through a
              functionality built into your web browser. To learn more about how to control cookie
              settings through your browser:
            </p>
            <p>
              Click{" "}
              <a
                href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop"
                target="_blank"
              >
                here
              </a>{" "}
              to learn more about the "Private Browsing" setting and managing cookie settings in
              Firefox;
            </p>
            <p>
              Click{" "}
              <a
                href="https://support.google.com/chrome/answer/95647?hl%3Den&sa=D&ust=1527292847109000"
                target="_blank"
              >
                here
              </a>{" "}
              to learn more about "Incognito" and managing cookie settings in Chrome;
            </p>
            <p>
              Click{" "}
              <a
                href="https://support.microsoft.com/en-us/help/17442/windows-internet-explorer-delete-manage-cookies&sa=D&ust=1527292847110000"
                target="_blank"
              >
                here
              </a>{" "}
              to learn more about "InPrivate" and managing cookie settings in Internet Explorer; or
            </p>
            <p>
              Click{" "}
              <a href="https://support.apple.com/en-gb/guide/safari/ibrw1069/mac" target="_blank">
                here
              </a>{" "}
              to learn more about "Private Browsing" and managing cookie settings in Safari.
            </p>
            <p>
              If you want to learn more about cookies, or how to control, disable or delete them,
              please visit http://www.aboutcookies.org for detailed guidance. In addition, certain
              third party advertising networks, including Google, permit users to opt out of or
              customize preferences associated with your internet browsing.
            </p>
            <p>
              We may link the information collected by Cookies with other information we collect
              from you pursuant to this Privacy Policy and use the combined information as set forth
              herein. Similarly, the third parties who serve cookies on our Site may link your name
              or email address to other information they collect, which may include past purchases
              made offline or online, or your online usage information. If you are located in the
              European Economic Area, you have certain rights that are described above under the
              header “Notice to EU Data Subjects”, including the right to inspect and correct or
              delete the data that we have about you.
            </p>
          </div>
        </div>
      </>
    );
  }
}
export default connect(pageMapStateToProps, pageMapDispatchToProps)(PrivacyPage);
