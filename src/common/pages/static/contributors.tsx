import React, { Component } from "react";
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "../common";
import { _t } from "../../i18n";
import Meta from "../../components/meta";
import ScrollToTop from "../../components/scroll-to-top";
import Theme from "../../components/theme";
import NavBar from "../../components/navbar";
import Contributors from "../../components/contributors";
import { connect } from "react-redux";

class ContributorsPage extends Component<PageProps> {
  render() {
    //  Meta config
    const metaProps = {
      title: _t("contributors.title")
    };

    return (
      <>
        <Meta {...metaProps} />
        <ScrollToTop />
        <Theme global={this.props.global} />
        <NavBar history={this.props.history} />

        <div className={"app-content static-page contributors-page"}>
          {Contributors({ ...this.props })}
        </div>
      </>
    );
  }
}
export default connect(pageMapStateToProps, pageMapDispatchToProps)(ContributorsPage);
