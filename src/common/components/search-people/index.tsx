import React from 'react';

import { History, Location } from 'history';

import queryString from 'query-string';

import { Account } from '../../store/accounts/types';
import { Global } from '../../store/global/types';

import BaseComponent from '../base';
import LinearProgress from '../linear-progress';

import SearchQuery from '../../helper/search-query';
import ProfileLink from '../profile-link';
import UserAvatar from '../user-avatar';

import { searchAccount, AccountSearchResult } from '../../api/search-api';

import { _t } from '../../i18n';

import truncate from '../../util/truncate';

interface Props {
  history: History;
  location: Location;
  global: Global;
  addAccount: (data: Account) => void;
}

interface State {
  search: string;
  results: AccountSearchResult[];
  loading: boolean;
}

const grabSearch = (location: Location) => {
  const qs = queryString.parse(location.search);
  const q = qs.q as string;

  return new SearchQuery(q).search.split(' ')[0].replace('@', '');
};

export class SearchPeople extends BaseComponent<Props, State> {
  state: State = {
    search: grabSearch(this.props.location),
    results: [],
    loading: false
  };

  componentDidMount() {
    this.fetch();
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
    const search = grabSearch(this.props.location);
    if (search !== grabSearch(prevProps.location)) {
      this.stateSet({ search }, this.fetch);
    }
  }

  fetch = () => {
    const { search } = this.state;
    this.stateSet({ results: [], loading: true });
    searchAccount(search, 5)
      .then((resp) => {
        this.stateSet({ results: resp.slice(0, 4) });
      })
      .finally(() => {
        this.stateSet({ loading: false });
      });
  };

  render() {
    const { loading, results } = this.state;

    return (
      <div className="card search-people">
        <div className="card-header">
          <strong>{_t('search-people.title')}</strong>
        </div>
        <div className="card-body">
          {(() => {
            if (loading) {
              return <LinearProgress />;
            }

            if (results.length === 0) {
              return <span className="text-muted">{_t('g.no-matches')}</span>;
            }

            return (
              <div className="people-list">
                <div className="list-body">
                  {results.map((i) => {
                    const username = i.name;
                    return (
                      <div className="list-item" key={username}>
                        <div className="item-header">
                          {ProfileLink({
                            ...this.props,
                            username,
                            children: <>{UserAvatar({ ...this.props, username, size: 'medium' })}</>
                          })}
                          <div className="item-title">
                            {ProfileLink({
                              ...this.props,
                              username,
                              children: <a className="item-name notransalte">{i.full_name}</a>
                            })}
                            <span className="item-sub-title">
                              {'@'}
                              {i.name}
                            </span>
                          </div>
                        </div>
                        <div className="item-about">{truncate(i.about, 120)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    );
  }
}

export default (p: Props) => {
  const props = {
    history: p.history,
    location: p.location,
    global: p.global,
    addAccount: p.addAccount
  };

  return <SearchPeople {...props} />;
};
