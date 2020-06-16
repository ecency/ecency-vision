import React, { Component } from "react";

import { Button } from "react-bootstrap";

import DownloadTrigger from "../download-trigger";

import { Global } from "../../store/global/types";

import { Account } from "../../store/accounts/types";

import { _t } from "../../i18n";

import defaults from "../../constants/defaults.json";

import {
  proxifyImageSrc,
  setProxyBase,
  // @ts-ignore
} from "@esteemapp/esteem-render-helpers";
setProxyBase(defaults.imageServer);

const coverFallbackDay = require("../../img/cover-fallback-day.png");
const coverFallbackNight = require("../../img/cover-fallback-night.png");

interface Props {
  global: Global;
  account: Account;
}

export default class ProfileCover extends Component<Props> {
  render() {
    const { global, account } = this.props;
    let bgImage = "";

    if (account.__loaded) {
      bgImage = global.theme === "day" ? coverFallbackDay : coverFallbackNight;
      if (account.profile?.cover_image) {
        bgImage = proxifyImageSrc(account.profile.cover_image);
      }
    }

    let style = {};
    if (bgImage) {
      style = { backgroundImage: `url('${bgImage}')` };
    }

    return (
      <div className="profile-cover">
        <div className="cover-image" style={style} />
        <div className="follow-controls-holder">
          <DownloadTrigger>
            <Button>{_t("follow-controls.follow")}</Button>
          </DownloadTrigger>
        </div>
      </div>
    );
  }
}
