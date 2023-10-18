import React, { Component } from "react";
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "../common";
import Meta from "../../components/meta";
import ScrollToTop from "../../components/scroll-to-top";
import Theme from "../../components/theme";
import NavBar from "../../components/navbar";
import { connect } from "react-redux";

class ContributePage extends Component<PageProps> {
  render() {
    //  Meta config
    const metaProps = {
      title: "Contribute"
    };

    return (
      <>
        <Meta {...metaProps} />
        <ScrollToTop />
        <Theme global={this.props.global} />
        <NavBar history={this.props.history} />

        <div className="app-content static-page contribute-page">
          <div className="static-content">
            <h1 className="page-title">Contribute to Esteem</h1>
            <p>
              Esteem is a decentralized platform which rewards contributors. Content on platform is
              100% user generated. You can{" "}
              <a href="https://esteem.app/signup">signup to get your own account</a> and start
              earning cryptocurrency. If you do not mind for rewards, you can get publicity for
              free, just fill out form below and we will make sure to handle rest.
            </p>
            <ul>
              <li>
                To submit a contribution, <a href="https://esteem.app/guest-posts">click here</a>.
              </li>
              <li>Comments on your content will be emailed to your provided address.</li>
            </ul>
            <h3 id="topics">Topics</h3>
            <p>
              Our ambit is broad, you can post about anything that is original and has proper
              references. We stand against Plagiarism!
            </p>
            <h2 id="submit">Submit</h2>
            <p>
              We accept contributions through <a href="https://esteem.app/guest-posts">this form</a>
              . For formating your post use{" "}
              <a href="https://hackmd.io" target="_blank" rel="noopener noreferrer">
                Hackmd
              </a>
              , it is great tool to format your posts which will show perfectly. You can put content
              of your post inside form. It is acceptable to publish existing content that you have
              the right to republish. Please review the format instructions above before submitting.
            </p>
            <h2 id="faq">FAQ</h2>
            <ol>
              <li>
                <em>Can I re-publish my contribution to Esteem on another site?</em> Yes. All that
                we request is that you link back to the Esteem article.
              </li>
              <li>
                <em>Can I re-use a previously published article?</em> Yes, if we believe your
                article is relevant to a general audience.
              </li>
            </ol>
          </div>
        </div>
      </>
    );
  }
}
export default connect(pageMapStateToProps, pageMapDispatchToProps)(ContributePage);
