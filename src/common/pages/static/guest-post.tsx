import React, { Component } from "react";
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "../common";
import Meta from "../../components/meta";
import ScrollToTop from "../../components/scroll-to-top";
import Theme from "../../components/theme";
import NavBar from "../../components/navbar";
import { connect } from "react-redux";

class GuestPostPage extends Component<PageProps> {
  render() {
    //  Meta config
    const metaProps = {
      title: "Guest Posts"
    };

    return (
      <>
        <Meta {...metaProps} />
        <ScrollToTop />
        <Theme global={this.props.global} />
        <NavBar history={this.props.history} />

        <div className={"app-content static-page guest-post-page"}>
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

export default connect(pageMapStateToProps, pageMapDispatchToProps)(GuestPostPage);
