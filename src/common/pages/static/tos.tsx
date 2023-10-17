import React, { Component } from "react";
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "../common";
import Meta from "../../components/meta";
import ScrollToTop from "../../components/scroll-to-top";
import Theme from "../../components/theme";
import NavBar from "../../components/navbar";
import { connect } from "react-redux";

class TosPage extends Component<PageProps> {
  render() {
    //  Meta config
    const metaProps = {
      title: "Terms Of Service"
    };

    const { global } = this.props;

    return (
      <>
        <Meta {...metaProps} />
        <ScrollToTop />
        <Theme global={this.props.global} />
        <NavBar history={this.props.history} />

        <div className={"app-content static-page tos-page"}>
          <div className="static-content">
            <h1 className="page-title">Terms Of Service</h1>
            <p className="static-last-updated">Last Updated August 20, 2020</p>
            <p>
              This agreement (the "Agreement") between you and this site’s operators ("we", "us",
              "our") sets out your rights to access and use of this site and any other products or
              services provided by this web site (the "Service"). If you are accepting this
              Agreement and using the Services on behalf of a company, organization, government, or
              other legal entity, you represent and warrant that you are authorized to do so and
              have the authority to bind such entity to this Agreement. By accessing our Service,
              you agree that you have read, understood and accepted this Agreement.
            </p>
            <p>
              If we decide to make changes to this Agreement, we will provide notice of those
              changes by updating the "Last Updated" date above or posting notice on this site. Your
              continued use of the Service will confirm your acceptance of the changes.
            </p>
            <h2>1. Privacy Policy</h2>
            <p>
              Please refer to our <a href="/privacy-policy">Privacy Policy</a> for information about
              how we collect, use, and disclose information about you.
            </p>
            <h2>2. Eligibility</h2>
            <p>
              The Service is not targeted toward, nor intended for use by, anyone under the age of
              13. You must be at least 13 years of age to access or use of the Service. If you are
              between 13 and 18 years of age (or the age of legal majority where you reside), you
              may only access or use the Service under the supervision of a parent or legal guardian
              who agrees to be bound by this Agreement.
            </p>
            <h2>3. Copyright and Limited License</h2>
            <p>
              We may retain data, text, photographs, images, video, audio, graphics, articles,
              comments, software, code, scripts, and other content supplied by us, the Hive
              blockchain or our licensors, which we call "Hive Content."
            </p>
            <p>
              You are granted a limited, non-exclusive, non-transferable, and non-sublicensable
              license to access and use the Service and Hive Content for your personal use. You
              retain ownership of and responsibility for Content you create or own ("Your Content").
              If you're posting anything you did not create yourself or do not own the rights to,
              you agree that you are responsible for any Content you post; that you will only submit
              Content that you have the right to post; and that you will fully comply with any
              third-party licenses relating to Content you post.
            </p>
            <h2>4. Trademark Policy</h2>
            <p>
              "Ecency", the Ecency logo and any other product or service names, logos or slogans
              that may appear on Ecency are trademarks of Ecency and may not be copied, imitated or
              used, in whole or in part, without our prior written permission. You may not use any
              metatags or other "hidden text" utilizing "Ecency" or any other name, trademark or
              product or service name of Ecency without our prior written permission. In addition,
              the look and feel of Ecency, including, without limitation, all page headers, custom
              graphics, button icons and scripts, constitute the service mark, trademark or trade
              dress of Ecency and may not be copied, imitated or used, in whole or in part, without
              our prior written permission. All other trademarks, registered trademarks, product
              names and company names or logos mentioned or used on Ecency are the property of their
              respective owners and may not be copied, imitated or used, in whole or in part,
              without the permission of the applicable trademark holder. Reference to any products,
              services, processes or other information by name, trademark, manufacturer, supplier or
              otherwise does not constitute or imply endorsement, sponsorship or recommendation by
              Ecency.
            </p>
            <h2>5. Assumption of Risk, Limitations on Liability.</h2>
            <p>
              5.1. You accept and acknowledge that there are risks associated with utilizing an
              Internet-based Hive blockchain account service including, but not limited to, the risk
              of failure of hardware, software and Internet connections, the risk of malicious
              software introduction, and the risk that third-parties may obtain unauthorized access
              to information stored within or associated with your Account, including, but not
              limited to your private key(s) ("Private Key"). You accept and acknowledge that we
              will not be responsible for any communication failures, disruptions, errors,
              distortions, or delays you may experience when using the Services, however caused.
            </p>
            <p>
              5.2. We make no representation or warranty of any kind, express or implied, statutory,
              or otherwise, regarding the contents of the Service, information and functions made
              accessible through the Service, any hyperlinks to third-party websites, nor for any
              breach of security associated with the transmission of information through the Service
              or any website linked to by the Service.
            </p>
            <p>
              5.3. We will not be responsible or liable to you for any loss and take no
              responsibility for and will not be liable to you for any use of our Services,
              including but not limited to any losses, damages or claims arising from: (a) User
              error such as forgotten passwords, incorrectly constructed transactions, or mistyped
              Hive blockchain addresses; (b) Server failure or data loss; (c) Corrupted Account
              files; (d) Unauthorized access to applications; (e) Any unauthorized third-party
              activities, including without limitation the use of viruses, phishing, brute forcing
              or other means of attack against the Service or Services.
            </p>
            <p>
              5.4. We make no warranty that the Service or the server that makes it available, are
              free of viruses or errors, that its content is accurate, that it will be
              uninterrupted, or that defects will be corrected. We will not be responsible or liable
              to you for any loss of any kind, from action taken, or taken in reliance on material,
              or information, contained on the Service.
            </p>
            <p>
              5.5. Subject to 6.1 below, any and all indemnities, warranties, terms, and conditions
              (whether express or implied) are hereby excluded to the fullest extent permitted.
            </p>
            <p>
              5.6. We will not be liable, in contract, or tort (including, without limitation,
              negligence), other than where we have been fraudulent or made negligent
              misrepresentations.
            </p>
            <p>
              5.7. Nothing in this Agreement excludes or limits liability for death or personal
              injury caused by negligence, fraudulent misrepresentation, or any other liability
              which may not otherwise be limited or excluded under United States law.
            </p>
            <h2>6. Agreement to Hold this Site's Operators Harmless</h2>
            <p>
              6.1. You agree to hold harmless this site (and its operators) from any claim, demand,
              action, damage, loss, cost, or expense, including without limitation reasonable legal
              fees, arising out, or relating to:
            </p>
            <p>6.1.1. Your use of, or conduct in connection with, our Services;</p>
            <p>6.1.2. Your violation of any term in this Agreement; or</p>
            <p>6.1.3. Violation of any rights of any other person or entity.</p>
            <p>
              6.2. If you are obligated to indemnify us, we will have the right, in our sole
              discretion, to control any action or proceeding (at our expense) and determine whether
              we will pursue a settlement of any action or proceeding.
            </p>
            <h2>7. No Liability for Third-Party Services and Content</h2>
            <p>
              7.1. In using our Services, you may view content or utilize services provided by third
              parties, including links to web pages and services of such parties (“Third-Party
              Content”). We do not control, endorse, or adopt any Third-Party Content and will have
              no responsibility for Third-Party Content including, without limitation, material that
              may be misleading, incomplete, erroneous, offensive, indecent, or otherwise
              objectionable in your jurisdiction. In addition, your dealings or correspondence with
              such third parties are solely between you and the third parties. We are not
              responsible or liable for any loss or damage of any sort incurred because of any such
              dealings and you understand that your use of Third-Party Content, and your
              interactions with third parties, is at your own risk.
            </p>
            <h2>8. Account Registration</h2>
            <p>
              8.1. You need not use a Hive blockchain account provided by us, and you can create an
              account independently of the Service. If you would like to use part of the Service,
              you must create a Hive blockchain account ("Account"). When you create an Account, you
              are strongly advised to take the following precautions, as failure to do so may result
              in loss of access to, and/or control over, your Account: (b) Provide accurate and
              truthful information; (c) maintain the security of your Account by protecting your
              Account password and access to your computer and your Account; (e) Promptly notify us
              if you discover or otherwise suspect any security breaches related to your Account.
            </p>
            <p>
              8.2. You hereby accept and acknowledge that you take responsibility for all activities
              that occur under your Account and accept all risks of any authorized or unauthorized
              access to your Account, to the maximum extent permitted by law.
            </p>
            <p>
              8.3. You acknowledge and understand that cryptography is a progressing field. Advances
              in code cracking or technical advances such as the development of quantum computers
              may present risks to the Services that you use and your Account, which could result in
              the theft or loss of your property. By using the Service or accessing Hive Content,
              you acknowledge these inherent risks.
            </p>
            <h2>9. The Services</h2>
            <p>
              9.1. As described in more detail below, the Services, among other things, provide
              software that facilitates the submission of Hive blockchain transaction data to the
              Hive blockchain without requiring you to access the Hive blockchain command line
              interface.
            </p>
            <p>
              9.2. Account and Private Keys. Should you agree to create an Account through our
              Service, we generate a cryptographic private and public key pair that are provided
              solely to you and completely owned by you; provided however that we not store
              passwords or Private Keys for our you. We never have access to your Private Key and do
              not custody any Private Keys on your behalf, and therefore, assume no responsibility
              for the management of the Private Key tied to your Account. The Private Key uniquely
              match the Account name and must be used in connection with the Account to authorize
              the transfer of HIVE and Hive Dollars from that Account. You are solely responsible
              for maintaining the security of your Private Keys. You must keep your Private Key
              access information secure. Failure to do so may result in the loss of control of HIVE,
              Hive Power and Hive Dollars associated with your Account.
            </p>
            <p>
              9.3. No Password Retrieval. We do not receive or store your Account password or
              Private Keys. Your Private Key is your own and you are solely responsible for their
              safekeeping. We cannot assist you with Account password retrieval, reset, or recovery.
              You are solely responsible for remembering your Account password. If you have not
              safely stored a backup of any Account and password pairs maintained in your Account,
              you accept and acknowledge that any HIVE, Hive Dollars and Hive Power you have
              associated with such Account will become permanently inaccessible if you do not have
              your Account password.
            </p>
            <p>
              9.4. Transactions. All proposed Hive blockchain transactions must be confirmed and
              recorded in the Hive blockchain via the Hive distributed consensus network (a
              peer-to-peer network), which is not owned, controlled, or operated by us. The Hive
              blockchain is operated by a decentralized network of independent third parties. We
              have no control over the Hive blockchain and therefore cannot and will not ensure that
              any transaction details you submit via the Services will be confirmed on the Hive
              blockchain. You acknowledge and agree that the transaction details you submit via the
              Services may not be completed, or may be substantially delayed, by the Hive
              blockchain. You may use the Services to submit these details to the Hive blockchain.
            </p>
            <p>
              9.5. No Storage or Transmission of HIVE, Hive Dollars or Hive Power. HIVE, in any of
              its forms (HIVE, Hive Dollars and Hive Power) is an intangible, digital asset
              controlled by you. These assets exist only by virtue of the ownership record
              maintained on the Hive blockchain. The Service does not store, send, or receive HIVE,
              Hive Dollars, or Hive Power. Any transfer of title that might occur in any HIVE, Hive
              Dollars or Hive Power occurs on the Hive blockchain and not within the Services. We do
              not guarantee that the Service can affect the transfer of title or right in any HIVE,
              Hive Dollars or Hive Power.
            </p>
            <p>
              9.6. Relationship. Nothing in this Agreement is intended to nor shall create any
              partnership, joint venture, agency, consultancy, or trusteeship, between you and us.
            </p>
            <p>
              9.7. Accuracy of Information. You represent and warrant that any information you
              provide via the Services is accurate and complete. You accept and acknowledge that we
              are not responsible for any errors or omissions that you make in connection with any
              Hive blockchain transaction initiated via the Services, for instance, if you mistype
              an Account name or otherwise provide incorrect information. We strongly encourage you
              to review your transaction details carefully before completing them via the Services.
            </p>
            <p>
              9.8. No Cancellations or Modifications. Once transaction details have been submitted
              to the Hive blockchain via the Services, The Services cannot assist you to cancel or
              otherwise modify your transaction details. We have no control over the Hive blockchain
              and do not have the ability to facilitate any cancellation or modification requests.
            </p>
            <p>
              9.9. Taxes. It is your responsibility to determine what, if any, taxes apply to the
              transactions you for which you have submitted transaction details via the Services,
              and it is your responsibility to report and remit the correct tax to the appropriate
              tax authority. You agree that the we are not responsible for determining whether taxes
              apply to your Hive blockchain transactions or for collecting, reporting, withholding,
              or remitting any taxes arising from any Hive blockchain transactions.
            </p>
            <h2>10. Fees for Using the Services</h2>
            <p>
              10.1. Fees Creating an Account. We do not currently charge fees for the creation of
              Accounts, however we reserve the right to do so in future, and in such case any
              applicable fees will be displayed prior to you using any Service to which a fee
              applies.
            </p>
            <h2>11. No Right to Cancel And/or Reverse Hive Transactions</h2>
            <p>
              11.1. If you use a Service to which HIVE, Hive Dollars or Hive Power is transacted,
              you will not be able to change your mind once you have confirmed that you wish to
              proceed with the Service or transaction.
            </p>
            <h2>12. Discontinuation of Services.</h2>
            <p>
              12.1. We may, in our sole discretion and without cost to you, with or without prior
              notice and at any time, modify or discontinue, temporarily or permanently, any portion
              of our Services. You are solely responsible for storing, outside of the Services, a
              backup of any Account and Private Key that you maintain in your Account.
            </p>
            <p>
              12.2. If you do not maintain a backup of your Account data outside of the Services,
              you will be may not be able to access HIVE, Hive Dollars and Hive Power associated
              with any Account maintained in your Account if we discontinue or deprecate the
              Services.
            </p>
            <h2>13. Suspension or Termination of Service.</h2>
            <p>
              13.1. We may suspend or terminate your access to the Services in our sole discretion,
              immediately and without prior notice, and delete or deactivate your account and all
              related information and files in such without cost to you, including, for instance, if
              you breach any term of this Agreement. In the event of termination, your access to the
              funds in your account will require you access to the Hive blockchain via the command
              line API or third party tool, and will require you to have access to your backup of
              your Account data including your Account and Private Keys.
            </p>
            <h2>14. User Conduct</h2>
            <p>
              14.1. When accessing or using the Services, you agree that you will not commit any
              unlawful act, and that you are solely responsible for your conduct while using our
              Services. Without limiting the generality of the foregoing, you agree that you will
              not:
            </p>
            <p>
              14.1.1. Use of our Services in any manner that could interfere with, disrupt,
              negatively affect, or inhibit other users from fully enjoying our Services, or that
              could damage, disable, overburden, or impair the functioning of our Services in any
              manner;
            </p>
            <p>
              14.1.2. Use our Services to pay for, support or otherwise engage in any activity
              prohibited by law, including, but not limited to illegal gambling, fraud,
              money-laundering, or terrorist financing activities.
            </p>
            <p>14.1.3. Use or attempt to use another user’s Account without authorization;</p>
            <p>
              14.1.4. Attempt to circumvent any content filtering techniques we employ, or attempt
              to access any service or area of our Services that you are not authorized to access;
            </p>
            <p>
              14.1.5. Introduce to the Services any virus, Trojan, worms, logic bombs or other
              harmful material;
            </p>
            <p>
              14.1.6. Encourage or induce any third-party to engage in any of the activities
              prohibited under this Section.
            </p>
            <h2>15. Copyright Complaints, the DMCA, and Takedowns</h2>
            <p>
              15.1 We will respond to legitimate requests under the Digital Millennium Copyright Act
              ("DMCA"), and we retain the right to remove access to user content provided via the
              Service that we deem to be infringing the copyright of others. If you become aware of
              user content on the Service that infringes your copyright rights, you may submit a
              properly formatted DMCA request (see 17 U.S.C. § 512) to this site’s operator(s).
            </p>
            <p>
              Misrepresentations of infringement can result in liability for monetary damages. You
              may want to consult an attorney before taking any action pursuant to the DMCA. A DMCA
              request can be sent to us via the contact information below:
            </p>
            <p>Copyright Agent</p>
            <p>
              <code>info@ecency.com</code>
            </p>
            <p>Please send our Copyright Agent the following information:</p>
            <p>
              The electronic or physical signature of the owner of the copyright or the person
              authorized to act on the owner's behalf;
            </p>
            <p>
              Identification of the copyrighted work claimed to have been infringed, or a
              representative list of such works;
            </p>
            <p>
              The URL or Internet location of the materials claimed to be infringing or to be the
              subject of infringing activity, or information reasonably sufficient to permit us to
              locate the material;
            </p>
            <p>Your name, address, telephone number, and email address;</p>
            <p>
              A statement by you that you have a good faith belief that the disputed use of the
              material is not authorized by the copyright owner, its agent, or the law;
            </p>
            <p>
              A statement by you, made under penalty of perjury, that the above information in your
              notice is accurate and that you are the copyright owner or are authorized to act on
              the copyright owner's behalf.
            </p>
            <p>
              15.2 Your right to file a counter-notice. If you believe your user content was wrongly
              removed due to a mistake or misidentification of the material, you can s end a
              counter-notice to our Copyright Agent (contact information provided above) that
              includes the following:
            </p>
            <p>Your physical or electronic signature;</p>
            <p>
              Identification of the material that has been removed or to which access has been
              disabled and where the material was located online before it was removed or access to
              it was disabled;
            </p>
            <p>
              A statement by you, under penalty of perjury, that you have a good faith belief that
              the material was removed or disabled because of mistake or misidentification of the
              material to be removed or disabled;
            </p>
            <p>
              Your name, address, and telephone number, and a statement that you consent to the
              jurisdiction of federal district court for the judicial district in which the address
              is located, or if your address is outside of the United States, for any judicial
              district in which the service provider may be found, and that you will accept service
              of process from the person who provided notification under DMCA 512 subsection
              (c)(1)(c) or an agent of such person.
            </p>
            <p>
              Upon receiving a counter-notice we will forward it to the complaining party and tell
              them we will restore your content within 10 business days. If that party does not
              notify us that they have filed an action to enjoin your use of that content on the
              Service before that period passes, we will consider restoring your user content to the
              site.
            </p>
            <p>
              It is our policy to deny use of the Service to users we identify as repeat infringers.
              We apply this policy at our discretion and in appropriate circumstances, such as when
              a user has repeatedly been charged with infringing the copyrights or other
              intellectual property rights of others.
            </p>
            <h2>16. Indemnity</h2>
            <p>
              All the things you do and all the information you submit or post to the Service remain
              your responsibility. Indemnity is basically a way of saying that you will not hold us
              legally liable for any of your content or actions that infringe the law or the rights
              of a third party or person in any way.
            </p>
            <p>
              Specifically, you agree to hold us, our affiliates, officers, directors, employees,
              agents, and third-party service providers harmless from and defend them against any
              claims, costs, damages, losses, expenses, and any other liabilities, including
              attorneys’ fees and costs, arising out of or related to your access to or use of the
              Service, your violation of this user agreement, and/or your violation of the rights of
              any third-party or person.
            </p>
            <h2>17. Disclaimers</h2>
            <p>
              To the fullest extent permitted by applicable law, the Service and the Hive Content
              are provided on an "as is" and "as available" basis, without warranties of any kind,
              either express or implied, including, without limitation, implied warranties of
              merchantability, fitness for a particular purpose, title and non-infringement and any
              warranties implied by any course of performance or usage of trade. The company does
              not represent or warrant that the Service and the Hive Content: (a) will be secure or
              available at any time or location; (b) are accurate, complete, reliable, current, or
              error-free or that any defects or errors will be corrected; and (c) are free of
              viruses or other harmful components. Your use of the Service and Hive Content is
              solely at your own risk. Some jurisdictions do not allow the disclaimer of implied
              terms in contracts with consumers, so some or all the disclaimers in this Section may
              not apply to you.
            </p>
            <h2>18. Limitation of liability</h2>
            <p>
              To the fullest extent permitted by applicable law, in no event shall this site’s
              operators or any related party, that includes but is not limited to, subsidiaries,
              vendors, or contractors, be liable for any special, indirect, incidental,
              consequential, exemplary or punitive damages, or any other damages of any kind,
              including, but not limited to, loss of use, loss of profits or loss of data, whether
              in an action in contract, tort (including, but not limited to, negligence) or
              otherwise, arising out of, or in any way connected with, the use of, or inability to
              use, the Service or the Hive Content. To the fullest extent permitted by applicable
              law, in no event shall the aggregate liability of this site’s operators or any related
              party, whether in contract, warranty, tort (including negligence, whether active,
              passive or imputed), product liability, strict liability or other theory, arising out
              of or relating to the use of or inability to use of the Service.
            </p>
            <p>
              Some jurisdictions do not allow the exclusion or limitation of certain damages, so
              some or all of the exclusions and limitations in this Section may not apply to you.
            </p>
            <h2>19. Modifications to the Service</h2>
            <p>
              We reserve the right to modify or discontinue, temporarily or permanently, the
              Service, or any features or portions of the Service, without prior notice. You agree
              that we will not be liable for any modification, suspension, or discontinuance of the
              Service.
            </p>
            <h2>20. Termination</h2>
            <p>
              We reserve the right, without notice and in our sole discretion, to terminate your
              license to access and use of the Service, which includes this site, and to block or
              prevent your future access to, and use of, the Service that we provide.
            </p>
            <h2>21. Severability</h2>
            <p>
              If any term, clause, or provision of this Agreement is deemed to be unlawful, void or
              for any reason unenforceable, then that term, clause or provision shall be deemed
              severable from this Agreement and shall not affect the validity and enforceability of
              any remaining provisions.
            </p>
            <h2>22. Changes</h2>
            <p>
              This Agreement is the entire agreement between you and us concerning the Service. It
              supersedes all prior or contemporaneous agreements between you and us. We may modify
              this user agreement at any time. If we make changes to this agreement that materially
              affect your rights, we will provide notice and keep this edition available as an
              archive. By continuing to use the Services after a change to this agreement, you agree
              to those changes.
            </p>
            <h2>23. Contact Information</h2>
            <p>
              Notices to this site’s operators should be directed to <code>info@ecency.com</code>.
            </p>
          </div>
        </div>
      </>
    );
  }
}
export default connect(pageMapStateToProps, pageMapDispatchToProps)(TosPage);
