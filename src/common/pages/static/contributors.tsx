import React, { Component } from "react";
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "../common";
import { _t } from "../../i18n";
import Meta from "../../components/meta";
import ScrollToTop from "../../components/scroll-to-top";
import Theme from "../../components/theme";
import NavBarElectron from "../../../desktop/app/components/navbar";
import NavBar from "../../components/navbar";
import Contributors from "../../components/contributors";
import { connect } from "react-redux";

class ContributorsPage extends Component<PageProps> {
  render() {
    //  Meta config
    const metaProps = {
      title: _t("contributors.title")
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

        <div className={"app-content static-page contributors-page" + containerClasses}>
          {Contributors({ ...this.props })}
        </div>
      </>
    );
  }
}
export default connect(pageMapStateToProps, pageMapDispatchToProps)(ContributorsPage);
