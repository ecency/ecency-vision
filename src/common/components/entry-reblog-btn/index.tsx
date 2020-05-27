import React, {Component} from 'react';

import Tooltip from '../tooltip';

import DownloadTrigger from '../download-trigger';

import {_t} from '../../i18n/index';

import {repeatSvg} from '../../../svg';

export default class EntryReblogBtn extends Component {
    render() {
        return (
            <div className="reblog-btn">
                <DownloadTrigger>
                    <a className="inner-btn">
                        <Tooltip content={_t('entry-reblog.reblog')}>
                            {repeatSvg}
                        </Tooltip>
                    </a>
                </DownloadTrigger>
            </div>
        );
    }
}
