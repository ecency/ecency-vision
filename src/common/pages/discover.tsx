import React, {Component} from "react";

import {connect} from "react-redux";

import Meta from "../components/meta";
import Theme from "../components/theme/index";
import NavBar from "../components/navbar/index";

import {getPopularUsers, PopularUser, getLeaderboard, LeaderBoardItem} from "../api/private";

import {_t} from "../i18n";


import {PageProps, pageMapDispatchToProps, pageMapStateToProps} from "./common";


interface State {
    popular: PopularUser,
    leaderboard: LeaderBoardItem[]
}

class DiscoverPage extends Component<PageProps> {

    _mounted: boolean = true;

    componentDidMount() {
        this.fetch();
    }

    fetch = () => {
        getPopularUsers().then(popular => {
            this.stateSet({popular});
            return getLeaderboard("day")
        }).then(leaderboard => {
            this.stateSet({leaderboard});
        });
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    stateSet = (obj: {}, cb: () => void = () => {
    }) => {
        if (this._mounted) {
            this.setState(obj, cb);
        }
    };


    render() {

        //  Meta config
        const metaProps = {
            title: _t("discover.title"),
        };

        return (
            <>
                <Meta {...metaProps} />
                <Theme global={this.props.global}/>
                {NavBar({...this.props})}

                <div className="app-content discover-page">
                    Discover
                </div>
            </>
        );
    }
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(DiscoverPage);
