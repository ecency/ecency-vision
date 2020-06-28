import React, { Component } from "react";

import { Link } from "react-router-dom";

import { Entry } from "../../store/entries/types";

import { _t } from "../../i18n/index";

import { pencilOutlineSvg } from "../../img/svg";

interface Props {
  entry: Entry;
}

export default class EntryEditBtn extends Component<Props> {
  render() {
    const { entry } = this.props;
    return (
      <Link className="entry-edit-btn" to={`/@${entry.author}/${entry.permlink}/edit`}>
        {pencilOutlineSvg} {_t("g.edit")}
      </Link>
    );
  }
}
