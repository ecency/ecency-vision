import React, {Component} from "react";

import {connect} from "react-redux";


import Meta from "../components/meta";
import Theme from "../components/theme/index";
import NavBar from "../components/navbar/index";
import NavBarElectron from "../../desktop/app/components/navbar";
import LeaderBoard from "../components/leaderboard";
import Curation from "../components/curation";
import PopularUsers from "../components/popular-users";
import FullHeight from "../components/full-height";
import ScrollToTop from "../components/scroll-to-top";

import {_t} from "../i18n";


import {PageProps, pageMapDispatchToProps, pageMapStateToProps} from "./common";


class DiscoverPage extends Component<PageProps> {
    render() {
        //  Meta config
        const metaProps = {
            title: _t("discover.title"),
            description: _t("discover.description"),
        };

        const {global} = this.props;

        return (
            <>
                <Meta {...metaProps} />
                <ScrollToTop/>
                <FullHeight/>
                <Theme global={this.props.global}/>
                {global.isElectron ?
                    NavBarElectron({
                        ...this.props,
                    }) :
                    NavBar({...this.props})}
                <div className="app-content discover-page">
                    {global.usePrivate && (<div className="top-users">
                        {LeaderBoard({...this.props})}
                    </div>)}
                    {global.usePrivate && (<div className="curation-users">
                        {Curation({...this.props})}
                    </div>)}
                    <div className="popular-users">
                        {PopularUsers({...this.props})}
                    </div>
                </div>
            </>
        );
    }
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(DiscoverPage);
