import React, { Component } from "react";

import DownloadTrigger from "../download-trigger";

import { chevronUpSvg } from "../../img/svg";

export default class EntryVoteBtn extends Component {
  render() {
    return (
      <div className="entry-vote-btn">
        <DownloadTrigger>
          <span className="btn-up-vote">
            <span className="btn-inner">{chevronUpSvg}</span>
          </span>
        </DownloadTrigger>
      </div>
    );
  }
}
