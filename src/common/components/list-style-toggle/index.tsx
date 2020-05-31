import React, {Component} from 'react';

import {State as GlobalState} from '../../store/global/types';
import {ListStyle} from '../../store/global/types';

import {viewModuleSvg} from '../../img/svg';

interface Props {
    global: GlobalState,
    toggleListStyle: () => void
}

export default class ListStyleToggle extends Component<Props> {
    changeStyle = () => {
        const {toggleListStyle} = this.props;

        toggleListStyle();
    };

    render() {
        const {global} = this.props;
        const {listStyle} = global;

        return (
            <span
                className={`list-style-toggle ${listStyle === ListStyle.grid ? 'toggled' : ''}`}
                onClick={() => {
                    this.changeStyle();
                }}
            >{viewModuleSvg}</span>
        );
    }
}
