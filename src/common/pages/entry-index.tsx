import React, {Component} from 'react';
import {AnyAction, bindActionCreators, Dispatch} from 'redux';
import {connect} from 'react-redux';
import {History, Location} from 'history';

import {Helmet} from 'react-helmet';

import {AppState} from '../store';
import {Filter, ListStyle, State as GlobalState} from '../store/global/types';
import {State as TrendingTagsState} from '../store/trending-tags/types';
import {State as CommunitiesState} from '../store/communities/types';
import {State as EntriesState} from '../store/entries/types';

import {hideIntro, toggleListStyle, toggleTheme} from '../store/global/index';
import {fetchTrendingTags} from '../store/trending-tags/index';
import {fetchCommunity} from '../store/communities/index';
import {makeGroupKey} from '../store/entries/index';

import Theme from '../components/theme/index';
import NavBar from '../components/navbar/index';
import Intro from '../components/intro/index';
import TagLink, {makePath} from '../components/tag-link/index';
import EntryListItem from '../components/entry-list-item/index';
import DropDown from '../components/dropdown/index';
import ListStyleToggle from '../components/list-style-toggle/index';

import {_t} from '../i18n';

import _c from '../util/fix-class-names';

const filters = Object.values(Filter);

interface Props {
    history: History,
    location: Location,
    global: GlobalState,
    trendingTags: TrendingTagsState,
    communities: CommunitiesState,
    entries: EntriesState,
    toggleTheme: () => void
    hideIntro: () => void,
    toggleListStyle: () => void,
    fetchTrendingTags: () => void,
    fetchCommunity: (name: string) => void
}

class EntryIndexPage extends Component<Props> {
    render() {
        const {trendingTags, global, entries} = this.props;
        const {filter, tag} = global;

        const groupKey = makeGroupKey(filter, tag);

        const data = entries[groupKey];
        if (data === undefined) {
            return null;
        }

        const entryList = data.entries;
        const loading = data.loading;

        const dropDownConfig = {
            label: _t(`entry-index.filter-${filter}`),
            items: filters.map(x => {
                return {
                    label: _t(`entry-index.filter-${x}`),
                    href: `/${x}`,
                    active: filter === x
                }
            })
        };

        return (
            <>
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
                            const cls = _c(`tag-list-item ${global.tag === t ? 'selected-item' : ''}`);
                            return (
                                <TagLink {...this.props} tag={t} key={t}>
                                    <a href={makePath(global.filter, t)} className={cls}>{t}</a>
                                </TagLink>
                            );
                        })}
                    </div>

                    <div className={_c(`page-content ${loading ? 'loading' : ''}`)}>
                        <div className="page-tools">
                            <DropDown {...{...this.props, ...dropDownConfig}}/>
                            <ListStyleToggle {...this.props} />
                        </div>
                        <div className={_c(`entry-list ${loading ? 'loading' : ''}`)}>
                            <div className={_c(`entry-list-body ${global.listStyle === ListStyle.grid ? ListStyle.grid : ''}`)}>
                                {entryList.map(e => <EntryListItem key={`${e.author}-${e.permlink}`} {...this.props} entry={e}/>)}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}


const mapStateToProps = (state: AppState) => ({
    global: state.global,
    trendingTags: state.trendingTags,
    communities: state.communities,
    entries: state.entries
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) =>
    bindActionCreators(
        {
            toggleTheme,
            hideIntro,
            toggleListStyle,
            fetchTrendingTags,
            fetchCommunity
        },
        dispatch
    );

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(EntryIndexPage);

