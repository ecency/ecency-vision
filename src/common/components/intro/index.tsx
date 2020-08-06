import React from 'react';
import {Context} from "react-img-webp";

import {Global} from '../../store/global/types';

const friends = require('../../img/friends.jpg');
const friendsWebp = require('../../img/friends-webp.webp');

import {closeSvg} from '../../img/svg';
const request = {
    headers: {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8"
    }
}

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
        <h1 className="intro-sub-header">uncensored, decentralized, communities</h1>
        <div className="cloud-1"/>
        <div className="cloud-2"/>
        <div className="cloud-3"/>
        <Context.WebPController accept={request.headers.Accept}>
            <Context.Image alt="Friends" className="friends" src={friends} webP={friendsWebp} />
        </Context.WebPController>
    </div>;
};
