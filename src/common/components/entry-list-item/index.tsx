import React, {Component} from 'react'
import {History, Location} from 'history';
import {Discussion} from '@esteemapp/dhive';

import {State as GlobalState} from '../../store/global/types';


// @ts-ignore
import {catchPostImage, postBodySummary} from '@esteemapp/esteem-render-helpers';

const fallbackImage = require('../../img/fallback.png');
const noImage = require( '../../img/noimage.png');


interface Props {
    history: History,
    location: Location,
    global: GlobalState,
    entry: Discussion,
    asAuthor: string,
    promoted: boolean
}

class EntryListItem extends Component<Props> {
    public static defaultProps = {
        asAuthor: '',
        promoted: false
    };

    render() {
        const {entry, asAuthor, promoted} = this.props;
        const img: string = catchPostImage(entry, 600, 500) || noImage;

        return null;
    }
}

/*
EntryListItem.defaultProps = {
  asAuthor: null
};

EntryListItem.propTypes = {
  global: PropTypes.shape({
    selectedFilter: PropTypes.string.isRequired
  }).isRequired,
  entry: PropTypes.shape({
    title: PropTypes.string.isRequired,
    parent_permlink: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    author_reputation: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    max_accepted_payout: PropTypes.string.isRequired,
    json_metadata: PropTypes.string.isRequired,
    children: PropTypes.number.isRequired,
    body: PropTypes.string.isRequired,
    created: PropTypes.string.isRequired
  }).isRequired,
  history: PropTypes.shape({}).isRequired,
  location: PropTypes.shape({}).isRequired,
  asAuthor: PropTypes.string,
  intl: PropTypes.instanceOf(Object).isRequired
};

 */
