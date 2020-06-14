import React, { Component } from "react";

import Tooltip from "../tooltip";

import DownloadTrigger from "../download-trigger";

import { _t } from "../../i18n/index";

import { repeatSvg } from "../../img/svg";

interface Props {
  text: boolean;
}

export default class EntryReblogBtn extends Component<Props> {
  public static defaultProps: Props = {
    text: true,
  };

  render() {
    const { text } = this.props;

    if (text) {
      return (
        <DownloadTrigger>
          <div className="entry-reblog-btn">
            <a className="inner-btn">
              {repeatSvg} {_t("entry-reblog.reblog")}
            </a>
          </div>
        </DownloadTrigger>
      );
    }

    return (
      <DownloadTrigger>
        <div className="entry-reblog-btn">
          <Tooltip content={_t("entry-reblog.reblog")}>
            <a className="inner-btn">{repeatSvg}</a>
          </Tooltip>
        </div>
      </DownloadTrigger>
    );
  }
}
