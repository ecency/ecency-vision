import React, {Component} from 'react';
import {connect} from 'react-redux';
import {AnyAction, bindActionCreators, Dispatch} from 'redux';

import {Helmet} from 'react-helmet';

import {AppState} from '../store';
import {State as GlobalState} from '../store/global/types';
import {State as TrendingTagsState} from '../store/trending-tags/types';
import {State as CommunitiesState} from '../store/communities/types';

import {toggleTheme, hideIntro} from '../store/global';
import {fetchTrendingTags} from '../store/trending-tags';
import {fetchCommunity} from '../store/communities';

import NavBar from '../components/navbar';

interface Props {
    history: History,
    location: Location,
    global: GlobalState,
    trendingTags: TrendingTagsState,
    communities: CommunitiesState,
    toggleTheme: () => void
    hideIntro: () => void,
    fetchTrendingTags: () => void,
    fetchCommunity: (name: string) => void
}


class EntryIndexPage extends Component<Props> {

    render() {

        return (
            <div>
                <Helmet>
                    <title>Home</title>
                </Helmet>

                <NavBar {...this.props} />

            </div>
        )
    }
}


const mapStateToProps = (state: AppState) => ({
    global: state.global,
    trendingTags: state.trendingTags,
    communities: state.communities
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) =>
    bindActionCreators(
        {
            toggleTheme,
            hideIntro,
            fetchTrendingTags,
            fetchCommunity
        },
        dispatch
    );

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(EntryIndexPage);

