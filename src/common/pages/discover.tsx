import React, { Component } from "react";

import { connect } from "react-redux";

import Meta from "../components/meta";
import Theme from "../components/theme/index";
import NavBar from "../components/navbar/index";
import LeaderBoard from "../components/leaderboard";
import Curation from "../components/curation";
import { DiscoverContributors } from "../components/discover-contributors";
import FullHeight from "../components/full-height";
import ScrollToTop from "../components/scroll-to-top";
import "./discover.scss";
import { _t } from "../i18n";
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "./common";

class DiscoverPage extends Component<PageProps> {
  render() {
    //  Meta config
    const metaProps = {
      title: _t("discover.title"),
      description: _t("discover.description")
    };

    const { global } = this.props;

    return (
      <>
        <Meta {...metaProps} />
        <ScrollToTop />
        <FullHeight />
        <Theme global={this.props.global} />
        <NavBar history={this.props.history} />

        <div className="app-content discover-page">
          {global.usePrivate && <div className="top-users">{LeaderBoard({ ...this.props })}</div>}
          {global.usePrivate && (
            <div className="curation-users">
              <Curation {...this.props} />
            </div>
          )}
          <div className="popular-users">
            <DiscoverContributors {...this.props} />
          </div>
        </div>
      </>
    );
  }
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(DiscoverPage);
