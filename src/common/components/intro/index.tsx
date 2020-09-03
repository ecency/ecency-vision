import React from 'react';

import {Global} from '../../store/global/types';

const friends = require('../../img/welcome_community.png');
const friendsWebp = require('../../img/welcome_community.webp');

import {closeSvg} from '../../img/svg';


interface Props {
    global: Global
    hideIntro: () => any
}

export default (props: Props) => {
    const hideIntro = () => props.hideIntro();

    if (!props.global.intro) {
        return null;
    }

    return <div className="intro">
        <div className="hide-intro" onClick={hideIntro}>{closeSvg}</div>
        <h1 className="intro-header">Aspire to greatness</h1>
        <h1 className="intro-sub-header">rewarding communities</h1>
        <div className="cloud-1"/>
        <div className="cloud-2"/>
        <div className="cloud-3"/>

        <img alt="Friends" className="friends" src={props.global.canUseWebp?friendsWebp:friends}/>
    </div>;
};
