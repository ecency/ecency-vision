import React, {Component, Fragment} from "react";

import {connect} from "react-redux";

import {FormControl} from "react-bootstrap";

import {Community} from "../store/communities/types";

import Meta from "../components/meta";
import Theme from "../components/theme/index";
import NavBar from "../components/navbar/index";
import LinearProgress from "../components/linear-progress";
import CommunityListItem from "../components/community-list-item";
import SearchBox from "../components/search-box";

import {_t} from "../i18n";

import {getCommunities, getSubscriptions} from "../api/bridge";

import {PageProps, pageMapDispatchToProps, pageMapStateToProps} from "./common";

interface State {

}

class CommunityPage extends Component<PageProps, State> {
    state: State = {

    };

    _mounted: boolean = true;

    componentDidMount() {

    }

    componentDidUpdate(prevProps: Readonly<PageProps>) {

    }

    componentWillUnmount() {
        this._mounted = false;
    }

    stateSet = (state: {}, cb?: () => void) => {
        if (this._mounted) {
            this.setState(state, cb);
        }
    };


    render() {
        return <span>COMMUNITY</span>
    }
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(CommunityPage);
