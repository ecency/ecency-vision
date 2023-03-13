import React, { Component } from "react";
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "../common";
import Meta from "../../components/meta";
import ScrollToTop from "../../components/scroll-to-top";
import Theme from "../../components/theme";
import NavBarElectron from "../../../desktop/app/components/navbar";
import NavBar from "../../components/navbar";
import { connect } from "react-redux";

class GuestPostPage extends Component<PageProps> {
  render() {
    //  Meta config
    const metaProps = {
      title: "Guest Posts"
    };

    const { global } = this.props;
    let containerClasses = global.isElectron ? " mt-0 pt-6" : "";

    return (
      <>
        <Meta {...metaProps} />
        <ScrollToTop />
        <Theme global={this.props.global} />
        {global.isElectron ? (
          NavBarElectron({
            ...this.props
          })
        ) : (
          <NavBar history={this.props.history} />
        )}

        <div className={"app-content static-page guest-post-page" + containerClasses}>
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
