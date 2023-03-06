import React from "react";

import { Link } from "react-router-dom";

import { Global } from "../../store/global/types";

import { _t } from "../../i18n";

import { closeSvg } from "../../img/svg";
import "./_index.scss";

interface Props {
  global: Global;
  hideIntro: () => any;
}

const Intro = (props: Props) => {
  const hideIntro = () => props.hideIntro();

  if (!props.global.intro) {
    return null;
  }

  return (
    <div className="intro-text">
      <div className="hide-intro" onClick={hideIntro}>
        {closeSvg}
      </div>
      <div className="text-content">
        <h1 className="intro-header">{_t("intro.title")}</h1>
        <h1 className="intro-sub-header">
          <div className="title">{_t("intro.sub-title")}</div>
          <div className="get-started">
            <Link to="/signup" className="btn btn-primary">
              {_t("intro.c2a")}
            </Link>
          </div>
        </h1>
      </div>
      <div className="cloud-1" />
      <div className="cloud-2" />
      <div className="cloud-3" />
      {/* <img alt="Friends" className="friends" src={props.global.canUseWebp ? friendsWebp : friends}/> */}
    </div>
  );
};

export default Intro;
