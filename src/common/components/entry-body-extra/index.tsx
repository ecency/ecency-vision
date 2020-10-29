import React, {Component} from "react";

import {Entry} from "../../store/entries/types";

interface Props {
    entry: Entry
}

class EntryBodyExtra extends Component<Props> {
    componentDidMount() {
        const {entry} = this.props;

        if (entry.body.indexOf('https://twitter.com/') > -1) {
            const twttr = window['twttr'];
            if (twttr && twttr.widgets) {
                twttr.widgets.load();
            }
        }
    }

    render() {
        return null;
    }

}

export default (p: Props) => {
    const props = {
        entry: p.entry
    }

    return <EntryBodyExtra {...props} />
}
