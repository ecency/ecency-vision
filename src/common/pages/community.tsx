import React, {Component, Fragment} from "react";

import {connect} from "react-redux";

import {match} from "react-router";

import {FormControl} from "react-bootstrap";

import {Community} from "../store/communities/types";

import Meta from "../components/meta";
import Theme from "../components/theme/index";
import NavBar from "../components/navbar/index";
import LinearProgress from "../components/linear-progress";
import CommunityListItem from "../components/community-list-item";
import SearchBox from "../components/search-box";

import {_t} from "../i18n";
import capitalize from "../util/capitalize";
import {getCommunity, getSubscriptions} from "../api/bridge";


import {PageProps, pageMapDispatchToProps, pageMapStateToProps} from "./common";
import NotFound from "../components/404";
import defaults from "../constants/defaults.json";
import Feedback from "../components/feedback";

interface MatchParams {
    filter: string;
    name: string;
}

interface Props extends PageProps {
    match: match<MatchParams>;
}

interface State {
    loading: boolean;
}

class CommunityPage extends Component<Props, State> {
    state: State = {
        loading: false
    };

    _mounted: boolean = true;

    async componentDidMount() {
        await this.ensureCommunity();

    }

    componentDidUpdate(prevProps: Readonly<Props>): void {

    }

    componentWillUnmount() {
        this._mounted = false;
    }

    stateSet = (state: {}, cb?: () => void) => {
        if (this._mounted) {
            this.setState(state, cb);
        }
    };

    ensureCommunity = (): Promise<void> => {
        const {match, communities, addCommunity} = this.props;

        const name = match.params.name;
        const community = communities.find((x) => x.name === name);

        if (!community) {
            // The community isn't in reducer. Fetch it and add to reducer.
            this.stateSet({loading: true});

            return getCommunity(name).then((data) => {
                if (data) {
                    addCommunity(data);
                }
            }).finally(() => {
                this.stateSet({loading: false});
            });
        } else {
            // The community is in reducer. Update it.
            return getCommunity(name).then((data) => {
                if (data) {
                    addCommunity(data);
                }
            })
        }
    }


    render() {
        const {global, entries, communities, match} = this.props;
        const {loading} = this.state;

        if (loading) {
            return <LinearProgress/>;
        }

        const {name, filter} = match.params;

        const community = communities.find((x) => x.name === name);

        if (!community) {
            return <NotFound/>;
        }

        //  Meta config
        const fC = capitalize(filter);
        const title = `${community.title.trim()}`;
        const description = _t("community-page.description", {f: `${fC} ${community.title.trim()}`});
        const url = `${defaults.base}/${filter}/${community.name}`;
        const rss = `${defaults.base}/${filter}/${community.name}/rss.xml`;

        const metaProps = {title, description, url, rss};

        const promoted = entries['__promoted__'].entries;

        return (
            <>
                <Meta {...metaProps} />
                <Theme global={this.props.global}/>
                <Feedback/>
                {NavBar({...this.props})}
            </>
        )
    }
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(CommunityPage);
