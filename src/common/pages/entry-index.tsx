import React, {Component} from 'react';
import {AnyAction, bindActionCreators, Dispatch} from 'redux';
import {connect} from 'react-redux';
import {Location, History} from 'history';

import {Helmet} from 'react-helmet';

import {AppState} from '../store';
import {State as GlobalState} from '../store/global/types';
import {State as TrendingTagsState} from '../store/trending-tags/types';
import {State as CommunitiesState} from '../store/communities/types';
import {State as EntriesState} from '../store/entries/types';

import {toggleTheme, hideIntro} from '../store/global';
import {fetchTrendingTags} from '../store/trending-tags';
import {fetchCommunity} from '../store/communities';
import {makeGroupKey} from '../store/entries/index';

import Theme from '../components/theme';
import NavBar from '../components/navbar';
import Intro from '../components/intro';
import TagLink, {makePath} from '../components/tag-link';

interface Props {
    history: History,
    location: Location,
    global: GlobalState,
    trendingTags: TrendingTagsState,
    communities: CommunitiesState,
    entries: EntriesState,
    toggleTheme: () => void
    hideIntro: () => void,
    fetchTrendingTags: () => void,
    fetchCommunity: (name: string) => void
}


class EntryIndexPage extends Component<Props> {

    render() {


        const {trendingTags, global} = this.props;

        const {filter, tag} = global;

        const groupKey = makeGroupKey(filter, tag);



        return (
            <div>
                <Helmet>
                    <title>Home</title>
                </Helmet>

                <Theme {...this.props} />
                <NavBar {...this.props} />
                <Intro {...this.props} />

                <div className="app-content">
                    <div className="trending-tag-list">
                        <h2 className="list-header">Popular Tags</h2>
                        {trendingTags.list.map(t => {
                            const cls = `tag-list-item ${
                                global.tag === t ? 'selected-item' : ''
                            }`;
                            return (
                                <TagLink {...this.props} tag={t} key={t}>
                                    <a href={makePath(global.filter, t)} className={cls}>{t}</a>
                                </TagLink>
                            );
                        })}
                    </div>
                </div>

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

