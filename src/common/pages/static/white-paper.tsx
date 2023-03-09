import React, { Component } from "react";
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "../common";
import Meta from "../../components/meta";
import ScrollToTop from "../../components/scroll-to-top";
import Theme from "../../components/theme";
import NavBarElectron from "../../../desktop/app/components/navbar";
import NavBar from "../../components/navbar";
import { connect } from "react-redux";

class WhitePaperPage extends Component<PageProps> {
  render() {
    //  Meta config
    const metaProps = {
      title: "Whitepaper"
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

        <div className={"app-content static-page white-paper-page" + containerClasses}>
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
export default connect(pageMapStateToProps, pageMapDispatchToProps)(WhitePaperPage);
