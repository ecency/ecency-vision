import React from 'react';

import {State as GlobalState} from '../../store/global/types';

const friends = require('../../img/friends.jpg');

import {closeSvg} from '../../img/svg';


interface Props {
    global: GlobalState
    hideIntro: () => any
}

export default (props: Props) => {
    const hideIntro = () => props.hideIntro();

    if (!props.global.intro) {
        return null;
    }

    return <div className="intro">
        <div className="hide-intro" onClick={hideIntro}>{closeSvg}</div>
        <h1 className="intro-header">Be rewarded</h1>
        <h1 className="intro-sub-header">for your blogs, votes and any social activity</h1>
        <div className="cloud-1"/>
        <div className="cloud-2"/>
        <div className="cloud-3"/>

        <img alt="Friends" className="friends" src={friends}/>
    </div>;
};
