import React from 'react';
import {Image} from "react-img-webp";

import {Global} from '../../store/global/types';

const friends = require('../../img/friends.jpg');
const friendsWebp = require('../../img/friends-webp.webp');

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
        <h1 className="intro-header">Be rewarded</h1>
        <h1 className="intro-sub-header">for your blogs, votes and any social activity</h1>
        <div className="cloud-1"/>
        <div className="cloud-2"/>
        <div className="cloud-3"/>

        <Image alt="Friends" className="friends" src={friends} webP={friendsWebp}/>
    </div>;
};
