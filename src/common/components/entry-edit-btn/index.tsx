import React, {Component} from "react";

import {Link} from "react-router-dom";

import {Entry} from "../../store/entries/types";

import {_t} from "../../i18n";

import {pencilOutlineSvg} from "../../img/svg";

interface Props {
    entry: Entry;
}

export default class EntryEditBtn extends Component<Props> {
    render() {
        const {entry} = this.props;
        return (
            <Link title={_t("g.edit")} className="entry-edit-btn" to={`/@${entry.author}/${entry.permlink}/edit`}>
                {pencilOutlineSvg}
            </Link>
        );
    }
}
