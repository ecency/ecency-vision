import React, {Component} from "react";

import {connect} from "react-redux";


import Meta from "../components/meta";
import Theme from "../components/theme/index";
import NavBar from "../components/navbar/index";
import LeaderBoard from "../components/leaderboard";
import PopularUsers from "../components/popular-users";
import FullHeight from "../components/full-height";
import ScrollToTop from "../components/scroll-to-top";

import {getPopularUsers, PopularUser, getLeaderboard, LeaderBoardItem} from "../api/private";

import {_t} from "../i18n";


import {PageProps, pageMapDispatchToProps, pageMapStateToProps} from "./common";


class DiscoverPage extends Component<PageProps> {

    _mounted: boolean = true;

    componentDidMount() {
        // this.fetch();
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    stateSet = (state: {}, cb?: () => void) => {
        if (this._mounted) {
            this.setState(state, cb);
        }
    };

    fetch = () => {
        getPopularUsers().then(popular => {
            this.stateSet({popular});
            return getLeaderboard("day")
        }).then(leaderboard => {
            this.stateSet({leaderboard});
        });
    }


    render() {
        //  Meta config
        const metaProps = {
            title: _t("discover.title"),
        };

        return (
            <>
                <Meta {...metaProps} />
                <ScrollToTop/>
                <FullHeight/>
                <Theme global={this.props.global}/>
                {NavBar({...this.props})}
                <div className="app-content discover-page">
                    <div className="top-users">
                        {LeaderBoard({...this.props})}
                    </div>
                    <div className="popular-users">
                        {PopularUsers({...this.props})}
                    </div>
                </div>
            </>
        );
    }
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(DiscoverPage);
