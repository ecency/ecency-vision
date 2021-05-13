import React, { useEffect, useState } from 'react';

import {Link} from "react-router-dom";

import {Global} from '../../store/global/types';

import {_t} from "../../i18n";

import {closeSvg} from '../../img/svg';

const friends = require('../../img/welcome_community.png');
const friendsWebp = require('../../img/welcome_community.webp');

interface Props {
    global: Global
    hideIntro: () => any
}

export default (props: Props) => {
    const hideIntro = () => props.hideIntro();

    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        const verification = localStorage.getItem("ecency_active_user")
        if( verification === null){
            setIsLoggedIn(false)
        } else setIsLoggedIn(true)
    })


    if (!props.global.intro || isLoggedIn) {
        return null;
    }

    return <div className="intro">
        <div className="hide-intro" onClick={hideIntro}>{closeSvg}</div>
        <div className="text-content">
            <h1 className="intro-header">{_t("intro.title")}</h1>
            <h1 className="intro-sub-header">
                <div className="title">{_t("intro.sub-title")}</div>
                <div className="get-started"><Link to="/signup" className="btn btn-primary">{_t("intro.c2a")}</Link></div>
            </h1>
        </div>
        <div className="cloud-1"/>
        <div className="cloud-2"/>
        <div className="cloud-3"/>
        <img alt="Friends" className="friends" src={props.global.canUseWebp ? friendsWebp : friends}/>
    </div>;
};
